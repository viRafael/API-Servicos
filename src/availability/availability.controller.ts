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
import { AvailabilityService } from './availability.service';
import { CreateAvailabilityDto } from './dto/create-availability.dto';
import { UpdateAvailabilityDto } from './dto/update-availability.dto';
import { AuthTokenGuard } from 'src/auth/guards/auth-token.guard';
import { Roles } from 'src/auth/enum/roles.enum';
import { SetRoleAccess } from 'src/auth/decorator/set-role.decorator';
import { RoleGuard } from 'src/auth/guards/role.guard';
import { TokenPayloadParam } from 'src/auth/params/token-payload.param';
import { TokenPayloadDto } from 'src/auth/dto/token-payload.dto';

@Controller('availability')
export class AvailabilityController {
  constructor(private readonly availabilityService: AvailabilityService) {}

  @SetRoleAccess(Roles.PROVIDER, Roles.ADMIN)
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

  @SetRoleAccess(Roles.PROVIDER, Roles.ADMIN)
  @UseGuards(AuthTokenGuard, RoleGuard)
  @Get()
  findMyAvailabilities(@TokenPayloadParam() tokenPayload: TokenPayloadDto) {
    return this.availabilityService.findMyAvailabilities(tokenPayload.sub);
  }

  @SetRoleAccess(Roles.PROVIDER, Roles.ADMIN)
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

  @SetRoleAccess(Roles.PROVIDER, Roles.ADMIN)
  @UseGuards(AuthTokenGuard, RoleGuard)
  @Delete(':id')
  removeProviderAvailability(
    @TokenPayloadParam() tokenPayload: TokenPayloadDto,
    @Param('id', ParseIntPipe) id: number,
  ) {
    return this.availabilityService.remove(tokenPayload.sub, id);
  }
}
