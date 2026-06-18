import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Color } from './entities/color.entity';
import { CreateColorDto } from './dto/create-color.dto';
import { UpdateColorDto } from './dto/update-color.dto';

@Injectable()
export class ColoresService {
  constructor(
    @InjectRepository(Color)
    private coloresRepository: Repository<Color>,
  ) {}

  async create(createColorDto: CreateColorDto): Promise<Color> {
    const existe = await this.coloresRepository.findOne({
      where: { nombre: createColorDto.nombre },
    });
    if (existe) {
      throw new ConflictException('Ya existe un color con ese nombre');
    }
    const color = this.coloresRepository.create(createColorDto);
    return this.coloresRepository.save(color);
  }

  async findAll(): Promise<Color[]> {
    return this.coloresRepository.find({
      order: { nombre: 'ASC' },
    });
  }

  async findOne(id: number): Promise<Color> {
    const color = await this.coloresRepository.findOne({ where: { id } });
    if (!color) {
      throw new NotFoundException(`Color con ID ${id} no encontrado`);
    }
    return color;
  }

  async update(id: number, updateColorDto: UpdateColorDto): Promise<Color> {
    const color = await this.findOne(id);
    
    if (updateColorDto.nombre && updateColorDto.nombre !== color.nombre) {
      const existe = await this.coloresRepository.findOne({
        where: { nombre: updateColorDto.nombre },
      });
      if (existe) {
        throw new ConflictException('Ya existe un color con ese nombre');
      }
    }
    
    Object.assign(color, updateColorDto);
    return this.coloresRepository.save(color);
  }

  async remove(id: number): Promise<void> {
    const color = await this.findOne(id);
    await this.coloresRepository.softRemove(color);
  }
}
