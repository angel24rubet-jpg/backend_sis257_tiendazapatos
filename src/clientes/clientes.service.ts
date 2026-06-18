import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { CreateClienteDto } from './dto/create-cliente.dto';
import { UpdateClienteDto } from './dto/update-cliente.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Cliente } from './entities/cliente.entity';
import { Repository } from 'typeorm';

@Injectable()
export class ClientesService {
  constructor(
    @InjectRepository(Cliente) private clientesRepository: Repository<Cliente>,
  ) {}

  async create(createClienteDto: CreateClienteDto): Promise<Cliente> {
    const cliente = new Cliente();
    cliente.nombre = createClienteDto.nombre?.trim();
    cliente.apellido = createClienteDto.apellido?.trim();
    cliente.telefono = createClienteDto.telefono?.trim();
    cliente.direccion = createClienteDto.direccion?.trim();
    cliente.cedula = createClienteDto.cedula?.trim() || undefined;
    cliente.genero = createClienteDto.genero?.trim() || undefined;
    cliente.fechaNacimiento = createClienteDto.fechaNacimiento ? new Date(createClienteDto.fechaNacimiento) : undefined;
    if (createClienteDto.idUsuario) {
      cliente.idUsuario = createClienteDto.idUsuario;
    }
    return this.clientesRepository.save(cliente);
  }

  async createForUsuario(idUsuario: number, createClienteDto: CreateClienteDto): Promise<Cliente> {
    const cliente = new Cliente();
    cliente.nombre = createClienteDto.nombre?.trim() || undefined;
    cliente.apellido = createClienteDto.apellido?.trim() || undefined;
    cliente.telefono = createClienteDto.telefono?.trim() || undefined;
    cliente.direccion = createClienteDto.direccion?.trim() || undefined;
    cliente.cedula = createClienteDto.cedula?.trim() || undefined;
    cliente.genero = createClienteDto.genero?.trim() || undefined;
    cliente.fechaNacimiento = createClienteDto.fechaNacimiento ? new Date(createClienteDto.fechaNacimiento) : undefined;
    cliente.idUsuario = idUsuario;
    return this.clientesRepository.save(cliente);
  }

  async findAll() {
    return this.clientesRepository.find();
  }

  async findByUsuario(idUsuario: number): Promise<Cliente> {
    const cliente = await this.clientesRepository
      .createQueryBuilder('cliente')
      .leftJoinAndSelect('cliente.usuario', 'usuario')
      .leftJoinAndSelect('cliente.ventas', 'ventas', 'ventas.fecha_eliminacion IS NULL')
      .leftJoinAndSelect('ventas.ventadetalles', 'ventadetalles', 'ventadetalles.fecha_eliminacion IS NULL')
      .leftJoinAndSelect('ventadetalles.producto', 'producto')
      .where('cliente.id_usuario = :idUsuario', { idUsuario })
      .andWhere('cliente.fecha_eliminacion IS NULL')
      .orderBy('ventas.fecha_creacion', 'DESC')
      .getOne();
    if (!cliente) throw new NotFoundException('El cliente no existe');
    return cliente;
  }

  async findOne(id: number): Promise<Cliente> {
    const cliente = await this.clientesRepository
      .createQueryBuilder('cliente')
      .leftJoinAndSelect('cliente.usuario', 'usuario')
      .leftJoinAndSelect('cliente.ventas', 'ventas', 'ventas.fecha_eliminacion IS NULL')
      .leftJoinAndSelect('ventas.ventadetalles', 'ventadetalles', 'ventadetalles.fecha_eliminacion IS NULL')
      .leftJoinAndSelect('ventadetalles.producto', 'producto')
      .where('cliente.id = :id', { id })
      .andWhere('cliente.fecha_eliminacion IS NULL')
      .orderBy('ventas.fecha_creacion', 'DESC')
      .getOne();
    if (!cliente) throw new NotFoundException('El cliente no existe');
    return cliente;
  }

  async update(id: number, updateClienteDto: UpdateClienteDto) {
    const cliente = await this.findOne(id);
    const clienteUpdate = Object.assign(cliente, updateClienteDto);
    return this.clientesRepository.save(clienteUpdate);
  }

  async remove(id: number) {
    const cliente = await this.findOne(id);
    if (!cliente) throw new NotFoundException('El cliente no existe');
    if (cliente.ventas && cliente.ventas.length > 0) {
      throw new ConflictException('El cliente tiene al menos un pedido y no puede ser eliminado');
    }
    return this.clientesRepository.softRemove(cliente);
  }
}
