import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { PrismaService } from './prisma/prisma';
import { UserModule } from './user/user.module';
import { MarketActionModule } from './market-action/market-action.module';

@Module({
  imports: [UserModule, MarketActionModule],
  controllers: [AppController],
  providers: [AppService, PrismaService],
})
export class AppModule {}
