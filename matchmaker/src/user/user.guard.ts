import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { Observable } from 'rxjs';
import { PrismaService } from '../prisma/prisma';

@Injectable()
export class UserGuard implements CanActivate {
  constructor(private prisma: PrismaService) {}
  canActivate(
    context: ExecutionContext,
  ): boolean | Promise<boolean> | Observable<boolean> {

    // check if the user provided a valid auth header
    // if not, return false
    let uuid:string = context.switchToHttp().getRequest().headers['session'];
    if (uuid == null) {
        return false;
    }
    // lets check if the user exists
    try {
      // @ts-ignore
      let user = this.prisma.user.findUnique({
        where: {
          // @ts-ignore
          token: uuid
        },
        rejectOnNotFound: false
      });
      return (user != null);
    }
    catch (e) {
      return false;
    }


    return true;
  }
}
