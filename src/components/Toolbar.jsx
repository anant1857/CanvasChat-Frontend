'use client';

import React from 'react';
import ColorPicker from './ColorPicker.jsx';

export default function Toolbar({ color, lineWidth, onColorChange, onLineWidthChange, onClear, onSave }) {
  return (
    <div className="bg-white p-6 rounded-lg shadow-lg space-y-6">
      <h2 className="text-xl font-bold text-gray-800">Drawing Tools</h2>
      
      <ColorPicker color={color} onChange={onColorChange} />
      
      <div className="space-y-2">
        <label className="text-sm font-medium flex justify-between">
          <span>Brush Size</span>
          <span className="text-primary-500">{lineWidth}px</span>
        </label>
        <input
          type="range"
          min="1"
          max="50"
          value={lineWidth}
          onChange={(e) => onLineWidthChange(Number(e.target.value))}
          className="w-full"
        />
      </div>

      <div className="space-y-3">
        <button
          onClick={onClear}
          className="w-full px-4 py-3 bg-red-500 text-white rounded-lg hover:bg-red-600"
        >
          Clear Canvas
        </button>
        <button
          onClick={onSave}
          className="w-full px-4 py-3 bg-primary-500 text-white rounded-lg hover:bg-primary-600"
        >
          Save Canvas
        </button>
      </div>
    </div>
  );
}
