import { DatumParameterKey } from '../constants';
import { DatumParameters, DefinitionField } from '../types';
declare const _default: {
    constructor: number;
    fields: (((field: DefinitionField, parameters: DatumParameters, shouldExtract?: boolean) => DatumParameters) | {
        int: DatumParameterKey;
        constructor?: undefined;
        fields?: undefined;
        bytes?: undefined;
    } | {
        constructor: number;
        fields: ({
            constructor: number;
            fields: {
                bytes: DatumParameterKey;
            }[];
        } | {
            constructor: number;
            fields: {
                constructor: number;
                fields: {
                    constructor: number;
                    fields: {
                        bytes: DatumParameterKey;
                    }[];
                }[];
            }[];
        })[];
        int?: undefined;
        bytes?: undefined;
    } | {
        bytes: DatumParameterKey;
        int?: undefined;
        constructor?: undefined;
        fields?: undefined;
    } | {
        constructor: number;
        fields: ({
            constructor: DatumParameterKey;
            fields: never[];
            int?: undefined;
        } | {
            int: DatumParameterKey;
            constructor?: undefined;
            fields?: undefined;
        })[];
        int?: undefined;
        bytes?: undefined;
    })[];
};
export default _default;
