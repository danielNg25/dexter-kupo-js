import { compareTokenWithPolicy, identifierToAsset, joinPolicyId, LOVELACE, retry, splitPolicyId, } from '../utils';
import { BaseDex } from './models/base-dex';
import { LiquidityPool } from './models/liquidity-pool';
import { DEX_IDENTIFIERS } from './utils';
import order from './definitions/minswap/order';
export class Minswap extends BaseDex {
    constructor(kupoApi) {
        super(kupoApi);
        this.identifier = DEX_IDENTIFIERS.MINSWAP;
        /**
         * On-Chain constants.
         */
        this.marketOrderAddress = 'addr1wxn9efv2f6w82hagxqtn62ju4m293tqvw0uhmdl64ch8uwc0h43gt';
        this.limitOrderAddress = 'addr1zxn9efv2f6w82hagxqtn62ju4m293tqvw0uhmdl64ch8uw6j2c79gy9l76sdg0xwhd7r0c0kna0tycz4y5s6mlenh8pq6s3z70';
        this.lpTokenPolicyId = 'e4214b7cce62ac6fbba385d164df48e157eae5863521b4b67ca71d86';
        this.poolNftPolicyId = '0be55d262b29f564998ff81efe21bdc0022621c12f15af08d0f2ddb1';
        this.poolValidityAsset = '13aa2accf2e1561723aa26871e071fdf32c867cff7e7d50ad470d62f.4d494e53574150';
        this.poolValidityAssetJoined = '13aa2accf2e1561723aa26871e071fdf32c867cff7e7d50ad470d62f4d494e53574150';
        this.cancelDatum = 'd87a80';
        this.orderScript = {
            type: 'PlutusV1',
            script: '59014f59014c01000032323232323232322223232325333009300e30070021323233533300b3370e9000180480109118011bae30100031225001232533300d3300e22533301300114a02a66601e66ebcc04800400c5288980118070009bac3010300c300c300c300c300c300c300c007149858dd48008b18060009baa300c300b3754601860166ea80184ccccc0288894ccc04000440084c8c94ccc038cd4ccc038c04cc030008488c008dd718098018912800919b8f0014891ce1317b152faac13426e6a83e06ff88a4d62cce3c1634ab0a5ec133090014a0266008444a00226600a446004602600a601a00626600a008601a006601e0026ea8c03cc038dd5180798071baa300f300b300e3754601e00244a0026eb0c03000c92616300a001375400660106ea8c024c020dd5000aab9d5744ae688c8c0088cc0080080048c0088cc00800800555cf2ba15573e6e1d200201',
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
        return await this.kupoApi.get(this.poolValidityAsset, true);
    }
    async liquidityPoolFromUtxo(utxo, poolId = '') {
        if (!utxo.data_hash) {
            return Promise.resolve(undefined);
        }
        const relevantAssets = utxo.amount.filter((assetBalance) => {
            const assetBalanceId = assetBalance.unit;
            return (assetBalanceId !== this.poolValidityAssetJoined &&
                !assetBalanceId.startsWith(this.lpTokenPolicyId) &&
                !assetBalanceId.startsWith(this.poolNftPolicyId));
        });
        // Irrelevant UTxO
        if (relevantAssets.length < 2) {
            return Promise.resolve(undefined);
        }
        poolId =
            utxo.amount.find((amount) => amount.unit.startsWith(this.poolNftPolicyId))?.unit || poolId;
        // Could be ADA/X or X/X pool
        const assetAIndex = relevantAssets.length === 2 ? 0 : 1;
        const assetBIndex = relevantAssets.length === 2 ? 1 : 2;
        const liquidityPool = new LiquidityPool(this, identifierToAsset(relevantAssets[assetAIndex].unit), identifierToAsset(relevantAssets[assetBIndex].unit), BigInt(relevantAssets[assetAIndex].quantity), BigInt(relevantAssets[assetBIndex].quantity), utxo.address, 0.3, poolId);
        return liquidityPool;
    }
    async liquidityPoolFromUtxoExtend(utxo, poolId = '') {
        return await this.liquidityPoolFromUtxo(utxo, poolId);
    }
    async liquidityPoolFromPoolId(poolId) {
        if (!poolId.startsWith(this.poolNftPolicyId)) {
            poolId = `${this.poolNftPolicyId}.${poolId}`;
        }
        poolId = splitPolicyId(joinPolicyId(poolId));
        const utxos = await this.kupoApi.get(poolId, true);
        if (utxos.length === 0) {
            return Promise.resolve(undefined);
        }
        return this.liquidityPoolFromUtxoExtend(utxos[0], poolId);
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
