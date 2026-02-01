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
  Query,
} from '@nestjs/common';
import { AvailabilityService } from './availability.service';
import { CreateAvailabilityDto } from './dto/create-availability.dto';
import { UpdateAvailabilityDto } from './dto/update-availability.dto';
import { AuthTokenGuard } from 'src/auth/guards/auth-token.guard';
import { RoleGuard } from 'src/auth/guards/role.guard';
import { TokenPayloadParam } from 'src/auth/params/token-payload.param';
import { TokenPayloadDto } from 'src/auth/dto/token-payload.dto';
import { SetRoleAccess } from 'src/auth/decorator/set-role.decorator';
import { Roles } from 'src/auth/enum/roles.enum';

@Controller('availability')
export class AvailabilityController {
  constructor(private readonly availabilityService: AvailabilityService) {}

  @SetRoleAccess(Roles.PROVIDER)
  @UseGuards(AuthTokenGuard, RoleGuard)
  @Post()
  create(
    @TokenPayloadParam() tokenPayload: TokenPayloadDto,
    @Body() createAvailabilityDto: CreateAvailabilityDto,
  ) {
    return this.availabilityService.create(
      tokenPayload.sub,
      createAvailabilityDto,
    );
  }

  @Get()
  findAll(@Query('providerId', ParseIntPipe) providerId: number) {
    return this.availabilityService.findAll(providerId);
  }

  @SetRoleAccess(Roles.PROVIDER)
  @UseGuards(AuthTokenGuard, RoleGuard)
  @Get('my-availabilities')
  findMyAvailabilities(@TokenPayloadParam() tokenPayload: TokenPayloadDto) {
    return this.availabilityService.findMyAvailabilities(tokenPayload.sub);
  }

  @SetRoleAccess(Roles.PROVIDER)
  @UseGuards(AuthTokenGuard, RoleGuard)
  @Patch(':id')
  updateProviderAvailability(
    @TokenPayloadParam() tokenPayload: TokenPayloadDto,
    @Param('id', ParseIntPipe) id: number,
    @Body() updateAvailabilityDto: UpdateAvailabilityDto,
  ) {
    return this.availabilityService.update(
      tokenPayload.sub,
      id,
      updateAvailabilityDto,
    );
  }
  @SetRoleAccess(Roles.PROVIDER)
  @UseGuards(AuthTokenGuard, RoleGuard)
  @Delete(':id')
  removeProviderAvailability(
    @TokenPayloadParam() tokenPayload: TokenPayloadDto,
    @Param('id', ParseIntPipe) id: number,
  ) {
    return this.availabilityService.remove(tokenPayload.sub, id);
  }
}
