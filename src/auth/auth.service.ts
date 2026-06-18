import { Injectable, UnauthorizedException, ConflictException, InternalServerErrorException, BadRequestException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { Usuario } from 'src/usuarios/entities/usuario.entity';
import { UsuariosService } from 'src/usuarios/usuarios.service';
import { ClientesService } from 'src/clientes/clientes.service';
import { DataSource, Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { Cliente } from 'src/clientes/entities/cliente.entity';
import { AuthLoginDto } from './dto/auth-login.dto';
import { AuthRegisterDto } from './dto/auth-register.dto';
import { ChangePasswordDto } from './dto/change-password.dto';
import { JwtPayload } from './interfaces/jwt-payload.interface';
import * as bcrypt from 'bcrypt';

@Injectable()
export class AuthService {
  constructor(
    private usuarioService: UsuariosService,
    private jwtService: JwtService,
    private clientesService: ClientesService,
    private dataSource: DataSource,
  ) {}
  async login(authLoginDto: AuthLoginDto): Promise<any> {
    const { nombreUsuario, clave } = authLoginDto;
    const usuarioOk = await this.usuarioService.validate(nombreUsuario, clave);

    const payload = { sub: usuarioOk.id };
    const access_token = this.getAccessToken(payload);

    return { ...usuarioOk, access_token };
  }

  async register(authRegisterDto: AuthRegisterDto): Promise<any> {
    const { nombreUsuario, clave, nombre, apellido, cedula, genero, fechaNacimiento, telefono, direccion, rol } =
      authRegisterDto;

    // Use a transaction so we don't leave an orphan Usuario if Cliente creation fails
    try {
      const result = await this.dataSource.transaction(async (manager) => {
        const usuarioRepo = manager.getRepository(Usuario);
        const clienteRepo = manager.getRepository(Cliente);

        const existe = await usuarioRepo.findOneBy({ nombreUsuario: nombreUsuario.trim() });
        if (existe) {
          throw new ConflictException('El usuario ya existe');
        }

        // Determinar el rol (admin o cliente)
        const rolFinal = rol || 'cliente';

        // Hash la contraseña MANUALMENTE antes de crear el usuario
        const claveAHashear = clave ?? (process.env.DEFAULT_PASSWORD ?? '');
        const salt = await bcrypt.genSalt();
        const claveHasheada = await bcrypt.hash(claveAHashear, salt);

        const nuevoUsuario = usuarioRepo.create({ 
          nombreUsuario: nombreUsuario.trim(), 
          clave: claveHasheada,
          rol: rolFinal
        });
        const usuarioGuardado = await usuarioRepo.save(nuevoUsuario);

        // Solo crear registro de Cliente si el rol es 'cliente'
        let clienteGuardado: Cliente | null = null;
        if (rolFinal === 'cliente') {
          const cliente = clienteRepo.create({ 
            nombre: nombre?.trim(), 
            apellido: apellido?.trim(),
            cedula: cedula?.trim(),
            genero: genero?.trim(),
            fechaNacimiento: fechaNacimiento ? new Date(fechaNacimiento) : undefined,
            telefono: telefono?.trim(), 
            direccion: direccion?.trim(), 
            idUsuario: usuarioGuardado.id 
          });
          clienteGuardado = await clienteRepo.save(cliente);
        }

        return { usuario: usuarioGuardado, cliente: clienteGuardado };
      });

      const usuario = result.usuario as Usuario;
      const cliente = result.cliente;
      const payload = { sub: usuario.id };
      const access_token = this.getAccessToken(payload);

      usuario.clave = '';
      return { usuario, cliente, access_token };
    } catch (err: any) {
      if (err instanceof ConflictException) throw err;
      console.error('Error en AuthService.register:', err);
      // Re-throw with the inner message to surface DB/validation issues to the client for debugging
      throw new InternalServerErrorException(err?.message || 'Error al crear cuenta');
    }
  }

  getAccessToken(payload: any) {
    const accessToken = this.jwtService.sign(payload, {
      secret: process.env.JWT_TOKEN,
      expiresIn: process.env.JWT_TOKEN_EXPIRATION,
    });
    return accessToken;
  }

  async verifyPayload(payload: JwtPayload): Promise<Usuario> {
    let usuario: Usuario;

    try {
      usuario = await this.usuarioService.findOne(payload.sub);
    } catch {
      throw new UnauthorizedException(`Usuario inválido: ${payload.sub}`);
    }

    return usuario;
  }

  async changePassword(userId: number, changePasswordDto: ChangePasswordDto): Promise<{ message: string }> {
    const { claveActual, claveNueva } = changePasswordDto;

    // Obtener el usuario con la clave
    const usuario = await this.usuarioService.findOne(userId);
    if (!usuario) {
      throw new UnauthorizedException('Usuario no encontrado');
    }

    // Verificar la contraseña actual
    const isPasswordValid = await usuario.validatePassword(claveActual);
    if (!isPasswordValid) {
      throw new BadRequestException('La contraseña actual es incorrecta');
    }

    // Actualizar la contraseña (el hook @BeforeUpdate se encarga del hash)
    usuario.clave = claveNueva;
    await this.dataSource.manager.save(usuario);

    return { message: 'Contraseña actualizada correctamente' };
  }
}
