import { tokenName } from '../models';
import { compareTokenWithPolicy, identifierToAsset, LOVELACE } from '../utils';
import { DefinitionBuilder } from './definitions/definition-builder';
import pool from './definitions/sundaeswap-v3/pool';
import { cborToDatumJson } from './definitions/utils';
import { BaseDex } from './models/base-dex';
import { LiquidityPool } from './models/liquidity-pool';
import { DEX_IDENTIFIERS } from './utils';
export class SundaeSwapV3 extends BaseDex {
    constructor(kupoApi) {
        super(kupoApi);
        this.identifier = DEX_IDENTIFIERS.SUNDAESWAPV3;
        /**
         * On-Chain constants.
         */
        this.poolAddress = 'addr1x8srqftqemf0mjlukfszd97ljuxdp44r372txfcr75wrz26rnxqnmtv3hdu2t6chcfhl2zzjh36a87nmd6dwsu3jenqsslnz7e';
        this.lpTokenPolicyId = 'e0302560ced2fdcbfcb2602697df970cd0d6a38f94b32703f51c312b';
        this.cancelDatum = 'd87a80';
        this.orderScriptHash = 'fa6a58bbe2d0ff05534431c8e2f0ef2cbdc1602a8456e4b13c8f3077';
        this.orderScript = {
            type: 'PlutusV2',
            script: '5909a201000033232323232323223222323232253330093232533300b3005300c375400e264646464646466664444646600200200a4464a6660306026002264646600200201044a66603c00229404c94ccc070cdc79bae302100200414a226600600600260420026eb8c074c068dd50010a99980c1809000899198008009bac301e301b375400644a66603a00229444c94ccc06ccc018018c0800084cc00c00c00452818100008a99980c1806800899198008009bac301e301b375400644a66603a00229404c94ccc06ccc018018c08000852889980180180098100008a99980c180600089919b89375a603c002646660020026eb0c07cc0800092000222533301f002100113330030033022002533301c33007007302100213370000290010800980d1baa00215333018300b00113232533301a3014301b3754002264a66603664a66603e603c0022a666038602c603a002294454ccc070c05cc0740045280b0b1baa300b301d37546016603a6ea80204cdc4800801899b88001003375a603e60386ea80045281807980d9baa3009301b375400c6eb4c074c068dd50010a99980c180500089919299980d180a180d9baa001132533301b32533301f301e0011533301c3016301d00114a22a666038602e603a00229405858dd51805980e9baa3011301d3754010266e2400c0044cdc40018009bad301f301c37540022940c03cc06cdd51807980d9baa006375a603a60346ea80084c8c8cc004004018894ccc078004528099299980e19baf004301d302100214a2266006006002604200266e9520003301c3374a90011980e180e980d1baa0024bd7025eb80c060dd5000980098099baa00e3758602c602e602e602e602e602e602e602e602e60266ea8c01cc04cdd5004980b180b980b980b980b980b980b980b98099baa3007301337540126eacc020c04cdd5180398099baa009230163017001323232325333013300e301437540202646464646464646464646464a666044604a00426464646493192999811980f000899192999814181580109924c64a66604c604200226464a666056605c0042930b1bae302c001302837540042a66604c604000226464a666056605c0042930b1bae302c001302837540042c604c6ea800458c0a4004c094dd50038a999811980e800899191919299981518168010991924c6464646464a66606060660042930b1bad30310013031002375c605e002605e0066eb8c0b4008c8c8c8c8c94ccc0bcc0c800852616375a606000260600046eb8c0b8004c0b8010dd718160018b1bac302b001302b00237586052002604a6ea801c54ccc08cc0600044c8c94ccc0a0c0ac0084c926323232323232323253330303033002149858dd6981880098188011bae302f001302f003375c605a0046464646464a66605e60640042930b1bad30300013030002375c605c002605c0066eb8c0b0008dd618140011bac302600116325333028302b302b0011337606054002605460560022c6eb0c0a4004c094dd50038a999811980b800899192999814181580109924c6464646464a66605a60600042930b1bad302e001302e002375c605800260580046eb8c0a800458dd6181480098129baa007153330233016001132325333028302b002132498c8c8c8c8c8c8c8c94ccc0c0c0cc00852616375a606200260620046eb8c0bc004c0bc00cdd718168011919191919299981798190010a4c2c6eb4c0c0004c0c0008dd7181700098170019bae302c002375860500046eb0c09800458c94ccc0a0c0acc0ac0044cdd81815000981518158008b1bac30290013025375400e2a666046602a00226464a666050605600426493191bae3028002375c604c0022c64a66605060566056002266ec0c0a8004c0a8c0ac00458dd6181480098129baa007163023375400c64a666044603a002264646464a6660526058004264649319299981418118008a99981598151baa00314985854ccc0a0c0880044c8c94ccc0b4c0c000852616375c605c00260546ea800c54ccc0a0c0740044c8c94ccc0b4c0c000852616302e001302a37540062c60506ea80094ccc098c084c09cdd5001899191919299981698180010991924c64a666058604e00226464a666062606800426493192999817981500089919299981a181b80109924c60440022c606a00260626ea800854ccc0bcc0a40044c8c8c8c8c8c94ccc0e0c0ec00852616375a607200260720046eb4c0dc004c0dc008dd6981a80098189baa00216302f37540022c6064002605c6ea800c54ccc0b0c09800454ccc0bcc0b8dd50018a4c2c2c60586ea8008c06c00c58c0b8004c0b8008c0b0004c0a0dd50018b0b18150009815001181400098121baa00815333022301c00115333025302437540102930b0b18111baa007300e00a325333020301b0011323253330253028002149858dd7181300098111baa00c15333020301a00115333023302237540182930b0b18101baa00b163023001302300230210013021002301f001301f002375a603a002603a004603600260360046032002602a6ea804058c00400488c94ccc050c03c0044c8c94ccc064c07000852616375c6034002602c6ea800854ccc050c0380044c8c94ccc064c0700084c926330060012330060060011637586034002602c6ea800854ccc050c0240044c8c94ccc064c0700084c926330060012330060060011637586034002602c6ea800854ccc050c0200044c8c8c8c94ccc06cc0780084c92633008001233008008001163758603800260380046eb4c068004c058dd50010a99980a180380089919299980c980e0010a4c2c6eb4c068004c058dd50010a99980a180300089919299980c980e0010a4c2c6eb4c068004c058dd50010a99980a19b87480300044c8c94ccc064c07000852616375c6034002602c6ea800858c050dd500091191980080080191299980b8008a4c26466006006603600460066032002464a666022601800226464a66602c60320042930b1bae3017001301337540042a666022601600226464a66602c60320042930b1bae3017001301337540042c60226ea8004dc3a40146e1d2008370e90031b87480104c8ccc004004dd5980198071baa3002300e37540089408894ccc04400840044c8ccc010010c05400ccc88c94ccc048c034c04cdd500189929998099806980a1baa001132533301400714a2266e3c004048dd7180c180a9baa001002301730143754006002200860200026eb4c044004c04c0088c0400048c03cc040c040c040c040c040c0400045261365632533300830030011533300b300a37540082930b0a99980418010008a99980598051baa00414985858c020dd50019b8748008dc3a40006eb80055cd2ab9d5573caae7d5d02ba1574498011e581c99e5aacf401fed0eb0e2993d72d423947f42342e8f848353d03efe610001',
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
        return await this.kupoApi.get(this.poolAddress, true);
    }
    async liquidityPoolFromUtxo(utxo, poolId = '') {
        if (!utxo.data_hash) {
            return Promise.resolve(undefined);
        }
        const relevantAssets = utxo.amount.filter((assetBalance) => {
            const assetBalanceId = assetBalance.unit;
            if (assetBalanceId.startsWith(this.lpTokenPolicyId)) {
                poolId = assetBalanceId;
                return false;
            }
            else {
                return true;
            }
        });
        // Irrelevant UTxO
        if (![2, 3].includes(relevantAssets.length)) {
            return Promise.resolve(undefined);
        }
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
                typeof parameters.FinalFee === 'string' ||
                    typeof parameters.FinalFee === 'number'
                    ? Number(parameters.FinalFee) / 100
                    : 0;
            if (parameters.LovelaceDeduction) {
                const deduction = BigInt(parameters.LovelaceDeduction);
                if (compareTokenWithPolicy(liquidityPool.assetA, LOVELACE)) {
                    liquidityPool.reserveA -= deduction;
                }
                else if (compareTokenWithPolicy(liquidityPool.assetB, LOVELACE)) {
                    liquidityPool.reserveB -= deduction;
                }
            }
        }
        catch (e) {
            console.error(`Failed parsing datum for liquidity pool ${liquidityPool.dex.identifier} ${tokenName(liquidityPool.assetA)}/${tokenName(liquidityPool.assetB)}`);
            return undefined;
        }
        return liquidityPool;
    }
    async liquidityPoolFromPoolId(poolId) {
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
