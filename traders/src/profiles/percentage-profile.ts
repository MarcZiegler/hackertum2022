import { ITrade, TradeType } from "../types/types";
import { BaseProfile } from "./base-profile";


export class PercentageProfile extends BaseProfile {
  constructor(
    username: string,
    private readonly stopLossPerc: number,
    private readonly takeProfitPerc: number,
  ) {
    super(username);
  }

  getStrategy(
    lastTrade: ITrade | null,
    currentPrice: number
  ): TradeType | null {
    if (!lastTrade) {
      return TradeType.BUY;
    }
    if (lastTrade.type === TradeType.BUY) {
      if (
        (currentPrice > lastTrade.buyPrice &&
          currentPrice - lastTrade.buyPrice >=
            this.takeProfitPerc * lastTrade.buyPrice) ||
        (currentPrice < lastTrade.buyPrice &&
          lastTrade.buyPrice - currentPrice >=
            this.stopLossPerc * lastTrade.buyPrice)
      ) {
        return TradeType.SELL;
      }
    }
    return null;
  }
}
