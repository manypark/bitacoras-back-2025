import { Observable } from 'rxjs';
import { Reflector } from '@nestjs/core';
import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';

import { META_ROLES } from '../../decorators';
import { CustomUnauthorizedException } from '../../expections/custom-exception';

@Injectable()
export class UserRoleGuard implements CanActivate {

  constructor( private readonly reflector:Reflector ) {}

  canActivate( ctx: ExecutionContext ): boolean | Promise<boolean> | Observable<boolean> {

    const validRoles:string[] = this.reflector.get( META_ROLES, ctx.getHandler() );

    if( !validRoles ) return true;
    if( validRoles.length === 0 ) return true;

    const req  = ctx.switchToHttp().getRequest();
    const user = req.user;


    if( !user ) throw new CustomUnauthorizedException('Usuario no encontrado', 404);

    // for ( const item of user.roles ) {
    //   if( validRoles.includes(item) ) {
    //     return true;
    //   }
    // }

    throw new CustomUnauthorizedException(`El usuario necesita un rol valido`, 403);
  }

}
