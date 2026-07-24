import express from 'express';
import envConfig from './config/env.js';
import conversionRoutes from './routes/conversionRoutes.js';

const app = express();

app.use(express.json());

app.use('/api', conversionRoutes);

app.get('/health', (_req, res) => {
  res.status(200).json({ status: 'OK', timestamp: new Date().toISOString() });
});

app.listen(envConfig.PORT, () => {
  console.log(`Servidor rodando na porta ${envConfig.PORT}`);
  console.log(`Endpoint ativo: http://localhost:${envConfig.PORT}/api/convert`);
});