import { KupoApi } from './KupoApi';
import { BlockFrostAPI } from '@blockfrost/blockfrost-js';
const url = 'https://kupo1v6ejr4q6j469x2x87ze.mainnet-v2.kupo-m1.demeter.run/matches/addr1qyzk2jnlyklmcpjlaqt8r73uqmdkmq8jdl83uvgf6crnnqcjtcz8hchkwxt6s9afm7eqzlx4y4v5r93sl6eph6k9f54s24cyg5';
import { fetchAssetMetadata } from './utils';
const main = async () => {
    const kupo = new KupoApi('http://192.168.0.104:1444/');
    // const minswap = new MinswapV2(kupo);
    // // console.log(await minswap.allLiquidityPoolDatas());
    // const start = new Date().getTime();
    // minswap
    //     .liquidityPoolsFromToken(
    //         'f66d78b4a3cb3d37afa0ec36461e51ecbde00f26c8f0a68f94b6988069534f4c'
    //     )
    //     .then((values) => {
    //         console.log(values);
    //         const end = new Date().getTime();
    //         console.log(`Execution time: ${(end - start) / 1000}s`);
    //     });
    console.log(await fetchAssetMetadata('279c909f348e533da5808898f87f9a14bb2c3dfbbacccd631d927a3f534e454b'));
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
