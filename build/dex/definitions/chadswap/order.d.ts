import { DatumParameterKey } from '../constants';
import { DatumParameters, DefinitionField } from '../types';
/**
 * https://github.com/CatspersCoffee/contracts/blob/bd6831e6806798032f6bb754d94a06d72d4d28a1/dex/src/Minswap/BatchOrder/Types.hs
 */
declare const _default: {
    constructor: number;
    fields: (((field: DefinitionField, parameters: DatumParameters, shouldExtract?: boolean) => void) | {
        constructor: number;
        fields: (((field: DefinitionField, parameters: DatumParameters, shouldExtract?: boolean) => void) | {
            constructor: number;
            fields: ((field: DefinitionField, parameters: DatumParameters, shouldExtract?: boolean) => void)[];
            bytes?: undefined;
            int?: undefined;
        } | {
            constructor: string;
            fields: never[];
            bytes?: undefined;
            int?: undefined;
        } | {
            bytes: DatumParameterKey;
            constructor?: undefined;
            fields?: undefined;
            int?: undefined;
        } | {
            int: DatumParameterKey;
            constructor?: undefined;
            fields?: undefined;
            bytes?: undefined;
        } | {
            constructor: number;
            fields: {
                int: DatumParameterKey;
            }[];
            bytes?: undefined;
            int?: undefined;
        })[];
    })[];
};
export default _default;
