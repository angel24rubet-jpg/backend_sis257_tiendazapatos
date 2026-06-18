import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString, MaxLength, IsOptional, IsDateString } from 'class-validator';

export class AuthRegisterDto {
  @ApiProperty({ example: 'usuario123', description: 'Nombre de usuario' })
  @IsNotEmpty({ message: 'El campo usuario es obligatorio' })
  @IsString({ message: 'El campo usuario debe ser de tipo cadena' })
  @MaxLength(50, { message: 'El campo usuario no debe ser mayor a 50 caracteres' })
  nombreUsuario: string;

  @ApiProperty({ example: 'miPassword123', description: 'Clave del usuario' })
  @IsNotEmpty({ message: 'La clave es obligatoria' })
  @IsString({ message: 'La clave debe ser de tipo cadena' })
  clave: string;

  @ApiProperty({ example: 'Juan', description: 'Nombre del cliente' })
  @IsOptional()
  @IsString()
  nombre?: string;

  @ApiProperty({ example: 'Pérez', description: 'Apellido del cliente' })
  @IsOptional()
  @IsString()
  apellido?: string;

  @ApiProperty({ example: '12345678', description: 'Cédula de identidad del cliente' })
  @IsOptional()
  @IsString()
  @MaxLength(30, { message: 'La cédula no debe ser mayor a 30 caracteres' })
  cedula?: string;

  @ApiProperty({ example: 'masculino', description: 'Género del cliente' })
  @IsOptional()
  @IsString()
  genero?: string;

  @ApiProperty({ example: '1990-05-15', description: 'Fecha de nacimiento del cliente' })
  @IsOptional()
  @IsDateString({}, { message: 'La fecha de nacimiento debe ser una fecha válida' })
  fechaNacimiento?: string;

  @ApiProperty({ example: '+591 71234567', description: 'Teléfono del cliente' })
  @IsOptional()
  @IsString()
  telefono?: string;

  @ApiProperty({ example: 'Av. Siempre Viva 123', description: 'Dirección del cliente' })
  @IsOptional()
  @IsString()
  direccion?: string;

  @ApiProperty({ example: 'cliente', description: 'Rol del usuario (cliente o admin)' })
  @IsOptional()
  @IsString()
  rol?: string;
}
