'use client';

import { useEffect, useRef, useState } from 'react';
import { init, dispose, Chart, Nullable, KLineData, IndicatorCreate } from 'klinecharts';
import { computeBollingerBands } from '@/lib/indicators/bollinger';
import { BollingerInputs, BollingerStyles, OHLCVData } from '@/lib/types';
import BollingerSettings from './BollingerSettings';

const BB_INDICATOR_NAME = 'BB';

const hexToRgba = (hex: string, opacity: number) => {
    let c: any = hex.substring(1).split('');
    if (c.length === 3) c = [c[0], c[0], c[1], c[1], c[2], c[2]];
    c = '0x' + c.join('');
    return `rgba(${[(c >> 16) & 255, (c >> 8) & 255, c & 255].join(',')},${opacity})`;
};

export default function ChartComponent() {
  const chartRef = useRef<Nullable<Chart>>(null); 
  const [ohlcvData, setOhlcvData] = useState<KLineData[]>([]);
  const [bbAdded, setBbAdded] = useState(false);
  const [showSettings, setShowSettings] = useState(false);

  const [bbInputs, setBbInputs] = useState<BollingerInputs>({
    length: 20, stdDev: 2, offset: 0, maType: 'SMA', source: 'close',
  });
  const [bbStyles, setBbStyles] = useState<BollingerStyles>({
      basis: { display: true, color: '#FFD700', width: 1, style: 'solid' },
      upper: { display: true, color: '#2196F3', width: 1, style: 'solid' },
      lower: { display: true, color: '#2196F3', width: 1, style: 'solid' },
      background: { display: true, color: '#2196F3', opacity: 0.2 },
  });

  useEffect(() => {
    fetch('/data/ohlcv.json')
      .then(res => res.json())
      .then((data: OHLCVData[]) => {
        const formattedData: KLineData[] = data.map(d => ({...d, turnover: d.open * d.volume }));
        setOhlcvData(formattedData);
        if (!chartRef.current) {
          const chart = init('kline-chart-container');
          chart?.setStyles('dark');
          chartRef.current = chart;
          chart?.applyNewData(formattedData);
        } else {
          chartRef.current.applyNewData(formattedData);
        }
      });
    return () => { if (chartRef.current) { dispose(chartRef.current); chartRef.current = null; } };
  }, []);

  useEffect(() => {
    if (!chartRef.current || ohlcvData.length === 0 || !bbAdded) return;
    const chart = chartRef.current;
    
    const figures = [];
    if (bbStyles.basis.display) {
      figures.push({ key: 'value', title: 'MID', type: 'line', styles: () => ({ dashValue: bbStyles.basis.style === 'dashed' ? [2, 2] : [1, 0], color: bbStyles.basis.color, lineWidth: bbStyles.basis.width, }) });
    }
    if (bbStyles.upper.display) {
      figures.push({ key: 'upper', title: 'UPPER', type: 'line', styles: () => ({ dashValue: bbStyles.upper.style === 'dashed' ? [2, 2] : [1, 0], color: bbStyles.upper.color, lineWidth: bbStyles.upper.width, }) });
    }
    if (bbStyles.lower.display) {
      figures.push({ key: 'lower', title: 'LOWER', type: 'line', styles: () => ({ dashValue: bbStyles.lower.style === 'dashed' ? [2, 2] : [1, 0], color: bbStyles.lower.color, lineWidth: bbStyles.lower.width, }) });
    }

    const bollingerIndicator: IndicatorCreate = {
      name: BB_INDICATOR_NAME,
      calc: (data: KLineData[]) => {
        const calculatedBands = computeBollingerBands(data, bbInputs);
        const offset = bbInputs.offset;
        if (offset === 0) return calculatedBands;
        const shiftedResult = new Array(calculatedBands.length).fill(null);
        for (let i = 0; i < calculatedBands.length; i++) {
          if (i - offset >= 0) { shiftedResult[i] = calculatedBands[i - offset]; }
        }
        return shiftedResult;
      },
      figures: figures,
      styles: {
        area: { style: 'fill', color: hexToRgba(bbStyles.background.color, bbStyles.background.opacity), toFigureKey: 'upper', fromFigureKey: 'lower', visible: bbStyles.background.display, }
      },
      calcParams: [bbInputs.length, bbInputs.stdDev],
      precision: 2,
    };
    chart.createIndicator(bollingerIndicator, true);
    chart.resize();
  }, [ohlcvData, bbInputs, bbStyles, bbAdded]);
  
  const handleAddIndicator = () => setBbAdded(true);

  return (
    <div className="relative w-full h-full">
      <div className="p-4 bg-gray-900 flex space-x-4">
          <button onClick={handleAddIndicator} disabled={bbAdded} className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:bg-gray-500">
            {bbAdded ? 'BB Indicator Added' : 'Add Bollinger Bands'}
          </button>
          {bbAdded && (<button onClick={() => setShowSettings(!showSettings)} className="px-4 py-2 bg-gray-700 text-white rounded hover:bg-gray-600">Settings</button>)}
      </div>
      {bbAdded && showSettings && (<BollingerSettings inputs={bbInputs} styles={bbStyles} onInputsChange={setBbInputs} onStylesChange={setBbStyles} onClose={() => setShowSettings(false)} />)}
      <div id="kline-chart-container" style={{ height: '600px' }} />
    </div>
  );
}