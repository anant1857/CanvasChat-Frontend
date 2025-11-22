'use client';

import React, { useState } from 'react';
import ColorPicker from './ColorPicker.jsx';

export default function Toolbar({ 
  color, 
  lineWidth, 
  onColorChange, 
  onLineWidthChange, 
  onClear, 
  onSave,
  onExportCode,
  currentLayer,
  onLayerChange,
  layers
}) {
  const [showColorPicker, setShowColorPicker] = useState(false);
  const [showBrushSize, setShowBrushSize] = useState(false);
  const [showAIMenu, setShowAIMenu] = useState(false);
  const [showLayersMenu, setShowLayersMenu] = useState(false);

  const presetColors = [
    '#000000', '#FFFFFF', '#FF0000', '#00FF00', '#0000FF',
    '#FFFF00', '#FF00FF', '#00FFFF', '#FFA500', '#800080',
    '#FFC0CB', '#A52A2A', '#808080', '#00FF7F', '#FF1493',
  ];

  const brushSizes = [1, 2, 5, 10, 15, 20, 30, 50];

  return (
    <div className="bg-gray-800 border-b border-gray-700 shadow-lg z-20">
      {/* Main Toolbar */}
      <div className="px-4 py-2 flex items-center gap-2">
        {/* Drawing Tools Group */}
        <div className="flex items-center gap-2 bg-gray-700 rounded-lg px-3 py-2">
          <span className="text-xs text-gray-400 font-medium uppercase tracking-wide">Draw</span>
          
          {/* Color Picker */}
          <div className="relative">
            <button
              onClick={() => {
                setShowColorPicker(!showColorPicker);
                setShowBrushSize(false);
                setShowAIMenu(false);
                setShowLayersMenu(false);
              }}
              className="flex items-center gap-2 px-3 py-1.5 bg-gray-800 hover:bg-gray-600 rounded transition-colors"
              title="Choose Color"
            >
              <div
                className="w-8 h-8 rounded border-2 border-gray-500 shadow-sm"
                style={{ backgroundColor: color }}
              />
              <span className="text-white text-xs font-medium">{color}</span>
              <svg className="w-3 h-3 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </button>

            {showColorPicker && (
              <div className="absolute top-full mt-2 left-0 z-50">
                <div className="fixed inset-0" onClick={() => setShowColorPicker(false)} />
                <div className="relative bg-gray-700 rounded-lg shadow-2xl p-4 border border-gray-600 w-80">
                  <h3 className="text-white text-sm font-semibold mb-3">Select Color</h3>
                  <div className="grid grid-cols-5 gap-2 mb-4">
                    {presetColors.map((c) => (
                      <button
                        key={c}
                        className={`w-12 h-12 rounded-lg border-2 transition-all hover:scale-110 ${
                          color === c ? 'border-primary-500 ring-2 ring-primary-500' : 'border-gray-600'
                        }`}
                        style={{ backgroundColor: c }}
                        onClick={() => {
                          onColorChange(c);
                          setShowColorPicker(false);
                        }}
                        title={c}
                      />
                    ))}
                  </div>
                  <div className="border-t border-gray-600 pt-3">
                    <ColorPicker color={color} onChange={(c) => {
                      onColorChange(c);
                      setShowColorPicker(false);
                    }} />
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Brush Size */}
          <div className="relative">
            <button
              onClick={() => {
                setShowBrushSize(!showBrushSize);
                setShowColorPicker(false);
                setShowAIMenu(false);
                setShowLayersMenu(false);
              }}
              className="flex items-center gap-2 px-3 py-1.5 bg-gray-800 hover:bg-gray-600 rounded transition-colors"
              title="Brush Size"
            >
              <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
              </svg>
              <span className="text-white text-sm font-medium">{lineWidth}px</span>
              <svg className="w-3 h-3 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </button>

            {showBrushSize && (
              <div className="absolute top-full mt-2 left-0 z-50">
                <div className="fixed inset-0" onClick={() => setShowBrushSize(false)} />
                <div className="relative bg-gray-700 rounded-lg shadow-2xl p-4 border border-gray-600 w-64">
                  <h3 className="text-white text-sm font-semibold mb-3">Brush Size</h3>
                  
                  {/* Slider */}
                  <div className="mb-4">
                    <input
                      type="range"
                      min="1"
                      max="50"
                      value={lineWidth}
                      onChange={(e) => onLineWidthChange(Number(e.target.value))}
                      className="w-full h-2 bg-gray-600 rounded-lg appearance-none cursor-pointer accent-primary-500"
                    />
                    <div className="flex justify-between text-xs text-gray-400 mt-1">
                      <span>1px</span>
                      <span>50px</span>
                    </div>
                  </div>

                  {/* Preset Sizes */}
                  <div className="grid grid-cols-4 gap-2">
                    {brushSizes.map((size) => (
                      <button
                        key={size}
                        onClick={() => {
                          onLineWidthChange(size);
                          setShowBrushSize(false);
                        }}
                        className={`flex flex-col items-center justify-center p-3 rounded transition-all ${
                          lineWidth === size
                            ? 'bg-primary-600 text-white'
                            : 'hover:bg-gray-600 text-gray-300'
                        }`}
                      >
                        <div
                          className="rounded-full bg-white mb-1"
                          style={{
                            width: `${Math.min(size, 24)}px`,
                            height: `${Math.min(size, 24)}px`,
                          }}
                        />
                        <span className="text-xs">{size}px</span>
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        <div className="h-8 w-px bg-gray-600" />

        {/* AI Tools Group */}
        <div className="flex items-center gap-2 bg-gradient-to-r from-blue-600 to-cyan-600 rounded-lg px-3 py-2">
          <span className="text-xs text-white font-medium uppercase tracking-wide flex items-center gap-1">
            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
              <path d="M13 7H7v6h6V7z" />
              <path fillRule="evenodd" d="M7 2a1 1 0 012 0v1h2V2a1 1 0 112 0v1h2a2 2 0 012 2v2h1a1 1 0 110 2h-1v2h1a1 1 0 110 2h-1v2a2 2 0 01-2 2h-2v1a1 1 0 11-2 0v-1H9v1a1 1 0 11-2 0v-1H5a2 2 0 01-2-2v-2H2a1 1 0 110-2h1V9H2a1 1 0 010-2h1V5a2 2 0 012-2h2V2zM5 5h10v10H5V5z" clipRule="evenodd" />
            </svg>
            Export
          </span>

          <button
            onClick={onExportCode}
            className="px-3 py-1.5 bg-white/20 hover:bg-white/30 text-white rounded transition-colors text-sm font-medium flex items-center gap-2"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" />
            </svg>
            Export Code
          </button>
        </div>

        <div className="h-8 w-px bg-gray-600" />

        {/* Layers Group */}
        <div className="flex items-center gap-2 bg-gray-700 rounded-lg px-3 py-2">
          <span className="text-xs text-gray-400 font-medium uppercase tracking-wide">Layers</span>
          
          <div className="relative">
            <button
              onClick={() => {
                setShowLayersMenu(!showLayersMenu);
                setShowColorPicker(false);
                setShowBrushSize(false);
                setShowAIMenu(false);
              }}
              className="flex items-center gap-2 px-3 py-1.5 bg-gray-800 hover:bg-gray-600 rounded transition-colors"
            >
              <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
              </svg>
              <span className="text-white text-sm">{currentLayer === 'shared' ? '🌐 Shared' : '🔒 Private'}</span>
              <svg className="w-3 h-3 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </button>

            {showLayersMenu && (
              <div className="absolute top-full mt-2 left-0 z-50">
                <div className="fixed inset-0" onClick={() => setShowLayersMenu(false)} />
                <div className="relative bg-gray-700 rounded-lg shadow-2xl p-4 border border-gray-600 w-72">
                  <h3 className="text-white text-sm font-semibold mb-3">Switch Canvas</h3>
                  <div className="space-y-2">
                    {layers?.map((layer) => (
                      <button
                        key={layer.id}
                        onClick={() => {
                          onLayerChange(layer.id);
                          setShowLayersMenu(false);
                        }}
                        className={`w-full flex items-center gap-3 p-3 rounded transition-all ${
                          currentLayer === layer.id
                            ? 'bg-primary-600 text-white'
                            : 'hover:bg-gray-600 text-gray-300'
                        }`}
                      >
                        <div className="text-2xl">
                          {layer.id === 'shared' ? '🌐' : '🔒'}
                        </div>
                        <div className="flex-1 text-left">
                          <div className="text-sm font-medium">{layer.name}</div>
                          <div className="text-xs opacity-75">{layer.description}</div>
                        </div>
                        {currentLayer === layer.id && (
                          <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                          </svg>
                        )}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        <div className="h-8 w-px bg-gray-600" />

        {/* Action Buttons */}
        <div className="flex items-center gap-2">
          <button
            onClick={onClear}
            className="flex items-center gap-2 px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
            </svg>
            Clear
          </button>

          <button
            onClick={onSave}
            className="flex items-center gap-2 px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-3m-1 4l-3 3m0 0l-3-3m3 3V4" />
            </svg>
            Save
          </button>
        </div>
      </div>
    </div>
  );
}
