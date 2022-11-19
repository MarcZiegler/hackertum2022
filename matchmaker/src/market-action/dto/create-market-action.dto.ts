import {IsEnum, IsNotEmpty, IsPositive, IsString} from "class-validator";
import {TypeOfMarketAction} from "@prisma/client";

export class CreateMarketActionDto {
    @IsString()
    @IsNotEmpty()
    ticker: string;

    @IsEnum(['BUY', 'SELL'])
    marketAction: TypeOfMarketAction;

    @IsPositive()
    shares: number;

    @IsPositive()
    price: number;
}


