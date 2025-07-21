import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { MenuRolesService } from './menu-roles.service';
import { MenuRoles } from './entities/menu-role.entity';
import { ResponseService } from '../shared/interceptors';
import { MenuRolesController } from './menu-roles.controller';

@Module({
  controllers : [MenuRolesController],
  providers   : [
    MenuRolesService, 
    ResponseService,
  ],
  imports     : [ TypeOrmModule.forFeature([MenuRoles]) ],
})
export class MenuRolesModule {}
