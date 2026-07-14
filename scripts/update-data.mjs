import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";

const outDir = path.resolve("src/data");
const pppUrl =
  "https://api.worldbank.org/v2/country/all/indicator/PA.NUS.PPP?format=json&date=2021&per_page=20000";
const countriesUrl = "https://raw.githubusercontent.com/mledoze/countries/master/countries.json";

const decimalDigitsByCurrency = {
  BHD: 3,
  CLF: 4,
  IQD: 3,
  JOD: 3,
  KWD: 3,
  LYD: 3,
  OMR: 3,
  TND: 3,
  VUV: 0,
  XAF: 0,
  XOF: 0,
  XPF: 0,
  BIF: 0,
  CLP: 0,
  DJF: 0,
  GNF: 0,
  ISK: 0,
  JPY: 0,
  KMF: 0,
  KRW: 0,
  MGA: 0,
  PYG: 0,
  RWF: 0,
  UGX: 0,
  UYI: 0,
  VND: 0
};

function assertOk(response, label) {
  if (!response.ok) {
    throw new Error(`${label} request failed: ${response.status} ${response.statusText}`);
  }
}

async function fetchJson(url, label) {
  const response = await fetch(url);
  assertOk(response, label);
  return response.json();
}

function normalizeCountries(rows) {
  return rows
    .filter((country) => country.cca2 && country.name?.common)
    .map((country) => ({
      cca2: country.cca2,
      name: country.name.common,
      flagUrl: `https://flagcdn.com/${country.cca2.toLowerCase()}.svg`,
      region: country.region || "Unassigned",
      subregion: country.subregion || "Unassigned",
      currencies: Object.entries(country.currencies || {}).map(([code, value]) => ({
        code,
        name: value.name || code,
        symbol: value.symbol || code,
        decimalDigits: decimalDigitsByCurrency[code] ?? 2
      }))
    }))
    .filter((country) => country.currencies.length > 0)
    .sort((a, b) => a.name.localeCompare(b.name));
}

function normalizePpp(worldBankRows, countryCurrencyByCode) {
  return worldBankRows
    .filter((row) => row.country?.id && row.value !== null && Number.isFinite(Number(row.value)))
    .map((row) => {
      const countryCode = row.country.id;
      return {
        countryCode,
        year: Number(row.date),
        pppConversionFactor: Number(row.value),
        currencyCode: countryCurrencyByCode.get(countryCode) || "",
        sourceDataset:
          "World Bank ICP 2021 round - PA.NUS.PPP, PPP conversion factor, GDP (LCU per international $)"
      };
    })
    .sort((a, b) => a.countryCode.localeCompare(b.countryCode));
}

async function main() {
  await mkdir(outDir, { recursive: true });
  const [countriesRaw, pppRaw] = await Promise.all([
    fetchJson(countriesUrl, "mledoze/countries"),
    fetchJson(pppUrl, "World Bank PPP")
  ]);

  const countries = normalizeCountries(countriesRaw);
  const countryCurrencyByCode = new Map(
    countries.map((country) => [country.cca2, country.currencies[0]?.code || ""])
  );
  const pppRows = Array.isArray(pppRaw) ? pppRaw[1] || [] : [];
  const ppp = normalizePpp(pppRows, countryCurrencyByCode);

  await writeFile(
    path.join(outDir, "countries-snapshot.json"),
    `${JSON.stringify(
      {
        generatedAt: new Date().toISOString(),
        source: countriesUrl,
        flagSource: "https://flagcdn.com/{lowercase-cca2}.svg",
        adapter: "mledoze/countries -> PRD Country contract",
        countries
      },
      null,
      2
    )}\n`
  );
  await writeFile(
    path.join(outDir, "ppp-2021.json"),
    `${JSON.stringify(
      {
        indicatorCode: "PA.NUS.PPP",
        vintageYear: 2021,
        source: pppUrl,
        sourceDataset:
          "World Bank ICP 2021 round - PPP conversion factor, GDP (LCU per international $)",
        entries: ppp
      },
      null,
      2
    )}\n`
  );
  console.log(`Wrote ${countries.length} countries and ${ppp.length} PPP entries.`);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
