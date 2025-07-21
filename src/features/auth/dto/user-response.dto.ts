import { Exclude, Expose, Transform, Type } from 'class-transformer';

export class MenuItem {
  @Expose()
  idMenu: number;

  @Expose()
  name: string;

  @Expose()
  route: string;

  @Expose()
  icon: string;
}

export class MenuListItem {
  @Type(() => MenuItem)
  @Expose()
  menu: MenuItem;
}

export class RoleItem {
  @Expose()
  idRoles: number;

  @Expose()
  name: string;
}

export class UserResponseDto {
  @Expose()
  idUser: number;

  @Expose()
  firstName: string;

  @Expose()
  lastName: string;

  @Expose()
  email: string;

  @Expose()
  avatarUrl: string;

  @Expose()
  active:boolean;

  @Expose()
  lastLogin: Date;

  @Expose()
  createdAt: Date;

  @Expose()
  updatedAt: Date;

  @Expose()
  @Type(() => MenuListItem)
  menuList: MenuListItem[];

  @Expose()
  @Type(() => RoleItem)
  rolesList: RoleItem[];
}
