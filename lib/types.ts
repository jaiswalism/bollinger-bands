import { KLineData } from "klinecharts";

export interface OHLCVData {
  timestamp: number;
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
}

export interface BollingerBandData {
  value: number; // The library requires this specific key for the primary value.
  upper: number;
  lower: number;
}

export interface BollingerInputs {
  length: number;
  stdDev: number;
  offset: number;
  maType: 'SMA';
  source: 'close';
}

export interface BollingerStyles {
  basis: { display: boolean; color: string; width: number; style: 'solid' | 'dashed'; };
  upper: { display: boolean; color: string; width: number; style: 'solid' | 'dashed'; };
  lower: { display: boolean; color: string; width: number; style: 'solid' | 'dashed'; };
  background: { display: boolean; color: string; opacity: number; };
}