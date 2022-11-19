import { Module } from '@nestjs/common';
import { MarketActionService } from './market-action.service';
import { MarketActionController } from './market-action.controller';
import {UserModule} from "../user/user.module";
import {PrismaModule} from "../prisma/prisma.module";

@Module({
  controllers: [MarketActionController],
  providers: [MarketActionService],
  imports: [UserModule, PrismaModule],
})
export class MarketActionModule {}
