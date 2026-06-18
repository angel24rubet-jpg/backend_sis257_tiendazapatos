import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { CreateProductoDto } from './dto/create-producto.dto';
import { UpdateProductoDto } from './dto/update-producto.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Producto } from './entities/producto.entity';
import { Color } from '../colores/entities/color.entity';
import { Marca } from '../marcas/entities/marca.entity';
import { Repository, In } from 'typeorm';

@Injectable()
export class ProductosService {
  constructor(
    @InjectRepository(Producto)
    private productosRepository: Repository<Producto>,
    @InjectRepository(Color)
    private coloresRepository: Repository<Color>,
    @InjectRepository(Marca)
    private marcasRepository: Repository<Marca>,
  ) {}

  async create(createProductoDto: CreateProductoDto): Promise<Producto> {
    const existe = await this.productosRepository.findOneBy({
      nombre: createProductoDto.nombre.trim(),
    });
    if (existe) throw new ConflictException('El producto ya existe');

    // Buscar los colores por sus IDs
    const colores = await this.coloresRepository.find({
      where: { id: In(createProductoDto.colores) },
    });

   const marca = await this.marcasRepository.findOne({
      where: { id: createProductoDto.idMarca },
    });

    if (!marca) {
      throw new NotFoundException(
        `Marca con ID ${createProductoDto.idMarca} no encontrada`,
      );
    }

    const producto = new Producto();
    producto.nombre = createProductoDto.nombre.trim();
    producto.descripcion = createProductoDto.descripcion.trim();
    producto.precio = createProductoDto.precio;
    producto.stock = createProductoDto.stock;
    producto.tallas = Array.isArray(createProductoDto.tallas)
      ? createProductoDto.tallas.map((t) => String(t))
      : [];
    producto.colores = colores;
    producto.genero = createProductoDto.genero;
    producto.imagenes = createProductoDto.imagenes;
    producto.idCategoria = createProductoDto.idCategoria;
    producto.idMarca = createProductoDto.idMarca;
    producto.marca = marca;
    return this.productosRepository.save(producto);
  }

  async findAll(): Promise<Producto[]> {
    return this.productosRepository.find({ 
      relations: ['categoria', 'colores'] 
    });
  }

  async findOne(id: number): Promise<Producto> {
    const producto = await this.productosRepository.findOne({
      where: { id },
      relations: ['categoria', 'colores'],
    });
    if (!producto) throw new NotFoundException('El producto no existe');
    return producto;
  }

  async update(
    id: number,
    updateProductoDto: UpdateProductoDto,
  ): Promise<Producto> {
    const producto = await this.findOne(id);
    
    if ((updateProductoDto as any).tallas) {
      producto.tallas = (updateProductoDto as any).tallas.map((t: any) => String(t));
    }
    
    // Si se envían colores, buscar las entidades
    if ((updateProductoDto as any).colores) {
      const colores = await this.coloresRepository.find({
        where: { id: In((updateProductoDto as any).colores) },
      });
      producto.colores = colores;
    }

    // Si se envía una marca, buscar la entidad
    if ((updateProductoDto as any).idMarca) {
      const marca = await this.marcasRepository.findOne({
        where: { id: (updateProductoDto as any).idMarca },
      });

      if (!marca) {
        throw new NotFoundException(
          `Marca con ID ${(updateProductoDto as any).idMarca} no encontrada`,
        );
      }

      producto.idMarca = marca.id;
      producto.marca = marca;
    }
    
    // Actualizar otros campos
    const { colores, tallas, ...otherFields } = updateProductoDto as any;
    Object.assign(producto, otherFields);
    
    return this.productosRepository.save(producto);
  }

  async remove(id: number) {
    const producto = await this.findOne(id);
    return this.productosRepository.softRemove(producto);
  }
}
