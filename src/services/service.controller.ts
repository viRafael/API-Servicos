import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  ParseIntPipe,
  UseGuards,
} from '@nestjs/common';
import { ServiceService } from './service.service';
import { CreateServiceDto } from './dto/create-service.dto';
import { UpdateServiceDto } from './dto/update-service.dto';
import { AuthTokenGuard } from 'src/auth/guards/auth-token.guard';
import { TokenPayloadParam } from 'src/auth/params/token-payload.param';
import { TokenPayloadDto } from 'src/auth/dto/token-payload.dto';
import { RoleGuard } from 'src/auth/guards/role.guard';
import { SetRoleAccess } from 'src/auth/decorator/set-role.decorator';
import { Roles } from 'src/auth/enum/roles.enum';
import { Public } from 'src/auth/decorator/public.decorator';

@Controller('service')
export class ServiceController {
  constructor(private readonly serviceService: ServiceService) {}

  @SetRoleAccess(Roles.PROVIDER)
  @UseGuards(AuthTokenGuard, RoleGuard)
  @Post()
  create(
    @TokenPayloadParam() tokenPayload: TokenPayloadDto,
    @Body() createServiceDto: CreateServiceDto,
  ) {
    return this.serviceService.create(tokenPayload.sub, createServiceDto);
  }

  @Public()
  @UseGuards(AuthTokenGuard, RoleGuard)
  @Get('all-services')
  findAll() {
    return this.serviceService.findAll();
  }

  @Public()
  @UseGuards(AuthTokenGuard, RoleGuard)
  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.serviceService.findOne(id);
  }

  @SetRoleAccess(Roles.PROVIDER)
  @UseGuards(AuthTokenGuard, RoleGuard)
  @Patch(':id')
  update(
    @Param('id', ParseIntPipe) id: number,
    @TokenPayloadParam() tokenPayload: TokenPayloadDto,
    @Body() updateServiceDto: UpdateServiceDto,
  ) {
    return this.serviceService.update(id, tokenPayload.sub, updateServiceDto);
  }

  @SetRoleAccess(Roles.PROVIDER)
  @UseGuards(AuthTokenGuard, RoleGuard)
  @Delete(':id')
  remove(
    @Param('id', ParseIntPipe) id: number,
    @TokenPayloadParam() tokenPayload: TokenPayloadDto,
  ) {
    return this.serviceService.remove(id, tokenPayload.sub);
  }

  @SetRoleAccess(Roles.CLIENT)
  @UseGuards(AuthTokenGuard, RoleGuard)
  @Patch(':id/toggle-active')
  toggleIsActive(
    @Param('id', ParseIntPipe) id: number,
    @TokenPayloadParam() tokenPayload: TokenPayloadDto,
  ) {
    return this.serviceService.toggleIsActive(id, tokenPayload.sub);
  }
}
