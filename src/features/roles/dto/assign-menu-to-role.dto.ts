import { IsOptional, IsArray } from 'class-validator';

export class AssignMenuToRoleDto {
  @IsOptional()
  @IsArray()
  idMenus?: number[];
}
