import { KupoApi } from '../KupoApi';
import { AddressInfo, Unit, KupoTypes, UTXO } from '../types';
import { isShellyAddress, joinPolicyId, LOVELACE } from '../utils';
import { handleError } from '../utils/errors';

export async function addresses(
    this: KupoApi,
    address: string
): Promise<AddressInfo> {
    try {
        const res = await this.addressesUtxos(address);

        return {
            address: address,
            amount: res.reduce((acc: Array<Unit>, utxo: UTXO) => {
                utxo.amount.forEach((asset) => {
                    const index = acc.findIndex((a) => a.unit === asset.unit);

                    if (index === -1) {
                        acc.push(asset);
                    } else {
                        acc[index].quantity = (
                            BigInt(acc[index].quantity) + BigInt(asset.quantity)
                        ).toString();
                    }
                });

                return acc;
            }, []),
            stake_address: null,
            type: isShellyAddress(address) ? 'shelley' : 'byron',
            script: res.length > 0 && res[0].data_hash !== null,
        };
    } catch (error) {
        throw handleError(error);
    }
}

export async function addressesUtxos(
    this: KupoApi,
    address: string
): Promise<Array<UTXO>> {
    try {
        return await this.get(address, true);
    } catch (error) {
        throw handleError(error);
    }
}
