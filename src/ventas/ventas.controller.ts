import {
  Controller,
  Get,
  Post,
  Param,
  Body,
  Delete,
  Patch,
  ParseIntPipe,
  UseGuards,
  Req,
} from '@nestjs/common';
import { ApiTags, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { AuthGuard } from '@nestjs/passport';
import { VentasService } from './ventas.service';
import { CreateVentaDto } from './dto/create-venta.dto';
import { UpdateVentaDto } from './dto/update-venta.dto';
import { Venta } from './entities/venta.entity';
import { Roles } from '../auth/decorators/roles.decorator';
import { RolesGuard } from '../auth/guards/roles.guard';

@ApiTags('Ventas')
@Controller('ventas')
export class VentasController {
  constructor(private readonly ventasService: VentasService) {}

  @Get()
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles('admin')
  @ApiResponse({ status: 200, description: 'Lista de todas las ventas' })
  async obtenerVentas() {
    return this.ventasService.obtenerVentas();
  }

  @Get('mis-pedidos')
  @UseGuards(AuthGuard('jwt'))
  @ApiResponse({ status: 200, description: 'Lista de pedidos del cliente logueado' })
  async obtenerMisPedidos(@Req() req: any) {
    const usuario = req.user;
    return this.ventasService.obtenerVentasPorUsuario(usuario.id);
  }

  @Get(':id')
  @UseGuards(AuthGuard('jwt'))
  @ApiResponse({ status: 200, description: 'Detalle de una venta específica' })
  @ApiResponse({ status: 404, description: 'Venta no encontrada' })
  async obtenerVentaPorId(@Param('id') id: number): Promise<Venta> {
    return this.ventasService.obtenerVentaPorId(id);
  }

  @Get(':id/detalles')
  @UseGuards(AuthGuard('jwt'))
  @ApiResponse({ status: 200, description: 'Detalles de una venta específica' })
  @ApiResponse({ status: 404, description: 'Detalles no encontrados' })
  async obtenerVentaDetalles(@Param('id') id: number) {
    return this.ventasService.obtenerVentaDetalles(id);
  }
  // Rutas para crear, actualizar y anular ventas
  @Post()
  @UseGuards(AuthGuard('jwt'))
  @ApiResponse({ status: 201, description: 'Venta creada exitosamente' })
  @ApiResponse({ status: 400, description: 'Datos inválidos o error de stock' })
  async crearVenta(@Body() createVentaDto: CreateVentaDto): Promise<Venta> {

    return this.ventasService.crearVenta(createVentaDto);
  }

  @Patch(':id')
  @UseGuards(AuthGuard('jwt'))
  @ApiResponse({ status: 200, description: 'Venta actualizada exitosamente' })
  @ApiResponse({ status: 404, description: 'Venta no encontrada' })
  async actualizarVenta(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateVentaDto: UpdateVentaDto,
  ): Promise<Venta> {
    return this.ventasService.updateVenta(id, updateVentaDto);
  }

  @Patch(':id/estado')
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles('admin')
  @ApiResponse({ status: 200, description: 'Estado de la venta actualizado' })
  async actualizarEstado(
    @Param('id', ParseIntPipe) id: number,
    @Body('estado') estado: string,
  ): Promise<Venta> {
    return this.ventasService.cambiarEstadoVenta(id, estado);
  }

  @Patch(':id/recibido')
  @UseGuards(AuthGuard('jwt'))
  @ApiResponse({ status: 200, description: 'Pedido marcado como recibido por el cliente' })
  async marcarRecibido(
    @Param('id', ParseIntPipe) id: number,
    @Req() req: any,
  ): Promise<Venta> {
    const usuario = req.user;
    return this.ventasService.marcarVentaEntregada(id, usuario.id);
  }

  @Patch(':id/soft-remove')
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles('admin')
  @ApiResponse({
    status: 200,
    description: 'Venta eliminada exitosamente (soft)',
  })
  @ApiResponse({ status: 404, description: 'Venta no encontrada' })
  async softRemoveVenta(
    @Param('id', ParseIntPipe) id: number,
  ): Promise<{ mensaje: string }> {
    return this.ventasService.softRemoveVenta(id);
  }

  @Delete(':id')
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles('admin')
  @ApiResponse({ status: 200, description: 'Venta anulada exitosamente' })
  @ApiResponse({ status: 404, description: 'Venta no encontrada' })
  @ApiResponse({ status: 400, description: 'La venta ya está anulada' })
  @ApiResponse({ status: 500, description: 'Error al anular la venta' })
  async anularVentaPorId(
    @Param('id', ParseIntPipe) id: number,
  ): Promise<Venta> {
    return this.ventasService.anularVenta(id);
  }

  @Delete()
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles('admin')
  @ApiResponse({
    status: 200,
    description: 'Ventas anuladas eliminadas exitosamente',
  })
  @ApiResponse({ status: 500, description: 'Error al limpiar ventas anuladas' })
  async limpiarAnuladas(): Promise<{ cantidadRegistrosEliminados: number }> {
    return this.ventasService.limpiarVentasAnuladas();
  }
}
