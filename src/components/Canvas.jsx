'use client';

import React, { useEffect, useState, useRef } from 'react';
import { useDraw } from '../hooks/useDraw.jsx';
import { drawLine } from '../utils/drawLine.jsx';
import { getSocket } from '../utils/socket.jsx';

export default function Canvas({ color, lineWidth, roomId, currentLayer, userId, username }) {
  const [mounted, setMounted] = useState(false);
  const [canvasDimensions, setCanvasDimensions] = useState({ width: 1920, height: 1080 });
  const [userLabels, setUserLabels] = useState([]);
  const { canvasRef, onMouseDown, clear } = useDraw(createLine);
  const isDrawingRef = useRef(false);
  const drawingStartPosRef = useRef(null);
  const labelContainerRef = useRef(null);

  useEffect(() => setMounted(true), []);

  useEffect(() => {
    const updateCanvasSize = () => {
      const container = canvasRef.current?.parentElement;
      if (container) {
        const width = Math.min(container.clientWidth - 40, 1920);
        const height = Math.min(container.clientHeight - 40, 1080);
        setCanvasDimensions({ width, height });
      }
    };

    updateCanvasSize();
    window.addEventListener('resize', updateCanvasSize);
    return () => window.removeEventListener('resize', updateCanvasSize);
  }, [canvasRef]);

  // Load/Save canvas based on layer
  useEffect(() => {
    if (!mounted || !canvasRef.current) return;
    
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    
    const savedCanvas = localStorage.getItem(`canvas-${currentLayer}-${userId}`);
    if (savedCanvas) {
      const img = new Image();
      img.src = savedCanvas;
      img.onload = () => {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        ctx.drawImage(img, 0, 0);
      };
    } else {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
    }

    // Clear labels when switching layers
    setUserLabels([]);
  }, [currentLayer, mounted, userId, canvasRef]);

  // Save canvas on changes (only for personal layer)
  useEffect(() => {
    if (!mounted || !canvasRef.current) return;

    const saveCanvas = () => {
      const canvas = canvasRef.current;
      if (canvas && currentLayer === 'personal') {
        const canvasData = canvas.toDataURL();
        localStorage.setItem(`canvas-personal-${userId}`, canvasData);
      }
    };

    const interval = setInterval(saveCanvas, 2000);
    return () => clearInterval(interval);
  }, [mounted, currentLayer, userId]);

  // Handle mouse down to track drawing start (only for shared canvas)
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const getCanvasCoordinates = (e) => {
      const rect = canvas.getBoundingClientRect();
      const scaleX = canvas.width / rect.width;
      const scaleY = canvas.height / rect.height;
      
      const clientX = e.clientX || (e.touches && e.touches[0]?.clientX);
      const clientY = e.clientY || (e.touches && e.touches[0]?.clientY);
      
      return {
        canvasX: (clientX - rect.left) * scaleX,
        canvasY: (clientY - rect.top) * scaleY,
        screenX: clientX - rect.left,
        screenY: clientY - rect.top,
      };
    };

    const handleStart = (e) => {
      // Only track for shared canvas
      if (currentLayer === 'shared') {
        isDrawingRef.current = true;
        const coords = getCanvasCoordinates(e);
        drawingStartPosRef.current = coords;
      }
    };

    const handleEnd = () => {
      // Only add labels for shared canvas
      if (currentLayer === 'shared' && isDrawingRef.current && drawingStartPosRef.current) {
        // Add user label when drawing ends
        const labelData = {
          id: Date.now() + Math.random(),
          username: username,
          x: drawingStartPosRef.current.screenX,
          y: drawingStartPosRef.current.screenY - 30,
          color: color
        };
        
        setUserLabels(prev => [...prev, labelData]);
        
        // Remove label after 4 seconds
        setTimeout(() => {
          setUserLabels(prev => prev.filter(l => l.id !== labelData.id));
        }, 4000);

        // Emit to other users
        const socket = getSocket();
        if (socket) {
          socket.emit('user-label', labelData);
        }
      }
      
      isDrawingRef.current = false;
      drawingStartPosRef.current = null;
    };

    canvas.addEventListener('mousedown', handleStart);
    canvas.addEventListener('mouseup', handleEnd);
    canvas.addEventListener('mouseleave', handleEnd);
    canvas.addEventListener('touchstart', handleStart);
    canvas.addEventListener('touchend', handleEnd);

    return () => {
      canvas.removeEventListener('mousedown', handleStart);
      canvas.removeEventListener('mouseup', handleEnd);
      canvas.removeEventListener('mouseleave', handleEnd);
      canvas.removeEventListener('touchstart', handleStart);
      canvas.removeEventListener('touchend', handleEnd);
    };
  }, [canvasRef, username, color, currentLayer]);

  useEffect(() => {
    if (!mounted) return;
    const socket = getSocket();
    if (!socket) return;

    const ctx = canvasRef.current?.getContext('2d');
    if (!ctx) return;

    if (currentLayer === 'shared') {
      socket.emit('request-canvas-state');
    }

    const handleCanvasState = (state) => {
      if (currentLayer !== 'shared') return;
      const img = new Image();
      img.src = state;
      img.onload = () => ctx.drawImage(img, 0, 0);
    };

    const handleSendCanvasState = () => {
      if (currentLayer === 'shared' && canvasRef.current) {
        socket.emit('canvas-state', canvasRef.current.toDataURL());
      }
    };

    const handleDrawLine = (data) => {
      if (currentLayer === 'shared') {
        drawLine({ ...data, ctx });
      }
    };

    const handleUserLabel = (labelData) => {
      if (currentLayer === 'shared') {
        setUserLabels(prev => [...prev, labelData]);
        setTimeout(() => {
          setUserLabels(prev => prev.filter(l => l.id !== labelData.id));
        }, 4000);
      }
    };

    const handleClearCanvas = () => {
      if (currentLayer === 'shared') {
        clear();
        setUserLabels([]);
      }
    };

    socket.on('canvas-state-from-server', handleCanvasState);
    socket.on('send-canvas-state', handleSendCanvasState);
    socket.on('draw-line', handleDrawLine);
    socket.on('user-label', handleUserLabel);
    socket.on('clear-canvas', handleClearCanvas);

    return () => {
      socket.off('canvas-state-from-server');
      socket.off('send-canvas-state');
      socket.off('draw-line');
      socket.off('user-label');
      socket.off('clear-canvas');
    };
  }, [canvasRef, clear, mounted, currentLayer]);

  function createLine({ prevPoint, currentPoint, ctx }) {
    const lineData = { prevPoint, currentPoint, color, lineWidth };
    drawLine({ ...lineData, ctx });

    // Only emit to socket if on shared layer
    if (currentLayer === 'shared') {
      const socket = getSocket();
      if (socket) {
        socket.emit('draw-line', lineData);
      }
    }
  }

  if (!mounted) {
    return (
      <div className="w-full h-full flex items-center justify-center">
        <div className="animate-pulse text-gray-500">Loading canvas...</div>
      </div>
    );
  }

  return (
    <div className="relative w-full h-full flex flex-col items-center justify-center">
      {/* Layer Indicator */}
      <div className="mb-4 px-4 py-2 bg-gray-800 text-white rounded-lg shadow-lg flex items-center gap-2">
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
        </svg>
        <span className="font-medium">
          {currentLayer === 'shared' ? '🌐 Shared Canvas (Everyone can see)' : '🔒 My Private Canvas (Only you can see)'}
        </span>
      </div>
      
      <div className="relative inline-block">
        <canvas
          ref={canvasRef}
          onMouseDown={onMouseDown}
          onTouchStart={onMouseDown}
          width={canvasDimensions.width}
          height={canvasDimensions.height}
          className="border-4 border-gray-700 rounded-lg shadow-2xl bg-white cursor-crosshair"
          style={{ 
            display: 'block',
            touchAction: 'none'
          }}
        />
        
        {/* User Labels Overlay - Only show on shared canvas */}
        {currentLayer === 'shared' && (
          <div 
            ref={labelContainerRef}
            className="absolute inset-0 pointer-events-none"
            style={{ zIndex: 10 }}
          >
            {userLabels.map(label => (
              <div
                key={label.id}
                className="absolute animate-fade-in"
                style={{
                  left: `${label.x}px`,
                  top: `${label.y}px`,
                  transform: 'translate(-50%, -100%)',
                }}
              >
                <div 
                  className="px-3 py-1.5 rounded-full text-white text-sm font-bold shadow-2xl border-2 border-white whitespace-nowrap"
                  style={{ 
                    backgroundColor: label.color,
                    animation: 'bounce 0.5s ease-out'
                  }}
                >
                  ✏️ {label.username}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Active Drawing Indicator - Only show on shared canvas */}
      {currentLayer === 'shared' && (
        <div className="mt-4 text-xs text-gray-400 flex items-center gap-2">
          <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
          </svg>
          <span>User names appear when drawing starts</span>
        </div>
      )}
    </div>
  );
}
