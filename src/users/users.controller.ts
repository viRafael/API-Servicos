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
import { UsersService } from './users.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { SetRoleAccess } from 'src/auth/decorator/set-role.decorator';
import { Roles } from 'src/auth/enum/roles.enum';
import { AuthTokenGuard } from 'src/auth/guards/auth-token.guard';
import { TokenPayloadParam } from 'src/auth/params/token-payload.param';
import { TokenPayloadDto } from 'src/auth/dto/token-payload.dto';
import { RoleGuard } from 'src/auth/guards/role.guard';

@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @SetRoleAccess(Roles.ADMIN)
  @UseGuards(AuthTokenGuard, RoleGuard)
  @Post()
  create(@Body() createUserDto: CreateUserDto) {
    return this.usersService.create(createUserDto);
  }

  @UseGuards(AuthTokenGuard)
  @Get()
  findAll() {
    return this.usersService.findAll();
  }

  @UseGuards(AuthTokenGuard)
  @Get('all-providers')
  findAllProviders() {
    return this.usersService.findAllProviders();
  }

  @UseGuards(AuthTokenGuard)
  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.usersService.findOne(id);
  }

  @SetRoleAccess(Roles.ADMIN)
  @UseGuards(AuthTokenGuard, RoleGuard)
  @Patch(':id')
  update(
    @TokenPayloadParam() tokenPayload: TokenPayloadDto,
    @Body() updateUserDto: UpdateUserDto,
    @Param('id', ParseIntPipe) id: number,
  ) {
    return this.usersService.update(tokenPayload.sub, id, updateUserDto);
  }

  @SetRoleAccess(Roles.ADMIN)
  @UseGuards(AuthTokenGuard, RoleGuard)
  @Delete(':id')
  remove(
    @TokenPayloadParam() tokenPayload: TokenPayloadDto,
    @Param('id', ParseIntPipe) idToDelete: number,
  ) {
    return this.usersService.remove(tokenPayload.sub, idToDelete);
  }
}
