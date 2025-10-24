import { KupoApi } from '../KupoApi';
import { Token, tokenName } from '../models';
import { Unit, UTXO } from '../types';
import {
    compareTokenWithPolicy,
    identifierToAsset,
    LOVELACE,
    retry,
} from '../utils';
import { DefinitionBuilder } from './definitions/definition-builder';
import order from './definitions/chadswap/order';
import { DatumParameters, DefinitionConstr } from './definitions/types';
import { cborToDatumJson } from './definitions/utils';
import { BaseDex } from './models/base-dex';
import { LiquidityPool } from './models/liquidity-pool';
import { DEX_IDENTIFIERS } from './utils';

export type Rate = {
    baseAsset: bigint;
    derivedAsset: bigint;
};

export class ChadSwap {
    public readonly identifier: string = DEX_IDENTIFIERS.VYFIBAR;
    public readonly kupoApi: KupoApi;

    constructor(kupoApi: KupoApi) {
        this.kupoApi = kupoApi;
    }

    async getRate(poolIdentifier: string): Promise<Rate> {
        const utxos = await this.rateUtxos(poolIdentifier);
        const baseTokenAmount = utxos[0].amount[0].quantity;
        const datum = await this.kupoApi.datum(poolIdentifier);
        const rate = await this.parseOrderDatum(datum);
        return {
            baseAsset: BigInt(baseTokenAmount),
            derivedAsset: BigInt(rate.ReserveA!),
        };
    }

    async rateFromUtxo(utxo: UTXO): Promise<Rate | undefined> {
        if (!utxo.data_hash) return undefined;
        return await this.fetchAndParseRateDatum(utxo.data_hash);
    }

    async rateUtxos(poolIdentifier: string): Promise<UTXO[]> {
        return await this.kupoApi.get(poolIdentifier, true);
    }

    async parseOrderDatum(datum: string): Promise<DatumParameters> {
        try {
            let jsonDatum = cborToDatumJson(datum);

            const builder: DefinitionBuilder =
                await new DefinitionBuilder().loadDefinition(order as any);

            const parameters: DatumParameters = builder.pullParameters(
                jsonDatum as DefinitionConstr
            );

            return parameters;
        } catch (error) {
            throw new Error(`Failed to parse order datum: ${error}`);
        }
    }

    async fetchAndParseRateDatum(datumHash: string): Promise<Rate> {
        const datum = await this.kupoApi.datum(datumHash);

        if (!datum) {
            throw new Error(`Datum not found for hash: ${datumHash}`);
        }

        let orderData = await this.parseOrderDatum(datum);

        return {
            baseAsset: BigInt(orderData.ReserveA!),
            derivedAsset: BigInt(orderData.ReserveB!),
        };
    }
}
