import React, { useState, useCallback } from 'react';
import { CurveEditor } from './CurveEditor';
import { PresetLibrary } from './PresetLibrary';
import { Toolbar } from './Toolbar';
import { useBezier } from '../hooks/useBezier';
import { useAEBridge } from '../hooks/useAEBridge';
import { useUpdater } from '../hooks/useUpdater';
import { Preset } from '../types';

export const App: React.FC = () => {
  const { curve, updateHandle1, updateHandle2, loadPreset } = useBezier();
  const { isConnected, isApplying, lastError, lastSuccess, applyToKeyframes, clearStatus } = useAEBridge();
  const { updateStatus, newVersion } = useUpdater();

  const [selectedPresetId, setSelectedPresetId] = useState<string | null>('ease-in-out');
  const [inInfluence, setInInfluence] = useState<number>(33);
  const [outInfluence, setOutInfluence] = useState<number>(33);
  const [presetLibraryKey, setPresetLibraryKey] = useState(0);

  const handlePresetSelect = useCallback(
    (preset: Preset) => {
      setSelectedPresetId(preset.id);
      loadPreset(preset.curve);
      clearStatus();
    },
    [loadPreset, clearStatus]
  );

  const handleApply = useCallback(() => {
    const { x1, y1, x2, y2 } = curve;
    applyToKeyframes(x1, y1, x2, y2, inInfluence, outInfluence);
  }, [curve, applyToKeyframes, inInfluence, outInfluence]);

  const handleHandle1Change = useCallback(
    (x: number, y: number) => {
      setSelectedPresetId(null);
      updateHandle1(x, y);
    },
    [updateHandle1]
  );

  const handleHandle2Change = useCallback(
    (x: number, y: number) => {
      setSelectedPresetId(null);
      updateHandle2(x, y);
    },
    [updateHandle2]
  );

  const handlePresetSaved = useCallback(() => {
    setPresetLibraryKey((k) => k + 1);
  }, []);

  return (
    <div
      style={{
        width: '100%',
        height: '100vh',
        display: 'flex',
        flexDirection: 'column',
        background: '#020202',
        color: '#ECECEC',
        fontFamily: 'Poppins, system-ui, sans-serif',
        overflow: 'hidden',
      }}
    >
      {/* Update banner */}
      {updateStatus === 'updated' && (
        <div
          style={{
            background: '#1a6b3a',
            color: '#b6f5cb',
            fontSize: 11,
            padding: '6px 14px',
            textAlign: 'center',
            flexShrink: 0,
            letterSpacing: '0.03em',
          }}
        >
          Update {newVersion} geïnstalleerd — herstart After Effects
        </div>
      )}

      {/* Toolbar */}
      <Toolbar
        curve={curve}
        isConnected={isConnected}
        isApplying={isApplying}
        lastError={lastError}
        lastSuccess={lastSuccess}
        inInfluence={inInfluence}
        outInfluence={outInfluence}
        onInInfluenceChange={setInInfluence}
        onOutInfluenceChange={setOutInfluence}
        onApply={handleApply}
        onPresetSaved={handlePresetSaved}
      />

      {/* Curve editor */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'center',
          padding: '16px 16px 10px',
          flexShrink: 0,
        }}
      >
        <CurveEditor
          curve={curve}
          onHandle1Change={handleHandle1Change}
          onHandle2Change={handleHandle2Change}
        />
      </div>

      {/* Divider */}
      <div
        style={{
          height: 1,
          background: 'rgba(255,255,255,0.05)',
          flexShrink: 0,
          margin: '0 16px',
        }}
      />

      {/* Section label */}
      <div
        style={{
          padding: '10px 16px 6px',
          fontFamily: 'Poppins, system-ui, sans-serif',
          fontSize: 10,
          color: '#444',
          letterSpacing: '0.08em',
          textTransform: 'uppercase',
          flexShrink: 0,
        }}
      >
        Presets
      </div>

      {/* Preset library */}
      <div style={{ flex: 1, minHeight: 0, display: 'flex', flexDirection: 'column' }}>
        <PresetLibrary
          key={presetLibraryKey}
          selectedPresetId={selectedPresetId}
          onPresetSelect={handlePresetSelect}
          onCustomPresetsChange={() => setPresetLibraryKey((k) => k + 1)}
        />
      </div>
    </div>
  );
};
