import {Controller, Get, Post, Body, Patch, Param, Delete, HttpException} from '@nestjs/common';
import { UserService } from './user.service';
import { CreateUserDto } from './dto/create-user.dto';

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
}
