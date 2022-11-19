import { format, subDays } from "date-fns";
import yahooFinance from "yahoo-finance";
import { SYMBOLS, WINDOW_SIZE } from ".";
import { BaseProfile } from "./profiles/base-profile";
import { TaProfile } from "./profiles/ta-profile";
import { TradeType } from "./types/types";

const WAY_BACK_PERIODS = 5000;
const today = new Date();
const fromBack = subDays(new Date(), WAY_BACK_PERIODS);

// yyyy-MM-dd'T'HH:mm:ss.SSSxxx
// const totals = [0,0,0,0,0,0,0,0,0,0,0,0];

export const tradeHistory = async (
  traders: BaseProfile[],
  windowTraders: TaProfile[]
): Promise<any> => {
  return new Promise((resolve, reject) => {
    yahooFinance.historical(
      {
        symbols: SYMBOLS,
        from: format(fromBack, "yyyy-MM-dd"),
        to: format(today, "yyyy-MM-dd"),
        period: "d", // 'd' (daily), 'w' (weekly), 'm' (monthly), 'v' (dividends only),
      },
      async function (err, quotes) {
        if (err) {
          reject(err);
          return;
        }
        SYMBOLS.forEach((symbol) => {
          quotes[symbol] = quotes[symbol].reverse();
        });

        const numOfSamples = quotes["AAPL"].length;
        const windowdData: Record<string, { symbol: string; price: number }[]> =
          {};
        SYMBOLS.forEach((symbol) => (windowdData[symbol] = []));
        const lastPrice = new Map();
        for (let index = 0; index < numOfSamples; index++) {
          const periodPrices = SYMBOLS.map((symbol) => {
            const sym = quotes[symbol][index]?.symbol;
            const price = quotes[symbol][index]?.close;
            if (windowdData[sym].length === WINDOW_SIZE) {
              windowdData[sym].splice(0, 1);
            }
            const entry = { symbol: sym, price };
            windowdData[sym].push(entry);
            lastPrice.set(sym, entry.price);
            return entry;
          });

          let promises = [];
          traders.map((trader) =>
            promises.push(trader.update(periodPrices, false))
          );

          if (index >= WINDOW_SIZE - 1) {
            windowTraders.map((trader) =>
              promises.push(trader.updateWindow(windowdData, false))
            );
          }
          const strats = await Promise.all(promises);
          // console.log(strats);

          strats.forEach((trader, idx) => {
            trader?.forEach((order) => {
              if (order.type === TradeType.BUY) {
                // console.log(idx, 'buy ', order.symbol, ' at ', order.buyPrice);
                // totals[2 * idx]++;
              } else {
                // console.log(idx, 'sell ', order.symbol, ' at ', order.sellPrice);
                // totals[2 * idx + 1]++;
              }
            });
          });
        }
        const profits = [...traders, ...windowTraders].map((trader) =>
          trader.calcProfit(lastPrice)
        );
        resolve({ profits, windowdData });
      }
    );
  });
};
