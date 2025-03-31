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
declare const _default: {
    constructor: number;
    fields: ({
        list: {
            int: DatumParameterKey;
        }[];
        int?: undefined;
        bytes?: undefined;
    } | {
        int: DatumParameterKey;
        list?: undefined;
        bytes?: undefined;
    } | {
        bytes: DatumParameterKey;
        list?: undefined;
        int?: undefined;
    })[];
};
export default _default;
