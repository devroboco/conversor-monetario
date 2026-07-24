import { Request, Response } from 'express';
import { validateConversionInput, ConversionInput } from '../utils/validators.js';
import {
  getExchangeRate,
  InvalidCurrencyPairError,
  ExternalServiceError,
} from '../services/currencyService.js';

export interface ConversionResponse {
  from: string;
  to: string;
  amount: number;
  rate: number;
  convertedAmount: number;
  source: 'api' | 'cache';
}

export async function convert(req: Request, res: Response) {
  const { from, to, amount } = req.body as ConversionInput;

  const validationErrors = validateConversionInput({ from, to, amount });
  if (validationErrors.length > 0) {
    return res.status(400).json({ error: validationErrors.join('; ') });
  }

  try {
    const fromCode = (from as string).toUpperCase();
    const toCode = (to as string).toUpperCase();
    const numericAmount = Number(amount);

    const { rate, source } = await getExchangeRate(fromCode, toCode);

    const responsePayload: ConversionResponse = {
      from: fromCode,
      to: toCode,
      amount: numericAmount,
      rate,
      convertedAmount: Number((rate * numericAmount).toFixed(2)),
      source,
    };

    return res.status(200).json(responsePayload);
  } catch (err) {

    if (err instanceof InvalidCurrencyPairError) {
      return res.status(400).json({ error: err.message });
    }
    if (err instanceof ExternalServiceError) {
      return res.status(503).json({ error: err.message });
    }

    return res.status(500).json({ error: 'Erro interno do servidor' });
  }
}