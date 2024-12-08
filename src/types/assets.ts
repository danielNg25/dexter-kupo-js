export type AssetTransaction = {
    tx_hash: string; // Hash of the transaction
    tx_index: number; // Transaction index within the block
    block_height: string; // Block height
    block_time: string; // Block creation time in UNIX time
};
