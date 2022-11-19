export type GraphData = {
    Date: string, //e.g. 2017-11-17
    Open: number, //e.g. 171.039993
    High: number, //e.g. 171.389999
    Low: number, // e.g. 169.639999
    Close: number, // e.g. 170.149994
    Volume: number, //e.g. 21899500
}
export type StockData = {
    id: number,
    tag: string,
    name: string,
}
    // Adj Close: 168.808151
export type GraphMetadata = {
    searchQuery: string
    nightmode: boolean
    showText: boolean
}