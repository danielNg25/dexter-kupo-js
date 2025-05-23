import { compareTokenWithPolicy, identifierToAsset, LOVELACE, retry, } from '../utils';
import { DefinitionBuilder } from './definitions/definition-builder';
import pool from './definitions/wingriders/pool';
import { cborToDatumJson } from './definitions/utils';
import { BaseDex } from './models/base-dex';
import { LiquidityPool } from './models/liquidity-pool';
import { DEX_IDENTIFIERS } from './utils';
import { tokenName } from '../models';
import order from './definitions/wingriders/order';
const MIN_POOL_ADA = 3000000n;
export class WingRiders extends BaseDex {
    constructor(kupoApi) {
        super(kupoApi);
        this.identifier = DEX_IDENTIFIERS.WINGRIDER;
        /**
         * On-Chain constants.
         */
        this.orderAddress = 'addr1wxr2a8htmzuhj39y2gq7ftkpxv98y2g67tg8zezthgq4jkg0a4ul4';
        this.poolValidityPolicy = '026a18d04a0c642759bb3d83b12e3344894e5c1c7b2aeb1a2113a570';
        this.poolValidityAssetIden = '026a18d04a0c642759bb3d83b12e3344894e5c1c7b2aeb1a2113a570.4c';
        this.poolValidityAssetIdenCheck = '026a18d04a0c642759bb3d83b12e3344894e5c1c7b2aeb1a2113a5704c';
        this.cancelDatum = 'd87a80';
        this.orderScript = {
            type: 'PlutusV1',
            script: '590370010000332332233322232323332223332223233223232323232332233222232322323225335301533225335301a00221333573466e3c02cdd7299a9a8101980924004a66a6a040660249000299a9a8101980924000a66a6a04066024900019a980b8900098099bac5335350203301248000d4d54054c0440088800858884008004588854cd4d4088004588854cd4d409000440088858588854cd4d4088004588854cd4d4090004588854cd4d409800440188858588854cd4d4088004588854cd4d409000440108858588854cd4d4088004400888580680644cc88d4c03400888d4c0440088888cc05cdd70019918139bac0015335350273301948000d4d54070c06001c88008588854cd4d40a4004588854cd4d40ac004588854cd4d40b4004588854cd4d40bc004588854cd4d40c4004588854cd4d40cc004588854cd4d40d400458884008cccd5cd19b8735573aa010900011980699191919191999ab9a3370e6aae75401120002333301535742a0086ae85400cd5d0a8011aba135744a004464c6a605266ae700900a80680644d5d1280089aba25001135573ca00226ea8004d5d0a8041aba135744a010464c6a604666ae7007809005004c004cccd5cd19b8750024800880688cccd5cd19b875003480008c8c074004dd69aba135573ca00a464c6a604466ae7007408c04c0480440044084584d55cea80089baa001135573ca00226ea80048848cc00400c0088004888848cccc00401401000c0088004c8004d540548894cd4d404c00440308854cd4c034ccd5cd19b8f00400200f00e100f13300500400125335350103300248000004588854cd4d4048004588854cd4d40500044cd54028010008885888c8d4d54018cd5401cd55cea80098021aab9e5001225335300b333573466e1c0140080340304004584dd5000990009aa809111999aab9f0012501223350113574200460066ae8800800d26112212330010030021120013200135500e2212253353500d0021622153353007333573466e1c00d2000009008100213353006120010013370200690010910010910009000909118010018910009000a490350543100320013550062233335573e0024a00c466a00a6eb8d5d080118019aba2002007112200212212233001004003120011200120011123230010012233003300200200148811ce6c90a5923713af5786963dee0fdffd830ca7e0c86a041d9e5833e910001',
        };
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
        return await this.kupoApi.get(this.poolValidityAssetIden, true);
    }
    async liquidityPoolFromUtxo(utxo, poolId = '') {
        if (!utxo.data_hash) {
            return Promise.resolve(undefined);
        }
        const relevantAssets = utxo.amount.filter((assetBalance) => {
            const assetBalanceId = assetBalance.unit;
            return !assetBalanceId.startsWith(this.poolValidityPolicy);
        });
        // Irrelevant UTxO
        if (relevantAssets.length < 2) {
            return Promise.resolve(undefined);
        }
        poolId =
            utxo.amount.find((amount) => amount.unit.startsWith(this.poolValidityPolicy) &&
                amount.unit !== this.poolValidityAssetIdenCheck)?.unit || poolId;
        // Could be ADA/X or X/X pool
        const assetAIndex = relevantAssets.length === 2 ? 0 : 1;
        const assetBIndex = relevantAssets.length === 2 ? 1 : 2;
        const assetAQuantity = BigInt(relevantAssets[assetAIndex].quantity);
        const assetBQuantity = BigInt(relevantAssets[assetBIndex].quantity);
        const liquidityPool = new LiquidityPool(this, identifierToAsset(relevantAssets[assetAIndex].unit), identifierToAsset(relevantAssets[assetBIndex].unit), relevantAssets[assetAIndex].unit === LOVELACE
            ? assetAQuantity - MIN_POOL_ADA < 1000000n
                ? assetAQuantity - MIN_POOL_ADA
                : assetAQuantity
            : assetAQuantity, relevantAssets[assetBIndex].unit === LOVELACE
            ? assetBQuantity - MIN_POOL_ADA < 1000000n
                ? assetBQuantity - MIN_POOL_ADA
                : assetBQuantity
            : assetBQuantity, utxo.address, 0.35, poolId);
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
            liquidityPool.reserveA =
                typeof parameters.PoolAssetATreasury === 'number' ||
                    typeof parameters.PoolAssetATreasury === 'string'
                    ? liquidityPool.reserveA -
                        BigInt(parameters.PoolAssetATreasury)
                    : liquidityPool.reserveA;
            liquidityPool.reserveB =
                typeof parameters.PoolAssetBTreasury === 'number' ||
                    typeof parameters.PoolAssetBTreasury === 'string'
                    ? liquidityPool.reserveB -
                        BigInt(parameters.PoolAssetBTreasury)
                    : liquidityPool.reserveB;
        }
        catch (e) {
            throw new Error(`Failed parsing datum for liquidity pool ${liquidityPool.dex.identifier} ${tokenName(liquidityPool.assetA)}/${tokenName(liquidityPool.assetB)}  PoolId: ${liquidityPool.poolId}`);
            return undefined;
        }
        return liquidityPool;
    }
    async liquidityPoolFromPoolId(poolId) {
        if (!poolId.startsWith(this.poolValidityPolicy)) {
            poolId = `${this.poolValidityPolicy}${poolId}`;
        }
        const utxos = await this.allLiquidityPoolUtxos();
        let foundUtxo = utxos.find((utxo) => {
            return utxo.amount.map((amount) => amount.unit).includes(poolId);
        });
        if (foundUtxo === undefined) {
            return Promise.resolve(undefined);
        }
        return this.liquidityPoolFromUtxoExtend(foundUtxo, poolId);
    }
    async liquidityPoolsFromToken(tokenB, tokenA = LOVELACE, tokenBDecimals = 0, tokenADecimals = 6, allLiquidityPools = [], skipRefetch) {
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
        return (await Promise.all(pools.map((pool) => retry(() => this.liquidityPoolFromPoolId(pool.poolId), 5, 100))))
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
    async parseOrderDatum(datum) {
        return this._parseOrderDatum(datum, order);
    }
    async fetchAndParseOrderDatum(datumHash) {
        const datum = await this.kupoApi.datum(datumHash);
        if (!datum) {
            throw new Error(`Datum not found for hash: ${datumHash}`);
        }
        return await this.parseOrderDatum(datum);
    }
}
