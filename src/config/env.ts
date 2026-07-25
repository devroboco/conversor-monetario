import dotenv from 'dotenv';

dotenv.config();

interface EnvConfig {
  PORT: number;
  API_KEY: string;
  REDIS_HOST: string;
  REDIS_PORT: number;
}

const envConfig: EnvConfig = {
  PORT: parseInt(process.env.PORT || '3000', 10),
  API_KEY: process.env.API_KEY || '',
  REDIS_HOST: process.env.REDIS_HOST || 'localhost',
  REDIS_PORT: parseInt(process.env.REDIS_PORT || '6379', 10),
};

if (!envConfig.API_KEY) {
  throw new Error('CONFIG_ERROR: A variável de ambiente API_KEY não foi definida no arquivo .env.');
}

export default envConfig;