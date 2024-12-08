import { DatumJson } from './types';
import { C, Datum, fromHex, toHex } from 'lucid-cardano';

export function datumJsonToCbor(json: DatumJson): Datum {
    const convert = (json: DatumJson): C.PlutusData => {
        if (!isNaN(json.int!)) {
            return C.PlutusData.new_integer(
                C.BigInt.from_str(json.int!.toString())
            );
        } else if (json.bytes || !isNaN(Number(json.bytes))) {
            return C.PlutusData.new_bytes(fromHex(json.bytes!));
        } else if (json.map) {
            const l = C.PlutusList.new();
            (json as any).forEach((v: DatumJson) => {
                l.add(convert(v));
            });
            return C.PlutusData.new_list(l);
        } else if (json.list) {
            const l = C.PlutusList.new();
            json.list.forEach((v: DatumJson) => {
                l.add(convert(v));
            });
            return C.PlutusData.new_list(l);
        } else if (!isNaN(json.constructor! as unknown as number)) {
            const l = C.PlutusList.new();
            json.fields!.forEach((v: DatumJson) => {
                l.add(convert(v));
            });
            return C.PlutusData.new_constr_plutus_data(
                C.ConstrPlutusData.new(
                    C.BigNum.from_str(json.constructor!.toString()),
                    l
                )
            );
        }
        throw new Error('Unsupported type');
    };

    return toHex(convert(json).to_bytes());
}

export function cborToDatumJson(raw: string): any {
    function deserializeToJson(data: C.PlutusData): any {
        if (data.kind() === 0) {
            // Constructor type
            const constr = data.as_constr_plutus_data()!;
            const fields = [];
            const l = constr.data();
            for (let i = 0; i < l.len(); i++) {
                fields.push(deserializeToJson(l.get(i)));
            }
            return {
                constructor: parseInt(constr.alternative().to_str()),
                fields,
            };
        } else if (data.kind() === 1) {
            // Map type
            const m = data.as_map()!;
            const keys = m.keys();
            const mapObj: { [key: string]: any } = {};
            for (let i = 0; i < keys.len(); i++) {
                const key = deserializeToJson(keys.get(i));
                const value = deserializeToJson(m.get(keys.get(i))!);
                mapObj[JSON.stringify(key)] = value; // Keys must be serialized
            }
            return mapObj;
        } else if (data.kind() === 2) {
            // List type
            const l = data.as_list()!;
            const deserializedList = [];
            for (let i = 0; i < l.len(); i++) {
                deserializedList.push(deserializeToJson(l.get(i)));
            }
            return deserializedList;
        } else if (data.kind() === 3) {
            // Integer type
            return {
                int: data.as_integer()!.to_str(),
            };
        } else if (data.kind() === 4) {
            // Bytes type
            return {
                bytes: toHex(data.as_bytes()!),
            };
        }

        throw new Error('Unsupported type');
    }
    const data = C.PlutusData.from_bytes(fromHex(raw));
    return deserializeToJson(data);
}
