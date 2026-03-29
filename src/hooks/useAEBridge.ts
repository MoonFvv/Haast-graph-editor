import { useState, useEffect, useCallback, useRef } from 'react';
import { AEBridgeState, CSInterface } from '../types';

export function useAEBridge() {
  const csInterfaceRef = useRef<CSInterface | null>(null);
  const [state, setState] = useState<AEBridgeState>({
    isConnected: false,
    isApplying: false,
    lastError: null,
    lastSuccess: false,
  });

  useEffect(() => {
    if (typeof window !== 'undefined' && window.CSInterface) {
      try {
        csInterfaceRef.current = new window.CSInterface();
        setState((prev) => ({ ...prev, isConnected: true }));
      } catch {
        csInterfaceRef.current = null;
        setState((prev) => ({ ...prev, isConnected: false }));
      }
    }
  }, []);

  const applyToKeyframes = useCallback(
    (x1: number, y1: number, x2: number, y2: number, inInfluence: number, outInfluence: number) => {
      if (!csInterfaceRef.current) {
        setState((prev) => ({
          ...prev,
          lastError: 'Not connected to After Effects',
          lastSuccess: false,
        }));
        return;
      }

      setState((prev) => ({ ...prev, isApplying: true, lastError: null, lastSuccess: false }));

      const script = `applyBezierToSelectedKeyframes(${x1}, ${y1}, ${x2}, ${y2}, ${inInfluence}, ${outInfluence})`;

      csInterfaceRef.current.evalScript(script, (result: string) => {
        if (result === 'EvalScript error.' || result.startsWith('Error:')) {
          setState((prev) => ({
            ...prev,
            isApplying: false,
            lastError: result.replace('Error:', '').trim() || 'An error occurred in After Effects',
            lastSuccess: false,
          }));
        } else if (result === 'noKeyframes') {
          setState((prev) => ({
            ...prev,
            isApplying: false,
            lastError: 'No keyframes selected. Select at least two keyframes.',
            lastSuccess: false,
          }));
        } else if (result === 'noComposition') {
          setState((prev) => ({
            ...prev,
            isApplying: false,
            lastError: 'No active composition found.',
            lastSuccess: false,
          }));
        } else {
          setState((prev) => ({
            ...prev,
            isApplying: false,
            lastError: null,
            lastSuccess: true,
          }));
          // Clear success state after 2 seconds
          setTimeout(() => {
            setState((prev) => ({ ...prev, lastSuccess: false }));
          }, 2000);
        }
      });
    },
    []
  );

  const clearStatus = useCallback(() => {
    setState((prev) => ({ ...prev, lastError: null, lastSuccess: false }));
  }, []);

  return {
    isConnected: state.isConnected,
    isApplying: state.isApplying,
    lastError: state.lastError,
    lastSuccess: state.lastSuccess,
    applyToKeyframes,
    clearStatus,
  };
}
