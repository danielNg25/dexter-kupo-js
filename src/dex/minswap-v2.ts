import { KupoApi } from '../KupoApi';
import { Unit, UTXO } from '../types';
import { compareTokenWithPolicy, identifierToAsset, LOVELACE } from '../utils';
import { DefinitionBuilder } from './definitions/definition-builder';
import { BaseDex } from './models/base-dex';
import { LiquidityPool } from './models/liquidity-pool';
import { DEX_IDENTIFIERS } from './utils';
import pool from './definitions/minswap-v2/pool';
import { DatumParameters, DefinitionConstr } from './definitions/types';
import { cborToDatumJson } from './definitions/utils';

export class MinswapV2 extends BaseDex {
    public readonly identifier: string = DEX_IDENTIFIERS.MINSWAPV2;

    /**
     * On-Chain constants.
     */
    public readonly lpTokenPolicyId: string =
        'f5808c2c990d86da54bfc97d89cee6efa20cd8461616359478d96b4c';
    public readonly poolValidityAsset: string =
        'f5808c2c990d86da54bfc97d89cee6efa20cd8461616359478d96b4c4d5350'; // Pool authen asset
    public readonly orderScriptHash: string =
        'c3e28c36c3447315ba5a56f33da6a6ddc1770a876a8d9f0cb3a97c4c';
    public readonly poolScriptHash: string =
        'ea07b733d932129c378af627436e7cbc2ef0bf96e0036bb51b3bde6b';
    public readonly poolScriptHashBench32: string =
        'script1agrmwv7exgffcdu27cn5xmnuhsh0p0ukuqpkhdgm800xksw7e2w';
    public readonly cancelDatum: string = 'd87a80';
    public readonly orderScript = {
        type: 'PlutusV2',
        script: '590a600100003332323232323232323222222533300832323232533300c3370e900118058008991919299980799b87480000084cc004dd5980a180a980a980a980a980a980a98068030060a99980799b87480080084c8c8c8c8c8c8c8c8c8c8c8c8c8c8c8c8c94ccc080cdc3a4000002264646600200200e44a66604c00229404c8c94ccc094cdc78010028a51133004004001302a002375c60500026eb8c094c07800854ccc080cdc3a40040022646464646600200202844a66605000229404c8c94ccc09ccdd798161812981618129816181698128010028a51133004004001302c002302a0013374a9001198131ba90014bd701bae3026001301e002153330203370e900200089980900419ba548000cc090cdd2a400466048604a603c00497ae04bd70099981019b87375a6044604a66446464a66604866e1d200200114bd6f7b63009bab302930220023022001323300100100322533302700114c103d87a800013232323253330283371e00e004266e9520003302c374c00297ae0133006006003375660520066eb8c09c008c0ac008c0a4004c8cc004004030894ccc09400452f5bded8c0264646464a66604c66e3d22100002100313302a337606ea4008dd3000998030030019bab3027003375c604a0046052004604e0026eb8c094c07800920004a0944c078004c08c004c06c060c8c8c8c8c8c8c94ccc08ccdc3a40000022646464646464646464646464646464646464a6660706076004264646464646464649319299981e99b87480000044c8c94ccc108c1140084c92632375a60840046eb4c10000458c8cdd81822000982218228009bac3043001303b0091533303d3370e90010008a999820181d8048a4c2c2c607601064a66607866e1d2000001132323232323232325333047304a002132498c09401458cdc3a400460886ea8c120004c120008dd6982300098230011822000982200119b8748008c0f8dd51821000981d0060a99981e19b87480080044c8c8c8c8c8c94ccc114c1200084c926302300316375a608c002608c0046088002608800466e1d2002303e3754608400260740182a66607866e1d2004001132323232323232325333047304a002132498c09401458dd6982400098240011bad30460013046002304400130440023370e9001181f1baa3042001303a00c1533303c3370e9003000899191919191919192999823982500109924c604a00a2c66e1d200230443754609000260900046eb4c118004c118008c110004c110008cdc3a4004607c6ea8c108004c0e803054ccc0f0cdc3a40100022646464646464a66608a60900042649319299982199b87480000044c8c8c8c94ccc128c13400852616375a609600260960046eb4c124004c10401854ccc10ccdc3a4004002264646464a666094609a0042930b1bad304b001304b002375a6092002608200c2c608200a2c66e1d200230423754608c002608c0046eb4c110004c110008c108004c0e803054ccc0f0cdc3a401400226464646464646464a66608e60940042649318130038b19b8748008c110dd5182400098240011bad30460013046002375a60880026088004608400260740182a66607866e1d200c001132323232323232325333047304a002132498c09801458cdc3a400460886ea8c120004c120008dd6982300098230011822000982200119b8748008c0f8dd51821000981d0060a99981e19b87480380044c8c8c8c8c8c8c8c8c8c8c8c8c8c94ccc134c14000852616375a609c002609c0046eb4c130004c130008dd6982500098250011bad30480013048002375a608c002608c0046eb4c110004c110008cdc3a4004607c6ea8c108004c0e803054ccc0f0cdc3a4020002264646464646464646464a66609260980042649318140048b19b8748008c118dd5182500098250011bad30480013048002375a608c002608c0046eb4c110004c110008c108004c0e803054ccc0f0cdc3a40240022646464646464a66608a60900042646493181200219198008008031129998238008a4c2646600600660960046464a66608c66e1d2000001132323232533304d3050002132498c0b400c58cdc3a400460946ea8c138004c138008c130004c11000858c110004c12400458dd698230009823001182200098220011bac3042001303a00c1533303c3370e900a0008a99981f981d0060a4c2c2c6074016603a018603001a603001c602c01e602c02064a66606c66e1d200000113232533303b303e002149858dd7181e000981a0090a99981b19b87480080044c8c94ccc0ecc0f800852616375c607800260680242a66606c66e1d200400113232533303b303e002149858dd7181e000981a0090a99981b19b87480180044c8c94ccc0ecc0f800852616375c607800260680242c60680222c607200260720046eb4c0dc004c0dc008c0d4004c0d4008c0cc004c0cc008c0c4004c0c4008c0bc004c0bc008c0b4004c0b4008c0ac004c0ac008c0a4004c08407858c0840748c94ccc08ccdc3a40000022a66604c60420042930b0a99981199b87480080044c8c94ccc0a0c0ac00852616375c605200260420042a66604666e1d2004001132325333028302b002149858dd7181480098108010b1810800919299981119b87480000044c8c8c8c94ccc0a4c0b00084c8c9263253330283370e9000000899192999816981800109924c64a66605666e1d20000011323253330303033002132498c04400458c0c4004c0a400854ccc0accdc3a40040022646464646464a666068606e0042930b1bad30350013035002375a606600260660046eb4c0c4004c0a400858c0a400458c0b8004c09800c54ccc0a0cdc3a40040022a666056604c0062930b0b181300118050018b18150009815001181400098100010b1810000919299981099b87480000044c8c94ccc098c0a400852616375a604e002603e0042a66604266e1d20020011323253330263029002149858dd69813800980f8010b180f800919299981019b87480000044c8c94ccc094c0a000852616375a604c002603c0042a66604066e1d20020011323253330253028002149858dd69813000980f0010b180f000919299980f99b87480000044c8c8c8c94ccc098c0a400852616375c604e002604e0046eb8c094004c07400858c0740048c94ccc078cdc3a400000226464a666046604c0042930b1bae3024001301c0021533301e3370e900100089919299981198130010a4c2c6eb8c090004c07000858c070004dd618100009810000980f8011bab301d001301d001301c00237566034002603400260320026030002602e0046eb0c054004c0340184cc004dd5980a180a980a980a980a980a980a980680300591191980080080191299980a8008a50132323253330153375e00c00229444cc014014008c054008c064008c05c004c03001cc94ccc034cdc3a40000022a666020601600e2930b0a99980699b874800800454ccc040c02c01c526161533300d3370e90020008a99980818058038a4c2c2c601600c2c60200026020004601c002600c00229309b2b118029baa001230033754002ae6955ceaab9e5573eae815d0aba24c126d8799fd87a9f581c1eae96baf29e27682ea3f815aba361a0c6059d45e4bfbe95bbd2f44affff004c0126d8799fd87a9f581cc8b0cc61374d409ff9c8512317003e7196a3e4d48553398c656cc124ffff0001',
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
        return await this.kupoApi.get(this.poolScriptHashBench32 + '/*', true);
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

                return (
                    assetBalanceId !== this.poolValidityAsset &&
                    !assetBalanceId.startsWith(this.lpTokenPolicyId)
                );
            }
        );

        // Irrelevant UTxO
        if (relevantAssets.length < 2) {
            return Promise.resolve(undefined);
        }

        // Could be ADA/X or X/X pool
        const assetAIndex: number = relevantAssets.length === 2 ? 0 : 1;
        const assetBIndex: number = relevantAssets.length === 2 ? 1 : 2;

        poolId =
            utxo.amount.find(
                (amount) =>
                    amount.unit.startsWith(this.lpTokenPolicyId) &&
                    amount.unit !== this.poolValidityAsset
            )?.unit || poolId;

        const liquidityPool: LiquidityPool = new LiquidityPool(
            this,
            identifierToAsset(relevantAssets[assetAIndex].unit),
            identifierToAsset(relevantAssets[assetBIndex].unit),
            BigInt(relevantAssets[assetAIndex].quantity),
            BigInt(relevantAssets[assetBIndex].quantity),
            utxo.address,
            0.3,
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
        // Ignore Zap orders
        if (
            typeof parameters.PoolAssetBPolicyId === 'string' &&
            parameters.PoolAssetBPolicyId === this.lpTokenPolicyId
        ) {
            return undefined;
        }

        liquidityPool.poolFeePercent = Number(parameters.BaseFee) / 100;
        if (
            compareTokenWithPolicy(
                liquidityPool.assetA,
                String(parameters.PoolAssetAPolicyId!) +
                    String(parameters.PoolAssetAAssetName!)
            )
        ) {
            liquidityPool.reserveA = BigInt(parameters.ReserveA!);
            liquidityPool.reserveB = BigInt(parameters.ReserveB!);
        } else {
            liquidityPool.reserveA = BigInt(parameters.ReserveB!);
            liquidityPool.reserveB = BigInt(parameters.ReserveA!);
        }

        return liquidityPool;
    }

    async liquidityPoolFromPoolId(
        poolId: string
    ): Promise<LiquidityPool | undefined> {
        if (!poolId.startsWith(this.lpTokenPolicyId)) {
            poolId = `${this.lpTokenPolicyId}${poolId}`;
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
                pools.map((pool) => this.liquidityPoolFromPoolId(pool.poolId))
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
}
