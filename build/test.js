import { KupoApi } from './KupoApi';
import { BlockFrostAPI } from '@blockfrost/blockfrost-js';
const url = 'https://kupo1v6ejr4q6j469x2x87ze.mainnet-v2.kupo-m1.demeter.run/matches/addr1qyzk2jnlyklmcpjlaqt8r73uqmdkmq8jdl83uvgf6crnnqcjtcz8hchkwxt6s9afm7eqzlx4y4v5r93sl6eph6k9f54s24cyg5';
import { WingRidersV2 } from './dex/wingriders-v2';
const main = async () => {
    const kupo = new KupoApi('http://192.168.0.104:1444/');
    const minswap = new WingRidersV2(kupo);
    const start = new Date().getTime();
    minswap
        .liquidityPoolsFromToken('8db269c3ec630e06ae29f74bc39edd1f87c819f1056206e879a1cd61446a65644d6963726f555344')
        .then((values) => {
        const end = new Date().getTime();
        console.log(values?.length);
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
