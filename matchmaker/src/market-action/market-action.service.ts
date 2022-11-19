import {HttpException, Injectable, Logger} from '@nestjs/common';
import {CreateMarketActionDto} from './dto/create-market-action.dto';
import {UpdateMarketActionDto} from './dto/update-market-action.dto';
import {PrismaService} from "../prisma/prisma";
import {Prisma, TypeOfMarketAction} from "@prisma/client";

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
            where: {token: session}
        });

        if (userId == null) {
            throw new Error("User not found");
        }

        let tickerId = await this.prisma.ticker.findUnique({
            where: {ticker: createMarketActionDto.ticker}
        });

        let res = this.prisma.$transaction(async (tx) : Promise<PostMarketActionResultDTO>  => {
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
                    }
                },
                create: {
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
            Logger.log((createMarketActionDto.marketAction == TypeOfMarketAction.BUY) ? TypeOfMarketAction.SELL : TypeOfMarketAction.BUY);
            // now lets check if we can make a trade
            //TODO check funds
            let possibilityForTrade = await tx.marketAction.findMany({
                where: {
                    price: {
                        lte: createMarketActionDto.price,
                    },
                    tickerId: tickerId.id,
                    typeOfMarketAction: (createMarketActionDto.marketAction == TypeOfMarketAction.BUY) ? TypeOfMarketAction.SELL : TypeOfMarketAction.BUY,
                    NOT: {
                        userId: userId.id
                    },
                    shares: {
                        gt: 0
                    }
                },
                orderBy: [
                    {
                        price: (createMarketActionDto.marketAction == TypeOfMarketAction.BUY) ? "asc" : "desc",
                    },
                    {
                        createdAt: "asc"
                    }
                ],
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
                    let sharesToTrade = Math.min(sharesLeft, partner.shares);
                    minPrice = Math.min(minPrice, partner.price);
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
                }
                return {
                    success: true,
                    amount: createMarketActionDto.shares - sharesLeft,
                    price: minPrice,
                    peopleTradedWith: possibilityForTrade.map((value) => value.userId)
                }

            }else{
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
            isolationLevel: Prisma.TransactionIsolationLevel.Serializable, // optional, default defined by database configuration
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
