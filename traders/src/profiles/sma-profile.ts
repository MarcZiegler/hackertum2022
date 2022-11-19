import { ITrade, TradeType } from "../types/types";
import { TaProfile } from "./ta-profile";

export class SmaProfile extends TaProfile {
  constructor(username: string, defaultLegth: number) {
    super(username, defaultLegth);
  }

  // sma function credits to https://github.com/Bitvested/ta.js
  sma(data, length = 14) {
    for (var i = length, sma = []; i <= data.length; i++) {
      var avg = data.slice(i - length, i).reduce((a, b) => a + b);
      sma.push(avg / length);
    }
    return sma;
  }

  getWindowStrategy(
    window: number[],
    length: number,
    lastTrade: ITrade
  ): TradeType | null {
    const res = this.sma(window, length);
    if (!lastTrade) {
      return TradeType.BUY;
    } else if (res[0] < lastTrade.buyPrice) {
      return TradeType.SELL;
    }
    return null;
  }
}
