export type KupoTypes = {
    transaction_index: number;
    transaction_id: string;
    output_index: number;
    address: string;
    value: {
        coins: string;
        assets: null | Record<string, string>;
    };
    datum_hash: string | null;
    script_hash: string | null;
    created_at: {
        slot_no: string;
        header_hash: string;
    };
    spent_at: string | null;
};
