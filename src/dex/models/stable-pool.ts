import { Asset, Token } from '../../models/asset';
import { handleError } from '../../utils';
import { BaseStableDex } from './base-stable-dex';

export class StablePool {
    dex: BaseStableDex;
    assetA: Token;
    assetB: Token;
    reserveA: bigint;
    reserveB: bigint;
    address: string;

    poolId: string = '';
    identifier: string = '';
    poolFeePercent: number = 0;
    poolLpTokens?: Token;
    totalLpTokens: bigint = 0n;
    extra: any = {};

    // Stable pool specific properties
    amplificationCoefficient: bigint = 0n;
    totalLiquidity: bigint = 0n;

    constructor(
        dex: BaseStableDex,
        assetA: Token,
        assetB: Token,
        reserveA: bigint,
        reserveB: bigint,
        address: string,
        poolFeePercent: number,
        amplificationCoefficient: bigint,
        totalLiquidity: bigint,
        poolId?: string,
        poolLpTokens?: Token
    ) {
        this.dex = dex;
        this.assetA = assetA;
        this.assetB = assetB;
        this.reserveA = reserveA;
        this.reserveB = reserveB;
        this.address = address;
        this.poolFeePercent = poolFeePercent;
        this.poolId = poolId || '';
        this.poolLpTokens = poolLpTokens;
        this.amplificationCoefficient = amplificationCoefficient;
        this.totalLiquidity = totalLiquidity;
    }

    get uuid(): string {
        return `${this.dex}.${this.pair}.${this.identifier}`;
    }

    get pair(): string {
        const assetAName: string =
            this.assetA === 'lovelace' ? 'ADA' : this.assetA.assetName;
        const assetBName: string =
            this.assetB === 'lovelace' ? 'ADA' : this.assetB.assetName;

        return `${assetAName}/${assetBName}`;
    }

    get price(): number {
        const assetADecimals: number =
            this.assetA === 'lovelace' ? 6 : this.assetA.decimals;
        const assetBDecimals: number =
            this.assetB === 'lovelace' ? 6 : this.assetB.decimals;

        // For stable pools, we need to consider the amplification coefficient
        // The price is calculated using the derivative of the invariant
        // P = (y/x) * (1 + A * x/D) / (1 + A * y/D)
        // where x, y are the token balances, A is the amplification coefficient,
        // and D is the total liquidity

        const x = Number(this.reserveA) / 10 ** assetADecimals;
        const y = Number(this.reserveB) / 10 ** assetBDecimals;
        const A = Number(this.amplificationCoefficient);
        const D =
            Number(this.totalLiquidity) /
            10 ** Math.min(assetADecimals, assetBDecimals);

        // Basic safety checks
        if (x <= 0 || y <= 0 || D <= 0) {
            return 0;
        }

        // Calculate price using the stable swap formula
        const price = (y / x) * ((1 + (A * x) / D) / (1 + (A * y) / D));

        return price;
    }

    async updateReserves() {
        try {
            const liquidityPool = await this.dex.liquidityPoolFromPoolId(
                this.poolId,
                [
                    (this.assetA as Asset).identifier(''),
                    (this.assetB as Asset).identifier(''),
                ],
                [6, 6]
            );
            if (!liquidityPool)
                throw Error(
                    `Error updating reserves ${this.dex.identifier} - ${this.poolId}`
                );

            this.reserveA = liquidityPool.reserveA;
            this.reserveB = liquidityPool.reserveB;
        } catch (e) {
            handleError(e);
        }
    }

    async updatePoolData() {
        await this.updateReserves();
    }
}
