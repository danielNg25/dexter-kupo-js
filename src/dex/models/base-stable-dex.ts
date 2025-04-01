import { KupoApi } from '../../KupoApi';
import { UTXO } from '../../types';
import { LiquidityPool } from './liquidity-pool';
import { StablePool } from './stable-pool';

export abstract class BaseStableDex {
    public kupoApi: KupoApi;
    public identifier!: string;

    constructor(kupoApi: KupoApi) {
        this.kupoApi = kupoApi;
    }

    /**
     * Craft liquidity pool state from a valid UTxO.
     */
    abstract liquidityPoolFromUtxoExtend(
        utxo: UTXO,
        assetList: string[],
        decimals: number[],
        poolId: string
    ): Promise<StablePool | undefined>;

    /**
     * Craft liquidity pool state from a pool id.
     */
    abstract liquidityPoolFromPoolId(
        poolId: string,
        assetList: string[],
        decimals: number[]
    ): Promise<StablePool | undefined>;
}
