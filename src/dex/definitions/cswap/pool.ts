import { DatumParameterKey } from '../constants';
import { DatumParameters, DefinitionField } from '../types';

/**
 * https://github.com/minswap/minswap-dex-v2/blob/main/src/types/pool.ts
 */
export default {
    constructor: 0,
    fields: [
        {
            int: DatumParameterKey.TotalLpTokens,
        },
        {
            int: DatumParameterKey.LpFee,
        },
        {
            bytes: DatumParameterKey.PoolAssetAPolicyId,
        },
        {
            bytes: DatumParameterKey.PoolAssetAAssetName,
        },
        {
            bytes: DatumParameterKey.PoolAssetBPolicyId,
        },
        {
            bytes: DatumParameterKey.PoolAssetBAssetName,
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
