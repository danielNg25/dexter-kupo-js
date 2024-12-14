import { KupoApi } from '../../KupoApi';
import { UTXO } from '../../types';
import { DatumParameters } from '../definitions/types';
import { LiquidityPool } from './liquidity-pool';
export declare abstract class BaseDex {
    kupoApi: KupoApi;
    identifier: string;
    constructor(kupoApi: KupoApi);
    /**
     * Craft liquidity pool state from a valid UTxO.
     */
    abstract liquidityPoolFromUtxo(utxo: UTXO): Promise<LiquidityPool | undefined>;
    /**
     * Craft liquidity pool state from a pool id.
     */
    abstract liquidityPoolFromPoolId(poolId: string): Promise<LiquidityPool | undefined>;
    abstract liquidityPoolsFromToken(tokenB: string, tokenA: string, tokenBDecimals: number, tokenADecimals: number, allLiquidityPools: any): Promise<Array<LiquidityPool> | undefined>;
    abstract parseOrderDatum(datum: string): Promise<DatumParameters>;
    abstract fetchAndParseOrderDatum(datumHash: string): Promise<DatumParameters>;
    _parseOrderDatum(datum: string, order: any): Promise<DatumParameters>;
}
