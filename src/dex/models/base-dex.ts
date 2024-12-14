import { KupoApi } from '../../KupoApi';
import { UTXO } from '../../types';
import { DefinitionBuilder } from '../definitions/definition-builder';
import { DatumParameters, DefinitionConstr } from '../definitions/types';
import { cborToDatumJson } from '../definitions/utils';
import { LiquidityPool } from './liquidity-pool';

export abstract class BaseDex {
    public kupoApi: KupoApi;
    public identifier!: string;

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

    abstract liquidityPoolsFromToken(
        tokenB: string,
        tokenA: string,
        tokenBDecimals: number,
        tokenADecimals: number,
        allLiquidityPools: any
    ): Promise<Array<LiquidityPool> | undefined>;

    abstract parseOrderDatum(datum: string): Promise<DatumParameters>;

    abstract fetchAndParseOrderDatum(
        datumHash: string
    ): Promise<DatumParameters>;

    async _parseOrderDatum(
        datum: string,
        order: any
    ): Promise<DatumParameters> {
        try {
            let jsonDatum = cborToDatumJson(datum);

            const builder: DefinitionBuilder =
                await new DefinitionBuilder().loadDefinition(order);

            const parameters: DatumParameters = builder.pullParameters(
                jsonDatum as DefinitionConstr
            );

            return parameters;
        } catch (error) {
            throw new Error(`Failed to parse order datum: ${error}`);
        }
    }
}
