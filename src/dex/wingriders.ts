import { KupoApi } from '../KupoApi';
import { Asset } from '../models/asset';
import { Unit, UTXO } from '../types';
import { compareTokenWithPolicy, identifierToAsset, LOVELACE } from '../utils';
import { DefinitionBuilder } from './definitions/definition-builder';
import pool from './definitions/wingriders/pool';
import { DatumParameters, DefinitionConstr } from './definitions/types';
import { cborToDatumJson } from './definitions/utils';
import { BaseDex } from './models/base-dex';
import { LiquidityPool } from './models/liquidity-pool';
import { DEX_IDENTIFIERS } from './utils';
const MIN_POOL_ADA: bigint = 3_000_000n;

export class WingRiders extends BaseDex {
    public static readonly identifier: string = DEX_IDENTIFIERS.WINGRIDER;

    /**
     * On-Chain constants.
     */
    public readonly orderAddress: string =
        'addr1wxr2a8htmzuhj39y2gq7ftkpxv98y2g67tg8zezthgq4jkg0a4ul4';
    public readonly poolValidityPolicy: string =
        '026a18d04a0c642759bb3d83b12e3344894e5c1c7b2aeb1a2113a570';
    public readonly poolValidityAssetIden: string =
        '026a18d04a0c642759bb3d83b12e3344894e5c1c7b2aeb1a2113a570.4c';
    public readonly cancelDatum: string = 'd87a80';
    public readonly orderScript = {
        type: 'PlutusV1',
        script: '590370010000332332233322232323332223332223233223232323232332233222232322323225335301533225335301a00221333573466e3c02cdd7299a9a8101980924004a66a6a040660249000299a9a8101980924000a66a6a04066024900019a980b8900098099bac5335350203301248000d4d54054c0440088800858884008004588854cd4d4088004588854cd4d409000440088858588854cd4d4088004588854cd4d4090004588854cd4d409800440188858588854cd4d4088004588854cd4d409000440108858588854cd4d4088004400888580680644cc88d4c03400888d4c0440088888cc05cdd70019918139bac0015335350273301948000d4d54070c06001c88008588854cd4d40a4004588854cd4d40ac004588854cd4d40b4004588854cd4d40bc004588854cd4d40c4004588854cd4d40cc004588854cd4d40d400458884008cccd5cd19b8735573aa010900011980699191919191999ab9a3370e6aae75401120002333301535742a0086ae85400cd5d0a8011aba135744a004464c6a605266ae700900a80680644d5d1280089aba25001135573ca00226ea8004d5d0a8041aba135744a010464c6a604666ae7007809005004c004cccd5cd19b8750024800880688cccd5cd19b875003480008c8c074004dd69aba135573ca00a464c6a604466ae7007408c04c0480440044084584d55cea80089baa001135573ca00226ea80048848cc00400c0088004888848cccc00401401000c0088004c8004d540548894cd4d404c00440308854cd4c034ccd5cd19b8f00400200f00e100f13300500400125335350103300248000004588854cd4d4048004588854cd4d40500044cd54028010008885888c8d4d54018cd5401cd55cea80098021aab9e5001225335300b333573466e1c0140080340304004584dd5000990009aa809111999aab9f0012501223350113574200460066ae8800800d26112212330010030021120013200135500e2212253353500d0021622153353007333573466e1c00d2000009008100213353006120010013370200690010910010910009000909118010018910009000a490350543100320013550062233335573e0024a00c466a00a6eb8d5d080118019aba2002007112200212212233001004003120011200120011123230010012233003300200200148811ce6c90a5923713af5786963dee0fdffd830ca7e0c86a041d9e5833e910001',
    };

    constructor(kupoApi: KupoApi) {
        super(kupoApi);
    }

    async allLiquidityPools(): Promise<LiquidityPool[]> {
        const utxos = await this.allLiquidityPoolUtxos();

        let pools: LiquidityPool[] = [];
        utxos.map(async (utxo) => {
            const pool = await this.liquidityPoolFromUtxo(utxo);
            if (pool) pools.push(pool);
        });

        return pools;
    }

    async allLiquidityPoolUtxos(): Promise<UTXO[]> {
        return await this.kupoApi.get(this.poolValidityAssetIden, true);
    }

    async liquidityPoolFromUtxo(
        utxo: UTXO,
        poolId: string = ''
    ): Promise<LiquidityPool | undefined> {
        if (!utxo.data_hash) {
            return Promise.resolve(undefined);
        }

        const relevantAssets: Unit[] = utxo.amount.filter(
            (assetBalance: Unit) => {
                const assetBalanceId: string = assetBalance.unit;

                return !assetBalanceId.startsWith(this.poolValidityPolicy);
            }
        );

        // Irrelevant UTxO
        if (relevantAssets.length < 2) {
            return Promise.resolve(undefined);
        }

        // Could be ADA/X or X/X pool
        const assetAIndex: number = relevantAssets.length === 2 ? 0 : 1;
        const assetBIndex: number = relevantAssets.length === 2 ? 1 : 2;

        const assetAQuantity: bigint = BigInt(
            relevantAssets[assetAIndex].quantity
        );
        const assetBQuantity: bigint = BigInt(
            relevantAssets[assetBIndex].quantity
        );

        const liquidityPool: LiquidityPool = new LiquidityPool(
            this,
            identifierToAsset(relevantAssets[assetAIndex].unit),
            identifierToAsset(relevantAssets[assetBIndex].unit),
            relevantAssets[assetAIndex].unit === LOVELACE
                ? assetAQuantity - MIN_POOL_ADA < 1_000_000n
                    ? assetAQuantity - MIN_POOL_ADA
                    : assetAQuantity
                : assetAQuantity,
            relevantAssets[assetBIndex].unit === LOVELACE
                ? assetBQuantity - MIN_POOL_ADA < 1_000_000n
                    ? assetBQuantity - MIN_POOL_ADA
                    : assetBQuantity
                : assetBQuantity,
            utxo.address,
            0.35,
            poolId
        );

        return liquidityPool;
    }

    async liquidityPoolFromUtxoExtend(
        utxo: UTXO,
        poolId: string = ''
    ): Promise<LiquidityPool | undefined> {
        let liquidityPool = await this.liquidityPoolFromUtxo(utxo, poolId);
        if (!liquidityPool) {
            return Promise.resolve(undefined);
        }

        const datum = await this.kupoApi.datum(utxo.data_hash!);
        let jsonDatum = cborToDatumJson(datum);

        const builder: DefinitionBuilder =
            await new DefinitionBuilder().loadDefinition(pool);

        const parameters: DatumParameters = builder.pullParameters(
            jsonDatum as DefinitionConstr
        );

        liquidityPool.reserveA =
            typeof parameters.PoolAssetATreasury === 'number' ||
            typeof parameters.PoolAssetATreasury === 'string'
                ? liquidityPool.reserveA - BigInt(parameters.PoolAssetATreasury)
                : liquidityPool.reserveA;
        liquidityPool.reserveB =
            typeof parameters.PoolAssetBTreasury === 'number' ||
            typeof parameters.PoolAssetBTreasury === 'string'
                ? liquidityPool.reserveB - BigInt(parameters.PoolAssetBTreasury)
                : liquidityPool.reserveB;

        return liquidityPool;
    }

    async liquidityPoolFromPoolId(
        poolId: string
    ): Promise<LiquidityPool | undefined> {
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

    async liquidityPoolsFromToken(
        tokenB: string,
        tokenA: string = LOVELACE,
        allLiquidityPools: LiquidityPool[] = []
    ): Promise<Array<LiquidityPool> | undefined> {
        allLiquidityPools =
            allLiquidityPools.length > 0
                ? allLiquidityPools
                : await this.allLiquidityPools();
        let pools = allLiquidityPools.filter((pool) => {
            return (
                (compareTokenWithPolicy(pool.assetA, tokenA) &&
                    compareTokenWithPolicy(pool.assetB, tokenB)) ||
                (compareTokenWithPolicy(pool.assetA, tokenB) &&
                    compareTokenWithPolicy(pool.assetB, tokenA))
            );
        });

        if (pools.length === 0) {
            return Promise.resolve(undefined);
        }

        return (
            await Promise.all(
                pools.map(async (pool) => {
                    return await this.liquidityPoolFromPoolId(pool.poolId);
                })
            )
        ).filter((pool) => pool !== undefined) as LiquidityPool[];
    }
}
