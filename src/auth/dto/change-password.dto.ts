import { IsString, MinLength } from 'class-validator';

export class ChangePasswordDto {
  @IsString()
  claveActual: string;

  @IsString()
  @MinLength(6)
  claveNueva: string;
}
