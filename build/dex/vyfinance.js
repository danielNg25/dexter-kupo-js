import { Asset, tokenName } from '../models/asset';
import { compareTokenWithPolicy, identifierToAsset, LOVELACE, retry, } from '../utils';
import { DefinitionBuilder } from './definitions/definition-builder';
import pool from './definitions/vyfinance/pool';
import { cborToDatumJson } from './definitions/utils';
import { BaseDex } from './models/base-dex';
import { LiquidityPool } from './models/liquidity-pool';
import { DEX_IDENTIFIERS } from './utils';
import * as fs from 'fs';
import order from './definitions/vyfinance/order';
// Function to structure and write data to a JSON file
function writeVyfinanceDataToFile(data, filePath) {
    const structuredData = {};
    data.forEach((pool) => {
        const [tokenA, tokenB] = pool.unitsPair.split('/');
        if (!structuredData[tokenA]) {
            structuredData[tokenA] = {};
        }
        if (!structuredData[tokenA][tokenB]) {
            structuredData[tokenA][tokenB] = [];
        }
        structuredData[tokenA][tokenB].push(pool);
    });
    // Write the structured data to a JSON file
    fs.writeFileSync(filePath, JSON.stringify(structuredData, null, 2));
}
function writeVyfinanceOrderAddressAsKeyToFile(data, filePath) {
    const structuredData = {};
    data.forEach((pool) => {
        structuredData[pool.orderValidatorUtxoAddress] = pool;
    });
    fs.writeFileSync(filePath, JSON.stringify(structuredData, null, 2));
}
export class Vyfinance extends BaseDex {
    constructor(kupoApi) {
        super(kupoApi);
        this.identifier = DEX_IDENTIFIERS.VYFINANCE;
        /**
         * On-Chain constants.
         */
        this.cancelDatum = 'd87a80';
        this.orderScript = {
            type: 'PlutusV1',
            script: '590a8c010000332323232322232322322323253353330093333573466e1cd55cea803a40004646424660020060046464646666ae68cdc3a800a40184642444444460020106eb4d5d09aab9e500323333573466e1d4009200a232122222223002008375a6ae84d55cf280211999ab9a3370ea00690041190911111118018041bad357426aae7940148cccd5cd19b875004480188c848888888c010020dd69aba135573ca00c46666ae68cdc3a802a400842444444400a46666ae68cdc3a8032400446424444444600c0106464646666ae68cdc39aab9d5002480008cc8848cc00400c008dd69aba15002375a6ae84d5d1280111931a99ab9c01d01c01b01a135573ca00226ea8004d5d09aab9e500823333573466e1d401d2000232122222223007008375a6ae84d55cf280491931a99ab9c01a019018017016015014013012011135573aa00226ea8004d5d09aba25008375c6ae85401c8c98d4cd5ce0078070068061999ab9a3370ea0089001109100111999ab9a3370ea00a9000109100091931a99ab9c01000f00e00d00c3333573466e1cd55cea8012400046644246600200600464646464646464646464646666ae68cdc39aab9d500a480008cccccccccc888888888848cccccccccc00402c02802402001c01801401000c008d5d0a80519a80b90009aba1500935742a0106ae85401cd5d0a8031aba1500535742a00866a02eeb8d5d0a8019aba15002357426ae8940088c98d4cd5ce00d80d00c80c09aba25001135744a00226ae8940044d5d1280089aba25001135744a00226ae8940044d5d1280089aab9e5001137540026ae854008c8c8c8cccd5cd19b875001480188c848888c010014c8c8c8c8c8c8cccd5cd19b8750014803084888888800c8cccd5cd19b875002480288488888880108cccd5cd19b875003480208cc8848888888cc004024020dd71aba15005375a6ae84d5d1280291999ab9a3370ea00890031199109111111198010048041bae35742a00e6eb8d5d09aba2500723333573466e1d40152004233221222222233006009008301b35742a0126eb8d5d09aba2500923333573466e1d40192002232122222223007008301c357426aae79402c8cccd5cd19b875007480008c848888888c014020c074d5d09aab9e500c23263533573804003e03c03a03803603403203002e26aae7540104d55cf280189aab9e5002135573ca00226ea8004d5d09aab9e500323333573466e1d400920042321222230020053011357426aae7940108cccd5cd19b875003480088c848888c004014c8c8c8cccd5cd19b8735573aa004900011991091980080180119191999ab9a3370e6aae75400520002375c6ae84d55cf280111931a99ab9c01c01b01a019137540026ae854008dd69aba135744a004464c6a66ae7006406005c0584d55cf280089baa001357426aae7940148cccd5cd19b875004480008c848888c00c014dd71aba135573ca00c464c6a66ae7005805405004c0480440404d55cea80089baa001357426ae8940088c98d4cd5ce007807006806080689931a99ab9c4901035054350000d00c135573ca00226ea80044d55ce9baa001135573ca00226ea800448c88c008dd60009900099180080091191999aab9f0022122002233221223300100400330053574200660046ae8800c01cc0080088c8c8c8c8cccd5cd19b875001480088ccc888488ccc00401401000cdd69aba15004375a6ae85400cdd69aba135744a00646666ae68cdc3a8012400046424460040066464646666ae68cdc3a800a400446424460020066eb8d5d09aab9e500323333573466e1d400920002321223002003375c6ae84d55cf280211931a99ab9c00f00e00d00c00b135573aa00226ea8004d5d09aab9e500623263533573801401201000e00c26aae75400c4d5d1280089aab9e5001137540029309000a481035054310033232323322323232323232323232332223222253350021350012232350032222222222533533355301512001321233001225335002210031001002501e25335333573466e3c0300040540504d40800045407c00c84054404cd4c8c8d4cc8848cc00400c008ccdc624000030004a66a666ae68cdc7a800a4410000b00a150151350165001223355011002001133371802e02e0026a00a4400444004260086a6464646464a66a6666666ae900148cccd5cd19b8735573aa00a900011999aab9f500525019233335573ea00a4a03446666aae7d40149406c8cccd55cf9aba2500625335323232323333333574800846666ae68cdc39aab9d5004480008cccd55cfa8021281191999aab9f500425024233335573e6ae89401494cd4c088d5d0a80390a99a99a811119191919191999999aba400623333573466e1d40092002233335573ea00c4a05e46666aae7d4018940c08cccd55cfa8031281891999aab9f35744a00e4a66a605a6ae854028854cd4c0b8d5d0a80510a99a98179aba1500a21350361223330010050040031503415033150322503203303203103023333573466e1d400d2000233335573ea00e4a06046666aae7cd5d128041299a98171aba150092135033122300200315031250310320312502f02c02b2502d2502d2502d2502d02e135573aa00826ae8940044d5d1280089aab9e5001137540026ae85401c84d40a048cc00400c0085409854094940940980940909408807c940849408494084940840884d5d1280089aab9e5001137540026ae854024854cd4ccd54054070cd54054070060d5d0a80490a99a99a80d00e9aba150092135020123330010040030021501e1501d1501c2501c01d01c01b01a250180152501725017250172501701821001135626135744a00226ae8940044d55cf280089baa00135001223500222222222225335009132635335738921035054380001f01b22100222200232001355011225335001100422135002225335333573466e3c00801c02402040244c01800c488008488004c8004d5403488448894cd40044d400c88004884ccd401488008c010008ccd54c01c480040140100044488c88ccccccd5d2000aa8029299a98019bab002213500f0011500d55005550055500500e3200135500e223233335573e00446a01e2440044a66a600c6aae754008854cd4c018d55cf280190a99a98031aba200521350123212233001003004335500b003002150101500f1500e00f135742002224a0102244246600200600446666666ae900049401c9401c9401c8d4020dd6801128038040911919191999999aba400423333573466e1d40092000233335573ea0084a01846666aae7cd5d128029299a98049aba15006213500f3500f0011500d2500d00e00d23333573466e1d400d2002233335573ea00a46a01ca01a4a01a01c4a0180120104a0144a0144a0144a01401626aae7540084d55cf280089baa00123232323333333574800846666ae68cdc3a8012400446666aae7d4010940288cccd55cf9aba2500525335300a35742a00c426a01a24460020062a0164a01601801646666ae68cdc3a801a400046666aae7d40149402c8cccd55cf9aba2500625335300b35742a00e426a01c24460040062a0184a01801a0184a01400e00c4a0104a0104a0104a01001226aae7540084d55cf280089baa0014988ccccccd5d20009280192801928019280191a8021bae002004121223002003112200112001480e0448c8c00400488cc00cc00800800522011c',
        };
    }
    async allLiquidityPoolDatas() {
        const res = await fetch('https://api.vyfi.io/lp?networkId=1&v2=true', {});
        let data = await res.json();
        data.map(async (poolData) => {
            let json = JSON.parse(poolData.json).mainNFT;
            poolData.poolNftPolicyId = `${json.currencySymbol}.${json.tokenName}`;
        });
        return data;
    }
    async allLiquidityPools() {
        throw new Error('Method not implemented.');
    }
    async liquidityPoolFromUtxo(utxo, poolId = '') {
        if (!utxo.data_hash) {
            return Promise.resolve(undefined);
        }
        let poolIdToCheck = poolId.replace('.', '');
        const relevantAssets = utxo.amount.filter((assetBalance) => {
            const assetBalanceId = assetBalance.unit;
            return assetBalanceId !== poolIdToCheck;
        });
        // Irrelevant UTxO
        if (relevantAssets.length < 2) {
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
            liquidityPool.reserveA =
                typeof parameters.PoolAssetABarFee === 'number' ||
                    typeof parameters.PoolAssetABarFee === 'string'
                    ? liquidityPool.reserveA -
                        BigInt(parameters.PoolAssetABarFee)
                    : liquidityPool.reserveA;
            liquidityPool.reserveB =
                typeof parameters.PoolAssetBBarFee === 'number' ||
                    typeof parameters.PoolAssetBBarFee === 'string'
                    ? liquidityPool.reserveB -
                        BigInt(parameters.PoolAssetBBarFee)
                    : liquidityPool.reserveB;
        }
        catch (e) {
            throw new Error(`Failed parsing datum for liquidity pool ${liquidityPool.dex.identifier} ${tokenName(liquidityPool.assetA)}/${tokenName(liquidityPool.assetB)}  PoolId: ${liquidityPool.poolId}`);
            return undefined;
        }
        return liquidityPool;
    }
    async liquidityPoolFromPoolId(poolId) {
        const nft = Asset.fromIdentifier(poolId).identifier('.');
        const utxos = await this.kupoApi.get(nft, true);
        if (utxos.length === 0) {
            return Promise.resolve(undefined);
        }
        return this.liquidityPoolFromUtxoExtend(utxos[0], poolId);
    }
    async liquidityPoolFromValidatorAddress(validatorAddress, filePath) {
        // Ensure the file exists
        if (!fs.existsSync(filePath)) {
            const data = await this.allLiquidityPoolDatas();
            writeVyfinanceOrderAddressAsKeyToFile(data, filePath);
        }
        // Parse the structured data
        let structuredData = JSON.parse(fs.readFileSync(filePath, 'utf8'));
        if (!structuredData[validatorAddress]) {
            const data = await this.allLiquidityPoolDatas();
            writeVyfinanceOrderAddressAsKeyToFile(data, filePath);
            structuredData = JSON.parse(fs.readFileSync(filePath, 'utf8'));
            if (!structuredData[validatorAddress]) {
                return undefined;
            }
        }
        let pool = structuredData[validatorAddress];
        return retry(() => this.liquidityPoolFromPoolId(pool.poolNftPolicyId), 5, 100);
    }
    async liquidityPoolsFromToken(tokenB, tokenA = LOVELACE, tokenBDecimals = 0, tokenADecimals = 6, filePath) {
        tokenB = tokenB.split('.').join('');
        tokenA = tokenA.split('.').join('');
        // Ensure the file exists
        if (!fs.existsSync(filePath)) {
            const data = await this.allLiquidityPoolDatas();
            writeVyfinanceDataToFile(data, filePath);
        }
        // Parse the structured data
        let structuredData = JSON.parse(fs.readFileSync(filePath, 'utf8'));
        // Check if the structure is defined before accessing nested properties
        const tokenBData = structuredData[tokenB] || {};
        const tokenAData = structuredData[tokenA] || {};
        if (!tokenBData[tokenA] && !tokenAData[tokenB]) {
            const data = await this.allLiquidityPoolDatas();
            writeVyfinanceDataToFile(data, filePath);
            structuredData = JSON.parse(fs.readFileSync(filePath, 'utf8'));
            // Update the structure again after refetching
            const newTokenBData = structuredData[tokenB] || {};
            const newTokenAData = structuredData[tokenA] || {};
            if (!newTokenBData[tokenA] && !newTokenAData[tokenB]) {
                return undefined;
            }
        }
        // Aggregate pool data
        const poolDatas = [
            ...(structuredData[tokenB]?.[tokenA] || []),
            ...(structuredData[tokenA]?.[tokenB] || []),
        ];
        // Fetch pools
        const pools = await Promise.all(poolDatas.map(async (poolData) => retry(() => this.liquidityPoolFromPoolId(poolData.poolNftPolicyId), 5, 100)));
        // Return filtered pools
        return pools.filter((pool) => pool !== undefined).map((pool) => {
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
