import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { Role } from './entities/role.entity';
import { RolesService } from './roles.service';
import { MenuModule } from '../menu/menu.module';
import { RolesController } from './roles.controller';
import { ResponseService } from '../shared/interceptors';

@Module({
  controllers : [ RolesController ],
  providers   : [ 
    RolesService, 
    ResponseService,
  ],
  imports     : [ TypeOrmModule.forFeature([ Role ]), MenuModule ],
  exports     : [ TypeOrmModule, RolesService ]
})
export class RolesModule {}
