import { Repository } from "typeorm";
import { Injectable } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { InjectRepository } from "@nestjs/typeorm";
import { ExtractJwt, Strategy } from "passport-jwt";
import { PassportStrategy } from "@nestjs/passport";

import { User } from "../entities/user.entity";
import { ResponseService } from "src/features/shared/interceptors";

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {

    constructor(
        @InjectRepository(User) 
        private readonly userRepository:Repository<User>,
        configServices:ConfigService,
        private readonly responseService:ResponseService,
    ) {
        super({
            jwtFromRequest  : ExtractJwt.fromAuthHeaderAsBearerToken(),
            secretOrKey     : configServices.get('JWT_SECRET') ?? '',
        });
    }

    async validate( idUser : number ) {

        const user = await this.userRepository.findOneBy({ idUser });

        if( !user ) return this.responseService.error('El token no es valido', 401);

        if( !user.active ) return this.responseService.error('El usuario no esta activo', 403);

        return user;
    }

}