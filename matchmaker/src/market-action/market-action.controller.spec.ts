import { Test, TestingModule } from '@nestjs/testing';
import { MarketActionController } from './market-action.controller';
import { MarketActionService } from './market-action.service';

describe('MarketActionController', () => {
  let controller: MarketActionController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [MarketActionController],
      providers: [MarketActionService],
    }).compile();

    controller = module.get<MarketActionController>(MarketActionController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
