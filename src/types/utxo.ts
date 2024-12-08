export type UTXO = {
    address: string; // Bech32 encoded addresses - useful when querying by payment_cred
    tx_hash: string; // Transaction hash of the UTXO
    tx_index: number; // Deprecated: UTXO index in the transaction
    output_index: number; // UTXO index in the transaction
    amount: Array<Unit>; // The sum of all the UTXO per asset
    block: string; // Block hash of the UTXO
    data_hash: string | null; // The hash of the transaction output datum
    inline_datum: string | null; // CBOR encoded inline datum
    reference_script_hash: string | null; // The hash of the reference script of the output
};

export type Unit = {
    unit: string; // Lovelace or concatenation of asset policy_id and hex-encoded asset_name
    quantity: string; // The quantity of the unit
};
