import { KupoApi } from '../KupoApi';
import { UTXO } from '../types';
import { DatumParameters } from './definitions/types';
import { BaseDex } from './models/base-dex';
import { LiquidityPool } from './models/liquidity-pool';
export declare class CSwap extends BaseDex {
    readonly identifier: string;
    /**
     * On-Chain constants.
     */
    readonly orderAddress: string;
    readonly poolAddress: string;
    readonly lpTokenPolicyId: string;
    readonly cancelDatum: string;
    readonly orderScript: {
        type: string;
        script: string;
    };
    constructor(kupoApi: KupoApi);
    allLiquidityPools(): Promise<LiquidityPool[]>;
    allLiquidityPoolUtxos(): Promise<UTXO[]>;
    liquidityPoolFromUtxo(utxo: UTXO, poolId?: string): Promise<LiquidityPool | undefined>;
    liquidityPoolFromUtxoExtend(utxo: UTXO, poolId?: string): Promise<LiquidityPool | undefined>;
    liquidityPoolFromPoolId(poolId: string, initial?: boolean): Promise<LiquidityPool | undefined>;
    liquidityPoolsFromToken(tokenB: string, tokenA?: string, tokenBDecimals?: number, tokenADecimals?: number, allLiquidityPools?: LiquidityPool[], skipRefetch?: boolean): Promise<Array<LiquidityPool> | undefined>;
    parseOrderDatum(datum: string): Promise<DatumParameters>;
    fetchAndParseOrderDatum(datumHash: string): Promise<DatumParameters>;
}
