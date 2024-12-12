import { Asset, Token } from '../models/asset';
import { LOVELACE } from './constant';

export const joinPolicyId = (policyId: string) => {
    return policyId.split('.').join('');
};

export const splitPolicyId = (policyId: string) => {
    return policyId.slice(0, 56) + '.' + policyId.slice(56);
};

export const isShellyAddress = (address: string): boolean => {
    return address.includes('addr1') || address.includes('stake1');
};

export const identifierToAsset = (
    identifierToAsset: string,
    decimal: number = 0
): Token => {
    if (identifierToAsset === LOVELACE) {
        return LOVELACE;
    }
    return Asset.fromIdentifier(identifierToAsset, decimal);
};

export const compareTokenWithPolicy = (a: Token, b: string): boolean => {
    if (typeof a === 'string') {
        return a === b || (a == LOVELACE && b == '');
    }

    if (a instanceof Asset) {
        return a.identifier() === b || a.identifier('.') === b;
    }

    return false;
};

export const removeTrailingSlash = (url: string): string => {
    return url.endsWith('/') ? url.slice(0, -1) : url;
};

export // Helper function for retrying
async function retry<T>(
    fn: () => Promise<T>,
    retries: number = 5,
    delay: number = 100
): Promise<T> {
    for (let attempt = 1; attempt <= retries; attempt++) {
        try {
            return await fn(); // Attempt to execute the function
        } catch (error) {
            console.error(`Attempt ${attempt} failed:`, error);
            if (attempt === retries) {
                throw error; // Re-throw the error if the last attempt fails
            }
            await new Promise((resolve) => setTimeout(resolve, delay)); // Wait before retrying
        }
    }
    throw new Error('Exceeded maximum retries');
}
