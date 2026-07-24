export interface ConversionInput {
  from?: string;
  to?: string;
  amount?: number | string;
}

const CURRENCY_CODE_REGEX = /^[A-Z]{3}$/;

export function validateConversionInput(input: ConversionInput): string[] {
  const { from, to, amount } = input;
  const errors: string[] = [];

  if (!from || typeof from !== 'string' || !CURRENCY_CODE_REGEX.test(from)) {
    errors.push('Campo "from" deve ser um código de moeda válido (ex: USD)');
  }

  if (!to || typeof to !== 'string' || !CURRENCY_CODE_REGEX.test(to)) {
    errors.push('Campo "to" deve ser um código de moeda válido (ex: BRL)');
  }

  const numericAmount = Number(amount);
  if (amount === undefined || amount === null || Number.isNaN(numericAmount) || numericAmount <= 0) {
    errors.push('Campo "amount" deve ser um número positivo');
  }

  return errors;
}