import { KupoApi } from '../KupoApi';
import { Token } from '../models';
import { UTXO } from '../types';
import { DatumParameters } from './definitions/types';
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
export declare class ChadSwap {
    readonly identifier: string;
    readonly kupoApi: KupoApi;
    /**
     * On-Chain constants.
     */
    readonly orderAddress: string;
    constructor(kupoApi: KupoApi);
    getAllOrders(): Promise<OrderBook>;
    getOrdersByAsset(asset: string): Promise<OrderBook>;
    orderFromUtxo(utxo: UTXO): Promise<{
        order: Order;
        isBuy: boolean;
    } | undefined>;
    allOrderUtxos(): Promise<UTXO[]>;
    parseOrderDatum(datum: string): Promise<DatumParameters>;
    fetchAndParseOrderDatum(datumHash: string): Promise<Order>;
}
