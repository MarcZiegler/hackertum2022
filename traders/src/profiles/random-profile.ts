import { ITrade, TradeType } from "../types/types";
import { BaseProfile } from "./base-profile";


export class RandomProfile extends BaseProfile {

  constructor(username: string, private readonly randomActionPercentage: number) {
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
        Math.random() <= this.randomActionPercentage &&
        currentPrice != lastTrade.buyPrice
      ) {
        return TradeType.SELL;
      }
    }
    return null;
  }
}
