import {SYMBOLS} from "..";
import {ITrade, TradeType} from "../types/types";
import {v4 as uuidv4} from "uuid";
import axios from "axios";

export const BUY_QUANTITY = 1;

export abstract class BaseProfile {
    public lastBuyTradePerTicker = new Map<string, ITrade>();
    currentFund: number;
    token: string;
    randomSpread: number;
    pnl: number;

    constructor(public username: string, public isMarketMover = false, public initFund: number = 10000) {
        // this.uuid = uuidv4();
        this.currentFund = initFund;
    }

    calcProfit(prices: Map<string, number>): number {
        SYMBOLS.forEach((symbol) => {
            const trade = this.lastBuyTradePerTicker.get(symbol);
            if (trade) {
                this.currentFund += trade.quantity * prices.get(symbol);
            }
        });

        return ((this.currentFund - this.initFund) * 100) / this.initFund;
    }

    async update(
        latestPrices: { symbol: string; price: number }[],
        publishTrade: boolean
    ): Promise<ITrade[]> {
        const strats = [];
        for (const ticker of latestPrices) {
            const lastTrade = this.lastBuyTradePerTicker.get(ticker.symbol);
            const strategy = this.getStrategy(lastTrade, ticker.price);
            if (
                strategy === TradeType.BUY &&
                this.currentFund >= BUY_QUANTITY * ticker.price
            ) {
                const spreadValue = (Math.random() <= 0.5 ? 1.1 : 0.9) * ticker.price;
                const trade = {
                    symbol: ticker.symbol,
                    type: TradeType.BUY,
                    buyPrice: spreadValue,
                    quantity: BUY_QUANTITY,
                    date: new Date(),
                };
                if (publishTrade) {
                    await this.performTrade(trade);
                }
                this.currentFund -= ticker.price * BUY_QUANTITY;
                this.lastBuyTradePerTicker.set(ticker.symbol, trade);
                strats.push(trade);
            } else if (strategy == TradeType.SELL) {
                const trade = {
                    symbol: ticker.symbol,
                    type: TradeType.SELL,
                    sellPrice: ticker.price,
                    quantity: lastTrade.quantity,
                    date: new Date(),
                };
                if (publishTrade) {
                    await this.performTrade(trade);
                }
                this.lastBuyTradePerTicker.set(ticker.symbol, null);
                this.currentFund += ticker.price * lastTrade.quantity;
                strats.push(trade);
            }
        }

        return strats.filter((strat) => !!strat);
    }

    getStrategy(
        lastTrade: ITrade | null,
        currentPrice: number
    ): TradeType | null {
        return null;
    }

    async performTrade(trade: ITrade): Promise<boolean> {
        if (trade == null || trade.quantity <= 0) {
            console.log("trade is null");
            return false;
        }
        try {
            const response = await axios.post<ITrade, any>(
                `http://${process.env.MARKET_URL}:${process.env.MARKET_PORT}/market-action`,
                {
                    ticker: trade.symbol,
                    marketAction: trade.type,
                    shares: trade.quantity,
                    price: trade.type === TradeType.BUY ? trade.buyPrice : trade.sellPrice,
                },
                {
                    headers: {
                        Accept: "application/json",
                        session: this.token,
                    },
                }
            );
            console.log('trading', trade)
            return response.data;
        } catch (error) {
            if (axios.isAxiosError(error)) {
                console.log("error message: ", error.message, " sent message body: ", {
                    ticker: trade.symbol,
                    marketAction: trade.type,
                    shares: trade.quantity,
                    price: trade.type === TradeType.BUY ? trade.buyPrice : trade.sellPrice,
                });
                return false;
            } else {
                console.log("unexpected error: ", error);
                return false;
            }
        }
    }
}
