import { Venta } from 'src/ventas/entities/venta.entity';
import { Usuario } from '../../usuarios/entities/usuario.entity';
import {
  Column,
  CreateDateColumn,
  DeleteDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
  OneToMany,
} from 'typeorm';

@Entity('clientes')
export class Cliente {
  @PrimaryGeneratedColumn('identity')
  id: number;

  @Column({ type: 'varchar', length: 50, nullable: true })
  nombre?: string;

  @Column({ type: 'varchar', length: 50, nullable: true })
  apellido?: string;

  @Column({ type: 'varchar', length: 30, nullable: true })
  cedula?: string;

  @Column({ type: 'varchar', length: 20, nullable: true })
  genero?: string;

  @Column({ type: 'date', name: 'fecha_nacimiento', nullable: true })
  fechaNacimiento?: Date;

  @Column({ type: 'varchar', length: 30, nullable: true })
  telefono?: string;

  @Column({ type: 'varchar', length: 100, nullable: true })
  direccion?: string;

  @CreateDateColumn({ name: 'fecha_creacion' })
  fechaCreacion: Date;

  @UpdateDateColumn({ name: 'fecha_modificacion' })
  fechaModificacion: Date;

  @DeleteDateColumn({ name: 'fecha_eliminacion' })
  fechaEliminacion: Date;

  @OneToMany(() => Venta, (venta) => venta.cliente)
  ventas: Venta[];

  @Column({ name: 'id_usuario', type: 'int', nullable: true })
  idUsuario?: number;

  @ManyToOne(() => Usuario, { nullable: true })
  @JoinColumn({ name: 'id_usuario', referencedColumnName: 'id' })
  usuario?: Usuario;
}
