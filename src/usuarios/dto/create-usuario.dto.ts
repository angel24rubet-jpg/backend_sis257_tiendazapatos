import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsNotEmpty, IsString, MaxLength, IsOptional, IsIn } from 'class-validator';

export class CreateUsuarioDto {
  @ApiProperty({
    example: 'usuario123',
    description: 'Nombre de usuario',
  })
  @IsNotEmpty({ message: 'El campo usuario es obligatorio' })
  @IsString({ message: 'El campo usuario debe ser de tipo cadena' })
  @MaxLength(15, {
    message: 'El campo usuario no debe ser mayor a 15 caracteres',
  })
  readonly nombreUsuario: string;

  @ApiPropertyOptional({
    example: 'cliente',
    description: 'Rol del usuario (admin o cliente)',
    enum: ['admin', 'cliente'],
  })
  @IsOptional()
  @IsString({ message: 'El campo rol debe ser de tipo cadena' })
  @IsIn(['admin', 'cliente'], { message: 'El rol debe ser admin o cliente' })
  readonly rol?: string;
}
