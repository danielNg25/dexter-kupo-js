export type UTXO = {
    address: string;
    tx_hash: string;
    tx_index: number;
    output_index: number;
    amount: Array<Unit>;
    block: string;
    data_hash: string | null;
    inline_datum: string | null;
    reference_script_hash: string | null;
};
export type Unit = {
    unit: string;
    quantity: string;
};
