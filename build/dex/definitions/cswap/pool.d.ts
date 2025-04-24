import { DatumParameterKey } from '../constants';
import { DatumParameters, DefinitionField } from '../types';
/**
 * https://github.com/minswap/minswap-dex-v2/blob/main/src/types/pool.ts
 */
declare const _default: {
    constructor: number;
    fields: (((field: DefinitionField, parameters: DatumParameters, shouldExtract?: boolean) => void) | {
        int: DatumParameterKey;
        bytes?: undefined;
    } | {
        bytes: DatumParameterKey;
        int?: undefined;
    })[];
};
export default _default;
