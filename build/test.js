import { KupoApi } from './KupoApi';
import { BlockFrostAPI } from '@blockfrost/blockfrost-js';
import { SundaeSwapV3 } from './dex/sundaeswap-v3';
const url = 'https://kupo1v6ejr4q6j469x2x87ze.mainnet-v2.kupo-m1.demeter.run/matches/addr1qyzk2jnlyklmcpjlaqt8r73uqmdkmq8jdl83uvgf6crnnqcjtcz8hchkwxt6s9afm7eqzlx4y4v5r93sl6eph6k9f54s24cyg5';
const main = async () => {
    const kupo = new KupoApi('http://192.168.0.104:1443/');
    // const chadswap = new ChadSwap(kupo);
    // chadswap
    //     .getOrdersByAsset(
    //         '97075bf380e65f3c63fb733267adbb7d42eec574428a754d2abca55b436861726c6573207468652043686164'
    //     )
    //     .then((orders) => {
    //         console.log(orders);
    //     });
    // console.log(
    // await kupo.get(
    //     'addr1wxn9efv2f6w82hagxqtn62ju4m293tqvw0uhmdl64ch8uwc0h43gt'
    // );
    // );
    // const minswapStable = new MinswapStable(kupo);
    // const start = new Date().getTime();
    // minswapStable
    //     .liquidityPoolFromPoolId(
    //         'addr1wy7kkcpuf39tusnnyga5t2zcul65dwx9yqzg7sep3cjscesx2q5m5',
    //         [
    //             '8db269c3ec630e06ae29f74bc39edd1f87c819f1056206e879a1cd61446a65644d6963726f555344',
    //             'f66d78b4a3cb3d37afa0ec36461e51ecbde00f26c8f0a68f94b6988069555344',
    //         ],
    //         [6, 6]
    //     )
    //     .then((values) => {
    //         const end = new Date().getTime();
    //         console.log(values);
    //         console.log(`Execution time: ${(end - start) / 1000}s`);
    //     });
    const cswap = new SundaeSwapV3(kupo);
    cswap
        .liquidityPoolsFromToken('285b65ae63d4fad36321384ec61edfd5187b8194fff89b5abe9876da414e47454c53', 'lovelace')
        .then((values) => {
        const end = new Date().getTime();
        console.log(values);
        console.log(values?.length);
    });
    // minswap
    //     .liquidityPoolFromPoolId(
    //         'e0302560ced2fdcbfcb2602697df970cd0d6a38f94b32703f51c312b000de140865c2402b4b4fa28357c91ce0bd0ef409b49cb7a312be852675cf2d5'
    //     )
    //     .then((values) => {
    //         const end = new Date().getTime();
    //         // console.log(values);
    //         console.log(`Execution time: ${(end - start) / 1000}s`);
    //     });
    //af1ff29d6ae29ccb189b2eb4854dc3b7afac1a6cd67a494d3f5a8def1461a17d
    // minswap
    //     .fetchAndParseOrderDatum(
    //         '60aadfa2400b35d2001d18d08d2970396d3636e039031a79a4a9ccdd98823527'
    //     )
    //     .then((values) => {
    //         const end = new Date().getTime();
    //         console.log(values);
    //         console.log(`Execution time: ${(end - start) / 1000}s`);
    //     });
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
