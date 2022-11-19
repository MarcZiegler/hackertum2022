import { Test, TestingModule } from '@nestjs/testing';
import { TickerController } from './ticker.controller';
import { TickerService } from './ticker.service';

describe('TickerController', () => {
  let controller: TickerController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [TickerController],
      providers: [TickerService],
    }).compile();

    controller = module.get<TickerController>(TickerController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
