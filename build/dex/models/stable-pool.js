import { handleError } from '../../utils';
export class StablePool {
    constructor(dex, assetA, assetB, reserveA, reserveB, address, poolFeePercent, amplificationCoefficient, totalLiquidity, poolId, poolLpTokens) {
        this.poolId = '';
        this.identifier = '';
        this.poolFeePercent = 0;
        this.totalLpTokens = 0n;
        this.extra = {};
        // Stable pool specific properties
        this.amplificationCoefficient = 0n;
        this.totalLiquidity = 0n;
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
        // For stable pools, we need to consider the amplification coefficient
        // The price is calculated using the derivative of the invariant
        // P = (y/x) * (1 + A * x/D) / (1 + A * y/D)
        // where x, y are the token balances, A is the amplification coefficient,
        // and D is the total liquidity
        const x = Number(this.reserveA) / 10 ** assetADecimals;
        const y = Number(this.reserveB) / 10 ** assetBDecimals;
        const A = Number(this.amplificationCoefficient);
        const D = Number(this.totalLiquidity) /
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
            const liquidityPool = await this.dex.liquidityPoolFromPoolId(this.poolId, [
                this.assetA.identifier(''),
                this.assetB.identifier(''),
            ]);
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
