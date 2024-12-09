import { Asset } from '../models/asset';
import { LOVELACE } from './constant';
export const joinPolicyId = (policyId) => {
    return policyId.split('.').join('');
};
export const isShellyAddress = (address) => {
    return address.includes('addr1') || address.includes('stake1');
};
export const identifierToAsset = (identifierToAsset, decimal = 0) => {
    if (identifierToAsset === LOVELACE) {
        return LOVELACE;
    }
    return Asset.fromIdentifier(identifierToAsset, decimal);
};
export const compareTokenWithPolicy = (a, b) => {
    if (typeof a === 'string') {
        return a === b;
    }
    if (a instanceof Asset) {
        return a.identifier() === b || a.identifier('.') === b;
    }
    return false;
};
export const removeTrailingSlash = (url) => {
    return url.endsWith('/') ? url.slice(0, -1) : url;
};
