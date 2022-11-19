import { ITrade, TradeType } from "../types/types";
import { BaseProfile, BUY_QUANTITY } from "./base-profile";
import { SYMBOLS } from "..";

export abstract class TaProfile extends BaseProfile {
  constructor(username:string, private defaultLegth: number) {
    super(username);
  }

  async updateWindow(latestWindowPrices: {
    [key: string]: { symbol: string; price: number }[],
  }, publishTrade: boolean): Promise<ITrade[]> {
    const strats: ITrade[] = [];
    for (const symbol of SYMBOLS) {
      const prices = latestWindowPrices[symbol].map((period) => period.price);
      const lastPrice = prices[prices.length - 1];
      const lastTrade = this.lastBuyTradePerTicker.get(symbol);
      const strategy = this.getWindowStrategy(
        prices,
        this.defaultLegth,
        lastTrade
      );
      if (
        strategy == TradeType.BUY &&
        this.currentFund >= BUY_QUANTITY * lastPrice
      ) {
        const trade = {
          symbol: symbol,
          type: TradeType.BUY,
          buyPrice: lastPrice,
          quantity: BUY_QUANTITY,
          date: new Date(),
        };
        if (publishTrade) {
          await this.performTrade(trade);
        }
        this.currentFund -= lastPrice * BUY_QUANTITY;
        this.lastBuyTradePerTicker.set(symbol, trade);
        strats.push(trade);
      } else if (strategy == TradeType.SELL) {
        const trade = {
          symbol: symbol,
          type: TradeType.SELL,
          sellPrice: lastPrice,
          quantity: lastTrade.quantity,
          date: new Date(),
        };
        if (publishTrade) {
          await this.performTrade(trade);
        }
        this.lastBuyTradePerTicker.set(symbol, null);
        this.currentFund += lastPrice * lastTrade.quantity;
        strats.push(trade);
      }
      return null;
    }

    return strats.filter((strat) => !!strat);
  }

  abstract getWindowStrategy(
    window: number[],
    length: number,
    lastTrade: ITrade
  );
}
