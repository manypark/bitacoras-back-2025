import { Repository } from "typeorm";
import { Injectable } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { InjectRepository } from "@nestjs/typeorm";
import { ExtractJwt, Strategy } from "passport-jwt";
import { PassportStrategy } from "@nestjs/passport";

import { User } from "../entities/user.entity";
import { CustomUnauthorizedException } from "../expections/custom-exception";

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {

    constructor(
        @InjectRepository(User) 
        private readonly userRepository:Repository<User>,
        configServices:ConfigService,
    ) {
        super({
            jwtFromRequest  : ExtractJwt.fromAuthHeaderAsBearerToken(),
            secretOrKey     : configServices.get('JWT_SECRET') ?? '',
        });
    }

    async validate( data : any ) {

        const user = await this.userRepository.findOneBy({ email: data.email });
        
        if( !user ) throw new CustomUnauthorizedException('El token no es válido', 401);
        
        if( !user.active ) throw new CustomUnauthorizedException('El usuario no está activo', 403);

        return user;
    }

}