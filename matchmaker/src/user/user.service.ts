import {BadRequestException, HttpException, Injectable} from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
import {Logger} from "@nestjs/common";
import { PrismaService } from '../prisma/prisma';
import { User, Prisma } from '@prisma/client';

@Injectable()
export class UserService {
  constructor(private prisma: PrismaService) {}
  create(createUserDto: CreateUserDto) : Promise<User> {
    Logger.log("Creating User {}", createUserDto);



    try {
      return this.prisma.user.create({
        data: createUserDto,

      });
    } catch (e) {
      Logger.error(e);
      throw new HttpException("User already exists", 400);
    }

  }
}
