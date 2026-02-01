import { Controller, Get, Query, Res, UseGuards } from '@nestjs/common';
import { GoogleCalendarService } from './google-calendar.service';
import type { Response } from 'express';
import { TokenPayloadParam } from 'src/auth/params/token-payload.param';
import { TokenPayloadDto } from 'src/auth/dto/token-payload.dto';
import { AuthTokenGuard } from 'src/auth/guards/auth-token.guard';
import { RoleGuard } from 'src/auth/guards/role.guard';
import { SetRoleAccess } from 'src/auth/decorator/set-role.decorator';
import { Roles } from 'src/auth/enum/roles.enum';

@Controller('google')
export class GoogleCalendarController {
  constructor(private readonly googleCalendarService: GoogleCalendarService) {}

  @SetRoleAccess(Roles.PROVIDER)
  @UseGuards(AuthTokenGuard, RoleGuard)
  @Get('auth')
  auth(@Res() res: Response) {
    const url = this.googleCalendarService.getAuthUrl();
    return res.redirect(url);
  }

  @SetRoleAccess(Roles.PROVIDER)
  @UseGuards(AuthTokenGuard, RoleGuard)
  @Get('callback')
  async callback(
    @Query('code') code: string,
    @Res() res: Response,
    @TokenPayloadParam() payload: TokenPayloadDto,
  ) {
    await this.googleCalendarService.handleOAuthCallback(code, payload.sub);
    return res.redirect('/dashboard');
  }
}
