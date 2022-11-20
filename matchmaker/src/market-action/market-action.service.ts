import {HttpException, Injectable, Logger} from '@nestjs/common';
import {CreateMarketActionDto} from './dto/create-market-action.dto';
import {UpdateMarketActionDto} from './dto/update-market-action.dto';
import {PrismaService} from "../prisma/prisma";
import {Prisma, TypeOfMarketAction} from "@prisma/client";
import {create} from "domain";

export type Enumerable<T> = T | Array<T>;

export type FloatFilter = {
    equals?: number
    in?: Enumerable<number>
    notIn?: Enumerable<number>
    lt?: number
    lte?: number
    gt?: number
    gte?: number
}

interface PostMarketActionResultDTO {
    success: boolean;
    amount: number;
    price: number;
    peopleTradedWith: number[];
}

interface DeleteMarketActionResultDTO {
    success: boolean;
    amount: number;
}

export {PostMarketActionResultDTO, DeleteMarketActionResultDTO};

@Injectable()
export class MarketActionService {
    constructor(private prisma: PrismaService) {
    }

    async create(createMarketActionDto: CreateMarketActionDto, session: string) {
        Logger.log("createMarketActionDto", createMarketActionDto);
        Logger.log(`session: ${session}`);
        let userId = await this.prisma.user.findUnique({
            where: {token: session},
            include: {
                // following the user
                follows: true
            }
        });

        if (userId == null) {
            throw new HttpException("User not found", 404);
        }

        let res = this.createMarketAction(userId, createMarketActionDto, session);

        Logger.log(`User has ${userId.follows.length} followers`);
        // lets check if there are any followers?
        if(userId.follows.length > 0) {
            Logger.log("Found followers", userId.follows);
            let followers = userId.follows;
            for (const follower in followers) {
                let userToken = await this.prisma.user.findUnique({where: {id: followers[follower].followedByID}})

                await this.createMarketAction(userToken, createMarketActionDto, userToken.token);
            }

        }
        return res;
    }

    private async createMarketAction(userId, createMarketActionDto: CreateMarketActionDto, session: string) {
        let tickerId = await this.prisma.ticker.findUnique({
            where: {ticker: createMarketActionDto.ticker}
        });
        let res = this.prisma.$transaction(async (tx): Promise<PostMarketActionResultDTO> => {

            let marketAction = await tx.marketAction.upsert({
                where: {
                    userId_tickerId_typeOfMarketAction_price: {
                        userId: userId.id,
                        tickerId: tickerId.id,
                        typeOfMarketAction: createMarketActionDto.marketAction,
                        price: createMarketActionDto.price
                    }
                },
                update: {
                    shares: {
                        increment: createMarketActionDto.shares
                    },

                },
                create: {
                    user: {
                        connect: {
                            id: userId.id
                        }
                    },
                    ticker: {
                        connect: {
                            ticker: createMarketActionDto.ticker
                        }
                    },
                    typeOfMarketAction: createMarketActionDto.marketAction,
                    price: createMarketActionDto.price,
                    shares: createMarketActionDto.shares
                },
            });

            let historicalMarketAction = await tx.marketActionHistory.create({
                data: {
                    user: {
                        connect: {
                            token: session
                        }
                    },
                    ticker: {
                        connect: {
                            ticker: createMarketActionDto.ticker
                        }
                    },
                    typeOfMarketAction: createMarketActionDto.marketAction,
                    price: createMarketActionDto.price,
                    shares: createMarketActionDto.shares,
                    typeOfChange: "Add",
                    marketAction: {
                        connect: {
                            id: marketAction.id
                        }
                    }
                }
            });

            // now lets check if we can make a trade
            let price_buy: FloatFilter = {
                lte: createMarketActionDto.price
            }
            let price_sell: FloatFilter = {
                gte: createMarketActionDto.price
            }
            let price = createMarketActionDto.marketAction == TypeOfMarketAction.BUY ? price_buy : price_sell;

            let possibilityForTrade = await tx.marketAction.findMany({
                where: {
                    price,
                    tickerId: tickerId.id,
                    typeOfMarketAction: (createMarketActionDto.marketAction == TypeOfMarketAction.BUY) ? TypeOfMarketAction.SELL : TypeOfMarketAction.BUY,
                    NOT: {
                        userId: userId.id
                    },
                    shares: {
                        gt: 0
                    },
                },
                orderBy: [
                    {
                        price: (createMarketActionDto.marketAction == TypeOfMarketAction.BUY) ? "asc" : "desc",
                    },
                    {
                        updatedAt: "asc"
                    }
                ],
                include: {
                    user: true
                }
            });
            if (possibilityForTrade.length > 0) {
                Logger.log("Found possibility for trade", possibilityForTrade);
                // trade each of them in order while checking that we have enough shares
                let sharesLeft = createMarketActionDto.shares;
                let minPrice = createMarketActionDto.price;
                for (const possiblePartner in possibilityForTrade) {
                    if (sharesLeft <= 0) {
                        break;
                    }

                    let partner = possibilityForTrade[possiblePartner];
                    let user = partner.typeOfMarketAction == TypeOfMarketAction.BUY ? partner.user : userId;
                    let seller = partner.typeOfMarketAction == TypeOfMarketAction.SELL ? partner.user : userId;

                    let sharesToTrade = Math.min(sharesLeft, partner.shares, user.Money / partner.price);
                    Logger.log("sharesToTrade", sharesToTrade);
                    minPrice = Math.min(minPrice, partner.price);
                    Logger.log("minPrice", minPrice);
                    sharesLeft -= sharesToTrade;
                    let partnerTrade = await tx.marketAction.update({
                        where: {
                            id: partner.id
                        },
                        data: {
                            shares: {
                                decrement: sharesToTrade
                            }
                        }
                    });

                    await tx.marketAction.update({
                        where: {
                            id: marketAction.id
                        },
                        data: {
                            shares: {
                                decrement: sharesToTrade
                            }
                        }
                    });
                    await tx.tickerHistory.create({
                        data: {
                            tickerId: tickerId.id,
                            amount: sharesToTrade,
                            price: minPrice,
                        }
                    });
                    await tx.user.update({
                        where: {id: user.id},
                        data: {
                            Money: {
                                decrement: minPrice * sharesToTrade
                            }
                        }
                    });
                    await tx.user.update({
                        where: {id: seller.id},
                        data: {
                            Money: {
                                increment: minPrice * sharesToTrade
                            }
                        }
                    });
                }
                return {
                    success: true,
                    amount: createMarketActionDto.shares - sharesLeft,
                    price: minPrice,
                    peopleTradedWith: possibilityForTrade.map((value) => value.userId)
                }

            } else {
                return {
                    success: true,
                    amount: 0,
                    price: 0,
                    peopleTradedWith: []
                }
            }

        }, {
            maxWait: 5000, // default: 2000
            timeout: 10000, // default: 5000
            isolationLevel: Prisma.TransactionIsolationLevel.ReadCommitted, // optional, default defined by database configuration
        });
        return res;
    }

    async remove(id: number, session: string): Promise<DeleteMarketActionResultDTO> {
        Logger.log("id", id);
        Logger.log(`session: ${session}`);
        let userId = await this.prisma.user.findUnique({
            where: {token: session}
        });

        let marketAction = await this.prisma.marketAction.findUnique({where: {id: id}});
        if (marketAction == null) {
            Logger.log("marketAction == null");
            throw new HttpException("MarketAction not found", 404);
        }
        if (marketAction.userId != userId.id) {
            Logger.log("marketAction.userId != userId.id");
            throw new HttpException("Unauthorized", 403);
        }

        let old = await this.prisma.marketAction.delete({
            where: {
                id: id,
            }
        });

        await this.prisma.marketActionHistory.create({
            data: {
                userId: userId.id,
                tickerId: marketAction.tickerId,
                typeOfMarketAction: marketAction.typeOfMarketAction,
                price: marketAction.price,
                shares: old.shares,
                typeOfChange: "Delete",
            }
        });

        return {
            success: true,
            amount: old.shares,
        }
    }

    async findAll(ticker: string, type: TypeOfMarketAction) {
        return this.prisma.marketAction.findMany({
            where: {
                ticker: {
                    ticker
                },
                typeOfMarketAction: type
            }
        });
    }
}
