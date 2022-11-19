import {IsPositive} from "class-validator";

export class CreateFollowDto {
    @IsPositive()
    readonly toFollow: number;
}

// TODO: SCORE in Create USer
// TODO: Get last price and bid and ask
