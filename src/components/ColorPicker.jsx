'use client';

import React, { useState } from 'react';
import { ChromePicker } from 'react-color';

export default function ColorPicker({ color, onChange }) {
  const [showPicker, setShowPicker] = useState(false);

  const presetColors = [
    '#000000', '#FFFFFF', '#FF0000', '#00FF00', '#0000FF',
    '#FFFF00', '#FF00FF', '#00FFFF', '#FFA500', '#800080',
  ];

  return (
    <div className="relative">
      <label className="block text-sm font-medium mb-2">Color</label>
      <div
        className="w-full h-12 rounded-lg border-2 cursor-pointer"
        style={{ backgroundColor: color }}
        onClick={() => setShowPicker(!showPicker)}
      />
      
      <div className="grid grid-cols-5 gap-2 mt-2">
        {presetColors.map((c) => (
          <button
            key={c}
            className="w-full h-8 rounded border-2"
            style={{ backgroundColor: c }}
            onClick={() => onChange(c)}
          />
        ))}
      </div>

      {showPicker && (
        <div className="absolute z-50 mt-2">
          <div className="fixed inset-0" onClick={() => setShowPicker(false)} />
          <ChromePicker color={color} onChange={(c) => onChange(c.hex)} />
        </div>
      )}
    </div>
  );
}
