import { handleError } from '../utils';
export async function assetsTransactions(asset) {
    try {
        const utxos = await this.assetsUtxos(asset);
        return utxos.map((utxo) => ({
            tx_hash: utxo.tx_hash,
            tx_index: utxo.tx_index,
            block_height: utxo.block,
            block_time: utxo.block,
        }));
    }
    catch (error) {
        throw handleError(error);
    }
}
export async function assetsUtxos(asset) {
    try {
        return await this.get(asset, true);
    }
    catch (error) {
        throw handleError(error);
    }
}
