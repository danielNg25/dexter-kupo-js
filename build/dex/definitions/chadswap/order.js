import { DatumParameterKey } from '../constants';
/**
 * https://github.com/CatspersCoffee/contracts/blob/bd6831e6806798032f6bb754d94a06d72d4d28a1/dex/src/Minswap/BatchOrder/Types.hs
 */
export default {
    constructor: 0,
    fields: [
        {
            constructor: 0,
            fields: [
                {
                    constructor: 0,
                    fields: [
                        (field, parameters, shouldExtract = true) => {
                            return;
                        },
                    ],
                },
                {
                    constructor: 'a',
                    fields: [],
                },
                {
                    bytes: DatumParameterKey.TokenPolicyId,
                },
                {
                    bytes: DatumParameterKey.TokenAssetName,
                },
                {
                    int: DatumParameterKey.UnitPrice,
                },
                {
                    constructor: 0,
                    fields: [
                        {
                            int: DatumParameterKey.UnitPriceDenominator,
                        },
                    ],
                },
                (field, parameters, shouldExtract = true) => {
                    return;
                },
            ],
        },
        {
            constructor: 0,
            fields: [
                {
                    int: DatumParameterKey.RemainingAmount,
                },
                {
                    int: DatumParameterKey.FilledAmount,
                },
            ],
        },
        (field, parameters, shouldExtract = true) => {
            return;
        },
    ],
};
