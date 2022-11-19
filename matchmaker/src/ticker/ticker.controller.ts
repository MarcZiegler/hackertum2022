import {Controller, Get, Post, Body, Patch, Param, Delete, UseGuards} from '@nestjs/common';
import { TickerService } from './ticker.service';
import { CreateTickerDto } from './dto/create-ticker.dto';
import {UserGuard} from "../user/user.guard";

@Controller('ticker')
export class TickerController {
  constructor(private readonly tickerService: TickerService) {}

  @UseGuards(UserGuard)
  @Post()
  async create(@Body() createTickerDto: CreateTickerDto) {
    return await this.tickerService.create(createTickerDto);
  }

  @UseGuards(UserGuard)
  @Get()
  findAll() {
    //TODO add last trade
    return this.tickerService.findAll();
  }

  @UseGuards(UserGuard)
  @Get(':id')
  async findOne(@Param('id') id: string) {
    return await this.tickerService.findOne(id, 50);
  }
}
