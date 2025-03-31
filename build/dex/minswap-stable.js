import { identifierToAsset, } from '../utils';
import { BaseStableDex } from './models/base-stable-dex';
import { StablePool } from './models/stable-pool';
import { DEX_IDENTIFIERS } from './utils';
import stablePool from './definitions/minswap/stable-pool';
import { cborToDatumJson } from './definitions/utils';
import { DefinitionBuilder } from './definitions/definition-builder';
export class MinswapStable extends BaseStableDex {
    constructor(kupoApi) {
        super(kupoApi);
        this.identifier = DEX_IDENTIFIERS.MINSWAPSTABLE;
    }
    async liquidityPoolFromUtxoExtend(utxo, assetList, poolId) {
        if (!utxo.data_hash) {
            return Promise.resolve(undefined);
        }
        try {
            const datum = await this.kupoApi.datum(utxo.data_hash);
            let jsonDatum = cborToDatumJson(datum);
            const builder = await new DefinitionBuilder().loadDefinition(stablePool);
            const parameters = builder.pullParameters(jsonDatum);
            const pool = new StablePool(this, identifierToAsset(assetList[0]), identifierToAsset(assetList[1]), BigInt(parameters.Balance0), BigInt(parameters.Balance1), poolId, 0.1, // Standard fee for Minswap stable pools
            BigInt(parameters.AmplificationCoefficient), BigInt(parameters.TotalLiquidity), poolId);
            return pool;
        }
        catch (e) {
            throw new Error(`Failed parsing datum for stable pool ${utxo.address}`);
        }
    }
    async liquidityPoolFromPoolId(poolId, assetList) {
        const utxos = await this.kupoApi.get(poolId, true);
        if (utxos.length === 0) {
            return Promise.resolve(undefined);
        }
        return this.liquidityPoolFromUtxoExtend(utxos[0], assetList, poolId);
    }
}
