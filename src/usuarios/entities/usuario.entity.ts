import {
  BeforeInsert,
  BeforeUpdate,
  Column,
  CreateDateColumn,
  DeleteDateColumn,
  Entity,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import * as bcrypt from 'bcrypt';
import { Venta } from '../../ventas/entities/venta.entity';
import { OneToMany } from 'typeorm';

@Entity('usuarios')
export class Usuario {
  @PrimaryGeneratedColumn()
  id: number;

  @Column('varchar', { length: 50, nullable: false, name: 'nombre_usuario' })
  nombreUsuario: string;

  @Column('varchar', { length: 5000, nullable: true })
  clave: string;

  @Column('varchar', { length: 20, nullable: false, default: 'cliente' })
  rol: string;

  @CreateDateColumn({ name: 'fecha_creacion' })
  fechaCreacion: Date;

  @UpdateDateColumn({ name: 'fecha_modificacion' })
  fechaModificacion: Date;

  @DeleteDateColumn({ name: 'fecha_eliminacion' })
  fechaEliminacion: Date;

  @BeforeInsert()
  @BeforeUpdate()
  async hashPassword() {
    // Solo hashear si la clave fue modificada y no está ya hasheada
    if (this.clave && !this.clave.startsWith('$2a') && !this.clave.startsWith('$2b') && !this.clave.startsWith('$2x') && !this.clave.startsWith('$2y')) {
      const salt = await bcrypt.genSalt();
      this.clave = await bcrypt.hash(this.clave, salt);
    }
  }

  async validatePassword(plainPassword: string): Promise<boolean> {
    return bcrypt.compare(plainPassword, this.clave);
  }
}
