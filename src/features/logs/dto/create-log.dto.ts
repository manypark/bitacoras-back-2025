import { IsOptional, IsString, IsNumber, IsInt, IsBoolean } from "class-validator";

import { User } from "../../../features/auth/entities/user.entity";
import { Task } from "../../../features/tasks/entities/task.entity";
import { Concept } from "../../../features/concepts/entities/concept.entity";

export class CreateLogDto {

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsString()
  image_url?: string;

  @IsOptional()
  @IsBoolean()
  active?: boolean;

  @IsNumber()
  latitud: number;

  @IsNumber()
  longitud: number;

  @IsInt()
  idUser:User;

  @IsInt()
  idTasks:Task;

  @IsInt()
  idConcept:Concept;
  
}
