import { ApiProperty } from '@nestjs/swagger';
import {
  IsNotEmpty,
  IsString,
  MaxLength,
  IsNumber,
  Min,
  IsArray,
  ArrayNotEmpty,
} from 'class-validator';

export class CreateProductoDto {
  @ApiProperty({
    example: 'Camiseta deportiva',
    description: 'Nombre del producto',
  })
  @IsNotEmpty({ message: 'El campo nombre es obligatorio' })
  @IsString({ message: 'El campo nombre debe ser de tipo cadena' })
  @MaxLength(100, {
    message: 'El campo nombre no debe ser mayor a 100 caracteres',
  })
  readonly nombre: string;

  @ApiProperty({
    example: 'Camiseta de algodón ideal para actividades deportivas',
    description: 'Descripción del producto',
  })
  @IsNotEmpty({ message: 'El campo descripcion es obligatorio' })
  @IsString({ message: 'El campo descripcion debe ser de tipo cadena' })
  @MaxLength(500, {
    message: 'El campo descripcion no debe ser mayor a 500 caracteres',
  })
  readonly descripcion: string;

  @ApiProperty({
    example: 29.99,
    description: 'Precio del producto',
  })
  @IsNotEmpty({ message: 'El campo precio es obligatorio' })
  @IsNumber({}, { message: 'El campo precio debe ser de tipo número' })
  @Min(0, { message: 'El precio no puede ser negativo' })
  readonly precio: number;

  @ApiProperty({
    example: 100,
    description: 'Cantidad de stock disponible',
  })
  @IsNotEmpty({ message: 'El campo stock es obligatorio' })
  @IsNumber({}, { message: 'El campo stock debe ser de tipo número' })
  @Min(0, { message: 'El stock no puede ser negativo' })
  readonly stock: number;

  @ApiProperty({
    example: ['S', 'M', 'L'],
    description: 'Tallas disponibles del producto (array)',
    type: [String],
  })
  @IsArray({ message: 'El campo tallas debe ser un arreglo' })
  @ArrayNotEmpty({ message: 'El campo tallas no debe estar vacío' })
  @IsString({ each: true, message: 'Cada talla debe ser de tipo cadena' })
  readonly tallas: string[];

  @ApiProperty({
    example: [1, 2],
    description: 'IDs de los colores asociados al producto',
    type: [Number],
  })
  @IsArray({ message: 'El campo colores debe ser un arreglo de ids' })
  @ArrayNotEmpty({ message: 'El campo colores no debe estar vacío' })
  @IsNumber({}, { each: true, message: 'Cada id de color debe ser numérico' })
  readonly colores: number[];

  @ApiProperty({
    example: 'hombre',
    description: 'Género del producto: hombre, mujer o unisex',
    enum: ['hombre', 'mujer', 'unisex'],
  })
  @IsNotEmpty({ message: 'El campo genero es obligatorio' })
  @IsString({ message: 'El genero debe ser de tipo cadena' })
  readonly genero: string;

  @ApiProperty({
    example: 'https://example.com/imagen.jpg',
    description: 'URL de la imagen del producto',
  })
  @IsNotEmpty({ message: 'El campo imagenes es obligatorio' })
  @IsString({ message: 'La imagen debe ser una URL válida' })
  readonly imagenes: string;

  @ApiProperty({
    example: 1,
    description: 'ID de la categoría del producto',
  })
  @IsNotEmpty({ message: 'El campo idCategoria es obligatorio' })
  @IsNumber({}, { message: 'El campo idCategoria debe ser de tipo número' })
  readonly idCategoria: number;

  // agregacion de idMarca para relacionar el producto con una marca

  @ApiProperty({
  example: 1,
  description: 'ID de la marca del producto',
  })
  @IsNotEmpty({ message: 'El campo idMarca es obligatorio' })
  @IsNumber({}, { message: 'El campo idMarca debe ser de tipo número' })
  readonly idMarca: number;
}
