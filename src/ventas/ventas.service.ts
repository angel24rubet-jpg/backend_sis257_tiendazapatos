import {
  Injectable,
  NotFoundException,
  BadRequestException,
  ForbiddenException,
  InternalServerErrorException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DataSource } from 'typeorm';
import { Venta } from './entities/venta.entity';
import { DetalleVenta } from './entities/detalle_venta.entity';
import { CreateVentaDto } from './dto/create-venta.dto';
import { Producto } from '../productos/entities/producto.entity';
import { Cliente } from '../clientes/entities/cliente.entity';

@Injectable()
export class VentasService {
  constructor(
    @InjectRepository(Venta)
    private ventaRepository: Repository<Venta>,
    @InjectRepository(DetalleVenta)
    private detalleVentaRepository: Repository<DetalleVenta>,
    @InjectRepository(Producto)
    private productoRepository: Repository<Producto>,
    @InjectRepository(Cliente)
    private clienteRepository: Repository<Cliente>,
    private dataSource: DataSource,
  ) {}

  async obtenerVentas(): Promise<Venta[]> {
    console.log('Obteniendo todas las ventas...');
    const ventas = await this.ventaRepository.find({
      relations: ['cliente', 'ventadetalles', 'ventadetalles.producto'],
    });
    console.log('Ventas obtenidas:', ventas);
    return ventas;
  }

  async obtenerVentasPorUsuario(idUsuario: number): Promise<Venta[]> {
    console.log(`Obteniendo ventas para el usuario con ID: ${idUsuario}`);
    
    // Primero buscar el cliente asociado al usuario
    const cliente = await this.clienteRepository.findOne({
      where: { idUsuario: idUsuario },
    });

    if (!cliente) {
      console.log(`No se encontró cliente para el usuario con ID: ${idUsuario}`);
      return [];
    }

    console.log(`Cliente encontrado: ID=${cliente.id}, Nombre=${cliente.nombre}`);

    // Obtener las ventas del cliente ordenadas por fecha de creación descendente
    const ventas = await this.ventaRepository.find({
      where: { cliente: { id: cliente.id } },
      relations: ['cliente', 'ventadetalles', 'ventadetalles.producto'],
      order: { fechaCreacion: 'DESC' },
    });

    console.log(`Ventas encontradas para el usuario: ${ventas.length}`);
    return ventas;
  }

  async obtenerVentaPorId(id: number): Promise<Venta> {
    console.log(`Buscando venta por ID: ${id}`);
    const venta = await this.ventaRepository.findOne({
      where: { id },
      relations: ['cliente', 'ventadetalles', 'ventadetalles.producto'],
    });

    if (!venta) {
      console.log(`No se encontró la venta con ID: ${id}`);
      throw new NotFoundException(`La venta con ID ${id} no fue encontrada`);
    }

    console.log('Venta encontrada:', venta);
    return venta;
  }

  async obtenerVentaDetalles(id: number): Promise<DetalleVenta[]> {
    const venta = await this.ventaRepository.findOne({
      where: { id },
      relations: ['ventadetalles', 'ventadetalles.producto'],
    });

    if (!venta) {
      throw new NotFoundException(`La venta con ID ${id} no fue encontrada`);
    }

    if (!venta.ventadetalles || venta.ventadetalles.length === 0) {
      throw new NotFoundException(
        `No se encontraron detalles para la venta con ID ${id}`,
      );
    }

    return venta.ventadetalles;
  }
  // metodo para crear una nueva venta con detalles y manejo de transacciones

  async crearVenta(createVentaDto: CreateVentaDto): Promise<Venta> {
    console.log('Iniciando creación de venta con DTO:', createVentaDto);
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      // Buscar el cliente si se proporciona un ID de cliente
      let cliente: Cliente | null = null;
      if (createVentaDto.idCliente) {
        console.log(`Buscando cliente con ID: ${createVentaDto.idCliente}`);
        cliente = await this.clienteRepository.findOne({
          where: { id: createVentaDto.idCliente },
        });
        if (!cliente) {
          console.log(
            `Cliente con ID ${createVentaDto.idCliente} no encontrado`,
          );
          throw new NotFoundException(
            `Cliente con ID ${createVentaDto.idCliente} no encontrado`,
          );
        }
        console.log('Cliente encontrado:', cliente);
      }
      // crea una nueva venta sin detalles aún
      const nuevaVenta = this.ventaRepository.create({
        metodoPago: createVentaDto.metodoPago || 'efectivo',
        totalVenta: 0,
        estado: 'pendiente',
        montoPagado: null, // Puede ser null
        cambio: null, // Puede ser null
      });

      if (cliente) {
        nuevaVenta.cliente = cliente;
      }

      console.log('Guardando nueva venta (sin detalles aún)...', nuevaVenta);
      const ventaGuardada = await queryRunner.manager.save(nuevaVenta);
      console.log('Venta guardada:', ventaGuardada);

      let totalVenta = 0;

      if (!createVentaDto.detalles || !createVentaDto.detalles.length) {
        console.log('No se proporcionaron detalles de venta');
        throw new BadRequestException(
          'La venta debe contener al menos un detalle',
        );
      }

      // Procesar cada detalle de venta

      for (const detalle of createVentaDto.detalles) {
        console.log('Procesando detalle:', detalle);

        // Buscar el producto correspondiente al detalle
        const producto = await this.productoRepository.findOne({
          where: { id: detalle.idProducto },
        });

        if (!producto) {
          console.log(`Producto con ID ${detalle.idProducto} no encontrado`);
          throw new NotFoundException(
            `Producto con ID ${detalle.idProducto} no encontrado`,
          );
        }
        console.log('Producto encontrado:', producto);

        const cantidadNum = Number(detalle.cantidad);
        if (isNaN(cantidadNum) || cantidadNum <= 0) {
          console.log(
            `Cantidad inválida para el producto ${producto.nombre}:`,
            detalle.cantidad,
          );
          throw new BadRequestException(
            `La cantidad para el producto ${producto.nombre} debe ser un número positivo`,
          );
        }
          // Verificar stock del producto antes de crear el detalle de venta

        if (producto.stock < cantidadNum) {
          console.log(
            `Stock insuficiente para el producto ${producto.nombre}. Stock actual: ${producto.stock}, solicitado: ${cantidadNum}`,
          );
          throw new BadRequestException(
            `Stock insuficiente para el producto ${producto.nombre}. Disponible: ${producto.stock}, Solicitado: ${cantidadNum}`,
          );
        }
          // Calcular subtotal y crear detalle de venta

        const precio = Number(producto.precio);
        const subtotal = precio * cantidadNum;

        console.log(
          `Creando detalle de venta para producto ${producto.nombre}: cantidad=${cantidadNum}, precio=${precio}, subtotal=${subtotal}`,
        );
        const nuevoDetalle = this.detalleVentaRepository.create({
          cantidad: cantidadNum,
          precioUnitario: precio,
          subtotal: subtotal,
          venta: { id: ventaGuardada.id },
          producto: { id: producto.id },
        });

        await queryRunner.manager.save(nuevoDetalle);
        console.log('Detalle de venta guardado:', nuevoDetalle);

        // Actualizar stock del producto después de crear el detalle de venta

        producto.stock -= cantidadNum;
        await queryRunner.manager.save(producto);
        console.log(
          `Stock actualizado para producto ${producto.nombre}: nuevo stock=${producto.stock}`,
        );
          // Actualizar total de la venta

        totalVenta += subtotal;
        console.log(
          `Subtotal sumado al totalVenta. Total actual: ${totalVenta}`,
        );
      }

      // Calcular cambio solo si montoPagado está definido
      if (
        createVentaDto.montoPagado !== undefined &&
        createVentaDto.montoPagado !== null
      ) {
        const montoPagado = Number(createVentaDto.montoPagado);
        if (montoPagado < totalVenta) {
          throw new BadRequestException(
            `El monto pagado (${montoPagado}) es menor al total de la venta (${totalVenta})`,
          );
        }
        const cambio = Number((montoPagado - totalVenta).toFixed(2));

        ventaGuardada.montoPagado = montoPagado;
        ventaGuardada.cambio = cambio;
        console.log('Monto pagado y cambio calculados:', {
          montoPagado,
          cambio,
        });
      }
          // guardar la venta total actualizada

      ventaGuardada.totalVenta = totalVenta;
      // mediante 
      await queryRunner.manager.save(ventaGuardada);
      console.log('Total de la venta actualizado:', totalVenta);

      await queryRunner.commitTransaction();
      console.log('Transacción confirmada. Venta creada exitosamente.');

      // Devolver la venta completa con detalles y cliente
      return this.obtenerVentaPorId(ventaGuardada.id);
    }
      catch (error) {
      console.log('Ocurrió un error durante la creación de la venta:', error);
      await queryRunner.rollbackTransaction();

      if (
        error instanceof NotFoundException ||
        error instanceof BadRequestException
      ) {
        throw error;
      }
      throw new InternalServerErrorException(
        'Error al procesar la venta: ' + error.message,
      );
    } finally {
      await queryRunner.release();
      console.log('QueryRunner liberado.');
    }
  }

  async anularVenta(id: number): Promise<Venta> {
    console.log(`Iniciando anulación de venta con ID: ${id}`);
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      const venta = await this.ventaRepository.findOne({
        where: { id },
        relations: ['ventadetalles', 'ventadetalles.producto'],
      });

      if (!venta) {
        console.log(`Venta con ID ${id} no encontrada para anular`);
        throw new NotFoundException(`La venta con ID ${id} no fue encontrada`);
      }

      if (venta.estado === 'anulada') {
        console.log(`La venta con ID ${id} ya está anulada`);
        throw new BadRequestException(`La venta con ID ${id} ya está anulada`);
      }

      const fechaAnulacion = new Date();

      console.log('Restaurando stock de productos de la venta...');
      for (const detalle of venta.ventadetalles) {
        const producto = await this.productoRepository.findOne({
          where: { id: detalle.producto.id },
        });

        if (producto) {
          const cantidadNum = Number(detalle.cantidad);
          if (!isNaN(cantidadNum)) {
            producto.stock += cantidadNum;
            await queryRunner.manager.save(producto);
            console.log(
              `Stock restaurado para producto ${producto.nombre}: nuevo stock=${producto.stock}`,
            );
          } else {
            console.log(
              `Cantidad inválida en detalle de venta para producto ID ${producto.id}`,
            );
          }
        } else {
          console.log(
            `Producto con ID ${detalle.producto.id} no encontrado al restaurar stock`,
          );
        }

        // Actualizar fechaAnulacion en el detalle
        detalle.fechaAnulacion = fechaAnulacion;
        await queryRunner.manager.save(detalle);
      }

      venta.estado = 'anulada';
      venta.totalVenta = 0;
      venta.fechaAnulacion = fechaAnulacion;
      await queryRunner.manager.save(venta);
      console.log(
        'Venta marcada como anulada, totalVenta puesto en 0 y fechaAnulacion actualizada',
      );

      await queryRunner.commitTransaction();
      console.log('Transacción de anulación confirmada.');

      return venta;
    } catch (error) {
      console.log('Ocurrió un error durante la anulación de la venta:', error);
      await queryRunner.rollbackTransaction();

      if (
        error instanceof NotFoundException ||
        error instanceof BadRequestException
      ) {
        throw error;
      }
      throw new InternalServerErrorException(
        'Error al anular la venta: ' + error.message,
      );
    } finally {
      await queryRunner.release();
      console.log('QueryRunner liberado tras anulación.');
    }
  }

  async limpiarVentasAnuladas(): Promise<{
    cantidadRegistrosEliminados: number;
    mensaje?: string;
  }> {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      // Buscar ventas anuladas
      const ventasAnuladas = await this.ventaRepository.find({
        where: { estado: 'anulada' },
        relations: ['ventadetalles'],
      });

      if (ventasAnuladas.length === 0) {
        return {
          cantidadRegistrosEliminados: 0,
          mensaje: 'No se encontraron ventas anuladas para eliminar.',
        };
      }

      // Soft-remove detalles de cada venta anulada
      let detallesEliminados = 0;
      for (const venta of ventasAnuladas) {
        if (venta.ventadetalles && venta.ventadetalles.length > 0) {
          for (const detalle of venta.ventadetalles) {
            await queryRunner.manager.softRemove(DetalleVenta, detalle);
            detallesEliminados++;
          }
        }
        // Soft-remove la venta anulada
        await queryRunner.manager.softRemove(Venta, venta);
      }

      await queryRunner.commitTransaction();

      return {
        cantidadRegistrosEliminados: ventasAnuladas.length,
        mensaje: `Ventas anuladas eliminadas (soft): ${ventasAnuladas.length}, detalles eliminados (soft): ${detallesEliminados}`,
      };
    } catch (error) {
      await queryRunner.rollbackTransaction();
      throw new InternalServerErrorException(
        'Error al limpiar ventas anuladas: ' + error.message,
      );
    } finally {
      await queryRunner.release();
    }
  }

  async softRemoveVenta(id: number): Promise<{ mensaje: string }> {
    console.log(`Iniciando eliminación suave de venta con ID: ${id}`);

    const venta = await this.ventaRepository.findOne({
      where: { id },
      relations: ['ventadetalles'],
    });

    if (!venta) {
      console.log(`Venta con ID ${id} no encontrada para eliminación suave`);
      throw new NotFoundException(`La venta con ID ${id} no fue encontrada`);
    }

    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      // Soft-remove detalles de la venta
      if (venta.ventadetalles && venta.ventadetalles.length > 0) {
        for (const detalle of venta.ventadetalles) {
          await queryRunner.manager.softRemove(DetalleVenta, detalle);
        }
      }

      // Soft-remove la venta
      await queryRunner.manager.softRemove(Venta, venta);

      await queryRunner.commitTransaction();
      console.log(`Venta con ID ${id} eliminada exitosamente (soft)`);

      return { mensaje: `Venta con ID ${id} eliminada exitosamente` };
    } catch (error) {
      console.log('Error durante la eliminación suave de la venta:', error);
      await queryRunner.rollbackTransaction();
      throw new InternalServerErrorException(
        'Error al eliminar la venta: ' + error.message,
      );
    } finally {
      await queryRunner.release();
    }
  }

  // Método para actualizar una venta existente

  async updateVenta(id: number, updateVentaDto: any): Promise<Venta> {
    console.log(`Actualizando venta con ID: ${id}`, updateVentaDto);

    // buscar la venta existente con sus relaciones
    const venta = await this.ventaRepository.findOne({
      where: { id },
      relations: ['cliente', 'ventadetalles', 'ventadetalles.producto'],
    });

    if (!venta) {
      console.log(`Venta con ID ${id} no encontrada para actualizar`);
      throw new NotFoundException(`La venta con ID ${id} no fue encontrada`);
    }

    // Actualizar estado y fechas correspondientes
    if (updateVentaDto.estado) {
      const estadoAnterior = venta.estado;
      venta.estado = updateVentaDto.estado;
      
      // Registrar fechas según el nuevo estado
      const ahora = new Date();
      if (updateVentaDto.estado === 'confirmado' && !venta.fechaConfirmacion) {
        venta.fechaConfirmacion = ahora;
      }
      if (updateVentaDto.estado === 'enviado' && !venta.fechaEnvio) {
        venta.fechaEnvio = ahora;

        if (!venta.numeroSeguimiento) {

           //  INSTRUCCION  para Generar número de seguimiento si no existe

          venta.numeroSeguimiento = `RAM-${Date.now().toString(36).toUpperCase()}`;
        }
      }
      if (updateVentaDto.estado === 'entregado' && !venta.fechaEntrega) {
        venta.fechaEntrega = ahora;
      }
    }

    // Actualizar número de seguimiento manualmente si se proporciona en el DTO
    if (updateVentaDto.numeroSeguimiento) {
      venta.numeroSeguimiento = updateVentaDto.numeroSeguimiento;
    }

    // guarda los cambios de la venta actualizada
    const ventaActualizada = await this.ventaRepository.save(venta);
    console.log(`Venta con ID ${id} actualizada exitosamente`);

    return this.obtenerVentaPorId(ventaActualizada.id);
  }
    // Método para cambiar el estado de una venta existente
  async cambiarEstadoVenta(id: number, nuevoEstado: string): Promise<Venta> {
    console.log(`cambiarEstadoVenta: id=${id}, nuevoEstado=${nuevoEstado}`);
    
    const venta = await this.ventaRepository.findOne({
      where: { id },
      relations: ['cliente', 'ventadetalles', 'ventadetalles.producto'],
    });

    if (!venta) {
      console.log(`Venta con ID ${id} no encontrada para cambiar estado`);
      throw new NotFoundException(`La venta con ID ${id} no fue encontrada`);
    }

    // actualiza el estado de la venta y registra las fechas correspondientes según el nuevo estado
    venta.estado = nuevoEstado;
    const ahora = new Date();
    if (nuevoEstado === 'confirmado' && !venta.fechaConfirmacion) {
      venta.fechaConfirmacion = ahora;
    }
    if (nuevoEstado === 'enviado' && !venta.fechaEnvio) {
      venta.fechaEnvio = ahora;

      if (!venta.numeroSeguimiento) {
        venta.numeroSeguimiento = `RAM-${Date.now().toString(36).toUpperCase()}`;
      }
    }
    if (nuevoEstado === 'entregado' && !venta.fechaEntrega) {
      venta.fechaEntrega = ahora;
    }
    // guarda los cambios de la venta actualizada
    const guardado = await this.ventaRepository.save(venta);
    console.log('Estado de venta actualizado:', guardado.estado);
    return this.obtenerVentaPorId(guardado.id);
  }

  async marcarVentaEntregada(id: number, idUsuario: number): Promise<Venta> {
    const venta = await this.ventaRepository.findOne({
      where: { id },
      relations: ['cliente', 'ventadetalles', 'ventadetalles.producto'],
    });

    if (!venta) {
      throw new NotFoundException(`La venta con ID ${id} no fue encontrada`);
    }

    if (!venta.cliente || venta.cliente.id !== idUsuario) {
      throw new ForbiddenException('No tienes permiso para marcar este pedido como recibido');
    }

    if (venta.estado !== 'enviado') {
      throw new BadRequestException('Solo se puede marcar como recibido un pedido que está en estado "enviado".');
    }

    venta.estado = 'entregado';
    if (!venta.fechaEntrega) {
      venta.fechaEntrega = new Date();
    }

    const guardado = await this.ventaRepository.save(venta);
    return this.obtenerVentaPorId(guardado.id);
  }
}
