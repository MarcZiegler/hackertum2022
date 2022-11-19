export interface ITrader {
    userID: string,
}

export enum TradeType {
    SELL = 'SELL',
    BUY = 'BUY',
}

export interface ITrade {
    symbol: string, 
    type: TradeType,
    buyPrice?: number, 
    sellPrice?: number, 
    quantity: number, 
    date: Date
}