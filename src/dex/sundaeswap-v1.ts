import { KupoApi } from '../KupoApi';
import { Asset } from '../models/asset';
import { Unit, UTXO } from '../types';
import { compareTokenWithPolicy, identifierToAsset, LOVELACE } from '../utils';
import { DefinitionBuilder } from './definitions/definition-builder';
import pool from './definitions/sundaeswap-v1/pool';
import { DatumParameters, DefinitionConstr } from './definitions/types';
import { cborToDatumJson } from './definitions/utils';
import { BaseDex } from './models/base-dex';
import { LiquidityPool } from './models/liquidity-pool';
import { DEX_IDENTIFIERS } from './utils';

export class SundaeSwapV1 extends BaseDex {
    public static readonly identifier: string = DEX_IDENTIFIERS.SUNDAESWAPV1;

    /**
     * On-Chain constants.
     */
    public readonly orderAddress: string =
        'addr1wxaptpmxcxawvr3pzlhgnpmzz3ql43n2tc8mn3av5kx0yzs09tqh8';
    public readonly poolAddress: string =
        'addr1w9qzpelu9hn45pefc0xr4ac4kdxeswq7pndul2vuj59u8tqaxdznu';
    public readonly lpTokenPolicyId: string =
        '0029cb7c88c7567b63d1a512c0ed626aa169688ec980730c0473b913';
    public readonly cancelDatum: string = 'd87a80';
    public readonly orderScript = {
        type: 'PlutusV1',
        script: '59084601000033233322232332232333222323332223322323332223233223233223332223333222233322233223322332233223332223322332233322232323232322222325335300b001103c13503d35303b3357389201035054350003c498ccc888c8c8c94cd4c05c0144d4c0680188888cd4c04c480048d4c0ed40188888888888cd4c078480048ccd5cd19b8f375c0020180440420066a6040006446a6048004446a605000444666aa60302400244a66a6a07c0044266a08c0020042002a0886466a002a088a08a2446600466a609000846a0820024a0806600400e00226a606ca002444444444466a6032240024646464666ae68cdc399991119191800802990009aa82c1119a9a826000a4000446a6aa08a00444a66a6050666ae68cdc78010048150148980380089803001990009aa82b9119a9a825800a4000446a6aa08800444a66a604e666ae68cdc7801003814814080089803001999aa81e3ae335503c75ceb4d4c084cccd5cd19b8735573aa006900011998119aba1500335742a00466a080eb8d5d09aba2500223505135304f33573892010350543100050499262220020183371491010270200035302801422220044800808007c4d5d1280089aab9e500113754002012264a66a6a070601a6aae78dd50008a81a910a99a9a81d0008a81b910a99a9a81e0008a81c910a99a9a81f0008a81d910a99a9a8200008a81e910a99a9a8210008a81f910a99a9a8220008a820910a99a9a8230008a821910a99a9a8240008a822910a99a9a8250008a823910a99a9a82600089999999999825981000a18100090080071810006181000500418100031810002001110a8259a980a1999ab9a3370e6aae754009200023301635742a0046ae84d5d1280111a8211a982019ab9c490103505431000414992622002135573ca00226ea8004cd40148c8c8c8c8cccd5cd19b8735573aa00890001199980d9bae35742a0086464646666ae68cdc39aab9d5002480008cc88cc08c008004c8c8c8cccd5cd19b8735573aa004900011991198148010009919191999ab9a3370e6aae754009200023302d304735742a00466a07a4646464646666ae68cdc3a800a4004466606a6eb4d5d0a8021bad35742a0066eb4d5d09aba2500323333573466e1d4009200023037304e357426aae7940188d4154d4c14ccd5ce2490350543100054499264984d55cea80189aba25001135573ca00226ea8004d5d09aba2500223504e35304c335738921035054310004d49926135573ca00226ea8004d5d0a80119a81cbae357426ae8940088d4128d4c120cd5ce249035054310004949926135573ca00226ea8004d5d0a80119a81abae357426ae8940088d4118d4c110cd5ce249035054310004549926135573ca00226ea8004d5d0a8019bad35742a00464646464646666ae68cdc3a800a40084605c646464646666ae68cdc3a800a40044606c6464646666ae68cdc39aab9d5002480008cc88cd40f8008004dd69aba15002375a6ae84d5d1280111a8289a982799ab9c491035054310005049926135573ca00226ea8004d5d09aab9e500423333573466e1d40092000233036304b35742a0086eb4d5d09aba2500423504e35304c335738921035054310004d499264984d55cea80109aab9e5001137540026ae84d55cf280291999ab9a3370ea0049001118169bad357426aae7940188cccd5cd19b875003480008ccc0bcc11cd5d0a8031bad35742a00a66a072eb4d5d09aba2500523504a353048335738920103505431000494992649926135573aa00626ae8940044d55cf280089baa001357426ae8940088d4108d4c100cd5ce249035054310004149926135744a00226ae8940044d55cf280089baa0010033350052323333573466e1d40052002201623333573466e1d40092000201623504035303e335738921035054310003f499264984d55ce9baa001002335005200100112001230023758002640026aa072446666aae7c004940c08cd40bcd5d080118019aba2002498c8004d540e088448894cd4d40bc0044008884cc014008ccd54c01c48004014010004c8004d540dc884894cd4d40b400440188854cd4c01cc01000840244cd4c01848004010004488008488004800488848ccc00401000c00880048848cc00400c00880044880084880048004888848cccc00401401000c00880048848cc00400c00880048848cc00400c00880048848cc00400c00880048488c00800c888488ccc00401401000c800484888c00c0108884888ccc00801801401084888c00401080048488c00800c88488cc00401000c800448848cc00400c008480044488c88c008dd5800990009aa80d11191999aab9f0022501223350113355008300635573aa004600a6aae794008c010d5d100180c09aba10011122123300100300211200112232323333573466e1d400520002350083005357426aae79400c8cccd5cd19b87500248008940208d405cd4c054cd5ce24810350543100016499264984d55cea80089baa00112122300200311220011200113500d35300b3357389211f556e6578706563746564205478496e666f20636f6e737472756374696f6e2e0000c498888888888848cccccccccc00402c02802402001c01801401000c00880044488008488488cc00401000c480048c8c8cccd5cd19b875001480088c018dd71aba135573ca00646666ae68cdc3a80124000460106eb8d5d09aab9e500423500c35300a3357389201035054310000b499264984d55cea80089baa001212230020032122300100320012323333573466e1d40052002200823333573466e1d40092000200a2350073530053357389210350543100006499264984d55ce9baa0011200120011261220021220012001112323001001223300330020020014891c0029cb7c88c7567b63d1a512c0ed626aa169688ec980730c0473b9130001',
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
        return await this.kupoApi.get(this.poolAddress, true);
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
                if (assetBalanceId.startsWith(this.lpTokenPolicyId)) {
                    poolId = assetBalanceId;
                    return false;
                } else {
                    return true;
                }
            }
        );

        // Irrelevant UTxO
        if (![2, 3].includes(relevantAssets.length)) {
            return Promise.resolve(undefined);
        }

        // Could be ADA/X or X/X pool
        const assetAIndex: number = relevantAssets.length === 2 ? 0 : 1;
        const assetBIndex: number = relevantAssets.length === 2 ? 1 : 2;

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

        liquidityPool.poolFeePercent =
            (typeof parameters.LpFeeNumerator === 'string' ||
                typeof parameters.LpFeeNumerator === 'number') &&
            (typeof parameters.LpFeeDenominator === 'number' ||
                typeof parameters.LpFeeDenominator === 'string')
                ? (Number(parameters.LpFeeNumerator) /
                      Number(parameters.LpFeeDenominator)) *
                  100
                : 0;

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

        if (!foundUtxo) {
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
