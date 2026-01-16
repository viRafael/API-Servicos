import { Injectable } from '@nestjs/common';
import * as nodemailer from 'nodemailer';
import { env } from 'src/utils/env-validator';
import { generalUseTemplate } from './template/general-use.template';
import { renderTemplate } from './template/render-template';

@Injectable()
export class MailService {
  private transporter: nodemailer.Transporter;

  constructor() {
    this.transporter = nodemailer.createTransport({
      host: env.MAIL_HOST,
      port: Number(env.MAIL_PORT),
      secure: false, // Gmail usa 587 (STARTTLS)
      auth: {
        user: env.MAIL_USER, // Seu email Gmail
        pass: env.MAIL_PASSWORD, // Senha de app (16 caracteres)
      },
      // Configurações específicas para Gmail
      tls: {
        rejectUnauthorized: false,
      },
    });
  }

  async sendEmail(to: string, from?: string, subject = 'Hello', html?: string) {
    const mailOptions = {
      from:
        from ||
        `${env.MAIL_FROM_NAME || 'Noreply'} <${env.MAIL_FROM_EMAIL || env.MAIL_USER}>`,
      to, // Destinatário
      subject, // Assunto
      html: html || generalUseTemplate,
    };

    await this.transporter.sendMail(mailOptions);
  }

  async sendBookingConfirmation(booking: any) {
    const html = renderTemplate('booking-confirmation', {
      clientName: booking.client.name,
      serviceName: booking.service.name,
      providerName: booking.provider.name,
      date: booking.date,
      time: booking.time,
      notes: booking.notes,
      platformUrl: env.PLATFORM_URL,
      year: new Date().getFullYear(),
    });

    await this.sendEmail(booking.client.email, 'Agendamento confirmado', html);
  }

  async sendCancellationNotice(booking: any) {
    const html = renderTemplate('booking-cancellation', {
      clientName: booking.client.name,
      serviceName: booking.service.name,
      date: booking.date,
      time: booking.time,
      cancellationReason: booking.cancellationReason,
      platformUrl: env.PLATFORM_URL,
      year: new Date().getFullYear(),
    });

    await this.sendEmail(booking.client.email, 'Agendamento cancelado', html);
  }

  async sendPaymentConfirmed(booking: any) {
    const html = renderTemplate('payment-confirmed', {
      clientName: booking.client.name,
      serviceName: booking.service.name,
      amount: booking.payment.amount,
      paymentMethod: booking.payment.method,
      paymentDate: booking.payment.date,
      platformUrl: env.PLATFORM_URL,
      year: new Date().getFullYear(),
    });

    await this.sendEmail(booking.client.email, 'Pagamento confirmado', html);
  }
}
