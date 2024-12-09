import { addresses, addressesUtxos } from './endpoints/addresses';
import { assetsTransactions, assetsUtxos } from './endpoints/assets';
import { KupoTypes, UTXO } from './types';
declare class KupoApi {
    apiUrl: string;
    constructor(apiUrl: string);
    buildMatches(match: string, unspent: boolean): string;
    buildDatum(hash: string): string;
    _matches(match: string, unspent?: boolean): Promise<Array<KupoTypes>>;
    _datum(hash: string): Promise<{
        datum: string;
    }>;
    get(match: string, unspent?: boolean): Promise<Array<UTXO>>;
    datum(hash: string): Promise<string>;
    addresses: typeof addresses;
    addressesUtxos: typeof addressesUtxos;
    assetsTransactions: typeof assetsTransactions;
    assetsUtxos: typeof assetsUtxos;
}
export { KupoApi };
