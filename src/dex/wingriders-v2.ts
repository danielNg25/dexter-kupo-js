import { KupoApi } from '../KupoApi';
import { Unit, UTXO } from '../types';
import {
    compareTokenWithPolicy,
    identifierToAsset,
    LOVELACE,
    retry,
} from '../utils';
import { DefinitionBuilder } from './definitions/definition-builder';
import pool from './definitions/wingriders-v2/pool';
import stable_pool from './definitions/wingriders-v2/stable-pool';
import { DatumParameters, DefinitionConstr } from './definitions/types';
import { cborToDatumJson } from './definitions/utils';
import { BaseDex } from './models/base-dex';
import { LiquidityPool } from './models/liquidity-pool';
import { DEX_IDENTIFIERS } from './utils';
import { tokenName } from '../models';
import order from './definitions/wingriders-v2/order';
const MIN_POOL_ADA: bigint = 3_000_000n;

export class WingRidersV2 extends BaseDex {
    public readonly identifier: string = DEX_IDENTIFIERS.WINGRIDERV2;

    /**
     * On-Chain constants.
     */
    public readonly orderAddress: string =
        'addr1w8qnfkpe5e99m7umz4vxnmelxs5qw5dxytmfjk964rla98q605wte';
    public readonly poolValidityPolicy: string =
        '6fdc63a1d71dc2c65502b79baae7fb543185702b12c3c5fb639ed737';
    public readonly poolValidityAssetIden: string =
        '6fdc63a1d71dc2c65502b79baae7fb543185702b12c3c5fb639ed737.4c';
    public readonly poolValidityAssetIdenCheck: string =
        '6fdc63a1d71dc2c65502b79baae7fb543185702b12c3c5fb639ed7374c';
    public readonly cancelDatum: string = 'd87a80';
    public readonly orderScript = {
        type: 'PlutusV2',
        script: '59019e010000323232323232323232222325333008001149858c8c8c94ccc028cdc3a40040042664601444a666aae7c0045280a99980699baf301000100314a226004601c00264646464a66601c66e1d20000021301100116301100230110013754601c601a002601a6010601800c646eb0c038c8c034c034c034c034c034c034c028004c034004c034c0300104ccc888cdc79919191bae301300132323253330123370e90000010b0800980a801180a8009baa3012301100132301230110013011300f301000133300c222533301033712900500109980199b8100248028c044c044c044c044c04400454ccc040cdc3801240002602600226644a66602466e20009200016133301122253330153370e00490000980c00089980199b8100248008c058004008004cdc0801240046022002004646eb0c044c040004c040c03c00400cdd70039bad300d001004300d002300d00137540046ea52211caf97793b8702f381976cec83e303e9ce17781458c73c4bb16fe02b83002300430040012323002233002002001230022330020020015734ae888c00cdd5000aba15573caae741',
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

        poolId =
            utxo.amount.find(
                (amount) =>
                    amount.unit.startsWith(this.poolValidityPolicy) &&
                    amount.unit !== this.poolValidityAssetIdenCheck
            )?.unit || poolId;

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

        try {
            const datum = await this.kupoApi.datum(utxo.data_hash!);
            let jsonDatum = cborToDatumJson(datum);

            let parameters: DatumParameters;
            try {
                // Change this if want to have stable pool
                const builder: DefinitionBuilder =
                    await new DefinitionBuilder().loadDefinition(stable_pool);
                parameters = builder.pullParameters(
                    jsonDatum as DefinitionConstr
                );
                if (parameters.WingRidersV2Special) {
                    return undefined;
                }
            } catch {}

            const builder: DefinitionBuilder =
                await new DefinitionBuilder().loadDefinition(pool);

            parameters = builder.pullParameters(jsonDatum as DefinitionConstr);

            liquidityPool.reserveA =
                typeof parameters.PoolAssetATreasury === 'number'
                    ? liquidityPool.reserveA -
                      BigInt(parameters.PoolAssetATreasury)
                    : liquidityPool.reserveA;
            liquidityPool.reserveB =
                typeof parameters.PoolAssetBTreasury === 'number'
                    ? liquidityPool.reserveB -
                      BigInt(parameters.PoolAssetBTreasury)
                    : liquidityPool.reserveB;

            let SwapFee = parameters.SwapFee ? Number(parameters.SwapFee) : 0;
            let ProtocolFee = parameters.ProtocolFee
                ? Number(parameters.ProtocolFee)
                : 0;
            let ProjectFeeInBasis = parameters.ProjectFeeInBasis
                ? Number(parameters.ProjectFeeInBasis)
                : 0;
            let ReserveFeeInBasis = parameters.ReserveFeeInBasis
                ? Number(parameters.ReserveFeeInBasis)
                : 0;
            liquidityPool.poolFeePercent =
                (SwapFee +
                    ProtocolFee +
                    ProjectFeeInBasis +
                    ReserveFeeInBasis) /
                100;
        } catch (e) {
            throw new Error(
                `Failed parsing datum for liquidity pool ${
                    liquidityPool.dex.identifier
                } ${tokenName(liquidityPool.assetA)}/${tokenName(
                    liquidityPool.assetB
                )}  PoolId: ${liquidityPool.poolId}`
            );
            return undefined;
        }
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
        tokenBDecimals: number = 0,
        tokenADecimals: number = 6,
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
                pools.map((pool) =>
                    retry(
                        () => this.liquidityPoolFromPoolId(pool.poolId),
                        5,
                        100
                    )
                )
            )
        )
            .filter((pool): pool is LiquidityPool => pool !== undefined) // Type guard for filtering
            .map((pool) => {
                const setDecimals = (
                    asset: typeof pool.assetA | typeof pool.assetB
                ) => {
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

    async parseOrderDatum(datum: string): Promise<DatumParameters> {
        return this._parseOrderDatum(datum, order);
    }

    async fetchAndParseOrderDatum(datumHash: string): Promise<DatumParameters> {
        const datum = await this.kupoApi.datum(datumHash);

        if (!datum) {
            throw new Error(`Datum not found for hash: ${datumHash}`);
        }

        return await this.parseOrderDatum(datum);
    }
}
