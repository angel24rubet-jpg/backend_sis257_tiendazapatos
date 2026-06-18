import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  ManyToMany,
  JoinTable,
  UpdateDateColumn,
  CreateDateColumn,
  JoinColumn,
  OneToMany,
  DeleteDateColumn,
} from 'typeorm';
import { Categoria } from '../../categorias/entities/categoria.entity';
import { Marca } from '../../marcas/entities/marca.entity';
import { Color } from '../../colores/entities/color.entity';
import { DetalleVenta } from 'src/ventas/entities/detalle_venta.entity';

@Entity('productos')
export class Producto {
  @PrimaryGeneratedColumn('identity')
  id: number;

  @Column()
  nombre: string;

  @Column()
  descripcion: string;

  @Column('decimal', { precision: 10, scale: 2 })
  precio: number;

  @Column()
  stock: number;

  @Column('simple-array', { nullable: true })
  tallas: string[];

  @ManyToMany(() => Color, { eager: true })
  @JoinTable({
    name: 'productos_colores',
    joinColumn: { name: 'id_producto', referencedColumnName: 'id' },
    inverseJoinColumn: { name: 'id_color', referencedColumnName: 'id' },
  })
  colores: Color[];

  @Column({ type: 'varchar', length: 20, default: 'unisex' })
  genero: string;

  @Column()
  imagenes: string;

  @CreateDateColumn({ name: 'fecha_creacion' })
  fechaCreacion: Date;

  @UpdateDateColumn({ name: 'fecha_modificacion' })
  fechaModificacion: Date;

  @DeleteDateColumn({ name: 'fecha_eliminacion' })
  fechaEliminacion: Date;

  @Column({ name: 'id_categoria' })
  idCategoria: number;

  // Relación con la entidad MARCA

  @Column({ name: 'id_marca',nullable: true,})
  idMarca: number;

  @ManyToOne(() => Categoria, (categoria) => categoria.productos)
  @JoinColumn({ name: 'id_categoria', referencedColumnName: 'id' })
  categoria: Categoria;

  @ManyToOne(() => Marca, { eager: true, nullable: true })
  @JoinColumn({ name: 'id_marca', referencedColumnName: 'id' })
  marca: Marca;

  @OneToMany(() => DetalleVenta, (ventadetalle) => ventadetalle.producto)
  ventadetalles: DetalleVenta[];
}
