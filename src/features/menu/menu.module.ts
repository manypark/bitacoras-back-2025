import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { MenuService } from './menu.service';
import { Menu } from './entities/menu.entity';
import { MenuController } from './menu.controller';
import { ResponseService } from '../shared/interceptors';

@Module({
  controllers : [ MenuController ],
  providers   : [
    MenuService,
    ResponseService,
  ],
  imports     : [ TypeOrmModule.forFeature([Menu]) ],
  exports     : [TypeOrmModule, MenuService ]
})
export class MenuModule {}
