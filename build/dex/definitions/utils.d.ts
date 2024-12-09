import { DatumJson } from './types';
import { Datum } from 'lucid-cardano';
export declare function datumJsonToCbor(json: DatumJson): Datum;
export declare function cborToDatumJson(raw: string): any;
