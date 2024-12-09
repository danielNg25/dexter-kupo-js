export type AddressInfo = {
    address: string;
    amount: Array<{
        unit: string;
        quantity: string;
    }>;
    stake_address: string | null;
    type: 'byron' | 'shelley';
    script: boolean;
};
export type AddressUtxo = {};
