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
    let orders = await this.getOrders();
    console.log(orders)
    const myBuyOrders = orders.buyOrders.filter(order => order.userId === this.id);
    const mySellOrders = orders.sellOrders.filter(order => order.userId === this.id);
    for(const order of myBuyOrders) {
      await this.deleteOne({
        ...order,
        type: TradeType.SELL,
        sellPrice: order.price
      })
    }
    for(const order of mySellOrders) {
      await this.deleteOne({
        ...order,
        type: TradeType.BUY,
        buyPrice: order.price,
      })
    }
    orders = await this.getOrders();
    for(const order of orders.buyOrders) {
      await this.fullfiilOne({
        ...order,
        type: TradeType.SELL,
        sellPrice: order.price
      })
    }
    for(const order of orders.sellOrders) {
      await this.fullfiilOne({
        ...order,
        type: TradeType.BUY,
        buyPrice: order.price,
      })
    }
  }

  deleteOne = async (order) => {
    console.log('deleting')
    return new Promise((resolve, reject) => {
      setTimeout(async() => {
        await this.performTrade(order, true);
        resolve(true);
      }, 200);
    })
  }

  fullfiilOne = async (order) => {
    console.log('fullfilling')
    return new Promise((resolve, reject) => {
      setTimeout(async() => {
        await this.performTrade(order);
        resolve(true);
      }, 2000);
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
