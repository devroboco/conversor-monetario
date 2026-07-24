import dotenv from 'dotenv';

dotenv.config();

interface EnvConfig {
  PORT: number;
  API_KEY: string;
}

const envConfig: EnvConfig = {
  PORT: parseInt(process.env.PORT || '3000', 10),
  API_KEY: process.env.API_KEY || '',
};

if (!envConfig.API_KEY) {
  throw new Error('CONFIG_ERROR: A variável de ambiente API_KEY não foi definida no arquivo .env.');
}

export default envConfig;