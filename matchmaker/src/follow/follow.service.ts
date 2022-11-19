import {HttpException, Injectable, Logger, UseGuards} from '@nestjs/common';
import {CreateFollowDto} from './dto/create-follow.dto';
import {PrismaService} from "../prisma/prisma";
import {UserGuard} from "../user/user.guard";

@Injectable()
export class FollowService {
    constructor(private prisma: PrismaService) {
    }

    create(createFollowDto: CreateFollowDto, session: string) {
        try {
            return this.prisma.follows.create({
                data: {
                    followedBy: {
                        connect: {
                            token: session
                        }
                    },
                    follows: {
                        connect: {
                            id: createFollowDto.toFollow
                        }
                    }
                }
            });
        }
        catch (e) {
            Logger.error(e);
            throw new HttpException("Invalid request", 400);
        }
    }

    findAll(session: string) {
        return this.prisma.follows.findMany({
            where: {
                followedBy: {
                    token: session
                }
            }
        });
    }

    async find(id: number, session: string) {
        let user = await this.prisma.user.findUnique({
            where: {
                token: session
            }
        });

        return this.prisma.follows.findUnique({
            where: {
                followsId_followedByID: {
                    followedByID: user.id,
                    followsId: id
                }
            }
        });
    }



    async remove(id: number, session: string) {
        let user = await this.prisma.user.findUnique({
            where: {
                token: session
            }
        });
        if(user== null){
            throw new HttpException("User could not be found", 404);
        }

        return this.prisma.follows.delete({
            where: {
                followsId_followedByID: {
                    followedByID: user.id,
                    followsId: id
                }
            }
        })
    }
}
