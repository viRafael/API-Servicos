import {
  Body,
  Controller,
  Get,
  Patch,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { LoginDto } from './dto/login.dto';
import { RegisterDto } from './dto/register.dto';
import { TokenPayloadParam } from './params/token-payload.param';
import { TokenPayloadDto } from './dto/token-payload.dto';
import { UsersService } from 'src/users/users.service';
import { AuthTokenGuard } from './guards/auth-token.guard';
import { UpdateUserDto } from 'src/users/dto/update-user.dto';
import { RefreshTokenDto } from './dto/refresh-token.dto';
import { RequestPasswordReset } from './dto/request-password-resert.dto';
import { ResetPasswordDto } from './dto/reset-password.dto';
import { Public } from './decorator/public.decorator';
import { RoleGuard } from './guards/role.guard';

@Controller('auth')
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly userService: UsersService,
  ) {}

  @Public()
  @Post('login')
  login(@Body() loginDto: LoginDto) {
    return this.authService.login(loginDto);
  }

  @UseGuards(AuthTokenGuard, RoleGuard)
  @Post('/logout')
  logout(@TokenPayloadParam() tokenPayload: TokenPayloadDto) {
    return this.authService.logout(tokenPayload.sub);
  }

  @Public()
  @Post('register')
  register(@Body() registerDto: RegisterDto) {
    return this.authService.register(registerDto);
  }

  @UseGuards(AuthTokenGuard, RoleGuard)
  @Get('me')
  getUserInformation(@TokenPayloadParam() tokenPayload: TokenPayloadDto) {
    return this.userService.findOne(tokenPayload.sub);
  }

  @UseGuards(AuthTokenGuard, RoleGuard)
  @Patch('me')
  patchUserInformation(
    @TokenPayloadParam() tokenPayload: TokenPayloadDto,
    @Body() updateUser: UpdateUserDto,
  ) {
    return this.userService.update(
      tokenPayload.sub,
      tokenPayload.sub,
      updateUser,
    );
  }

  @Post('refresh')
  refreshToken(@Body() refreshTokenDto: RefreshTokenDto) {
    return this.authService.refreshToken(refreshTokenDto);
  }

  @Public()
  @Post('forgot-password')
  requestPasswordReset(@Body() requestPasswordDto: RequestPasswordReset) {
    return this.authService.sendForgetPasswordEmail(requestPasswordDto);
  }

  @Post('reset-password')
  resetPassword(
    @Query('token') token: string,
    @Body() resetPasswordDto: ResetPasswordDto,
  ) {
    return this.authService.resetPassword(token, resetPasswordDto);
  }
}
