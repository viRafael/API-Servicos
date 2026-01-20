import { Module, forwardRef } from '@nestjs/common';
import { BookingService } from './booking.service';
import { BookingController } from './booking.controller';
import { PrismaModule } from 'src/common/prisma/prisma.module';
import jwtConfig from 'src/auth/config/jwt.config';
import { JwtModule } from '@nestjs/jwt';
import { ConfigModule } from '@nestjs/config';
import { MailModule } from 'src/common/mail/mail.module';
import { PaymentModule } from 'src/payment/payment.module';
import { GoogleCalendarModule } from 'src/google-calendar/google-calendar.module';

@Module({
  imports: [
    PrismaModule,
    PaymentModule,
    ConfigModule.forFeature(jwtConfig),
    JwtModule.registerAsync(jwtConfig.asProvider()),
    forwardRef(() => MailModule),
    GoogleCalendarModule,
  ],
  controllers: [BookingController],
  providers: [BookingService],
  exports: [BookingService],
})
export class BookingModule {}
