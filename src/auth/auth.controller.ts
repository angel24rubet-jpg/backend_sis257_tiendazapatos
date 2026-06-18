import { Body, Controller, HttpCode, HttpStatus, Post, Patch, Get, Param, UseGuards, Request } from '@nestjs/common';
import { AuthService } from './auth.service';
import { UsuariosService } from '../usuarios/usuarios.service';
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger';
import { AuthLoginDto } from './dto/auth-login.dto';
import { AuthRegisterDto } from './dto/auth-register.dto';
import { ChangePasswordDto } from './dto/change-password.dto';
import { JwtAuthGuard } from './guards/jwt-auth.guard';

@ApiTags('auth')
@ApiBearerAuth()
@Controller('auth')
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly usuariosService: UsuariosService,
  ) {}

  @Post('login')
  @HttpCode(HttpStatus.OK)
  async login(@Body() authLoginDto: AuthLoginDto): Promise<any> {
    return this.authService.login(authLoginDto);
  }

  @Post('register')
  @HttpCode(HttpStatus.CREATED)
  async register(@Body() authRegisterDto: AuthRegisterDto): Promise<any> {
    return this.authService.register(authRegisterDto);
  }

  @UseGuards(JwtAuthGuard)
  @Patch('change-password')
  @HttpCode(HttpStatus.OK)
  async changePassword(
    @Request() req: any,
    @Body() changePasswordDto: ChangePasswordDto,
  ): Promise<{ message: string }> {
    return this.authService.changePassword(req.user.id, changePasswordDto);
  }

  // Endpoint para promover usuario a admin (útil para desarrollo)
  @Get('promote-admin')
  @HttpCode(HttpStatus.OK)
  async promoteAdmin(): Promise<{ message: string }> {
    return this.usuariosService.promoteAdminUser();
  }

  // Endpoint para promover cualquier usuario a admin por nombre
  @Patch('make-admin/:nombreUsuario')
  @HttpCode(HttpStatus.OK)
  async makeAdmin(@Param('nombreUsuario') nombreUsuario: string): Promise<{ message: string; rol: string }> {
    const usuarios = await this.usuariosService.findAll();
    const usuario = usuarios.find(u => u.nombreUsuario.toLowerCase() === nombreUsuario.toLowerCase());
    
    if (!usuario) {
      return { message: `Usuario ${nombreUsuario} no encontrado`, rol: '' };
    }
    
    await this.usuariosService.update(usuario.id, { rol: 'admin' });
    return { message: `Usuario ${nombreUsuario} ahora es admin`, rol: 'admin' };
  }
}
