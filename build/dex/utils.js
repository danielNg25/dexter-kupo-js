import * as fs from 'fs';
export var DEX_IDENTIFIERS;
(function (DEX_IDENTIFIERS) {
    DEX_IDENTIFIERS["MINSWAP"] = "Minswap";
    DEX_IDENTIFIERS["MINSWAPV2"] = "MinswapV2";
    DEX_IDENTIFIERS["SUNDAESWAPV1"] = "SundaeSwapV1";
    DEX_IDENTIFIERS["SUNDAESWAPV3"] = "SundaeSwapV3";
    DEX_IDENTIFIERS["WINGRIDER"] = "WingRider";
    DEX_IDENTIFIERS["WINGRIDERV2"] = "WingRiderV2";
    DEX_IDENTIFIERS["VYFINANCE"] = "VyFinance";
    DEX_IDENTIFIERS["MUESLISWAP"] = "MuesliSwap";
    DEX_IDENTIFIERS["MINSWAPSTABLE"] = "MinswapStable";
})(DEX_IDENTIFIERS || (DEX_IDENTIFIERS = {}));
// Function to structure and write data to a JSON file
export function writeDataToFile(data, filePath) {
    const structuredData = {};
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
