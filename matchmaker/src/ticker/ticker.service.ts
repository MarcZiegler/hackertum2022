import {HttpException, Injectable, Logger} from '@nestjs/common';
import { CreateTickerDto } from './dto/create-ticker.dto';
import {PrismaService} from "../prisma/prisma";
import {Ticker} from "@prisma/client";


export interface TickerPricing {
    FirstPrice: number,
    MinPrice: number,
    MaxPrice: number,
    Volume: number,
    executedAt: String,
}

export interface StockInfo {
    ticker: Ticker,
    historicalData: TickerPricing[]
}

@Injectable()
export class TickerService {
  constructor(private prisma: PrismaService) {
  }
  create(createTickerDto: CreateTickerDto) {
    return this.prisma.ticker.create({
        data: {
            ticker: createTickerDto.ticker,
            name: createTickerDto.name
        }
    });
  }

  findAll() {
    return this.prisma.ticker.findMany({
        include: {
            TickerHistory: {
                take: 1,
                orderBy: {
                    executed_at: "desc"
                },

            }
        }
    });
  }

  async findOne(ticker: string, limit : number) {
    let t = await this.prisma.ticker.findUnique({
        where: {ticker},
    });

    if (t == null){
        throw  new HttpException("Ticker not found", 404);
    }

    let res = await this.prisma.$queryRaw<TickerPricing[]>`SELECT DISTINCT price as FirstPrice, MIN(price) as MinPrice, MAX(price) as MaxPrice, SUM(TickerHistory.amount) as Volume,  TickerHistory.executed_at FROM TickerHistory where TickerHistory.tickerId = ${t.id} GROUP BY HOUR(TickerHistory.executed_at), MINUTE(TickerHistory.executed_at), TickerHistory.executed_at, price LIMIT ${limit}`;

    return {
        ticker: t,
        historicalData: res
    }
  }
}
