import { Asset, Token } from '../../models/asset';
import { BaseDex } from './base-dex';

export class LiquidityPool {
    dex: BaseDex;
    assetA: Token;
    assetB: Token;
    reserveA: bigint;
    reserveB: bigint;
    address: string;

    poolId: string = '';
    identifier: string = '';
    poolFeePercent: number = 0;
    totalLpTokens: bigint = 0n;
    extra: any = {};

    constructor(
        dex: BaseDex,
        assetA: Token,
        assetB: Token,
        reserveA: bigint,
        reserveB: bigint,
        address: string,
        poolFeePercent: number,
        poolId?: string
    ) {
        this.dex = dex;
        this.assetA = assetA;
        this.assetB = assetB;
        this.reserveA = reserveA;
        this.reserveB = reserveB;
        this.address = address;
        this.poolFeePercent = poolFeePercent;
        this.poolId = poolId || '';
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

        const adjustedReserveA: number =
            Number(this.reserveA) / 10 ** assetADecimals;
        const adjustedReserveB: number =
            Number(this.reserveB) / 10 ** assetBDecimals;

        return adjustedReserveA / adjustedReserveB;
    }
}
