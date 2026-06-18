import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ColoresService } from './colores.service';
import { ColoresController } from './colores.controller';
import { Color } from './entities/color.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Color])],
  controllers: [ColoresController],
  providers: [ColoresService],
  exports: [ColoresService],
})
export class ColoresModule {}
