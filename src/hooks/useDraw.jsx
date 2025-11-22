import { useEffect, useRef, useState } from 'react';

export const useDraw = (onDraw) => {
  const canvasRef = useRef(null);
  const prevPointRef = useRef(null);
  const [isDrawing, setIsDrawing] = useState(false);

  const onMouseDown = () => setIsDrawing(true);

  const getCoordinates = (e, canvas) => {
    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;

    let clientX, clientY;

    if (e.touches && e.touches[0]) {
      clientX = e.touches[0].clientX;
      clientY = e.touches[0].clientY;
    } else {
      clientX = e.clientX;
      clientY = e.clientY;
    }

    return {
      x: (clientX - rect.left) * scaleX,
      y: (clientY - rect.top) * scaleY,
    };
  };

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const handleMouseMove = (e) => {
      if (!isDrawing) return;
      const currentPoint = getCoordinates(e, canvas);
      onDraw({ prevPoint: prevPointRef.current, currentPoint, ctx });
      prevPointRef.current = currentPoint;
    };

    const handleMouseUp = () => {
      setIsDrawing(false);
      prevPointRef.current = null;
    };

    const handleTouchMove = (e) => {
      if (!isDrawing) return;
      e.preventDefault();
      const currentPoint = getCoordinates(e, canvas);
      onDraw({ prevPoint: prevPointRef.current, currentPoint, ctx });
      prevPointRef.current = currentPoint;
    };

    const handleTouchEnd = (e) => {
      e.preventDefault();
      setIsDrawing(false);
      prevPointRef.current = null;
    };

    canvas.addEventListener('mousemove', handleMouseMove);
    canvas.addEventListener('mouseup', handleMouseUp);
    canvas.addEventListener('mouseleave', handleMouseUp);
    canvas.addEventListener('touchmove', handleTouchMove, { passive: false });
    canvas.addEventListener('touchend', handleTouchEnd, { passive: false });

    return () => {
      canvas.removeEventListener('mousemove', handleMouseMove);
      canvas.removeEventListener('mouseup', handleMouseUp);
      canvas.removeEventListener('mouseleave', handleMouseUp);
      canvas.removeEventListener('touchmove', handleTouchMove);
      canvas.removeEventListener('touchend', handleTouchEnd);
    };
  }, [isDrawing, onDraw]);

  const clear = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    ctx?.clearRect(0, 0, canvas.width, canvas.height);
  };

  return { canvasRef, onMouseDown, clear };
};
