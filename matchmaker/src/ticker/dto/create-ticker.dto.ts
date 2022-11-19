import {IsNotEmpty, IsString} from "class-validator";

export class CreateTickerDto {
    @IsString()
    @IsNotEmpty()
    readonly ticker: string;


    @IsString()
    @IsNotEmpty()
    readonly name: string;
}
