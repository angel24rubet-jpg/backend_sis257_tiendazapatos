import { Injectable,  NotFoundException, ConflictException } from '@nestjs/common';
import { CreateMarcaDto } from './dto/create-marca.dto';
import { UpdateMarcaDto } from './dto/update-marca.dto';

import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { Marca } from './entities/marca.entity';

@Injectable()
export class MarcasService {
  constructor(
    @InjectRepository(Marca)
    private marcasRepository: Repository<Marca>,
  ) {}

      // Método para crear una nueva marca

    async create(createMarcaDto: CreateMarcaDto): Promise<Marca> {
      const marca = new Marca();

      marca.nombre = createMarcaDto.nombre.trim();

      // si existe una descripción, la asignamos, de lo contrario, dejamos el campo como null

      marca.descripcion = createMarcaDto.descripcion?.trim();

      return this.marcasRepository.save(marca);
    }

    // metodo para mostrar las marcas 
    async findAll(): Promise<Marca[]> {
      return this.marcasRepository.find({
        order: {
          // ordenamos por id de forma ascendente
          id: 'ASC',
        },
      });
    }

    // metodo para mostrar una marca por id

    async findOne(id: number): Promise<Marca> {
      const marca = await this.marcasRepository.findOne({
        where: { id },
      });

      if (!marca) {
        throw new NotFoundException(
          `Marca con ID ${id} no encontrada`,
        );
      }

      return marca;
    }

    // metodo para mostrar una marca por nombre

        // busca una marca para verificar si ya existe una marca con el mismo nombre
        
    async update(
      id: number,
      updateMarcaDto: UpdateMarcaDto,
    ): Promise<Marca> {

      const marca = await this.findOne(id);

      if (
        updateMarcaDto.nombre &&
        updateMarcaDto.nombre !== marca.nombre
      ) {
        const existe = await this.marcasRepository.findOne({
          where: { nombre: updateMarcaDto.nombre },
        });

        if (existe) {
          throw new ConflictException(
            'Ya existe una marca con ese nombre',
          );
        }
      }

      Object.assign(marca, updateMarcaDto);

      return this.marcasRepository.save(marca);
    }

    // metodo para eliminar una marca por id
    
   async remove(id: number): Promise<void> {
      const marca = await this.findOne(id);

      await this.marcasRepository.softRemove(marca);
   }
}