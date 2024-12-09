import { KupoApi } from './KupoApi';
import { BlockFrostAPI } from '@blockfrost/blockfrost-js';
import { SundaeSwapV1 } from './dex/sundaeswap-v1';
const url = 'https://kupo1v6ejr4q6j469x2x87ze.mainnet-v2.kupo-m1.demeter.run/matches/addr1qyzk2jnlyklmcpjlaqt8r73uqmdkmq8jdl83uvgf6crnnqcjtcz8hchkwxt6s9afm7eqzlx4y4v5r93sl6eph6k9f54s24cyg5';
const main = async () => {
    const kupo = new KupoApi('http://192.168.0.104:1444/');
    const minswap = new SundaeSwapV1(kupo);
    // console.log(await minswap.allLiquidityPoolDatas());
    const start = new Date().getTime();
    minswap
        .liquidityPoolsFromToken('a0028f350aaabe0545fdcb56b039bfb08e4bb4d8c4d7c3c7d481c235484f534b59')
        .then((values) => {
        console.log(values);
        const end = new Date().getTime();
        console.log(`Execution time: ${(end - start) / 1000}s`);
    });
    const blockfrost = new BlockFrostAPI({
        network: 'mainnet',
        projectId: 'mainnetHjrPupgWwMtdM8P1hVYjKXW7iAElU2nY',
    });
    // console.log(
    //     (await blockfrost.scriptsDatum(
    //         '3a6183bcd0d75208d5aeaac5fd814951c575e4e6bb66fc0670b4f8dd1c30eef9'
    //     )).json_value
    // );
};
main();
