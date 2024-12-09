import { KupoApi } from '../KupoApi';
import { AssetTransaction } from '../types/assets';
import { UTXO } from '../types/utxo';
export declare function assetsTransactions(this: KupoApi, asset: string): Promise<Array<AssetTransaction>>;
export declare function assetsUtxos(this: KupoApi, asset: string): Promise<Array<UTXO>>;
