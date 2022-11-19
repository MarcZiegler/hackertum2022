import { Injectable } from '@nestjs/common';
import { CreateTickerDto } from './dto/create-ticker.dto';
import {PrismaService} from "../prisma/prisma";

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
    return this.prisma.ticker.findMany();
  }

  findOne(ticker: string) {
    return this.prisma.ticker.findUnique({
        where: {ticker},
        include: {
            TickerHistory: true
        }
    });
  }
}
