interface TokenRegistryValue<TValueType extends string | number> {
    signatures: {
        signature: string;
        publicKey: string;
    }[];
    sequenceNumber: number;
    value: TValueType;
}
export interface TokenRegistryMetadata {
    subject: string;
    name: TokenRegistryValue<string>;
    description: TokenRegistryValue<string>;
    policy?: string;
    url?: TokenRegistryValue<string>;
    ticker?: TokenRegistryValue<string>;
    decimals?: TokenRegistryValue<number>;
    logo?: TokenRegistryValue<string>;
}
export declare const transformTokenRegistryAsset: (tokenRegistryAsset: TokenRegistryMetadata) => {
    name: string;
    description: string;
    ticker: string | null;
    url: string | null;
    decimals: number | null;
};
export declare const fetchAssetMetadata: (asset: string, tokenRegistryUrl?: string, timeout?: number) => Promise<{
    name: string;
    description: string;
    ticker: string | null;
    url: string | null;
    decimals: number | null;
} | null>;
export {};
