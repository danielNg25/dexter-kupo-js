import { tokenName } from '../models';
import { compareTokenWithPolicy, identifierToAsset, joinPolicyId, LOVELACE, splitPolicyId, } from '../utils';
import { DefinitionBuilder } from './definitions/definition-builder';
import pool from './definitions/muesliswap/pool';
import { cborToDatumJson } from './definitions/utils';
import { BaseDex } from './models/base-dex';
import { LiquidityPool } from './models/liquidity-pool';
import { DEX_IDENTIFIERS } from './utils';
export class Muesliswap extends BaseDex {
    constructor(kupoApi) {
        super(kupoApi);
        this.identifier = DEX_IDENTIFIERS.MUESLISWAP;
        /**
         * On-Chain constants.
         */
        this.orderAddress = 'addr1zyq0kyrml023kwjk8zr86d5gaxrt5w8lxnah8r6m6s4jp4g3r6dxnzml343sx8jweqn4vn3fz2kj8kgu9czghx0jrsyqqktyhv';
        this.lpTokenPolicyId = 'af3d70acf4bd5b3abb319a7d75c89fb3e56eafcdd46b2e9b57a2557f';
        this.poolNftPolicyIdV1 = '909133088303c49f3a30f1cc8ed553a73857a29779f6c6561cd8093f';
        this.poolNftPolicyIdV2 = '7a8041a0693e6605d010d5185b034d55c79eaf7ef878aae3bdcdbf67';
        this.factoryTokenPolicyId = 'de9b756719341e79785aa13c164e7fe68c189ed04d61c9876b2fe53f';
        this.factoryToken = 'de9b756719341e79785aa13c164e7fe68c189ed04d61c9876b2fe53f.4d7565736c69537761705f414d4d';
        this.cancelDatum = 'd87980';
    }
    async allLiquidityPools() {
        const utxos = await this.allLiquidityPoolUtxos();
        let pools = [];
        utxos.map(async (utxo) => {
            const pool = await this.liquidityPoolFromUtxo(utxo);
            if (pool)
                pools.push(pool);
        });
        return pools;
    }
    async allLiquidityPoolUtxos() {
        return await this.kupoApi.get(this.factoryToken, true);
    }
    async liquidityPoolFromUtxo(utxo, poolId = '') {
        if (!utxo.data_hash) {
            return Promise.resolve(undefined);
        }
        const relevantAssets = utxo.amount.filter((assetBalance) => {
            const assetBalanceId = assetBalance.unit;
            return (!assetBalanceId.startsWith(this.factoryTokenPolicyId) &&
                !assetBalanceId.startsWith(this.poolNftPolicyIdV1) &&
                !assetBalanceId.startsWith(this.poolNftPolicyIdV2));
        });
        // Irrelevant UTxO
        if (![2, 3].includes(relevantAssets.length)) {
            return Promise.resolve(undefined);
        }
        poolId =
            utxo.amount.find((amount) => amount.unit.startsWith(this.poolNftPolicyIdV1) ||
                amount.unit.startsWith(this.poolNftPolicyIdV2))?.unit || poolId;
        // Could be ADA/X or X/X pool
        const assetAIndex = relevantAssets.length === 2 ? 0 : 1;
        const assetBIndex = relevantAssets.length === 2 ? 1 : 2;
        const liquidityPool = new LiquidityPool(this, identifierToAsset(relevantAssets[assetAIndex].unit), identifierToAsset(relevantAssets[assetBIndex].unit), BigInt(relevantAssets[assetAIndex].quantity), BigInt(relevantAssets[assetBIndex].quantity), utxo.address, 0.3, poolId);
        return liquidityPool;
    }
    async liquidityPoolFromUtxoExtend(utxo, poolId = '') {
        let liquidityPool = await this.liquidityPoolFromUtxo(utxo, poolId);
        if (!liquidityPool) {
            return Promise.resolve(undefined);
        }
        try {
            const datum = await this.kupoApi.datum(utxo.data_hash);
            let jsonDatum = cborToDatumJson(datum);
            const builder = await new DefinitionBuilder().loadDefinition(pool);
            const parameters = builder.pullParameters(jsonDatum);
            liquidityPool.poolFeePercent =
                typeof parameters.LpFee === 'number' ||
                    typeof parameters.LpFee === 'string'
                    ? Number(parameters.LpFee) / 100
                    : 0;
        }
        catch (e) {
            console.error(`Failed parsing datum for liquidity pool ${liquidityPool.dex.identifier} ${tokenName(liquidityPool.assetA)}/${tokenName(liquidityPool.assetB)}  PoolId: ${liquidityPool.poolId}`);
            return undefined;
        }
        return liquidityPool;
    }
    async liquidityPoolFromPoolId(poolId) {
        poolId = splitPolicyId(joinPolicyId(poolId));
        const utxos = await this.kupoApi.get(poolId, true);
        if (utxos.length === 0) {
            return Promise.resolve(undefined);
        }
        return this.liquidityPoolFromUtxoExtend(utxos[0], poolId);
    }
    async liquidityPoolsFromToken(tokenB, tokenA = LOVELACE, tokenBDecimals = 0, tokenADecimals = 6, allLiquidityPools = []) {
        allLiquidityPools =
            allLiquidityPools.length > 0
                ? allLiquidityPools
                : await this.allLiquidityPools();
        let pools = allLiquidityPools.filter((pool) => {
            return ((compareTokenWithPolicy(pool.assetA, tokenA) &&
                compareTokenWithPolicy(pool.assetB, tokenB)) ||
                (compareTokenWithPolicy(pool.assetA, tokenB) &&
                    compareTokenWithPolicy(pool.assetB, tokenA)));
        });
        if (pools.length === 0) {
            return Promise.resolve(undefined);
        }
        return (await Promise.all(pools.map((pool) => this.liquidityPoolFromPoolId(pool.poolId))))
            .filter((pool) => pool !== undefined) // Type guard for filtering
            .map((pool) => {
            const setDecimals = (asset) => {
                if (asset !== LOVELACE) {
                    asset.decimals = compareTokenWithPolicy(asset, tokenA)
                        ? tokenADecimals
                        : tokenBDecimals;
                }
            };
            setDecimals(pool.assetA);
            setDecimals(pool.assetB);
            return pool;
        });
    }
}
