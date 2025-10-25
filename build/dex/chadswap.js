import { tokenIdentifier } from '../models';
import { compareTokenWithPolicy, identifierToAsset, } from '../utils';
import { DefinitionBuilder } from './definitions/definition-builder';
import order from './definitions/chadswap/order';
import { cborToDatumJson } from './definitions/utils';
import { DEX_IDENTIFIERS } from './utils';
export class ChadSwap {
    constructor(kupoApi) {
        this.identifier = DEX_IDENTIFIERS.CHADSWAP;
        /**
         * On-Chain constants.
         */
        this.orderAddress = 'addr1wxxxdudv3dtaa09tngrm8wds54v45kkhdcau4e6keqh0uncksc7pn';
        this.kupoApi = kupoApi;
    }
    async getAllOrders() {
        const utxos = await this.allOrderUtxos();
        let orders = {
            buyOrders: [],
            sellOrders: [],
        };
        await Promise.all(utxos.map(async (utxo) => {
            const orderData = await this.orderFromUtxo(utxo);
            if (orderData) {
                if (orderData.isBuy) {
                    orders.buyOrders.push(orderData.order);
                }
                else {
                    orders.sellOrders.push(orderData.order);
                }
            }
        }));
        return orders;
    }
    async allOrderBooks() {
        const orders = await this.getAllOrders();
        let orderBooks = new Map();
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
    async getOrdersByAsset(asset) {
        const orders = await this.getAllOrders();
        return {
            buyOrders: orders.buyOrders.filter((order) => compareTokenWithPolicy(order.asset, asset)),
            sellOrders: orders.sellOrders.filter((order) => compareTokenWithPolicy(order.asset, asset)),
        };
    }
    async orderFromUtxo(utxo) {
        if (!utxo.data_hash)
            return undefined;
        return {
            order: await this.fetchAndParseOrderDatum(utxo.data_hash),
            isBuy: utxo.amount.length === 1,
        };
    }
    async allOrderUtxos() {
        return await this.kupoApi.get(this.orderAddress, true);
    }
    async parseOrderDatum(datum) {
        try {
            let jsonDatum = cborToDatumJson(datum);
            const builder = await new DefinitionBuilder().loadDefinition(order);
            const parameters = builder.pullParameters(jsonDatum);
            return parameters;
        }
        catch (error) {
            throw new Error(`Failed to parse order datum: ${error}`);
        }
    }
    async fetchAndParseOrderDatum(datumHash) {
        const datum = await this.kupoApi.datum(datumHash);
        if (!datum) {
            throw new Error(`Datum not found for hash: ${datumHash}`);
        }
        let orderData = await this.parseOrderDatum(datum);
        return {
            price: BigInt(orderData.UnitPrice),
            priceDenominator: BigInt(orderData.UnitPriceDenominator),
            asset: identifierToAsset(String(orderData.TokenPolicyId) +
                String(orderData.TokenAssetName)),
            amount: BigInt(orderData.RemainingAmount),
        };
    }
}
