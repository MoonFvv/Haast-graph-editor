import { useState, useCallback } from 'react';
import { BezierCurve } from '../types';
import { clamp } from '../utils/bezier';

const DEFAULT_CURVE: BezierCurve = { x1: 0.42, y1: 0, x2: 0.58, y2: 1 };

export function useBezier(initial?: BezierCurve) {
  const [curve, setCurve] = useState<BezierCurve>(initial ?? DEFAULT_CURVE);

  const updateHandle1 = useCallback((x: number, y: number) => {
    setCurve((prev) => ({
      ...prev,
      x1: clamp(x, 0, 1),
      y1: y, // Y can exceed 0-1 for overshoot effects
    }));
  }, []);

  const updateHandle2 = useCallback((x: number, y: number) => {
    setCurve((prev) => ({
      ...prev,
      x2: clamp(x, 0, 1),
      y2: y, // Y can exceed 0-1 for overshoot effects
    }));
  }, []);

  const setCurveValues = useCallback((x1: number, y1: number, x2: number, y2: number) => {
    setCurve({ x1: clamp(x1, 0, 1), y1, x2: clamp(x2, 0, 1), y2 });
  }, []);

  const loadPreset = useCallback((presetCurve: BezierCurve) => {
    setCurve({ ...presetCurve });
  }, []);

  return {
    curve,
    updateHandle1,
    updateHandle2,
    setCurveValues,
    loadPreset,
  };
}
