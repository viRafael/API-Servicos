import { Controller, Post } from '@nestjs/common';
import { MailService } from 'src/common/mail/mail.service';

@Controller('app')
export class AppController {
  constructor(private readonly mailService: MailService) {}

  @Post('test-email')
  async testEmail() {
    await this.mailService.sendEmail({
      to: 'mouravieira44@gmail.com',
      subject: 'TESTE - API SERVICE',
    });

    return { ok: true };
  }
}
