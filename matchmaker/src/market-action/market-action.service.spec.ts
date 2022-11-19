import { Test, TestingModule } from '@nestjs/testing';
import { MarketActionService } from './market-action.service';

describe('MarketActionService', () => {
  let service: MarketActionService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [MarketActionService],
    }).compile();

    service = module.get<MarketActionService>(MarketActionService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
