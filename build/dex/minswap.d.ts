import { KupoApi } from '../KupoApi';
import { UTXO } from '../types';
import { BaseDex } from './models/base-dex';
import { LiquidityPool } from './models/liquidity-pool';
export declare class Minswap extends BaseDex {
    readonly identifier: string;
    /**
     * On-Chain constants.
     */
    readonly marketOrderAddress: string;
    readonly limitOrderAddress: string;
    readonly lpTokenPolicyId: string;
    readonly poolNftPolicyId: string;
    readonly poolValidityAsset: string;
    readonly poolValidityAssetJoined: string;
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
    liquidityPoolFromPoolId(poolId: string): Promise<LiquidityPool | undefined>;
    liquidityPoolsFromToken(tokenB: string, tokenA?: string, tokenBDecimals?: number, tokenADecimals?: number, allLiquidityPools?: LiquidityPool[]): Promise<Array<LiquidityPool> | undefined>;
}
