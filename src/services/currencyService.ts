import axios from 'axios';

interface AwesomeApiResponse {
  [key: string]: {
    code: string;
    codein: string;
    name: string;
    high: string;
    low: string;
    varBid: string;
    pctChange: string;
    bid: string;
    ask: string;
    timestamp: string;
    create_date: string;
  };
}

interface CacheEntry {
  rate: number;
  timestamp: number;
}

export interface ExchangeRateResult {
  rate: number;
  source: 'api' | 'cache';
}

export class InvalidCurrencyPairError extends Error {}
export class ExternalServiceError extends Error {}

const CACHE_TTL_MS = 2 * 60 * 1000; 
const cache = new Map<string, CacheEntry>();

export async function getExchangeRate(from: string, to: string): Promise<ExchangeRateResult> {
  const pairKey = `${from}-${to}`;
  const cached = cache.get(pairKey);

  if (cached && Date.now() - cached.timestamp < CACHE_TTL_MS) {
    return { rate: cached.rate, source: 'cache' };
  }

  let response;
  try {
    response = await axios.get<AwesomeApiResponse>(
      `https://economia.awesomeapi.com.br/last/${pairKey}`,
      { timeout: 5000 }
    );
  } catch {
    throw new ExternalServiceError('Serviço de cotação externo indisponível');
  }

  const responseKey = `${from}${to}`;
  const data = response.data?.[responseKey];

  if (!data || !data.bid) {
    throw new InvalidCurrencyPairError(`Par de moedas ${pairKey} não encontrado`);
  }

  const rate = parseFloat(data.bid);

  cache.set(pairKey, { rate, timestamp: Date.now() });

  return { rate, source: 'api' };
}