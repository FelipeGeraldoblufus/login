// edit-team.dto.ts

import { IsString, MinLength } from 'class-validator';

export class EditTeamDto {
  @IsString()
  @MinLength(4)
  nombre: string;

  @IsString()
  descripcion: string;
}