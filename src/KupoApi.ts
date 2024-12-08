import { addresses, addressesUtxos } from './endpoints/addresses';
import { assetsTransactions, assetsUtxos } from './endpoints/assets';
import { Unit, KupoTypes, UTXO } from './types';
import { LOVELACE, joinPolicyId } from './utils';

class KupoApi {
    apiUrl: string;

    constructor(apiUrl: string) {
        this.apiUrl = apiUrl;
    }

    buildMatches(match: string, unspent: boolean): string {
        return `${this.apiUrl}/matches/${match}${unspent ? '?unspent' : ''}`;
    }

    buildDatum(hash: string): string {
        return `${this.apiUrl}/datums/${hash}`;
    }

    async _matches(
        match: string,
        unspent: boolean = true
    ): Promise<Array<KupoTypes>> {
        return await (await fetch(this.buildMatches(match, unspent))).json();
    }

    async _datum(hash: string): Promise<{
        datum: string;
    }> {
        return await (await fetch(this.buildDatum(hash))).json();
    }

    async get(match: string, unspent: boolean = true): Promise<Array<UTXO>> {
        const res = await this._matches(match, unspent);

        return res.map((utxo: KupoTypes) => ({
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
                    ? Object.entries(utxo.value.assets).map(
                          ([unit, quantity]) => ({
                              unit: joinPolicyId(unit),
                              quantity: quantity,
                          })
                      )
                    : []),
            ] as Array<Unit>,
            block: utxo.created_at.header_hash,
            data_hash: utxo.datum_hash,
            inline_datum: null,
            reference_script_hash: utxo.script_hash,
        }));
    }

    async datum(hash: string): Promise<string> {
        return (await this._datum(hash)).datum;
    }

    addresses = addresses;
    addressesUtxos = addressesUtxos;

    assetsTransactions = assetsTransactions;
    assetsUtxos = assetsUtxos;
}

export { KupoApi };
