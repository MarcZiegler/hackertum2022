import { Module } from '@nestjs/common';
import { TickerService } from './ticker.service';
import { TickerController } from './ticker.controller';
import {PrismaModule} from "../prisma/prisma.module";
import {UserModule} from "../user/user.module";

@Module({
  controllers: [TickerController],
  providers: [TickerService],
  imports: [
      PrismaModule, UserModule
  ],
})
export class TickerModule {}
