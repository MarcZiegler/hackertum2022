import {IsEnum, IsNotEmpty, IsPositive, IsString} from "class-validator";
import {TypeOfMarketAction} from "@prisma/client";

export class FindAllMarketActionDto {
    @IsString()
    @IsNotEmpty()
    ticker: string;

    @IsEnum(['BUY', 'SELL'])
    marketAction: TypeOfMarketAction;
}


