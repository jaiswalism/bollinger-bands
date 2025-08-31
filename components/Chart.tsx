'use client';

import { useEffect, useRef, useState } from 'react';
import { init, dispose, Chart, Nullable, KLineData, registerIndicator } from 'klinecharts';
import { BollingerInputs, BollingerStyles, OHLCVData } from '@/lib/types';
import BollingerSettings from './BollingerSettings';

const BB_INDICATOR_NAME = 'BB';

const hexToRgba = (hex: string, opacity: number) => {
    let c: any = hex.substring(1).split('');
    if (c.length === 3) c = [c[0], c[0], c[1], c[1], c[2], c[2]];
    c = '0x' + c.join('');
    return `rgba(${[(c >> 16) & 255, (c >> 8) & 255, c & 255].join(',')},${opacity})`;
};

// Register indicator exactly once
let indicatorRegistered = false;

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

  // Register indicator once
  useEffect(() => {
    if (!indicatorRegistered) {
      registerIndicator({
        name: BB_INDICATOR_NAME,
        shortName: 'BB',
        calcParams: [20, 2, 0],
        precision: 2,
        calc: (data: KLineData[], indicator: any) => {
          const { params } = indicator;
          const [length, stdDevMultiplier, offset] = params || [20, 2, 0];
          
          const result: any[] = [];

          for (let i = 0; i < data.length; i++) {
            if (i < length - 1) {
              result.push({});
              continue;
            }

            const slice = data.slice(i - length + 1, i + 1);
            const closePrices = slice.map(d => d.close);

            // Calculate SMA (basis)
            const sum = closePrices.reduce((acc, val) => acc + val, 0);
            const sma = sum / length;

            // Calculate standard deviation (population)
            const squaredDiffs = closePrices.map(price => Math.pow(price - sma, 2));
            const avgSquaredDiff = squaredDiffs.reduce((acc, val) => acc + val, 0) / length;
            const standardDeviation = Math.sqrt(avgSquaredDiff);

            // Calculate bands
            const upper = sma + (standardDeviation * stdDevMultiplier);
            const lower = sma - (standardDeviation * stdDevMultiplier);

            result.push({
              value: sma,
              upper: upper,
              lower: lower
            });
          }

          return result;
        },
      });
      indicatorRegistered = true;
    }
  }, []);

  // Load data and initialize chart
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
        }
        
        chartRef.current?.applyNewData(formattedData);
      })
      .catch(err => console.error('Data fetch error:', err));
      
    return () => { 
      if (chartRef.current) { 
        dispose(chartRef.current); 
        chartRef.current = null; 
      } 
    };
  }, []);

  // Update indicator styles and parameters when settings change
  useEffect(() => {
    if (!chartRef.current || ohlcvData.length === 0 || !bbAdded) return;
    
    const chart = chartRef.current;

    const figures = [];
    if (bbStyles.basis.display) {
      figures.push({ 
        key: 'value', 
        title: 'BASIS', 
        type: 'line', 
        styles: () => ({ 
          dashValue: bbStyles.basis.style === 'dashed' ? [2, 2] : [1, 0], 
          color: bbStyles.basis.color, 
          lineWidth: bbStyles.basis.width 
        }) 
      });
    }
    if (bbStyles.upper.display) {
      figures.push({ 
        key: 'upper', 
        title: 'UPPER', 
        type: 'line', 
        styles: () => ({ 
          dashValue: bbStyles.upper.style === 'dashed' ? [2, 2] : [1, 0], 
          color: bbStyles.upper.color, 
          lineWidth: bbStyles.upper.width 
        }) 
      });
    }
    if (bbStyles.lower.display) {
      figures.push({ 
        key: 'lower', 
        title: 'LOWER', 
        type: 'line', 
        styles: () => ({ 
          dashValue: bbStyles.lower.style === 'dashed' ? [2, 2] : [1, 0], 
          color: bbStyles.lower.color, 
          lineWidth: bbStyles.lower.width 
        }) 
      });
    }
    
    chart.overrideIndicator({
        name: BB_INDICATOR_NAME,
        calcParams: [bbInputs.length, bbInputs.stdDev, bbInputs.offset],
        figures: figures,
        styles: {
            area: {
                style: 'fill',
                color: hexToRgba(bbStyles.background.color, bbStyles.background.opacity),
                toFigureKey: 'upper',
                fromFigureKey: 'lower',
                visible: bbStyles.background.display,
            }
        }
    });

  }, [bbInputs, bbStyles, bbAdded, ohlcvData]);
  
  const handleAddIndicator = () => {
    if (chartRef.current && ohlcvData.length > 0) {
      try {
        // Create indicator on the main chart pane
        const result = chartRef.current.createIndicator({
            name: BB_INDICATOR_NAME,
            calcParams: [bbInputs.length, bbInputs.stdDev, bbInputs.offset],
        }, true, { id: 'candle_pane' }); // Force it on the main candlestick pane
        
        console.log('createIndicator result:', result);
        setBbAdded(true);
        
      } catch (error) {
        console.error('Error in handleAddIndicator:', error);
      }
    }
  };

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