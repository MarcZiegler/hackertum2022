import { PartialType } from '@nestjs/mapped-types';
import { CreateMarketActionDto } from './create-market-action.dto';

export class UpdateMarketActionDto extends PartialType(CreateMarketActionDto) {}
