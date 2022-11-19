import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { PrismaService } from './prisma/prisma';
import { UserModule } from './user/user.module';
import { MarketActionModule } from './market-action/market-action.module';
import { TickerModule } from './ticker/ticker.module';
import { FollowModule } from './follow/follow.module';

@Module({
  imports: [UserModule, MarketActionModule, TickerModule, FollowModule],
  controllers: [AppController],
  providers: [AppService, PrismaService],
})
export class AppModule {}
