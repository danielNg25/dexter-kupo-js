import { KupoApi } from '../KupoApi';
import { AddressInfo, UTXO } from '../types';
export declare function addresses(this: KupoApi, address: string): Promise<AddressInfo>;
export declare function addressesUtxos(this: KupoApi, address: string): Promise<Array<UTXO>>;
