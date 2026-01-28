import { registerAs } from '@nestjs/config';
import { env } from 'src/utils/env-validator';

export default registerAs('jwt', () => {
  return {
    secret: env.JWT_SECRET,
    audience: env.JWT_TOKEN_AUDIENCE,
    issuer: env.JWT_TOKEN_ISSUER,
    jwtTtl: Number(env.JWT_TTL),
    jwtRefreshTtl: Number(env.JWT_REFRESH_TTL),
  };
});
