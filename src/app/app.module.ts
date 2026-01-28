import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from 'src/auth/auth.module';
import { BookingModule } from 'src/booking/booking.module';
import { PaymentModule } from 'src/payment/payment.module';
import { ReviewModule } from 'src/review/review.module';
import { ServiceModule } from 'src/services/service.module';
import { UsersModule } from 'src/users/users.module';
import { ConfigModule } from '@nestjs/config';
import { MailModule } from 'src/common/mail/mail.module';
import { BullModule } from '@nestjs/bullmq';
import { EventEmitterModule } from '@nestjs/event-emitter';
import { AvailabilityModule } from 'src/availability/availability.module';
import { WebhooksModule } from 'src/webhooks/webhooks.module';
import { GoogleCalendarModule } from 'src/google-calendar/google-calendar.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    EventEmitterModule.forRoot(),
    BullModule.forRoot({
      connection: {
        host: 'localhost',
        port: 6379,
      },
    }),
    AuthModule,
    BookingModule,
    PaymentModule,
    ReviewModule,
    ServiceModule,
    UsersModule,
    MailModule,
    AvailabilityModule,
    WebhooksModule,
    GoogleCalendarModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
