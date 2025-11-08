export const drawLine = ({ prevPoint, currentPoint, ctx, color, lineWidth }) => {
  const { x: currX, y: currY } = currentPoint;
  
  ctx.beginPath();
  ctx.lineWidth = lineWidth;
  ctx.strokeStyle = color;
  ctx.lineCap = 'round';
  ctx.lineJoin = 'round';

  if (prevPoint) {
    ctx.moveTo(prevPoint.x, prevPoint.y);
    ctx.lineTo(currX, currY);
  } else {
    ctx.moveTo(currX, currY);
    ctx.lineTo(currX, currY);
  }

  ctx.stroke();
  ctx.closePath();
};
