import { DatumParameterKey } from './constants';
export type DefinitionBytes = {
    bytes: string | DatumParameterKey;
};
export type DefinitionInt = {
    int: number | DatumParameterKey;
};
export type DefinitionList = {
    list: DefinitionField[] | DefinitionList[];
};
export type DefinitionField = DefinitionConstr | DefinitionBytes | DefinitionInt | DefinitionList | Function | DefinitionField[];
export type DefinitionConstr = {
    constructor: number | DatumParameterKey;
    fields: DefinitionField[];
};
export type DatumParameters = {
    [key in DatumParameterKey | string]?: string | number | bigint;
};
export type DatumJson = {
    int?: number;
    bytes?: string;
    list?: Array<DatumJson>;
    map?: Array<{
        k: unknown;
        v: unknown;
    }>;
    fields?: Array<DatumJson>;
    [constructor: string]: unknown;
};
