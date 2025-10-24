import { KupoApi } from '../KupoApi';
import { UTXO } from '../types';
import { DatumParameters } from './definitions/types';
export type Rate = {
    baseAsset: bigint;
    derivedAsset: bigint;
};
export declare class VyfiBar {
    readonly identifier: string;
    readonly kupoApi: KupoApi;
    constructor(kupoApi: KupoApi);
    getRate(poolIdentifier: string): Promise<Rate>;
    rateFromUtxo(utxo: UTXO): Promise<Rate | undefined>;
    rateUtxos(poolIdentifier: string): Promise<UTXO[]>;
    parseOrderDatum(datum: string): Promise<DatumParameters>;
    fetchAndParseRateDatum(datumHash: string): Promise<Rate>;
}
