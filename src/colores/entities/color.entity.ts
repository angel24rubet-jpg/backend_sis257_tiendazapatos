import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  DeleteDateColumn,
} from 'typeorm';

@Entity('colores')
export class Color {
  @PrimaryGeneratedColumn('identity')
  id: number;

  @Column({ length: 50 })
  nombre: string;

  @Column({ length: 7, nullable: true })
  codigoHex: string; // Ej: #FF5733

  @CreateDateColumn({ name: 'fecha_creacion' })
  fechaCreacion: Date;

  @UpdateDateColumn({ name: 'fecha_modificacion' })
  fechaModificacion: Date;

  @DeleteDateColumn({ name: 'fecha_eliminacion' })
  fechaEliminacion: Date;
}
