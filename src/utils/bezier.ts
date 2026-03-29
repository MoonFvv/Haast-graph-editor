/**
 * Solves the cubic bezier equation for a given t parameter.
 * Returns the x or y coordinate at parameter t.
 */
function cubicBezierPoint(t: number, p0: number, p1: number, p2: number, p3: number): number {
  const mt = 1 - t;
  return mt * mt * mt * p0 + 3 * mt * mt * t * p1 + 3 * mt * t * t * p2 + t * t * t * p3;
}

/**
 * Returns the derivative (tangent) of the cubic bezier at t.
 */
function cubicBezierDerivative(t: number, p0: number, p1: number, p2: number, p3: number): number {
  const mt = 1 - t;
  return 3 * mt * mt * (p1 - p0) + 6 * mt * t * (p2 - p1) + 3 * t * t * (p3 - p2);
}

/**
 * Finds the t value corresponding to a given x using Newton-Raphson iteration.
 * This is necessary because x is not linear in t for arbitrary bezier curves.
 */
function getTForX(x: number, x1: number, x2: number, iterations = 10): number {
  let t = x;
  for (let i = 0; i < iterations; i++) {
    const xAtT = cubicBezierPoint(t, 0, x1, x2, 1);
    const dx = xAtT - x;
    if (Math.abs(dx) < 1e-6) break;
    const dxdt = cubicBezierDerivative(t, 0, x1, x2, 1);
    if (Math.abs(dxdt) < 1e-8) break;
    t -= dx / dxdt;
    t = Math.max(0, Math.min(1, t));
  }
  return t;
}

/**
 * Evaluates the cubic bezier CSS timing function at a given x (time) value.
 * Maps x=0..1 to y=0..1 using the CSS cubic-bezier convention:
 * P0=(0,0), P1=(x1,y1), P2=(x2,y2), P3=(1,1)
 */
export function cubicBezier(x: number, x1: number, y1: number, x2: number, y2: number): number {
  if (x <= 0) return 0;
  if (x >= 1) return 1;
  const t = getTForX(x, x1, x2);
  return cubicBezierPoint(t, 0, y1, y2, 1);
}

/**
 * Generates an array of {x, y} points along the bezier curve for rendering.
 * Uses t parameter directly for smooth rendering (not x-based lookup).
 */
export function generateCurvePoints(
  x1: number,
  y1: number,
  x2: number,
  y2: number,
  steps = 100
): Array<{ x: number; y: number }> {
  const points: Array<{ x: number; y: number }> = [];
  for (let i = 0; i <= steps; i++) {
    const t = i / steps;
    points.push({
      x: cubicBezierPoint(t, 0, x1, x2, 1),
      y: cubicBezierPoint(t, 0, y1, y2, 1),
    });
  }
  return points;
}

/**
 * Converts canvas coordinates to bezier space [0..1] for handles.
 * Canvas: origin top-left, y increases down.
 * Bezier: origin bottom-left, y increases up.
 */
export function canvasToBezier(
  canvasX: number,
  canvasY: number,
  canvasSize: number,
  padding: number
): { x: number; y: number } {
  const innerSize = canvasSize - padding * 2;
  return {
    x: (canvasX - padding) / innerSize,
    y: 1 - (canvasY - padding) / innerSize,
  };
}

/**
 * Converts bezier space [0..1] to canvas coordinates.
 */
export function bezierToCanvas(
  bx: number,
  by: number,
  canvasSize: number,
  padding: number
): { x: number; y: number } {
  const innerSize = canvasSize - padding * 2;
  return {
    x: padding + bx * innerSize,
    y: padding + (1 - by) * innerSize,
  };
}

/**
 * Clamps a value between min and max.
 */
export function clamp(value: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, value));
}

/**
 * Formats a bezier value to 3 decimal places, removing trailing zeros.
 */
export function formatBezierValue(value: number): string {
  return parseFloat(value.toFixed(3)).toString();
}
