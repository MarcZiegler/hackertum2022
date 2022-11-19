import { ITrade, TradeType } from "../types/types";
import { TaProfile } from "./ta-profile";

export class EmaProfile extends TaProfile {

  constructor(username: string, defaultLegth: number) {
    super(username, defaultLegth);
  }

  // ema function credits to https://github.com/Bitvested/ta.js
  ema(data, length = 12) {
    for (
      var i = length, ema = [], weight = 2 / (length + 1);
      i <= data.length;
      i++
    ) {
      if (ema.length > 0) {
        ema.push(
          (data[i - 1] - ema[ema.length - 1]) * weight + ema[ema.length - 1]
        );
        continue;
      }
      var pl = data.slice(i - length, i),
        average = 0;
      for (var q in pl) average += pl[q];
      ema.push(average / length);
    }
    return ema;
  }

  getWindowStrategy(
    window: number[],
    length: number,
    lastTrade: ITrade
  ): TradeType | null {
    const res = this.ema(window, length);
    if (!lastTrade) {
      return TradeType.BUY;
    } else if (res[0] < lastTrade.buyPrice) {
      return TradeType.SELL;
    }
    return null;
  }
}
