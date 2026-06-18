import { IsNotEmpty, IsString, MaxLength, IsOptional, Matches } from 'class-validator';

export class CreateColorDto {
  @IsNotEmpty({ message: 'El nombre del color es obligatorio' })
  @IsString()
  @MaxLength(50)
  nombre: string;

  @IsOptional()
  @IsString()
  @MaxLength(7)
  @Matches(/^#[0-9A-Fa-f]{6}$/, { message: 'El código hex debe tener formato #RRGGBB' })
  codigoHex?: string;
}
