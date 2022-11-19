import {BadRequestException, HttpException, Injectable} from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
import {Logger} from "@nestjs/common";
import { PrismaService } from '../prisma/prisma';
import { User, Prisma } from '@prisma/client';

export type userFollowed = User & {isFollowed: number}

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

  get(session: string) {
    return this.prisma.user.findUnique({
        where: {
            token: session
        }
    });
  }

  findAll(session: string): Promise<userFollowed[]> {
    // @ts-ignore
    BigInt.prototype.toJSON = function() {
      return this.toString()
    }
    return this.prisma.$queryRaw`SELECT *,CASE WHEN EXISTS(SELECT * FROM Follows where Follows.followsId = User.id and Exists(SELECT * FROM User u2 where u2.token = ${session} and u2.id = Follows.followedByID)) THEN 1 ELSE 0 END AS isFollowed FROM User WHERE User.isRealUser = 0`
  }
}
