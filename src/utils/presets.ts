import { Preset } from '../types';

export const BUILT_IN_PRESETS: Preset[] = [
  // Basic
  { id: 'linear', name: 'Linear', category: 'Basic', curve: { x1: 0, y1: 0, x2: 1, y2: 1 } },
  { id: 'ease', name: 'Ease', category: 'Basic', curve: { x1: 0.25, y1: 0.1, x2: 0.25, y2: 1 } },

  // Ease In
  { id: 'ease-in', name: 'Ease In', category: 'Ease In', curve: { x1: 0.42, y1: 0, x2: 1, y2: 1 } },
  { id: 'ease-in-quad', name: 'Ease In Quad', category: 'Ease In', curve: { x1: 0.55, y1: 0.085, x2: 0.68, y2: 0.53 } },
  { id: 'ease-in-cubic', name: 'Ease In Cubic', category: 'Ease In', curve: { x1: 0.55, y1: 0.055, x2: 0.675, y2: 0.19 } },
  { id: 'ease-in-quart', name: 'Ease In Quart', category: 'Ease In', curve: { x1: 0.895, y1: 0.03, x2: 0.685, y2: 0.22 } },
  { id: 'ease-in-expo', name: 'Ease In Expo', category: 'Ease In', curve: { x1: 1, y1: 0, x2: 0.9, y2: 0.1 } },
  { id: 'ease-in-back', name: 'Ease In Back', category: 'Ease In', curve: { x1: 0.6, y1: -0.28, x2: 0.735, y2: 0.045 } },

  // Ease Out
  { id: 'ease-out', name: 'Ease Out', category: 'Ease Out', curve: { x1: 0, y1: 0, x2: 0.58, y2: 1 } },
  { id: 'ease-out-quad', name: 'Ease Out Quad', category: 'Ease Out', curve: { x1: 0.25, y1: 0.46, x2: 0.45, y2: 0.94 } },
  { id: 'ease-out-cubic', name: 'Ease Out Cubic', category: 'Ease Out', curve: { x1: 0.215, y1: 0.61, x2: 0.355, y2: 1 } },
  { id: 'ease-out-quart', name: 'Ease Out Quart', category: 'Ease Out', curve: { x1: 0.165, y1: 0.84, x2: 0.44, y2: 1 } },
  { id: 'ease-out-expo', name: 'Ease Out Expo', category: 'Ease Out', curve: { x1: 0.19, y1: 1, x2: 0.22, y2: 1 } },
  { id: 'ease-out-back', name: 'Ease Out Back', category: 'Ease Out', curve: { x1: 0.175, y1: 0.885, x2: 0.32, y2: 1.275 } },

  // Ease In-Out
  { id: 'ease-in-out', name: 'Ease In-Out', category: 'Ease In-Out', curve: { x1: 0.42, y1: 0, x2: 0.58, y2: 1 } },
  { id: 'ease-in-out-quad', name: 'Ease In-Out Quad', category: 'Ease In-Out', curve: { x1: 0.455, y1: 0.03, x2: 0.515, y2: 0.955 } },
  { id: 'ease-in-out-cubic', name: 'Ease In-Out Cubic', category: 'Ease In-Out', curve: { x1: 0.645, y1: 0.045, x2: 0.355, y2: 1 } },
  { id: 'ease-in-out-quart', name: 'Ease In-Out Quart', category: 'Ease In-Out', curve: { x1: 0.77, y1: 0, x2: 0.175, y2: 1 } },
  { id: 'ease-in-out-expo', name: 'Ease In-Out Expo', category: 'Ease In-Out', curve: { x1: 1, y1: 0, x2: 0, y2: 1 } },
  { id: 'ease-in-out-back', name: 'Ease In-Out Back', category: 'Ease In-Out', curve: { x1: 0.68, y1: -0.55, x2: 0.265, y2: 1.55 } },
];

const CUSTOM_PRESETS_KEY = 'haast-flow-custom-presets';

export function loadCustomPresets(): Preset[] {
  try {
    const stored = localStorage.getItem(CUSTOM_PRESETS_KEY);
    if (!stored) return [];
    return JSON.parse(stored) as Preset[];
  } catch {
    return [];
  }
}

export function saveCustomPreset(preset: Preset): void {
  const existing = loadCustomPresets();
  const updated = [...existing.filter((p) => p.id !== preset.id), preset];
  localStorage.setItem(CUSTOM_PRESETS_KEY, JSON.stringify(updated));
}

export function deleteCustomPreset(id: string): void {
  const existing = loadCustomPresets();
  const updated = existing.filter((p) => p.id !== id);
  localStorage.setItem(CUSTOM_PRESETS_KEY, JSON.stringify(updated));
}

export function getAllPresets(): Preset[] {
  return [...BUILT_IN_PRESETS, ...loadCustomPresets()];
}
