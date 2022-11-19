// @ts-ignore
import { IsEmail, IsNotEmpty } from 'class-validator';

export class CreateUserDto {
    @IsNotEmpty()
    username: string;
    @IsNotEmpty()
    isRealUser: boolean;
}
