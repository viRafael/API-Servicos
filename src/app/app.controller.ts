import { Controller, Get, Post } from '@nestjs/common';
import { AppService } from './app.service';
import { MailService } from 'src/common/mail/mail.service';

@Controller('app')
export class AppController {
  constructor(
    private readonly appService: AppService,
    private readonly mailService: MailService,
  ) {}

  @Get()
  getHello(): string {
    return this.appService.getHello();
  }

  @Post('test-email')
  async testEmail() {
    await this.mailService.sendEmail({
      to: 'rrl.vieira@hotmail.com',
      subject: 'OPA, ME ABRA - RAFAEL VIEIRA ',
    });

    return { ok: true };
  }
}
