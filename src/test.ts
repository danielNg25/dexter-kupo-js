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
import { Cardano } from '@cardano-sdk/core';
import { MinswapStable } from './dex/minswap-stable';

const main = async () => {
    const kupo = new KupoApi('http://192.168.0.104:1443/');
    // console.log(
    await kupo.get(
        'addr1wxn9efv2f6w82hagxqtn62ju4m293tqvw0uhmdl64ch8uwc0h43gt'
    );
    // );

    const minswapStable = new MinswapStable(kupo);
    const start = new Date().getTime();
    minswapStable
        .liquidityPoolFromPoolId(
            'addr1wy7kkcpuf39tusnnyga5t2zcul65dwx9yqzg7sep3cjscesx2q5m5',
            [
                '8db269c3ec630e06ae29f74bc39edd1f87c819f1056206e879a1cd61446a65644d6963726f555344',
                'f66d78b4a3cb3d37afa0ec36461e51ecbde00f26c8f0a68f94b6988069555344',
            ]
        )
        .then((values) => {
            const end = new Date().getTime();
            console.log(values);
            console.log(`Execution time: ${(end - start) / 1000}s`);
        });
    // const minswap = new Minswap(kupo);

    // const start = new Date().getTime();
    // minswap
    //     .liquidityPoolsFromToken(
    //         '92776616f1f32c65a173392e4410a3d8c39dcf6ef768c73af164779c4d79555344',
    //         'lovelace',
    //     )
    //     .then((values) => {
    //         const end = new Date().getTime();
    //         console.log(values);
    //         console.log(`Execution time: ${(end - start) / 1000}s`);
    //     });
    // minswap
    //     .liquidityPoolFromPoolId(
    //         '8e76c60dd3cbccdf8af264e560686078f05345d96d90c4af19c6c4f6'
    //     )
    //     .then((values) => {
    //         const end = new Date().getTime();
    //         console.log(values);
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
