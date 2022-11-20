import * as dotenv from "dotenv";
import { PercentageProfile } from "./profiles/percentage-profile";
import { BaseProfile } from "./profiles/base-profile";
import { RandomProfile } from "./profiles/random-profile";
import { RsiProfile } from "./profiles/rsi-profile";
import { EmaProfile } from "./profiles/ema-profile";
import { SmaProfile } from "./profiles/sma-profile";
import { tradeHistory } from "./historic-trader";
import { createUser } from "./market-handler";
import { MarketMover } from "./market-MOVER";
import {BuyerProfile} from "./profiles/buyer-profile";
import {ITrade} from "./types/types";

dotenv.config();

export const SYMBOLS = ["AMZN", "MSFT", "GOOGL", "GME", "AAPL", "MS"];
//export const SYMBOLS = [ "AMZN"];
export const WINDOW_SIZE = 14;

const main = async () => {
  const traders: BaseProfile[] = [
    new PercentageProfile("Chimp", 0.1, 0.15),
    new PercentageProfile("Elon", 0.15, 0.1),
    new PercentageProfile("Diamondhands", 1, 0.15),
    new PercentageProfile("Leo", 0.1, 0.25),
    new BuyerProfile("Hodler"),
    new RandomProfile("Bloomberg", 0.5),
    new RandomProfile("Moe", 0.2),
    new RandomProfile("Minimind", 0.9),
    new RandomProfile("Megamind", 0.6),
    new PercentageProfile('Max',0.10, 0.35),
    new PercentageProfile('Chris',0.15, 0.3),
    new PercentageProfile('Marc',1, 0.35),
    new PercentageProfile('Flo',0.30, 0.25),
  ];

  const windowTraders = [
    new RsiProfile("RSI", 14),
    new SmaProfile("SMA", 14),
    new EmaProfile("EMA", 14),
  ];

  const allTraders = [...traders, ...windowTraders];

  const { profits, windowdData, lastPrice } = await tradeHistory(traders, windowTraders);
  console.log(profits);

  allTraders.forEach((trader, idx) => {
    trader.pnl = profits[idx];
  });

  allTraders.forEach(async (trader) => {
    let res = await createUser(trader);
    trader.initFund = res.money;
    trader.token = res.token;
    trader.id = res.id;
    trader.lastBuyTradePerTicker = new Map<string, ITrade>();
  });

  const marketMover = new MarketMover("Market Mover", true);
  let res = await createUser(marketMover);
  marketMover.initFund = res.money;
  marketMover.token = res.token;

  let snapshot = [];
  let start = true;
  let lastPeriod;
  do {
    if (start) {
      lastPeriod = lastPrice;
      lastPrice.forEach((value, key) => {
        snapshot.push({
          symbol: key,
          price: value,
        })
      });
      snapshot.forEach((entry, idx) => {
        windowdData[entry.symbol]?.splice(0, 1);
        windowdData[entry.symbol]?.push(entry);
      })
      start = false;
    } else {
      lastPeriod = await marketMover.getLastTradeForAll();
      snapshot = lastPeriod.map((symbolObj) => {
        const ticker = symbolObj.ticker;
        const entry = { symbol: ticker, price: symbolObj.TickerHistory[0].price };
        windowdData[ticker]?.splice(0, 1);
        windowdData[ticker]?.push(entry);
        return entry;
      });
    }

    let promises = [];
    traders.map((trader) => promises.push(trader.update(snapshot, true)));

    windowTraders.map((trader) =>
      promises.push(trader.updateWindow(windowdData, true))
    );

    const strats = await Promise.all(promises);


    await marketMover.fullfillOrders();
    console.log('looping')
  } while (true);
};

main();
