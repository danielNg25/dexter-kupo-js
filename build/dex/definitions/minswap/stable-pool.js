import { DatumParameterKey } from '../constants';
/**
 * Minswap Stable Pool Datum Definition
 * Based on the following structure:
 * {
 *   balances: bigint[],
 *   totalLiquidity: bigint,
 *   amplificationCoefficient: bigint,
 *   orderHash: string
 * }
 *
 * Real life datum example:
 * {
 *     "fields": [
 *         {
 *             "list": [
 *                 {
 *                     "int": 33525335691
 *                 },
 *                 {
 *                     "int": 31740944086
 *                 }
 *             ]
 *         },
 *         {
 *             "int": 64969697528
 *         },
 *         {
 *             "int": 10
 *         },
 *         {
 *             "bytes": "4c4d65a0616f60adc2cba70f533705233b1d7e8cb3e9868cdca39d86"
 *         }
 *     ],
 *     "constructor": 0
 * }
 */
export default {
    constructor: 0,
    fields: [
        {
            list: [
                {
                    int: DatumParameterKey.Balance0,
                },
                {
                    int: DatumParameterKey.Balance1,
                },
            ],
        },
        {
            int: DatumParameterKey.TotalLiquidity,
        },
        {
            int: DatumParameterKey.AmplificationCoefficient,
        },
        {
            bytes: DatumParameterKey.OrderHash,
        },
    ],
};
