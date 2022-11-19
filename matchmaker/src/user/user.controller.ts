import {Controller, Get, Post, Body, Patch, Param, Delete, HttpException, Headers, UseGuards} from '@nestjs/common';
import { UserService } from './user.service';
import { CreateUserDto } from './dto/create-user.dto';
import {UserGuard} from "./user.guard";

@Controller('user')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Post()
  create(@Body() createUserDto: CreateUserDto) {
    try {

      return this.userService.create(createUserDto);
    }catch (e) {
      throw new HttpException("User already exists", 400);
    }
  }

  @Get()
  @UseGuards(UserGuard)
  get(@Headers("session") session: string){
    return this.userService.get(session);
  }
}
