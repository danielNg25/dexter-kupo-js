import { KupoApi } from './KupoApi';
import { BlockFrostAPI } from '@blockfrost/blockfrost-js';
import { MinswapV2 } from './dex/minswap-v2';
const url = 'https://kupo1v6ejr4q6j469x2x87ze.mainnet-v2.kupo-m1.demeter.run/matches/addr1qyzk2jnlyklmcpjlaqt8r73uqmdkmq8jdl83uvgf6crnnqcjtcz8hchkwxt6s9afm7eqzlx4y4v5r93sl6eph6k9f54s24cyg5';
import { fetchAssetMetadata } from './utils';
const main = async () => {
    const kupo = new KupoApi('http://192.168.0.104:1444/');
    const minswap = new MinswapV2(kupo);
    // console.log(await minswap.allLiquidityPoolDatas());
    // const start = new Date().getTime();
    // minswap
    //     .liquidityPoolsFromToken(
    //         '25c5de5f5b286073c593edfd77b48abc7a48e5a4f3d4cd9d428ff93555534454',
    //     )
    //     .then((values) => {
    //         console.log(values);
    //         const end = new Date().getTime();
    //         console.log(`Execution time: ${(end - start) / 1000}s`);
    //     });
    console.log(await fetchAssetMetadata('64f7b108bd43f4bde344b82587655eeb821256c0c8e79ad48db15d1844454449'));
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
