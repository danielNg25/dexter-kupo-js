import { Token } from '../../models/asset';
import { BaseStableDex } from './base-stable-dex';
export declare class StablePool {
    dex: BaseStableDex;
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
    amplificationCoefficient: bigint;
    totalLiquidity: bigint;
    constructor(dex: BaseStableDex, assetA: Token, assetB: Token, reserveA: bigint, reserveB: bigint, address: string, poolFeePercent: number, amplificationCoefficient: bigint, totalLiquidity: bigint, poolId?: string, poolLpTokens?: Token);
    get uuid(): string;
    get pair(): string;
    get price(): number;
    updateReserves(): Promise<void>;
    updatePoolData(): Promise<void>;
}
