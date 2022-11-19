import { ITrade, TradeType } from "../types/types";
import { TaProfile } from "./ta-profile";

export class RsiProfile extends TaProfile {

  constructor(username: string, defaultLegth: number) {
    super(username, defaultLegth);
  }

  // rsi function credits to https://github.com/Bitvested/ta.js
  getRsi(data, length = 14) {
    for (
      var i = length - 1,
        gain = 0,
        loss = 0,
        arrsi = [],
        pl = data.slice(0, length - 1);
      i < data.length;
      i++, gain = 0, loss = 0
    ) {
      pl.push(data[i]);
      for (var q = 1; q < pl.length; q++)
        if (pl[q] - pl[q - 1] < 0) {
          loss += Math.abs(pl[q] - pl[q - 1]);
        } else {
          gain += pl[q] - pl[q - 1];
        }
      var rsi = 100 - 100 / (1 + gain / length / (loss / length));
      arrsi.push(rsi);
      pl.splice(0, 1);
    }
    return arrsi;
  }

  getWindowStrategy(
    window: number[],
    length: number,
    lastTrade: ITrade
  ): TradeType | null {
    const res = this.getRsi(window, length);
    if (!lastTrade) {
      return TradeType.BUY;
    } else if (res[0] > 70 && lastTrade) {
      return TradeType.SELL;
    }
    return null;
  }
}
