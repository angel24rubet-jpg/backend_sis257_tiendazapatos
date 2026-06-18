import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  ParseIntPipe,
  UseGuards,
} from '@nestjs/common';
import { ColoresService } from './colores.service';
import { CreateColorDto } from './dto/create-color.dto';
import { UpdateColorDto } from './dto/update-color.dto';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';

@Controller('colores')
export class ColoresController {
  constructor(private readonly coloresService: ColoresService) {}

  @UseGuards(JwtAuthGuard)
  @Post()
  create(@Body() createColorDto: CreateColorDto) {
    return this.coloresService.create(createColorDto);
  }

  @Get()
  findAll() {
    return this.coloresService.findAll();
  }

  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.coloresService.findOne(id);
  }

  @UseGuards(JwtAuthGuard)
  @Patch(':id')
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateColorDto: UpdateColorDto,
  ) {
    return this.coloresService.update(id, updateColorDto);
  }

  @UseGuards(JwtAuthGuard)
  @Delete(':id')
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.coloresService.remove(id);
  }
}
