import { BaseProfile } from "./profiles/base-profile";
import axios from "axios";
import { SYMBOLS } from ".";
import { ITrade, TradeType } from "./types/types";
import {BehaviorSubject, delay, Observable, tap} from 'rxjs'
const NO_ACTION_PERIOD = 5;

interface ICreateUserResponse {
  money: number;
  token: string;
}

let noActionCount = 0;

export class MarketMover extends BaseProfile {

  fullfillOrders = async () => {
    const orders = await this.getOrders();

    return new Promise((resolve, reject) => {
      let processed = 0;
      const subject = new BehaviorSubject<ITrade>(null);
      const subject$ = subject.asObservable();
      const sub = subject$.pipe(
          delay(2000),
          tap((trade) => {
            this.performTrade(trade);
            processed++;
            if(processed === orders.buyOrders.length + orders.sellOrders.length) {
              resolve;
            }
          }),
      ).subscribe();

      for(const order of orders.buyOrders) {
        subject.next( {
          ...order,
          type: TradeType.SELL,
          sellPrice: order.price
        });
      }
      for(const order of orders.sellOrders) {
        subject.next( {
          ...order,
          type: TradeType.BUY,
          buyPrice: order.price
        })
      }
    })
  }
  
  // checkMarket = async (): Promise<any> => {
  //   noActionCount++;
  //   if (noActionCount === NO_ACTION_PERIOD) {
  //     // move market
  //     const getAllTickers = await getAllTickers();
  //     for(const ticker of getAllTickers)
  //     {
  //       const dir = Math.random() <= 0.5 ? 0.15 : -0.15;
  //       const newValue = ticker.lastTrade.price * (1 + dir);
  //       moveAsset(ticker, newValue,)
  //     }
  //   }
  //   for (const trader of traders) {
  //     const response: ICreateUserResponse = await createUser(trader);
  //     if (response) {
  //       trader.money = response.money;
  //       trader.token = response.token;
  //     }
  //   }
  //   return;
  // };
  
  // createUser(user: BaseProfile): Promise<ICreateUserResponse> {
  //   try {
  //     const { money, token } = await axios.post<any, ICreateUserResponse>(
  //       `http://${process.env.MARKET_URL}:${process.env.MARKET_PORT}/user`,
  //       {
  //         username: user.uuid,
  //       },
  //       {
  //         headers: {
  //           Accept: "application/json",
  //         },
  //       }
  //     );
  
  //     return { money, token };
  //   } catch (error) {
  //     if (axios.isAxiosError(error)) {
  //       console.log("error message: ", error.message);
  //       return null;
  //     } else {
  //       console.log("unexpected error: ", error);
  //       return null;
  //     }
  //   }
  // }
  
  getOrders = async (): Promise<{buyOrders: any[], sellOrders: any[]}> => {
    const buyOrders = [];
    const sellOrders = [];
    for(const symbol of SYMBOLS) {
      const buys = await this.getTickerOrders(symbol, TradeType.BUY);
      const sells = await this.getTickerOrders(symbol, TradeType.SELL);
      buyOrders.push(...buys);
      sellOrders.push(...sells);
    }

    return {
      buyOrders,
      sellOrders,
    };
  }

  getTickerOrders = async (ticker: string, type: TradeType) => {
    try {
      const response = await axios.get<any, any>(
        `http://${process.env.MARKET_URL}:${process.env.MARKET_PORT}/market-action`,
        {
          headers: {
            Accept: "application/json",
            session: this.token,
          },
          data: {
            ticker: ticker,
            marketAction: type
          }
        }
      );

      return response.data.map((order) => {
        return {
          ...order,
          symbol: ticker,
          quantity: order.shares,
        }
      })
    } catch (error) {
      if (axios.isAxiosError(error)) {
        console.log("error message: ", error.message);
        return null;
      } else {
        console.log("unexpected error: ", error);
        return null;
      }
    }
  }

  getLastTradeForAll = async (): Promise<any[]> => {
    try {
      console.log(this.token)
      const response = await axios.get<any, any>(
        `http://${process.env.MARKET_URL}:${process.env.MARKET_PORT}/ticker`,
        {
          headers: {
            Accept: "application/json",
            session: this.token
          },
        }
      );
  
      return response.data;
    } catch (error) {
      if (axios.isAxiosError(error)) {
        console.log("error message: ", error.message);
        return [];
      } else {
        console.log("unexpected error: ", error);
        return [];
      }
    }
  }
}
