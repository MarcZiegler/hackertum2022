import {Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, Headers} from '@nestjs/common';
import { FollowService } from './follow.service';
import { CreateFollowDto } from './dto/create-follow.dto';
import {UserGuard} from "../user/user.guard";

@Controller('follow')
export class FollowController {
  constructor(private readonly followService: FollowService) {}

  @UseGuards(UserGuard)
  @Post()
  create(@Body() createFollowDto: CreateFollowDto, @Headers("session") session: string) {
    return this.followService.create(createFollowDto, session);
  }

  @UseGuards(UserGuard)
  @Get()
  findAll(@Headers("session") session: string) {
    return this.followService.findAll(session);
  }

  @UseGuards(UserGuard)
  @Delete()
  remove(@Body('toFollow') id: string, @Headers("session") session: string) {
    return this.followService.remove(+id, session);
  }
}
