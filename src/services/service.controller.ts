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

@Controller('service')
export class ServiceController {
  constructor(private readonly serviceService: ServiceService) {}

  @UseGuards(AuthTokenGuard)
  @Post()
  create(
    @TokenPayloadParam() tokenPayload: TokenPayloadDto,
    @Body() createServiceDto: CreateServiceDto,
  ) {
    return this.serviceService.create(tokenPayload.sub, createServiceDto);
  }

  @Get('all-services')
  findAll() {
    return this.serviceService.findAll();
  }

  @UseGuards(AuthTokenGuard, RoleGuard)
  @SetRoleAccess(Roles.PROVIDER)
  @Get('my-services')
  findAllMyService(@TokenPayloadParam() tokenPayload: TokenPayloadDto) {
    return this.serviceService.findAllMyService(tokenPayload.sub);
  }

  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.serviceService.findOne(id);
  }

  @UseGuards(AuthTokenGuard)
  @Patch(':id')
  update(
    @Param('id', ParseIntPipe) id: number,
    @TokenPayloadParam() tokenPayload: TokenPayloadDto,
    @Body() updateServiceDto: UpdateServiceDto,
  ) {
    return this.serviceService.update(id, tokenPayload.sub, updateServiceDto);
  }

  @UseGuards(AuthTokenGuard)
  @Delete(':id')
  remove(
    @Param('id', ParseIntPipe) id: number,
    @TokenPayloadParam() tokenPayload: TokenPayloadDto,
  ) {
    return this.serviceService.remove(id, tokenPayload.sub);
  }

  @UseGuards(AuthTokenGuard)
  @Patch(':id/toggle-active')
  toggleIsActive(
    @Param('id', ParseIntPipe) id: number,
    @TokenPayloadParam() tokenPayload: TokenPayloadDto,
  ) {
    return this.serviceService.toggleIsActive(id, tokenPayload.sub);
  }
}
