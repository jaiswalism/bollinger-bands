'use client';

import { BollingerInputs, BollingerStyles } from "@/lib/types";
import { useState } from "react";

interface BollingerSettingsProps {
  inputs: BollingerInputs;
  styles: BollingerStyles;
  onInputsChange: (newInputs: BollingerInputs) => void;
  onStylesChange: (newStyles: BollingerStyles) => void;
  onClose: () => void;
}

export default function BollingerSettings({
  inputs,
  styles,
  onInputsChange,
  onStylesChange,
  onClose,
}: BollingerSettingsProps) {
  const [activeTab, setActiveTab] = useState<'Inputs' | 'Style'>('Inputs');

  const handleInputChange = (field: keyof BollingerInputs, value: string | number) => {
    onInputsChange({ ...inputs, [field]: Number(value) });
  };
  
  const handleStyleChange = (band: keyof BollingerStyles, field: string, value: any) => {
    const newStyles = JSON.parse(JSON.stringify(styles));
    (newStyles[band] as any)[field] = value;
    onStylesChange(newStyles);
  };
  
  const handleBackgroundStyleChange = (field: keyof BollingerStyles['background'], value: any) => {
    const newStyles = JSON.parse(JSON.stringify(styles));
    newStyles.background[field] = value;
    onStylesChange(newStyles);
  };

  const lineStyleOptions = ['solid', 'dashed'];

  return (
    <div className="absolute top-16 left-4 z-50 bg-gray-800 text-white p-4 rounded-lg shadow-lg w-80 border border-gray-700">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-bold">Bollinger Bands</h3>
        <button onClick={onClose} className="text-gray-400 hover:text-white">&times;</button>
      </div>

      <div className="flex border-b border-gray-600 mb-4">
        <button onClick={() => setActiveTab('Inputs')} className={`px-4 py-2 ${activeTab === 'Inputs' ? 'border-b-2 border-blue-500 text-white' : 'text-gray-400'}`}>Inputs</button>
        <button onClick={() => setActiveTab('Style')} className={`px-4 py-2 ${activeTab === 'Style' ? 'border-b-2 border-blue-500 text-white' : 'text-gray-400'}`}>Style</button>
      </div>

      {activeTab === 'Inputs' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <label htmlFor="length">Length</label>
            <input id="length" type="number" value={inputs.length} onChange={(e) => handleInputChange('length', e.target.value)} className="bg-gray-700 w-24 p-1 rounded" />
          </div>
          <div className="flex items-center justify-between">
            <label htmlFor="source">Source</label>
            <input id="source" type="text" value="close" disabled className="bg-gray-900 text-gray-400 w-24 p-1 rounded" />
          </div>
          <div className="flex items-center justify-between">
            <label htmlFor="stddev">StdDev</label>
            <input id="stddev" type="number" value={inputs.stdDev} onChange={(e) => handleInputChange('stdDev', e.target.value)} className="bg-gray-700 w-24 p-1 rounded" />
          </div>
           <div className="flex items-center justify-between">
            <label htmlFor="offset">Offset</label>
            <input id="offset" type="number" value={inputs.offset} onChange={(e) => handleInputChange('offset', e.target.value)} className="bg-gray-700 w-24 p-1 rounded" />
          </div>
        </div>
      )}

      {activeTab === 'Style' && (
        <div className="space-y-4 text-sm">
          {/* Basis */}
          <div className="flex items-center space-x-2">
            <input type="checkbox" checked={styles.basis.display} onChange={(e) => handleStyleChange('basis', 'display', e.target.checked)} />
            <span>Basis</span>
            <input type="color" value={styles.basis.color} onChange={(e) => handleStyleChange('basis', 'color', e.target.value)} className="bg-transparent" />
            <input type="number" value={styles.basis.width} min="1" max="10" onChange={(e) => handleStyleChange('basis', 'width', parseInt(e.target.value))} className="w-12 bg-gray-700 p-1 rounded" />
            <select value={styles.basis.style} onChange={(e) => handleStyleChange('basis', 'style', e.target.value)} className="bg-gray-700 p-1 rounded">
              {lineStyleOptions.map(s => <option key={s} value={s}>{s}</option>)}
            </select>
          </div>

          {/* Upper */}
           <div className="flex items-center space-x-2">
            <input type="checkbox" checked={styles.upper.display} onChange={(e) => handleStyleChange('upper', 'display', e.target.checked)} />
            <span>Upper</span>
            <input type="color" value={styles.upper.color} onChange={(e) => handleStyleChange('upper', 'color', e.target.value)} className="bg-transparent" />
            <input type="number" value={styles.upper.width} min="1" max="10" onChange={(e) => handleStyleChange('upper', 'width', parseInt(e.target.value))} className="w-12 bg-gray-700 p-1 rounded" />
            <select value={styles.upper.style} onChange={(e) => handleStyleChange('upper', 'style', e.target.value)} className="bg-gray-700 p-1 rounded">
              {lineStyleOptions.map(s => <option key={s} value={s}>{s}</option>)}
            </select>
          </div>

          {/* Lower */}
           <div className="flex items-center space-x-2">
            <input type="checkbox" checked={styles.lower.display} onChange={(e) => handleStyleChange('lower', 'display', e.target.checked)} />
            <span>Lower</span>
            <input type="color" value={styles.lower.color} onChange={(e) => handleStyleChange('lower', 'color', e.target.value)} className="bg-transparent" />
            <input type="number" value={styles.lower.width} min="1" max="10" onChange={(e) => handleStyleChange('lower', 'width', parseInt(e.target.value))} className="w-12 bg-gray-700 p-1 rounded" />
            <select value={styles.lower.style} onChange={(e) => handleStyleChange('lower', 'style', e.target.value)} className="bg-gray-700 p-1 rounded">
              {lineStyleOptions.map(s => <option key={s} value={s}>{s}</option>)}
            </select>
          </div>

          {/* Background */}
           <div className="flex items-center space-x-2">
              <input type="checkbox" checked={styles.background.display} onChange={(e) => handleBackgroundStyleChange('display', e.target.checked)} />
              <span>Background</span>
              <input type="color" value={styles.background.color} onChange={(e) => handleBackgroundStyleChange('color', e.target.value)} className="bg-transparent" />
              <input type="range" min="0" max="1" step="0.1" value={styles.background.opacity} onChange={(e) => handleBackgroundStyleChange('opacity', parseFloat(e.target.value))} />
           </div>
        </div>
      )}
    </div>
  );
}