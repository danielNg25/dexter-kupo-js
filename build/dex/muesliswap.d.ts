import { KupoApi } from '../KupoApi';
import { UTXO } from '../types';
import { BaseDex } from './models/base-dex';
import { LiquidityPool } from './models/liquidity-pool';
export declare class Muesliswap extends BaseDex {
    readonly identifier: string;
    /**
     * On-Chain constants.
     */
    readonly orderAddress: string;
    readonly lpTokenPolicyId: string;
    readonly poolNftPolicyIdV1: string;
    readonly poolNftPolicyIdV2: string;
    readonly factoryTokenPolicyId: string;
    readonly factoryToken: string;
    readonly cancelDatum: string;
    constructor(kupoApi: KupoApi);
    allLiquidityPools(): Promise<LiquidityPool[]>;
    allLiquidityPoolUtxos(): Promise<UTXO[]>;
    liquidityPoolFromUtxo(utxo: UTXO, poolId?: string): Promise<LiquidityPool | undefined>;
    liquidityPoolFromUtxoExtend(utxo: UTXO, poolId?: string): Promise<LiquidityPool | undefined>;
    liquidityPoolFromPoolId(poolId: string): Promise<LiquidityPool | undefined>;
    liquidityPoolsFromToken(tokenB: string, tokenA?: string, tokenBDecimals?: number, tokenADecimals?: number, allLiquidityPools?: LiquidityPool[]): Promise<Array<LiquidityPool> | undefined>;
}
