import { KupoApi } from '../KupoApi';
import { Token, tokenIdentifier, tokenName } from '../models';
import { Unit, UTXO } from '../types';
import { compareTokenWithPolicy, identifierToAsset } from '../utils';
import { DefinitionBuilder } from './definitions/definition-builder';
import order from './definitions/chadswap/order';
import { DatumParameters, DefinitionConstr } from './definitions/types';
import { cborToDatumJson } from './definitions/utils';
import { DEX_IDENTIFIERS } from './utils';
import orderPriceDenomNull from './definitions/chadswap/orderPriceDenomNull';

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
    public readonly orderAddress2: string =
        'addr1w84q0y2wwfj5efd9ch3x492edeh6pdwycvt7g030jfzhagg5ftr54';

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

    async allOrderBooks(): Promise<Map<string, OrderBook>> {
        const orders = await this.getAllOrders();
        let orderBooks: Map<string, OrderBook> = new Map();
        for (const order of orders.buyOrders) {
            const tokenId = tokenIdentifier(order.asset);
            if (!orderBooks.has(tokenId)) {
                orderBooks.set(tokenId, {
                    buyOrders: [],
                    sellOrders: [],
                });
            }
            orderBooks.get(tokenId)?.buyOrders.push(order);
        }
        for (const order of orders.sellOrders) {
            const tokenId = tokenIdentifier(order.asset);
            if (!orderBooks.has(tokenId)) {
                orderBooks.set(tokenId, {
                    buyOrders: [],
                    sellOrders: [],
                });
            }
            orderBooks.get(tokenId)?.sellOrders.push(order);
        }
        return orderBooks;
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
        const orderData = await this.fetchAndParseOrderDatum(utxo.data_hash);
        if (!orderData) return undefined;
        return {
            order: orderData,
            isBuy: utxo.amount.length === 1,
        };
    }

    async allOrderUtxos(): Promise<UTXO[]> {
        let utxoPromises = await Promise.all([
            this.kupoApi.get(this.orderAddress, true),
            this.kupoApi.get(this.orderAddress2, true),
        ]);
        return utxoPromises[0].concat(utxoPromises[1]);
    }

    async parseOrderDatum(datum: string): Promise<DatumParameters | undefined> {
        let jsonDatum = cborToDatumJson(datum);
        try {
            const builder: DefinitionBuilder =
                await new DefinitionBuilder().loadDefinition(order as any);

            const parameters: DatumParameters = builder.pullParameters(
                jsonDatum as DefinitionConstr
            );

            return parameters;
        } catch (error) {
            try {
                const builder: DefinitionBuilder =
                    await new DefinitionBuilder().loadDefinition(
                        orderPriceDenomNull as any
                    );

                const parameters: DatumParameters = builder.pullParameters(
                    jsonDatum as DefinitionConstr
                );

                return parameters;
            } catch (error) {
                console.log('Failed to parse order datum: ${error}');
                return undefined;
            }
        }
    }

    async fetchAndParseOrderDatum(
        datumHash: string
    ): Promise<Order | undefined> {
        const datum = await this.kupoApi.datum(datumHash);
        if (!datum) {
            throw new Error(`Datum not found for hash: ${datumHash}`);
        }

        let orderData = await this.parseOrderDatum(datum);

        if (!orderData) {
            return undefined;
        }

        return {
            price: BigInt(orderData.UnitPrice!),
            priceDenominator: BigInt(orderData.UnitPriceDenominator ?? 1),
            asset: identifierToAsset(
                String(orderData.TokenPolicyId!) +
                    String(orderData.TokenAssetName!)
            ),
            amount: BigInt(orderData.RemainingAmount!),
        };
    }
}
