import { KupoApi } from '../KupoApi';
import { Token, tokenName } from '../models';
import { Unit, UTXO } from '../types';
import {
    compareTokenWithPolicy,
    identifierToAsset,
    LOVELACE,
    retry,
} from '../utils';
import { DefinitionBuilder } from './definitions/definition-builder';
import order from './definitions/chadswap/order';
import { DatumParameters, DefinitionConstr } from './definitions/types';
import { cborToDatumJson } from './definitions/utils';
import { BaseDex } from './models/base-dex';
import { LiquidityPool } from './models/liquidity-pool';
import { DEX_IDENTIFIERS } from './utils';

export type Order = {
    price: bigint;
    priceDenominator: bigint;
    asset: Token;
    amount: bigint;
};

export type OrderBook = {
    buyOrders: Order[];
    sellOrders: Order[];
};

export class ChadSwap {
    public readonly identifier: string = DEX_IDENTIFIERS.CHADSWAP;
    public readonly kupoApi: KupoApi;
    /**
     * On-Chain constants.
     */
    public readonly orderAddress: string =
        'addr1wxxxdudv3dtaa09tngrm8wds54v45kkhdcau4e6keqh0uncksc7pn';

    constructor(kupoApi: KupoApi) {
        this.kupoApi = kupoApi;
    }

    async getAllOrders(): Promise<OrderBook> {
        const utxos = await this.allOrderUtxos();
        let orders: OrderBook = {
            buyOrders: [],
            sellOrders: [],
        };

        await Promise.all(
            utxos.map(async (utxo) => {
                const orderData = await this.orderFromUtxo(utxo);
                if (orderData) {
                    if (orderData.isBuy) {
                        orders.buyOrders.push(orderData.order);
                    } else {
                        orders.sellOrders.push(orderData.order);
                    }
                }
            })
        );

        return orders;
    }

    async getOrdersByAsset(asset: string): Promise<OrderBook> {
        const orders = await this.getAllOrders();
        return {
            buyOrders: orders.buyOrders.filter((order) =>
                compareTokenWithPolicy(order.asset, asset)
            ),
            sellOrders: orders.sellOrders.filter((order) =>
                compareTokenWithPolicy(order.asset, asset)
            ),
        };
    }

    async orderFromUtxo(
        utxo: UTXO
    ): Promise<{ order: Order; isBuy: boolean } | undefined> {
        if (!utxo.data_hash) return undefined;
        return {
            order: await this.fetchAndParseOrderDatum(utxo.data_hash),
            isBuy: utxo.amount.length === 1,
        };
    }

    async allOrderUtxos(): Promise<UTXO[]> {
        return await this.kupoApi.get(this.orderAddress, true);
    }

    async parseOrderDatum(datum: string): Promise<DatumParameters> {
        try {
            let jsonDatum = cborToDatumJson(datum);

            const builder: DefinitionBuilder =
                await new DefinitionBuilder().loadDefinition(order as any);

            const parameters: DatumParameters = builder.pullParameters(
                jsonDatum as DefinitionConstr
            );

            return parameters;
        } catch (error) {
            throw new Error(`Failed to parse order datum: ${error}`);
        }
    }

    async fetchAndParseOrderDatum(datumHash: string): Promise<Order> {
        const datum = await this.kupoApi.datum(datumHash);

        if (!datum) {
            throw new Error(`Datum not found for hash: ${datumHash}`);
        }

        let orderData = await this.parseOrderDatum(datum);

        return {
            price: BigInt(orderData.UnitPrice!),
            priceDenominator: BigInt(orderData.UnitPriceDenominator!),
            asset: identifierToAsset(
                String(orderData.TokenPolicyId!) +
                    String(orderData.TokenAssetName!)
            ),
            amount: BigInt(orderData.RemainingAmount!),
        };
    }
}
