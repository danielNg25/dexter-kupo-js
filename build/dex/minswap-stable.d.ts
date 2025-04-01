import { KupoApi } from '../KupoApi';
import { UTXO } from '../types';
import { BaseStableDex } from './models/base-stable-dex';
import { StablePool } from './models/stable-pool';
export declare class MinswapStable extends BaseStableDex {
    readonly identifier: string;
    constructor(kupoApi: KupoApi);
    liquidityPoolFromUtxoExtend(utxo: UTXO, assetList: string[], decimals: number[], poolId: string): Promise<StablePool | undefined>;
    liquidityPoolFromPoolId(poolId: string, assetList: string[], decimals: number[]): Promise<StablePool | undefined>;
}
