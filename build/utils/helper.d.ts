import { Token } from '../models/asset';
export declare const joinPolicyId: (policyId: string) => string;
export declare const isShellyAddress: (address: string) => boolean;
export declare const identifierToAsset: (identifierToAsset: string, decimal?: number) => Token;
export declare const compareTokenWithPolicy: (a: Token, b: string) => boolean;
