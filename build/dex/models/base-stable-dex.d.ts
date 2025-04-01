import { KupoApi } from '../../KupoApi';
import { UTXO } from '../../types';
import { StablePool } from './stable-pool';
export declare abstract class BaseStableDex {
    kupoApi: KupoApi;
    identifier: string;
    constructor(kupoApi: KupoApi);
    /**
     * Craft liquidity pool state from a valid UTxO.
     */
    abstract liquidityPoolFromUtxoExtend(utxo: UTXO, assetList: string[], decimals: number[], poolId: string): Promise<StablePool | undefined>;
    /**
     * Craft liquidity pool state from a pool id.
     */
    abstract liquidityPoolFromPoolId(poolId: string, assetList: string[], decimals: number[]): Promise<StablePool | undefined>;
}
