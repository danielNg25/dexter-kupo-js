import { DefinitionBuilder } from './definitions/definition-builder';
import pool from './definitions/vyfi-bar/pool';
import { cborToDatumJson } from './definitions/utils';
import { DEX_IDENTIFIERS } from './utils';
export class VyfiBar {
    constructor(kupoApi) {
        this.identifier = DEX_IDENTIFIERS.VYFIBAR;
        this.kupoApi = kupoApi;
    }
    async getRate(poolIdentifier) {
        const utxos = await this.rateUtxos(poolIdentifier);
        const utxo = utxos[0];
        const baseAsset = utxo.amount.find((asset) => asset.unit !== 'lovelace' &&
            !asset.unit.includes(poolIdentifier.split('.').join('')));
        const baseAssetAmount = baseAsset?.quantity;
        const datum = await this.kupoApi.datum(utxo.data_hash);
        const rate = await this.parseOrderDatum(datum);
        return {
            baseAsset: BigInt(baseAssetAmount),
            derivedAsset: BigInt(rate.ReserveA),
        };
    }
    async rateFromUtxo(utxo) {
        if (!utxo.data_hash)
            return undefined;
        return await this.fetchAndParseRateDatum(utxo.data_hash);
    }
    async rateUtxos(poolIdentifier) {
        return await this.kupoApi.get(poolIdentifier, true);
    }
    async parseOrderDatum(datum) {
        try {
            let jsonDatum = cborToDatumJson(datum);
            const builder = await new DefinitionBuilder().loadDefinition(pool);
            const parameters = builder.pullParameters(jsonDatum);
            return parameters;
        }
        catch (error) {
            throw new Error(`Failed to parse order datum: ${error}`);
        }
    }
    async fetchAndParseRateDatum(datumHash) {
        const datum = await this.kupoApi.datum(datumHash);
        if (!datum) {
            throw new Error(`Datum not found for hash: ${datumHash}`);
        }
        let orderData = await this.parseOrderDatum(datum);
        return {
            baseAsset: BigInt(orderData.ReserveA),
            derivedAsset: BigInt(orderData.ReserveB),
        };
    }
}
