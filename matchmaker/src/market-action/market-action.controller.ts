import {Controller, Get, Post, Body, Param, Delete, Headers, UseGuards} from '@nestjs/common';
import { MarketActionService } from './market-action.service';
import { CreateMarketActionDto } from './dto/create-market-action.dto';
import {UserGuard} from "../user/user.guard";
import {FindAllMarketActionDto} from "./dto/find-all-market-action.dto";

@Controller('market-action')
export class MarketActionController {
  constructor(private readonly marketActionService: MarketActionService) {}

  @Post()
  @UseGuards(UserGuard)
  async create(@Body() createMarketActionDto: CreateMarketActionDto, @Headers("session") session: string) {
    return await this.marketActionService.create(createMarketActionDto, session);
  }

  @Get()
  @UseGuards(UserGuard)
  async findAll(@Body() body: FindAllMarketActionDto) {
    return await this.marketActionService.findAll(body.ticker, body.marketAction);
  }

  @Delete(':id')
  @UseGuards(UserGuard)
  remove(@Param('id') id: string, @Headers("session") session: string) {
    return this.marketActionService.remove(+id, session);
  }
}
