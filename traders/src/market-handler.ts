import { BaseProfile } from "./profiles/base-profile";
import axios from "axios";

interface ICreateUserResponse {
  money: number;
  token: string;
  id: string;
}

/*export const createUsers = async (traders: BaseProfile[]): Promise<any> => {
  for (const trader of traders) {
    const response: ICreateUserResponse = await createUser(trader);
    if (response) {
      trader.initFund = response.money;
      trader.token = response.token;
    }
  }
  return;
};*/

export const createUser = async (user: BaseProfile): Promise<ICreateUserResponse> => {
  try {
    const response = await axios.post<any, any>(
      `http://${process.env.MARKET_URL}:${process.env.MARKET_PORT}/user`,
      {
        username: user.username,
        pnl: user.pnl,
        isRealUser: false,
        isMarketMover: user.isMarketMover,
      },
      {
        headers: {
          Accept: "application/json",
        },
      }
    );
    return { money: response.data.Money, token: response.data.token, id: response.data.id };
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

