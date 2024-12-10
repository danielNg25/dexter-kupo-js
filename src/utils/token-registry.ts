import { CONFIG_TOKEN_REGISTRY_URL } from './constant';
import { joinPolicyId } from './helper';

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

export const transformTokenRegistryAsset = (
    tokenRegistryAsset: TokenRegistryMetadata
) => {
    const metadata = {
        name: tokenRegistryAsset.name?.value,
        description: tokenRegistryAsset.description?.value,
        ticker: tokenRegistryAsset.ticker?.value ?? null,
        url: tokenRegistryAsset.url?.value ?? null,
        // logo: tokenRegistryAsset.logo?.value ?? null,
        decimals: tokenRegistryAsset.decimals?.value ?? null,
    };

    return metadata;
};
import fetch from 'node-fetch';

export const fetchAssetMetadata = async (
    asset: string,
    tokenRegistryUrl = CONFIG_TOKEN_REGISTRY_URL,
    timeout = 10_000 // timeout in milliseconds
) => {
    try {
        const url = `${tokenRegistryUrl}/metadata/${joinPolicyId(asset)}`;

        // Create an AbortController to handle the timeout
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), timeout);

        const response = await fetch(url, {
            method: 'GET',
            signal: controller.signal, // Pass the signal to the fetch call
        });

        // Clear the timeout once the request completes
        clearTimeout(timeoutId);

        if (response.ok && response.status != 200) {
            if (response.status === 204 || response.status === 404) {
                // 204 means asset is not in the token registry
                return null;
            } else {
                throw new Error(
                    `Failed to fetch metadata: ${response.statusText}`
                );
            }
        }

        const data = (await response.json()) as TokenRegistryMetadata;

        if (data?.name !== undefined && data?.description !== undefined) {
            return transformTokenRegistryAsset(data);
        } else {
            console.error(
                `Failed to fetch metadata for asset ${asset} due to invalid format. Response:`,
                data
            );
            return null;
        }
    } catch (error: unknown) {
        if (error instanceof Error) {
            if (error.name === 'AbortError') {
                console.error(
                    `Request for asset ${asset} timed out after ${timeout}ms`
                );
                return null;
            } else {
                console.error(
                    `Error fetching metadata for asset ${asset}:`,
                    error.message
                );
            }
        } else {
            console.error(
                `Unexpected error fetching metadata for asset ${asset}:`,
                error
            );
        }

        throw error; // Rethrow the error if needed
    }
};
