import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UsuariosModule } from './usuarios/usuarios.module';
import { CategoriasModule } from './categorias/categorias.module';
import { VentasModule } from './ventas/ventas.module';
import { ClientesModule } from './clientes/clientes.module';
import { ProductosModule } from './productos/productos.module';
import { ColoresModule } from './colores/colores.module';
import { AuthModule } from './auth/auth.module';
import { MarcasModule } from './marcas/marcas.module';

@Module({
  imports: [
    ConfigModule.forRoot(),
    TypeOrmModule.forRoot({
      type: 'postgres',
      host: process.env.DB_HOST,
      port: Number(process.env.DB_PORT),
      username: process.env.DB_USERNAME,
      password: process.env.DB_PASSWORD,
      database: process.env.DB_NAME,
      entities: [__dirname + '/**/entities/*.{ts|js}'],
      synchronize: true,
      autoLoadEntities: true,
    }),
    UsuariosModule,
    CategoriasModule,
    ProductosModule,
    ColoresModule,
    ClientesModule,
    VentasModule,
    AuthModule,
    MarcasModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}

