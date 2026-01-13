import dotenv from 'dotenv';
import * as Joi from '@hapi/joi';

dotenv.config();

interface EnvVars {
  PORT: number;
  DATABASE_URL: string;

  JWT_SECRET: string;
  JWT_TOKEN_AUDIENCE: string;
  JWT_TOKEN_ISSUER: string;
  JWT_TTL: number;
  JWT_REFRESH_TTL: number;
}

const envSchema = Joi.object<EnvVars>({
  PORT: Joi.number().port().default(3000),
  DATABASE_URL: Joi.string().uri().required(),

  JWT_SECRET: Joi.string().required(),
  JWT_TOKEN_AUDIENCE: Joi.string().uri().required(),
  JWT_TOKEN_ISSUER: Joi.string().uri().required(),
  JWT_TTL: Joi.number().required(),
  JWT_REFRESH_TTL: Joi.number().required(),
})
  .unknown(true) // Permite outras variáveis de ambiente
  .required();

const validationResult = envSchema.validate(process.env, {
  abortEarly: false,
  convert: true,
});

if (validationResult.error) {
  const errorMessages = validationResult.error.details
    .map((detail) => detail.message)
    .join('\n');
  console.error('❌ Erro nas variáveis de ambiente:\n', errorMessages);
  process.exit(1);
}

export const env = validationResult.value as EnvVars;
