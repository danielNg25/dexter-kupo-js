import { DatumParameterKey } from '../constants';
export default {
    constructor: 0,
    fields: [
        {
            constructor: 0,
            fields: [
                {
                    bytes: DatumParameterKey.SwapInTokenPolicyId,
                },
                {
                    bytes: DatumParameterKey.SwapInTokenAssetName,
                },
            ],
        },
        {
            constructor: 0,
            fields: [
                {
                    bytes: DatumParameterKey.SwapOutTokenPolicyId,
                },
                {
                    bytes: DatumParameterKey.SwapOutTokenAssetName,
                },
            ],
        },
        {
            constructor: 0,
            fields: [
                {
                    bytes: DatumParameterKey.TokenPolicyId, // Pool NFT
                },
                {
                    bytes: DatumParameterKey.TokenAssetName,
                },
            ],
        },
        {
            int: DatumParameterKey.LpFee,
        },
        {
            int: DatumParameterKey.LpFeeNumerator, // Execution fee numerator
        },
        {
            int: DatumParameterKey.LpFeeDenominator, // Execution fee denominator
        },
        {
            bytes: DatumParameterKey.SenderPubKeyHash,
        },
        (field, parameters, shouldExtract = true) => {
            if (!shouldExtract) {
                const stakeKeyHash = parameters[DatumParameterKey.SenderStakingKeyHash] ?? null;
                if (!stakeKeyHash)
                    return;
                return {
                    constructor: 0,
                    fields: [
                        {
                            bytes: stakeKeyHash,
                        },
                    ],
                };
            }
            if ('fields' in field) {
                if (field.constructor === 1)
                    return;
                if (field.fields.length > 0 && 'bytes' in field.fields[0]) {
                    parameters[DatumParameterKey.SenderStakingKeyHash] =
                        field.fields[0].bytes;
                }
            }
            return;
        },
        {
            int: DatumParameterKey.SwapInAmount,
        },
        {
            int: DatumParameterKey.MinReceive,
        },
    ],
};
