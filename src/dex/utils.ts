import * as fs from 'fs';

export enum DEX_IDENTIFIERS {
    MINSWAP = 'Minswap',
    MINSWAPV2 = 'MinswapV2',
    SUNDAESWAPV1 = 'SundaeSwapV1',
    SUNDAESWAPV3 = 'SundaeSwapV3',
    WINGRIDER = 'WingRider',
    WINGRIDERV2 = 'WingRiderV2',
    VYFINANCE = 'VyFinance',
    MUESLISWAP = 'MuesliSwap',
}

export type PoolData = {
    tokenA: string;
    tokenB: string;
    poolId: string;
};

// Function to structure and write data to a JSON file
export function writeDataToFile(data: PoolData[], filePath: string): void {
    const structuredData: Record<string, Record<string, Array<PoolData>>> = {};

    data.forEach((pool) => {
        const [tokenA, tokenB] = [pool.tokenA, pool.tokenB].sort();
        if (!structuredData[tokenA]) {
            structuredData[tokenA] = {};
        }
        if (!structuredData[tokenA][tokenB]) {
            structuredData[tokenA][tokenB] = [];
        }
        structuredData[tokenA][tokenB].push(pool);
    });

    // Write the structured data to a JSON file
    fs.writeFileSync(filePath, JSON.stringify(structuredData, null, 2));
}
