import { Module } from '@nestjs/common';
import { ReviewService } from './review.service';
import { ReviewController } from './review.controller';
import { PrismaModule } from 'src/common/prisma/prisma.module';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { JwtModule } from '@nestjs/jwt';
import jwtConfig from 'src/auth/config/jwt.config';

@Module({
  imports: [
    PrismaModule,
    ConfigModule.forFeature(jwtConfig),
    JwtModule.registerAsync({
      imports: [ConfigModule.forFeature(jwtConfig)],
      useFactory: async (config: ConfigService) => {
        return {
          secret: config.get('jwt.secret'),
          audience: config.get('jwt.audience'),
          issuer: config.get('jwt.issuer'),
          ttl: config.get('jwt.ttl'),
        };
      },
      inject: [ConfigService],
    }),
  ],
  controllers: [ReviewController],
  providers: [ReviewService],
})
export class ReviewModule {}
