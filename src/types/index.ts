export interface Point {
  x: number;
  y: number;
}

export interface BezierCurve {
  x1: number;
  y1: number;
  x2: number;
  y2: number;
}

export interface Preset {
  id: string;
  name: string;
  category: PresetCategory;
  curve: BezierCurve;
  isCustom?: boolean;
}

export type PresetCategory = 'Ease In' | 'Ease Out' | 'Ease In-Out' | 'Spring' | 'Basic' | 'Custom';

export interface AEBridgeState {
  isConnected: boolean;
  isApplying: boolean;
  lastError: string | null;
  lastSuccess: boolean;
}

export interface CSInterface {
  evalScript(script: string, callback?: (result: string) => void): void;
  addEventListener(type: string, listener: (event: unknown) => void): void;
  removeEventListener(type: string, listener: (event: unknown) => void): void;
  getOSInformation(): string;
  getApplicationID(): string;
  getSystemPath(pathType: string): string;
}

declare global {
  interface Window {
    CSInterface: new () => CSInterface;
    cep_node?: { require: (module: string) => unknown };
  }
  const __APP_VERSION__: string;
}
