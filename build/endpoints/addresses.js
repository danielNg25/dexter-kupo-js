import { isShellyAddress } from '../utils';
import { handleError } from '../utils/errors';
export async function addresses(address) {
    try {
        const res = await this.addressesUtxos(address);
        return {
            address: address,
            amount: res.reduce((acc, utxo) => {
                utxo.amount.forEach((asset) => {
                    const index = acc.findIndex((a) => a.unit === asset.unit);
                    if (index === -1) {
                        acc.push(asset);
                    }
                    else {
                        acc[index].quantity = (BigInt(acc[index].quantity) + BigInt(asset.quantity)).toString();
                    }
                });
                return acc;
            }, []),
            stake_address: null,
            type: isShellyAddress(address) ? 'shelley' : 'byron',
            script: res.length > 0 && res[0].data_hash !== null,
        };
    }
    catch (error) {
        throw handleError(error);
    }
}
export async function addressesUtxos(address) {
    try {
        return await this.get(address, true);
    }
    catch (error) {
        throw handleError(error);
    }
}
