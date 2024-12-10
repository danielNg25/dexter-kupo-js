import { DatumParameterKey } from '../constants';
import { DatumParameters, DefinitionField } from '../types';
declare const _default: {
    constructor: number;
    fields: (((field: DefinitionField, parameters: DatumParameters, shouldExtract?: boolean) => DatumParameters) | {
        bytes: DatumParameterKey;
        int?: undefined;
        constructor?: undefined;
        fields?: undefined;
    } | {
        int: DatumParameterKey;
        bytes?: undefined;
        constructor?: undefined;
        fields?: undefined;
    } | {
        constructor: number;
        fields: {
            int: DatumParameterKey;
        }[];
        bytes?: undefined;
        int?: undefined;
    })[];
};
export default _default;
