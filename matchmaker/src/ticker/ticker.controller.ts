import {Controller, Get, Post, Body, Patch, Param, Delete, UseGuards} from '@nestjs/common';
import { TickerService } from './ticker.service';
import { CreateTickerDto } from './dto/create-ticker.dto';
import {UserGuard} from "../user/user.guard";

@Controller('ticker')
export class TickerController {
  constructor(private readonly tickerService: TickerService) {}

  @UseGuards(UserGuard)
  @Post()
  create(@Body() createTickerDto: CreateTickerDto) {
    return this.tickerService.create(createTickerDto);
  }

  @UseGuards(UserGuard)
  @Get()
  findAll() {
    return this.tickerService.findAll();
  }

  @UseGuards(UserGuard)
  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.tickerService.findOne(id);
  }
}
