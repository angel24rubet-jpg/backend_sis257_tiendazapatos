import { ApiProperty } from '@nestjs/swagger';
import { IsString, Matches, MaxLength, IsOptional, IsNumber, IsDateString } from 'class-validator';

export class CreateClienteDto {
  @ApiProperty({
    example: 'Juan',
  })
  @IsString({ message: 'El campo nombre debe ser de tipo cadena' })
  @MaxLength(50, {
    message: 'El campo nombre no debe ser mayor a 50 caracteres',
  })
  nombre: string;

  @ApiProperty({
    example: 'Pérez',
  })
  @IsOptional()
  @IsString({ message: 'El campo apellido debe ser de tipo cadena' })
  @MaxLength(50, {
    message: 'El campo apellido no debe ser mayor a 50 caracteres',
  })
  apellido?: string;

  @ApiProperty({
    example: '+591 71234567',
  })
  @IsOptional()
  @IsString({ message: 'El campo telefono debe ser de tipo cadena' })
  @MaxLength(50, {
    message: 'El campo telefono no debe ser mayor a 50 caracteres',
  })
  @Matches(/^[0-9+\-\s()]+$/, {
    message: 'El campo telefono tiene un formato inválido',
  })
  telefono?: string;

  @ApiProperty({
    example: '73684446',
  })
  @IsOptional()
  @IsString({ message: 'El campo cedula debe ser de tipo cadena' })
  @MaxLength(30, {
    message: 'El campo cedula no debe ser mayor a 30 caracteres',
  })
  cedula?: string;

  @ApiProperty({
    example: 'femenino',
  })
  @IsOptional()
  @IsString({ message: 'El campo genero debe ser de tipo cadena' })
  @MaxLength(20, {
    message: 'El campo genero no debe ser mayor a 20 caracteres',
  })
  genero?: string;

  @ApiProperty({
    example: '1990-08-22',
    description: 'Fecha de nacimiento en formato ISO (YYYY-MM-DD)'
  })
  @IsOptional()
  @IsDateString({}, { message: 'El campo fechaNacimiento debe ser una fecha válida' })
  fechaNacimiento?: string;

  @ApiProperty({
    example: 'Av. Siempre Viva 123',
  })
  @IsOptional()
  @IsString({ message: 'El campo direccion debe ser de tipo cadena' })
  @MaxLength(50, {
    message: 'El campo direccion no debe ser mayor a 50 caracteres',
  })
  direccion?: string;

  @ApiProperty({
    example: 1,
    description: 'ID del usuario asociado al cliente (si ya existe una cuenta)',
  })
  @IsOptional()
  @IsNumber({}, { message: 'El campo idUsuario debe ser numérico' })
  idUsuario?: number;
}
