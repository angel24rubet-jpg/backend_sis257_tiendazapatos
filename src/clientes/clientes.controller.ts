import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  Req,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { ClientesService } from './clientes.service';
import { CreateClienteDto } from './dto/create-cliente.dto';
import { UpdateClienteDto } from './dto/update-cliente.dto';
import { Roles } from '../auth/decorators/roles.decorator';
import { RolesGuard } from '../auth/guards/roles.guard';


@Controller('clientes')
export class ClientesController {
  constructor(private readonly clientesService: ClientesService) {}

  @Post()
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles('admin')
  create(@Body() createClienteDto: CreateClienteDto) {
    return this.clientesService.create(createClienteDto);
  }

  @Get()
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles('admin')
  findAll() {
    return this.clientesService.findAll();
  }

  @Get('by-usuario/:id')
  @UseGuards(AuthGuard('jwt'))
  findByUsuario(@Param('id') id: string) {
    return this.clientesService.findByUsuario(+id);
  }

  @Get('me')
  @UseGuards(AuthGuard('jwt'))
  me(@Req() req: any) {
    const usuario = req.user;
    return this.clientesService.findByUsuario(usuario.id);
  }

  @Post('me')
  @UseGuards(AuthGuard('jwt'))
  createForMe(@Req() req: any, @Body() createClienteDto: CreateClienteDto) {
    const usuario = req.user;
    // ensure idUsuario is set to the authenticated user
    const dto = { ...createClienteDto, idUsuario: usuario.id } as CreateClienteDto;
    return this.clientesService.createForUsuario(usuario.id, dto);
  }

  @Get(':id')
  @UseGuards(AuthGuard('jwt'))
  findOne(@Param('id') id: string) {
    return this.clientesService.findOne(+id);
  }

  @Patch(':id')
  @UseGuards(AuthGuard('jwt'))
  update(@Param('id') id: string, @Body() updateClienteDto: UpdateClienteDto) {
    return this.clientesService.update(+id, updateClienteDto);
  }

  @Delete(':id')
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles('admin')
  remove(@Param('id') id: string) {
    return this.clientesService.remove(+id);
  }
}
