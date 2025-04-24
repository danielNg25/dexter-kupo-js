import { DatumParameterKey } from '../constants';
import { DatumParameters, DefinitionField } from '../types';

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
                        (
                            field: DefinitionField,
                            parameters: DatumParameters,
                            shouldExtract: boolean = true
                        ) => {
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
                (
                    field: DefinitionField,
                    parameters: DatumParameters,
                    shouldExtract: boolean = true
                ) => {
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
        (
            field: DefinitionField,
            parameters: DatumParameters,
            shouldExtract: boolean = true
        ) => {
            return;
        },
    ],
};
