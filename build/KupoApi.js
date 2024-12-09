import { addresses, addressesUtxos } from './endpoints/addresses';
import { assetsTransactions, assetsUtxos } from './endpoints/assets';
import { LOVELACE, joinPolicyId } from './utils';
class KupoApi {
    constructor(apiUrl) {
        this.addresses = addresses;
        this.addressesUtxos = addressesUtxos;
        this.assetsTransactions = assetsTransactions;
        this.assetsUtxos = assetsUtxos;
        this.apiUrl = apiUrl;
    }
    buildMatches(match, unspent) {
        return `${this.apiUrl}/matches/${match}${unspent ? '?unspent' : ''}`;
    }
    buildDatum(hash) {
        return `${this.apiUrl}/datums/${hash}`;
    }
    async _matches(match, unspent = true) {
        return await (await fetch(this.buildMatches(match, unspent))).json();
    }
    async _datum(hash) {
        return await (await fetch(this.buildDatum(hash))).json();
    }
    async get(match, unspent = true) {
        const res = await this._matches(match, unspent);
        return res.map((utxo) => ({
            address: utxo.address,
            tx_hash: utxo.transaction_id,
            tx_index: utxo.output_index,
            output_index: utxo.output_index,
            amount: [
                {
                    unit: LOVELACE,
                    quantity: utxo.value.coins,
                },
                ...(utxo.value.assets
                    ? Object.entries(utxo.value.assets).map(([unit, quantity]) => ({
                        unit: joinPolicyId(unit),
                        quantity: quantity,
                    }))
                    : []),
            ],
            block: utxo.created_at.header_hash,
            data_hash: utxo.datum_hash,
            inline_datum: null,
            reference_script_hash: utxo.script_hash,
        }));
    }
    async datum(hash) {
        return (await this._datum(hash)).datum;
    }
}
export { KupoApi };
