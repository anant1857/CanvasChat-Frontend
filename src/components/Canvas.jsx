'use client';

import React, { useEffect, useState } from 'react';
import { useDraw } from '../hooks/useDraw.jsx';
import { drawLine } from '../utils/drawLine.jsx';
import { getSocket } from '../utils/socket.jsx';

export default function Canvas({ color, lineWidth, roomId }) {
  const [mounted, setMounted] = useState(false);
  const { canvasRef, onMouseDown, clear } = useDraw(createLine);

  useEffect(() => setMounted(true), []);

  useEffect(() => {
    if (!mounted) return;
    const socket = getSocket();
    if (!socket) return;

    const ctx = canvasRef.current?.getContext('2d');
    if (!ctx) return;

    socket.emit('request-canvas-state');

    const handleCanvasState = (state) => {
      const img = new Image();
      img.src = state;
      img.onload = () => ctx.drawImage(img, 0, 0);
    };

    const handleSendCanvasState = () => {
      if (canvasRef.current) {
        socket.emit('canvas-state', canvasRef.current.toDataURL());
      }
    };

    const handleDrawLine = (data) => drawLine({ ...data, ctx });
    const handleClearCanvas = () => clear();

    socket.on('canvas-state-from-server', handleCanvasState);
    socket.on('send-canvas-state', handleSendCanvasState);
    socket.on('draw-line', handleDrawLine);
    socket.on('clear-canvas', handleClearCanvas);

    return () => {
      socket.off('canvas-state-from-server');
      socket.off('send-canvas-state');
      socket.off('draw-line');
      socket.off('clear-canvas');
    };
  }, [canvasRef, clear, mounted]);

  function createLine({ prevPoint, currentPoint, ctx }) {
    const socket = getSocket();
    if (!socket) return;
    const lineData = { prevPoint, currentPoint, color, lineWidth };
    socket.emit('draw-line', lineData);
    drawLine({ ...lineData, ctx });
  }

  if (!mounted) {
    return <div className="w-[800px] h-[600px] bg-gray-100 animate-pulse rounded-lg" />;
  }

  return (
    <canvas
      ref={canvasRef}
      onMouseDown={onMouseDown}
      onTouchStart={onMouseDown}
      width={800}
      height={600}
      className="border-2 border-gray-300 rounded-lg shadow-lg bg-white cursor-crosshair"
    />
  );
}
