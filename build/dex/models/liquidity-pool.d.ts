import { Token } from '../../models/asset';
import { BaseDex } from './base-dex';
export declare class LiquidityPool {
    dex: BaseDex;
    assetA: Token;
    assetB: Token;
    reserveA: bigint;
    reserveB: bigint;
    address: string;
    poolId: string;
    identifier: string;
    poolFeePercent: number;
    poolLpTokens?: Token;
    totalLpTokens: bigint;
    extra: any;
    constructor(dex: BaseDex, assetA: Token, assetB: Token, reserveA: bigint, reserveB: bigint, address: string, poolFeePercent: number, poolId?: string, poolLpTokens?: Token);
    get uuid(): string;
    get pair(): string;
    get price(): number;
    updateReserves(): Promise<void>;
    updatePoolData(): Promise<void>;
}
