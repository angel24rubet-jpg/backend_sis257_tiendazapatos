import { Cliente } from '../../clientes/entities/cliente.entity';
import { DetalleVenta } from './detalle_venta.entity';
import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  ManyToOne,
  OneToMany,
  JoinColumn,
  DeleteDateColumn,
} from 'typeorm';

@Entity('ventas')
export class Venta {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ name: 'total_venta', type: 'numeric', precision: 10, scale: 2 })
  totalVenta: number;

  @Column({
    name: 'metodo_pago',
    type: 'varchar',
    length: 50,
    enum: ['efectivo', 'tarjeta', 'transferencia', 'qr', 'cotización', 'otro'],
  })
  metodoPago: string;

  @Column({
    type: 'varchar',
    length: 20,
    default: 'pendiente',
    comment: 'Estado de la venta: pendiente, confirmado, en_preparacion, enviado, entregado, anulada',
  })
  estado: string;

  @Column({ name: 'numero_seguimiento', type: 'varchar', length: 50, nullable: true })
  numeroSeguimiento: string | null;

  @Column({ name: 'fecha_confirmacion', type: 'timestamp', nullable: true })
  fechaConfirmacion: Date | null;

  @Column({ name: 'fecha_envio', type: 'timestamp', nullable: true })
  fechaEnvio: Date | null;

  @Column({ name: 'fecha_entrega', type: 'timestamp', nullable: true })
  fechaEntrega: Date | null;

  @CreateDateColumn({ name: 'fecha_creacion' })
  fechaCreacion: Date;

  @DeleteDateColumn({ name: 'fecha_eliminacion' })
  fechaEliminacion: Date;

  @Column({ name: 'fecha_anulacion', type: 'timestamp', nullable: true })
  fechaAnulacion: Date | null;

  @Column({
    name: 'monto_pagado',
    type: 'numeric',
    precision: 10,
    scale: 2,
    default: 0,
    nullable: true,
  })
  montoPagado: number | null;

  @Column({
    name: 'cambio',
    type: 'numeric',
    precision: 10,
    scale: 2,
    default: 0,
    nullable: true,
  })
  cambio: number | null;

  //  muchas ventas puede realizar  un cliente
  @ManyToOne(() => Cliente, (cliente) => cliente.ventas)
  @JoinColumn({ name: 'id_cliente', referencedColumnName: 'id' })
  cliente: Cliente;

  @OneToMany(() => DetalleVenta, (detalleVenta) => detalleVenta.venta, {
    cascade: true,
  })
  ventadetalles: DetalleVenta[];
}
