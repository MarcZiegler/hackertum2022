import { Module } from '@nestjs/common';
import { FollowService } from './follow.service';
import { FollowController } from './follow.controller';
import {PrismaModule} from "../prisma/prisma.module";
import {UserModule} from "../user/user.module";

@Module({
  controllers: [FollowController],
  providers: [FollowService],
  imports: [
      PrismaModule, UserModule
  ]
})
export class FollowModule {}
