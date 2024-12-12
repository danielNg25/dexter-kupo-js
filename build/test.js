import { KupoApi } from './KupoApi';
import { BlockFrostAPI } from '@blockfrost/blockfrost-js';
import * as fs from 'fs';
const url = 'https://kupo1v6ejr4q6j469x2x87ze.mainnet-v2.kupo-m1.demeter.run/matches/addr1qyzk2jnlyklmcpjlaqt8r73uqmdkmq8jdl83uvgf6crnnqcjtcz8hchkwxt6s9afm7eqzlx4y4v5r93sl6eph6k9f54s24cyg5';
import { cborToDatumJson } from './dex/definitions/utils';
import { WingRiders } from './dex/wingriders';
const main = async () => {
    const kupo = new KupoApi('http://192.168.0.104:1444/');
    const minswap = new WingRiders(kupo);
    const start = new Date().getTime();
    // minswap
    //     .liquidityPoolsFromToken(
    //         '59bc0484225992f0fafffc472784f89f1c75e496cb570ec2922b9243444344',
    //         LOVELACE
    //     )
    //     .then((values) => {
    //         const end = new Date().getTime();
    //         console.log(values);
    //         console.log(`Execution time: ${(end - start) / 1000}s`);
    //     });
    minswap
        .liquidityPoolFromPoolId('026a18d04a0c642759bb3d83b12e3344894e5c1c7b2aeb1a2113a570471e578e9b35d79c0798e7204a1aa6851405e506a4510a48158ddb08ac777a69')
        .then((values) => {
        const end = new Date().getTime();
        console.log(values);
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
    fs.writeFileSync('file.json', JSON.stringify(cborToDatumJson('d8799fa200a001a140a1401a0e692d209fd8799f581c420000029ad9527271b1b1e3c27ee065c18df70a4a4cfc3093a41a444341584fffd8799f4040ffffd8799f581c5509b8063193f292f2b922375ea4d58799534f053f4932f0e6b313da46796165504c56ffa347656e6444617465d905009f1b000003bbcc68f818ff457072696365d87b9fd8799f1a000186a0184dffff49737461727444617465d905009f1b00000093933c5c18ffa0ff')));
};
main();
