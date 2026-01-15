import { Body, Controller, Get, Patch, Post, UseGuards } from '@nestjs/common';
import { AuthService } from './auth.service';
import { LoginDto } from './dto/login.dto';
import { RegisterDto } from './dto/register.dto';
import { TokenPayloadParam } from './params/token-payload.param';
import { TokenPayloadDto } from './dto/token-payload.dto';
import { UsersService } from 'src/users/users.service';
import { AuthTokenGuard } from './guards/auth-token.guard';
import { UpdateUserDto } from 'src/users/dto/update-user.dto';
import { RefreshTokenDto } from './dto/refresh-token.dto';

@Controller('auth')
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly userService: UsersService,
  ) {}

  @Post('login')
  login(@Body() loginDto: LoginDto) {
    return this.authService.login(loginDto);
  }

  @Post('register')
  register(@Body() registerDto: RegisterDto) {
    return this.authService.register(registerDto);
  }

  @UseGuards(AuthTokenGuard)
  @Get('me')
  getUserInformation(@TokenPayloadParam() tokenPayload: TokenPayloadDto) {
    return this.userService.findOne(tokenPayload.sub);
  }

  @UseGuards(AuthTokenGuard)
  @Patch('me')
  patchUserInformation(
    @TokenPayloadParam() tokenPayload: TokenPayloadDto,
    @Body() updateUser: UpdateUserDto,
  ) {
    return this.userService.update(tokenPayload.sub, updateUser);
  }

  @Post('refresh')
  refreshToken(@Body() refreshTokenDto: RefreshTokenDto) {
    return this.authService.refreshToken(refreshTokenDto);
  }
}
