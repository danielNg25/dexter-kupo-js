import { KupoApi } from '../../KupoApi';
import { UTXO } from '../../types';
import { LiquidityPool } from './liquidity-pool';

export abstract class BaseDex {
    public kupoApi: KupoApi;

    constructor(kupoApi: KupoApi) {
        this.kupoApi = kupoApi;
    }

    /**
     * Craft liquidity pool state from a valid UTxO.
     */
    abstract liquidityPoolFromUtxo(
        utxo: UTXO
    ): Promise<LiquidityPool | undefined>;

    /**
     * Craft liquidity pool state from a pool id.
     */
    abstract liquidityPoolFromPoolId(
        poolId: string
    ): Promise<LiquidityPool | undefined>;
}
