import axios from 'axios';
import redisClient from '../config/redis.js';

const CACHE_TTL_SECONDS = 120;

export class InvalidCurrencyPairError extends Error {}
export class ExternalServiceError extends Error {}

interface ExchangeRateResult {
  rate: number;
  source: 'api' | 'cache';
}

export async function getExchangeRate(fromCurrency: string, toCurrency: string): Promise<ExchangeRateResult> {
  const from = fromCurrency.toUpperCase();
  const to = toCurrency.toUpperCase();
  const pairKey = `rate:${from}-${to}`;

  try {
    const cached = await redisClient.get(pairKey);
    if (cached) {
      return { rate: parseFloat(cached), source: 'cache' };
    }
  } catch (error) {
    console.warn(`[Redis Warning] Falha ao ler cache da chave ${pairKey}:`, (error as Error).message);
  }

  let response;
  try {
    response = await axios.get(
      `https://economia.awesomeapi.com.br/last/${from}-${to}`,
      { timeout: 5000 }
    );
  } catch (err: unknown) {
    if (axios.isAxiosError(err)) {
      const status = err.response?.status;
      if (status === 404 || status === 444) {
        throw new InvalidCurrencyPairError(`Par de moedas ${from}-${to} não encontrado`);
      }
    }
    throw new ExternalServiceError('Serviço de cotação externo indisponível');
  }

  const data = response.data?.[`${from}${to}`];
  if (!data || !data.bid) {
    throw new InvalidCurrencyPairError(`Par de moedas ${from}-${to} não encontrado`);
  }

  const rate = parseFloat(data.bid);

  try {
    await redisClient.set(pairKey, rate.toString(), 'EX', CACHE_TTL_SECONDS);
  } catch (error) {
    console.warn(`[Redis Warning] Falha ao salvar cache da chave ${pairKey}:`, (error as Error).message);
  }

  return { rate, source: 'api' };
}