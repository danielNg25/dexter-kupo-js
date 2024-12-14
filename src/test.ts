import { KupoApi } from './KupoApi';
import { BlockFrostAPI } from '@blockfrost/blockfrost-js';
import * as fs from 'fs';
import { Minswap } from './dex/minswap';
import { MinswapV2 } from './dex/minswap-v2';
import { SundaeSwapV1 } from './dex/sundaeswap-v1';
import { SundaeSwapV3 } from './dex/sundaeswap-v3';
import { Vyfinance } from './dex/vyfinance';
const url =
    'https://kupo1v6ejr4q6j469x2x87ze.mainnet-v2.kupo-m1.demeter.run/matches/addr1qyzk2jnlyklmcpjlaqt8r73uqmdkmq8jdl83uvgf6crnnqcjtcz8hchkwxt6s9afm7eqzlx4y4v5r93sl6eph6k9f54s24cyg5';
import { Data, C, fromHex, toHex } from 'lucid-cardano';
import {
    DatumParameters,
    DefinitionConstr,
    DefinitionField,
} from './dex/definitions/types';
import { cborToDatumJson } from './dex/definitions/utils';
import { DefinitionBuilder } from './dex/definitions/definition-builder';
import pool from './dex/definitions/minswap-v2/pool';
import { WingRiders } from './dex/wingriders';
import { WingRidersV2 } from './dex/wingriders-v2';
import { Asset } from './models';
import { compareTokenWithPolicy, fetchAssetMetadata, LOVELACE } from './utils';

const main = async () => {
    const kupo = new KupoApi('http://192.168.0.104:1443/');

    const minswap = new SundaeSwapV1(kupo);

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
    // minswap
    //     .liquidityPoolFromPoolId(
    //         '026a18d04a0c642759bb3d83b12e3344894e5c1c7b2aeb1a2113a570471e578e9b35d79c0798e7204a1aa6851405e506a4510a48158ddb08ac777a69'
    //     )
    //     .then((values) => {
    //         const end = new Date().getTime();
    //         console.log(values);
    //         console.log(`Execution time: ${(end - start) / 1000}s`);
    //     });

    minswap
        .fetchAndParseOrderDatum(
            '10c27783bdf29fd5a6555bddf583f1a118141c1f0a831303371c92fb6726d0b3'
        )
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
};

main();
