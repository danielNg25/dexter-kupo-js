import { Asset, Token } from '../models/asset';
import { LOVELACE } from './constant';

export const joinPolicyId = (policyId: string) => {
    return policyId.split('.').join('');
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
        return a === b;
    }

    if (a instanceof Asset) {
        return a.identifier() === b || a.identifier('.') === b;
    }

    return false;
};
