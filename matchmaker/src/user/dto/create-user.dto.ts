// @ts-ignore
import {IsEmail, IsNotEmpty, IsOptional} from 'class-validator';

export class CreateUserDto {
    @IsNotEmpty()
    username: string;
    @IsNotEmpty()
    isRealUser: boolean;
    @IsOptional()
    pnl: number;
}
