import React, { useRef, useEffect, useCallback, useState } from 'react';
import { BezierCurve } from '../types';
import {
  generateCurvePoints,
  bezierToCanvas,
  canvasToBezier,
  cubicBezier,
  clamp,
  formatBezierValue,
} from '../utils/bezier';

interface CurveEditorProps {
  curve: BezierCurve;
  onHandle1Change: (x: number, y: number) => void;
  onHandle2Change: (x: number, y: number) => void;
}

const CANVAS_SIZE = 300;
const PADDING = 36;
const HANDLE_RADIUS = 7;
const INNER_SIZE = CANVAS_SIZE - PADDING * 2;

type DragTarget = 'handle1' | 'handle2' | null;

export const CurveEditor: React.FC<CurveEditorProps> = ({ curve, onHandle1Change, onHandle2Change }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const dragging = useRef<DragTarget>(null);
  const animFrameRef = useRef<number>(0);
  const ballTRef = useRef<number>(0);
  const [ballPos, setBallPos] = useState<{ x: number; y: number }>({ x: 0, y: 0 });

  const drawCanvas = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const dpr = window.devicePixelRatio || 1;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.save();
    ctx.scale(dpr, dpr);

    const { x1, y1, x2, y2 } = curve;

    // Background
    ctx.fillStyle = '#111111';
    ctx.fillRect(0, 0, CANVAS_SIZE, CANVAS_SIZE);

    // Grid
    const gridCount = 4;
    ctx.strokeStyle = 'rgba(255,255,255,0.06)';
    ctx.lineWidth = 1;
    for (let i = 0; i <= gridCount; i++) {
      const t = i / gridCount;
      const gx = PADDING + t * INNER_SIZE;
      const gy = PADDING + t * INNER_SIZE;

      ctx.beginPath();
      ctx.moveTo(gx, PADDING);
      ctx.lineTo(gx, PADDING + INNER_SIZE);
      ctx.stroke();

      ctx.beginPath();
      ctx.moveTo(PADDING, gy);
      ctx.lineTo(PADDING + INNER_SIZE, gy);
      ctx.stroke();
    }

    // Axis border
    ctx.strokeStyle = 'rgba(255,255,255,0.15)';
    ctx.lineWidth = 1;
    ctx.strokeRect(PADDING, PADDING, INNER_SIZE, INNER_SIZE);

    // Axis labels
    ctx.fillStyle = '#666666';
    ctx.font = '9px Poppins, system-ui, sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('TIME', PADDING + INNER_SIZE / 2, CANVAS_SIZE - 4);
    ctx.save();
    ctx.translate(10, PADDING + INNER_SIZE / 2);
    ctx.rotate(-Math.PI / 2);
    ctx.fillText('VALUE', 0, 0);
    ctx.restore();

    // Tick labels
    ctx.fillStyle = '#444444';
    ctx.font = '8px monospace';
    ['0', '0.5', '1'].forEach((label, i) => {
      const t = i / 2;
      const px = PADDING + t * INNER_SIZE;
      const py = PADDING + (1 - t) * INNER_SIZE;
      ctx.textAlign = 'center';
      ctx.fillText(label, px, CANVAS_SIZE - 16);
      ctx.textAlign = 'right';
      ctx.fillText(label, PADDING - 4, py + 3);
    });

    // Handle anchor points (at 0,0 and 1,1)
    const p0 = bezierToCanvas(0, 0, CANVAS_SIZE, PADDING);
    const p3 = bezierToCanvas(1, 1, CANVAS_SIZE, PADDING);

    // Control handle lines
    const h1Canvas = bezierToCanvas(x1, y1, CANVAS_SIZE, PADDING);
    const h2Canvas = bezierToCanvas(x2, y2, CANVAS_SIZE, PADDING);

    ctx.strokeStyle = 'rgba(59,130,246,0.4)';
    ctx.lineWidth = 1;
    ctx.setLineDash([3, 3]);
    ctx.beginPath();
    ctx.moveTo(p0.x, p0.y);
    ctx.lineTo(h1Canvas.x, h1Canvas.y);
    ctx.stroke();

    ctx.beginPath();
    ctx.moveTo(p3.x, p3.y);
    ctx.lineTo(h2Canvas.x, h2Canvas.y);
    ctx.stroke();
    ctx.setLineDash([]);

    // Bezier curve
    const points = generateCurvePoints(x1, y1, x2, y2, 120);
    ctx.beginPath();
    ctx.strokeStyle = '#3b82f6';
    ctx.lineWidth = 2.5;
    ctx.lineJoin = 'round';
    points.forEach((pt, i) => {
      const cp = bezierToCanvas(pt.x, pt.y, CANVAS_SIZE, PADDING);
      if (i === 0) ctx.moveTo(cp.x, cp.y);
      else ctx.lineTo(cp.x, cp.y);
    });
    ctx.stroke();

    // Glow effect on curve
    ctx.beginPath();
    ctx.strokeStyle = 'rgba(59,130,246,0.15)';
    ctx.lineWidth = 8;
    points.forEach((pt, i) => {
      const cp = bezierToCanvas(pt.x, pt.y, CANVAS_SIZE, PADDING);
      if (i === 0) ctx.moveTo(cp.x, cp.y);
      else ctx.lineTo(cp.x, cp.y);
    });
    ctx.stroke();

    // Anchor points
    ctx.fillStyle = '#ECECEC';
    ctx.strokeStyle = 'rgba(255,255,255,0.3)';
    ctx.lineWidth = 1;
    [p0, p3].forEach((pt) => {
      ctx.beginPath();
      ctx.arc(pt.x, pt.y, 4, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();
    });

    // Handle 1
    ctx.beginPath();
    ctx.arc(h1Canvas.x, h1Canvas.y, HANDLE_RADIUS, 0, Math.PI * 2);
    ctx.fillStyle = '#3b82f6';
    ctx.fill();
    ctx.strokeStyle = '#ECECEC';
    ctx.lineWidth = 1.5;
    ctx.stroke();

    // Handle 2
    ctx.beginPath();
    ctx.arc(h2Canvas.x, h2Canvas.y, HANDLE_RADIUS, 0, Math.PI * 2);
    ctx.fillStyle = '#60a5fa';
    ctx.fill();
    ctx.strokeStyle = '#ECECEC';
    ctx.lineWidth = 1.5;
    ctx.stroke();

    ctx.restore();
  }, [curve]);

  // Animate ball
  useEffect(() => {
    let running = true;
    let start: number | null = null;
    const duration = 1400;

    function animate(timestamp: number) {
      if (!running) return;
      if (!start) start = timestamp;
      const elapsed = (timestamp - start) % (duration + 400);
      let t = 0;
      if (elapsed < duration) {
        t = elapsed / duration;
      } else {
        t = 1;
      }
      if (elapsed > duration + 300) {
        start = timestamp;
      }
      ballTRef.current = t;
      const { x1, y1, x2, y2 } = curve;
      const bx = t;
      const by = cubicBezier(t, x1, y1, x2, y2);
      setBallPos({ x: bx, y: by });
      animFrameRef.current = requestAnimationFrame(animate);
    }

    animFrameRef.current = requestAnimationFrame(animate);
    return () => {
      running = false;
      cancelAnimationFrame(animFrameRef.current);
    };
  }, [curve]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const dpr = window.devicePixelRatio || 1;
    canvas.width = CANVAS_SIZE * dpr;
    canvas.height = CANVAS_SIZE * dpr;
    canvas.style.width = `${CANVAS_SIZE}px`;
    canvas.style.height = `${CANVAS_SIZE}px`;
  }, []);

  useEffect(() => {
    drawCanvas();
  }, [drawCanvas]);

  const getHandleAtPosition = useCallback(
    (canvasX: number, canvasY: number): DragTarget => {
      const { x1, y1, x2, y2 } = curve;
      const h1 = bezierToCanvas(x1, y1, CANVAS_SIZE, PADDING);
      const h2 = bezierToCanvas(x2, y2, CANVAS_SIZE, PADDING);
      const hitRadius = HANDLE_RADIUS + 4;

      const dist1 = Math.hypot(canvasX - h1.x, canvasY - h1.y);
      const dist2 = Math.hypot(canvasX - h2.x, canvasY - h2.y);

      if (dist1 < hitRadius && dist1 <= dist2) return 'handle1';
      if (dist2 < hitRadius) return 'handle2';
      return null;
    },
    [curve]
  );

  const getCanvasCoords = useCallback((e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return { x: 0, y: 0 };
    const rect = canvas.getBoundingClientRect();
    return {
      x: e.clientX - rect.left,
      y: e.clientY - rect.top,
    };
  }, []);

  const handleMouseDown = useCallback(
    (e: React.MouseEvent<HTMLCanvasElement>) => {
      const { x, y } = getCanvasCoords(e);
      const target = getHandleAtPosition(x, y);
      if (target) {
        dragging.current = target;
        e.preventDefault();
      }
    },
    [getCanvasCoords, getHandleAtPosition]
  );

  const handleMouseMove = useCallback(
    (e: React.MouseEvent<HTMLCanvasElement>) => {
      if (!dragging.current) return;
      const { x, y } = getCanvasCoords(e);
      const bezier = canvasToBezier(x, y, CANVAS_SIZE, PADDING);

      if (dragging.current === 'handle1') {
        onHandle1Change(bezier.x, bezier.y);
      } else if (dragging.current === 'handle2') {
        onHandle2Change(bezier.x, bezier.y);
      }
    },
    [getCanvasCoords, onHandle1Change, onHandle2Change]
  );

  const handleMouseUp = useCallback(() => {
    dragging.current = null;
  }, []);

  const handleMouseLeave = useCallback(() => {
    dragging.current = null;
  }, []);

  // Ball canvas position
  const ballCanvas = bezierToCanvas(ballPos.x, ballPos.y, CANVAS_SIZE, PADDING);
  const ballX = clamp(ballCanvas.x, PADDING - 8, PADDING + INNER_SIZE + 8);
  const ballY = clamp(ballCanvas.y, PADDING - 8, PADDING + INNER_SIZE + 8);

  const { x1, y1, x2, y2 } = curve;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 12 }}>
      <div style={{ position: 'relative', width: CANVAS_SIZE, height: CANVAS_SIZE }}>
        <canvas
          ref={canvasRef}
          style={{
            display: 'block',
            borderRadius: 8,
            cursor: dragging.current ? 'grabbing' : 'crosshair',
            border: '1px solid rgba(255,255,255,0.08)',
          }}
          onMouseDown={handleMouseDown}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
          onMouseLeave={handleMouseLeave}
        />
        {/* Animated ball */}
        <div
          style={{
            position: 'absolute',
            left: ballX - 5,
            top: ballY - 5,
            width: 10,
            height: 10,
            borderRadius: '50%',
            background: '#ffffff',
            boxShadow: '0 0 8px rgba(59,130,246,0.8)',
            pointerEvents: 'none',
            transition: 'none',
          }}
        />
      </div>

      {/* Bezier values display */}
      <div
        style={{
          display: 'flex',
          gap: 8,
          alignItems: 'center',
          padding: '8px 14px',
          background: '#0a0a0a',
          borderRadius: 6,
          border: '1px solid rgba(255,255,255,0.07)',
          fontFamily: 'monospace',
          fontSize: 11,
          color: '#3b82f6',
          letterSpacing: '0.02em',
          userSelect: 'text',
        }}
      >
        <span style={{ color: '#666' }}>cubic-bezier(</span>
        <span>{formatBezierValue(x1)}</span>
        <span style={{ color: '#666' }}>,</span>
        <span>{formatBezierValue(y1)}</span>
        <span style={{ color: '#666' }}>,</span>
        <span>{formatBezierValue(x2)}</span>
        <span style={{ color: '#666' }}>,</span>
        <span>{formatBezierValue(y2)}</span>
        <span style={{ color: '#666' }}>)</span>
      </div>
    </div>
  );
};
