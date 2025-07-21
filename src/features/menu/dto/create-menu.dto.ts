import { IsBoolean, IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class CreateMenuDto {
    
  @IsString()
  @IsNotEmpty({ message: 'El nombre del menú es requerido' })
  name: string;

  @IsString()
  @IsNotEmpty({ message: 'La ruta es requerida' })
  route: string;

  @IsString()
  @IsNotEmpty({ message: 'El ícono es requerido' })
  icon: string;

  @IsOptional()
  @IsBoolean()
  active?: boolean;
}
