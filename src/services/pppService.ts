import pppDataset from "../data/ppp-2021.json";
import type { PPPEntry } from "../types";

type PPPDataset = {
  indicatorCode: string;
  vintageYear: number;
  sourceDataset: string;
  entries: PPPEntry[];
};

const dataset = pppDataset as PPPDataset;

export function getPPPEntry(countryCode: string) {
  return dataset.entries.find((entry) => entry.countryCode === countryCode.toUpperCase()) ?? null;
}

export function getPPPDatasetMeta() {
  return {
    indicatorCode: dataset.indicatorCode,
    vintageYear: dataset.vintageYear,
    sourceDataset: dataset.sourceDataset
  };
}

export function getAllPPPEntries() {
  return dataset.entries;
}
