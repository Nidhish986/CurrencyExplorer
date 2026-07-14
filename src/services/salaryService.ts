import type { Country, SalaryComparison } from "../types";
import { getExchangeRate } from "./exchangeService";
import { getPPPEntry } from "./pppService";

export type SalaryComparisonResult = {
  comparison: SalaryComparison;
  explanation: string;
  fromPPPAvailable: boolean;
  toPPPAvailable: boolean;
  fromCurrency: string;
  toCurrency: string;
};

function primaryCurrency(country: Country) {
  return country.currencies[0];
}

export async function compareSalary(amount: number, fromCountry: Country, toCountry: Country): Promise<SalaryComparisonResult> {
  const fromCurrency = primaryCurrency(fromCountry).code;
  const toCurrency = primaryCurrency(toCountry).code;
  const rate = await getExchangeRate(fromCurrency, toCurrency);
  const exchangeRateResult = amount * rate.rate;
  const fromPPP = getPPPEntry(fromCountry.cca2);
  const toPPP = getPPPEntry(toCountry.cca2);
  const pppResult = fromPPP && toPPP ? (amount / fromPPP.pppConversionFactor) * toPPP.pppConversionFactor : null;
  const comparison: SalaryComparison = {
    amount,
    fromCountry: fromCountry.cca2,
    toCountry: toCountry.cca2,
    exchangeRateResult,
    pppResult,
    createdAt: new Date().toISOString()
  };
  const explanation = pppResult
    ? `${amount.toLocaleString()} ${fromCurrency} in ${fromCountry.name} converts to ${exchangeRateResult.toLocaleString(undefined, { maximumFractionDigits: 2 })} ${toCurrency} at market exchange rates. Using official PPP conversion factors, its purchasing-power equivalent is ${pppResult.toLocaleString(undefined, { maximumFractionDigits: 2 })} ${toCurrency}, because local prices differ between ${fromCountry.name} and ${toCountry.name}.`
    : `PPP data is unavailable for ${!fromPPP ? fromCountry.name : toCountry.name}, so only the exchange-rate conversion can be shown for this comparison.`;

  return {
    comparison,
    explanation,
    fromPPPAvailable: Boolean(fromPPP),
    toPPPAvailable: Boolean(toPPP),
    fromCurrency,
    toCurrency
  };
}
