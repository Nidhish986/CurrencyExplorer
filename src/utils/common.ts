export const createId = (prefix: string) => `${prefix}-${crypto.randomUUID()}`;

export const isValidCurrencyCode = (value: string) => /^[A-Z]{3}$/.test(value.trim().toUpperCase());

export const classNames = (...values: Array<string | false | null | undefined>) =>
  values.filter(Boolean).join(" ");
