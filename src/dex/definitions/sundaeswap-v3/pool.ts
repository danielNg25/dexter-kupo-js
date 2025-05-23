import { DatumParameterKey } from '../constants';
import { DatumParameters, DefinitionField } from '../types';

export default {
    constructor: 0,
    fields: [
        {
            bytes: DatumParameterKey.PoolIdentifier,
        },
        {
            list: [
                {
                    list: [
                        {
                            bytes: DatumParameterKey.PoolAssetAPolicyId,
                        },
                        {
                            bytes: DatumParameterKey.PoolAssetAAssetName,
                        },
                    ],
                },
                {
                    list: [
                        {
                            bytes: DatumParameterKey.PoolAssetBPolicyId,
                        },
                        {
                            bytes: DatumParameterKey.PoolAssetBAssetName,
                        },
                    ],
                },
            ],
        },
        {
            int: DatumParameterKey.TotalLpTokens,
        },
        {
            int: DatumParameterKey.OpeningFee,
        },
        {
            int: DatumParameterKey.FinalFee,
        },
        (
            field: DefinitionField,
            parameters: DatumParameters,
            shouldExtract: boolean = true
        ) => {
            return;
        },
        {
            int: DatumParameterKey.Unknown,
        },
        {
            int: DatumParameterKey.LovelaceDeduction,
        },
    ],
};
