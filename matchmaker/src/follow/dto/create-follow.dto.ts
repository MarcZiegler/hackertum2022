import {IsPositive} from "class-validator";

export class CreateFollowDto {
    @IsPositive()
    readonly toFollow: number;
}
