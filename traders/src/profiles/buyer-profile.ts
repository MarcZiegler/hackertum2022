import { ITrade, TradeType } from "../types/types";
import { BaseProfile } from "./base-profile";


export class BuyerProfile extends BaseProfile {
  constructor(
    username: string,
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
    return null;
  }
}
