import { KupoApi } from '../KupoApi';
import { UTXO } from '../types';
import { DatumParameters } from './definitions/types';
import { BaseDex } from './models/base-dex';
import { LiquidityPool } from './models/liquidity-pool';
export type VyfinancePoolData = {
    unitsPair: string;
    poolValidatorUtxoAddress: string;
    isPabPool: boolean;
    'lpPolicyId-assetId': string;
    json: string;
    pair: string;
    isLive: boolean;
    orderValidatorUtxoAddress: string;
    poolNftPolicyId: string;
};
export declare class Vyfinance extends BaseDex {
    readonly identifier: string;
    /**
     * On-Chain constants.
     */
    readonly cancelDatum: string;
    readonly orderScript: {
        type: string;
        script: string;
    };
    constructor(kupoApi: KupoApi);
    allLiquidityPoolDatas(): Promise<VyfinancePoolData[]>;
    allLiquidityPools(): Promise<LiquidityPool[]>;
    liquidityPoolFromUtxo(utxo: UTXO, poolId?: string): Promise<LiquidityPool | undefined>;
    liquidityPoolFromUtxoExtend(utxo: UTXO, poolId?: string): Promise<LiquidityPool | undefined>;
    liquidityPoolFromPoolId(poolId: string): Promise<LiquidityPool | undefined>;
    liquidityPoolFromValidatorAddress(validatorAddress: string, filePath: string): Promise<LiquidityPool | undefined>;
    static findPoolDataByAddress(structuredData: Record<string, Record<string, Array<VyfinancePoolData>>>, givenAddress: string): VyfinancePoolData | undefined;
    liquidityPoolsFromToken(tokenB: string, tokenA: string | undefined, tokenBDecimals: number | undefined, tokenADecimals: number | undefined, filePath: string): Promise<Array<LiquidityPool> | undefined>;
    parseOrderDatum(datum: string): Promise<DatumParameters>;
    fetchAndParseOrderDatum(datumHash: string): Promise<DatumParameters>;
}
