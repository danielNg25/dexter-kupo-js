import { handleError } from '../../utils';
export class LiquidityPool {
    constructor(dex, assetA, assetB, reserveA, reserveB, address, poolFeePercent, poolId, poolLpTokens) {
        this.poolId = '';
        this.identifier = '';
        this.poolFeePercent = 0;
        this.totalLpTokens = 0n;
        this.extra = {};
        this.dex = dex;
        this.assetA = assetA;
        this.assetB = assetB;
        this.reserveA = reserveA;
        this.reserveB = reserveB;
        this.address = address;
        this.poolFeePercent = poolFeePercent;
        this.poolId = poolId || '';
        this.poolLpTokens = poolLpTokens;
    }
    get uuid() {
        return `${this.dex}.${this.pair}.${this.identifier}`;
    }
    get pair() {
        const assetAName = this.assetA === 'lovelace' ? 'ADA' : this.assetA.assetName;
        const assetBName = this.assetB === 'lovelace' ? 'ADA' : this.assetB.assetName;
        return `${assetAName}/${assetBName}`;
    }
    get price() {
        const assetADecimals = this.assetA === 'lovelace' ? 6 : this.assetA.decimals;
        const assetBDecimals = this.assetB === 'lovelace' ? 6 : this.assetB.decimals;
        const adjustedReserveA = Number(this.reserveA) / 10 ** assetADecimals;
        const adjustedReserveB = Number(this.reserveB) / 10 ** assetBDecimals;
        return adjustedReserveA / adjustedReserveB;
    }
    async updateReserves() {
        try {
            const liquidityPool = await this.dex.liquidityPoolFromPoolId(this.poolId);
            if (!liquidityPool)
                throw Error(`Error updating reserves ${this.dex.identifier} - ${this.poolId}`);
            this.reserveA = liquidityPool.reserveA;
            this.reserveB = liquidityPool.reserveB;
        }
        catch (e) {
            handleError(e);
        }
    }
    async updatePoolData() {
        await this.updateReserves();
    }
}
