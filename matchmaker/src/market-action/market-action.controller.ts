import {Controller, Get, Post, Body, Param, Delete, Headers, UseGuards} from '@nestjs/common';
import { MarketActionService } from './market-action.service';
import { CreateMarketActionDto } from './dto/create-market-action.dto';
import { UpdateMarketActionDto } from './dto/update-market-action.dto';
import {UserGuard} from "../user/user.guard";

@Controller('market-action')
export class MarketActionController {
  constructor(private readonly marketActionService: MarketActionService) {}

  @Post()
  @UseGuards(UserGuard)
  create(@Body() createMarketActionDto: CreateMarketActionDto, @Headers("session") session: string) {
    return this.marketActionService.create(createMarketActionDto, session);
  }

  @Get()
  findAll() {
    return this.marketActionService.findAll();
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.marketActionService.remove(+id);
  }
}
