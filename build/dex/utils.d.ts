export declare enum DEX_IDENTIFIERS {
    CHADSWAP = "ChadSwap",
    MINSWAP = "Minswap",
    MINSWAPV2 = "MinswapV2",
    SUNDAESWAPV1 = "SundaeSwapV1",
    SUNDAESWAPV3 = "SundaeSwapV3",
    WINGRIDER = "WingRider",
    WINGRIDERV2 = "WingRiderV2",
    VYFINANCE = "VyFinance",
    MUESLISWAP = "MuesliSwap",
    MINSWAPSTABLE = "MinswapStable",
    CSWAP = "CSwap"
}
export type PoolData = {
    tokenA: string;
    tokenB: string;
    poolId: string;
};
export declare function writeDataToFile(data: PoolData[], filePath: string): void;
