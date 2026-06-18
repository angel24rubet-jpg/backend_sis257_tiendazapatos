import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { ProductosService } from './productos.service';
import { ProductosController } from './productos.controller';
import { Producto } from './entities/producto.entity';
import { Color } from '../colores/entities/color.entity';
import { Marca } from '../marcas/entities/marca.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Producto, Color, Marca])],
  controllers: [ProductosController],
  providers: [ProductosService],
})
export class ProductosModule {}
