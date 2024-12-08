export type AddressInfo = {
    address: string; // Bech32 encoded addresses
    amount: Array<{
        unit: string; // Lovelace or concatenation of asset policy_id and hex-encoded asset_name
        quantity: string; // The quantity of the unit
    }>; // The sum of all the UTXO per asset
    stake_address: string | null; // Stake address that controls the key
    type: 'byron' | 'shelley'; // Address era
    script: boolean; // True if this is a script address
};

export type AddressUtxo = {
    
}