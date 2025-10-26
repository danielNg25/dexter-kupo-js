import { tokenIdentifier } from '../models';
import { compareTokenWithPolicy, identifierToAsset } from '../utils';
import { DefinitionBuilder } from './definitions/definition-builder';
import order from './definitions/chadswap/order';
import { cborToDatumJson } from './definitions/utils';
import { DEX_IDENTIFIERS } from './utils';
import orderPriceDenomNull from './definitions/chadswap/orderPriceDenomNull';
export class ChadSwap {
    constructor(kupoApi) {
        this.identifier = DEX_IDENTIFIERS.CHADSWAP;
        /**
         * On-Chain constants.
         */
        this.orderAddress = 'addr1wxxxdudv3dtaa09tngrm8wds54v45kkhdcau4e6keqh0uncksc7pn';
        this.orderAddress2 = 'addr1w84q0y2wwfj5efd9ch3x492edeh6pdwycvt7g030jfzhagg5ftr54';
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
        const orderData = await this.fetchAndParseOrderDatum(utxo.data_hash);
        if (!orderData)
            return undefined;
        return {
            order: orderData,
            isBuy: utxo.amount.length === 1,
        };
    }
    async allOrderUtxos() {
        let utxoPromises = await Promise.all([
            this.kupoApi.get(this.orderAddress, true),
            this.kupoApi.get(this.orderAddress2, true),
        ]);
        return utxoPromises[0].concat(utxoPromises[1]);
    }
    async parseOrderDatum(datum) {
        let jsonDatum = cborToDatumJson(datum);
        try {
            const builder = await new DefinitionBuilder().loadDefinition(order);
            const parameters = builder.pullParameters(jsonDatum);
            return parameters;
        }
        catch (error) {
            console.log('Json Datum', jsonDatum);
            try {
                const builder = await new DefinitionBuilder().loadDefinition(orderPriceDenomNull);
                const parameters = builder.pullParameters(jsonDatum);
                return parameters;
            }
            catch (error) {
                console.log('Failed to parse order datum: ${error}');
                return undefined;
            }
        }
    }
    async fetchAndParseOrderDatum(datumHash) {
        const datum = await this.kupoApi.datum(datumHash);
        if (!datum) {
            throw new Error(`Datum not found for hash: ${datumHash}`);
        }
        let orderData = await this.parseOrderDatum(datum);
        if (!orderData) {
            return undefined;
        }
        return {
            price: BigInt(orderData.UnitPrice),
            priceDenominator: BigInt(orderData.UnitPriceDenominator ?? 1),
            asset: identifierToAsset(String(orderData.TokenPolicyId) +
                String(orderData.TokenAssetName)),
            amount: BigInt(orderData.RemainingAmount),
        };
    }
}
