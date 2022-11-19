import * as dotenv from "dotenv";
import { PercentageProfile } from "./profiles/percentage-profile";
import { BaseProfile } from "./profiles/base-profile";
import { RandomProfile } from "./profiles/random-profile";
import { RsiProfile } from "./profiles/rsi-profile";
import { EmaProfile } from "./profiles/ema-profile";
import { SmaProfile } from "./profiles/sma-profile";
import { tradeHistory } from "./historic-trader";
import { createUser, createUsers } from "./market-handler";
import { MarketMover } from "./market-MOVER";

dotenv.config();

export const SYMBOLS = ["AAPL", "MSFT", "GOOGL", "GME", "AMZN", "MS"];
export const WINDOW_SIZE = 14;

const main = async () => {
  const traders: BaseProfile[] = [
    new PercentageProfile("John", 0.1, 0.15),
    new PercentageProfile("Carol", 0.15, 0.1),
    new PercentageProfile("Max", 1, 0.15),
    new PercentageProfile("Leo", 0.1, 0.25),
    new RandomProfile("Sara", 0.5),
    new RandomProfile("Moe", 0.2),
    // new PercentageProfile(0.10, 0.35),
    // new PercentageProfile(0.15, 0.3),
    // new PercentageProfile(1, 0.35),
    // new PercentageProfile(0.30, 0.25),
  ];

  const windowTraders = [
    new RsiProfile("RSI", 14),
    new SmaProfile("SMA", 14),
    new EmaProfile("EMA", 14),
  ];

  const allTraders = [...traders, ...windowTraders];

  const { profits, windowdData } = await tradeHistory(traders, windowTraders);
  console.log(profits);

  allTraders.forEach((trader, idx) => {
    trader.pnl = profits[idx];
  });
  await createUsers(allTraders);

  const marketMover = new MarketMover("Market Mover", true);
  await createUser(marketMover);

  do {
    const lastPeriod = await marketMover.getLastTradeForAll();
    const snapshot = lastPeriod.map((symbolObj) => {
      const ticker = symbolObj.ticker;
      const entry = { symbol: ticker, price: symbolObj.TickerHistory[0].price };
      windowdData[ticker]?.splice(0, 1);
      windowdData[ticker]?.push(entry);
      return entry;
    });

    let promises = [];
    traders.map((trader) => promises.push(trader.update(snapshot, true)));

    windowTraders.map((trader) =>
      promises.push(trader.updateWindow(windowdData, true))
    );

    const strats = await Promise.all(promises);

    await marketMover.fullfillOrders();
  } while (true);
};

main();
