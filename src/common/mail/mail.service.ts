import { Injectable, Logger } from '@nestjs/common';
import * as nodemailer from 'nodemailer';
import { env } from 'src/utils/env-validator';
import { generalUseTemplate } from './template/general-use.template';
import { renderTemplate } from './template/render-template';
import { FullBooking } from 'src/booking/types/booking.type';
import SMTPTransport from 'nodemailer/lib/smtp-transport';

interface MailOptions {
  to: string;
  subject: string;
  html?: string;
  from?: string;
}

@Injectable()
export class MailService {
  private readonly logger = new Logger(MailService.name);
  private transporter: nodemailer.Transporter<SMTPTransport.SentMessageInfo>;

  constructor() {
    this.transporter = nodemailer.createTransport({
      host: env.MAIL_HOST,
      port: Number(env.MAIL_PORT),
      secure: false,
      auth: {
        user: env.MAIL_USER,
        pass: env.MAIL_PASSWORD,
      },
      tls: {
        rejectUnauthorized: false,
      },
    });
  }

  async sendEmail({ to, subject, html, from }: MailOptions) {
    const mailOptions = {
      from:
        from ||
        `${env.MAIL_FROM_NAME || 'Noreply'} <${env.MAIL_FROM_EMAIL || env.MAIL_USER}>`,
      to,
      subject,
      html: html || generalUseTemplate,
    };

    try {
      const info: SMTPTransport.SentMessageInfo =
        await this.transporter.sendMail(mailOptions);
      if (info && info.messageId) {
        this.logger.log(`Email sent to ${to}: ${info.messageId}`);
      }
    } catch (error) {
      this.logger.error(`Failed to send email to ${to}`, error);
    }

    console.log('chegou no fim');
  }

  async sendBookingConfirmation(booking: FullBooking) {
    try {
      const html = renderTemplate('booking-confirm', {
        clientName: booking.client.name,
        serviceName: booking.service.name,
        providerName: booking.provider.name,
        date: new Date(booking.startTime).toLocaleDateString(),
        time: new Date(booking.startTime).toLocaleTimeString(),
        notes: booking.notes,
        year: new Date().getFullYear(),
      });

      await this.sendEmail({
        to: booking.client.email,
        subject: 'Agendamento confirmado',
        html,
      });
    } catch (error) {
      this.logger.error(
        `Failed to send booking confirmation for booking ID: ${booking.id}`,
        error,
      );
    }
  }

  async sendCancellationNotice(booking: FullBooking, reason?: string) {
    try {
      const html = renderTemplate('booking-cancelation', {
        clientName: booking.client.name,
        serviceName: booking.service.name,
        date: new Date(booking.startTime).toLocaleDateString(),
        time: new Date(booking.startTime).toLocaleTimeString(),
        cancellationReason: reason || 'N/A',
        year: new Date().getFullYear(),
      });

      await this.sendEmail({
        to: booking.client.email,
        subject: 'Agendamento cancelado',
        html,
      });
    } catch (error) {
      this.logger.error(
        `Failed to send cancellation notice for booking ID: ${booking.id}`,
        error,
      );
    }
  }

  async sendPaymentConfirmed(booking: FullBooking) {
    if (!booking.payment) {
      this.logger.warn(
        `Payment information is missing for booking ID: ${booking.id}`,
      );
      return;
    }
    try {
      const html = renderTemplate('payment-confirmed', {
        clientName: booking.client.name,
        serviceName: booking.service.name,
        amount: booking.payment.amount,
        paymentMethod: booking.payment.paymentMethod,
        paymentDate: new Date(booking.payment.createdAt).toLocaleDateString(),
        year: new Date().getFullYear(),
      });

      await this.sendEmail({
        to: booking.client.email,
        subject: 'Pagamento confirmado',
        html,
      });
    } catch (error) {
      this.logger.error(
        `Failed to send payment confirmation for booking ID: ${booking.id}`,
        error,
      );
    }
  }
}
