import React, { useState, useCallback } from 'react';
import { BezierCurve } from '../types';
import { formatBezierValue } from '../utils/bezier';
import { saveCustomPreset } from '../utils/presets';
import { Preset } from '../types';

interface ToolbarProps {
  curve: BezierCurve;
  isConnected: boolean;
  isApplying: boolean;
  lastError: string | null;
  lastSuccess: boolean;
  inInfluence: number;
  outInfluence: number;
  onInInfluenceChange: (value: number) => void;
  onOutInfluenceChange: (value: number) => void;
  onApply: () => void;
  onPresetSaved: () => void;
}

export const Toolbar: React.FC<ToolbarProps> = ({
  curve,
  isConnected,
  isApplying,
  lastError,
  lastSuccess,
  inInfluence,
  outInfluence,
  onInInfluenceChange,
  onOutInfluenceChange,
  onApply,
  onPresetSaved,
}) => {
  const [copied, setCopied] = useState(false);
  const [showSaveDialog, setShowSaveDialog] = useState(false);
  const [presetName, setPresetName] = useState('');

  const { x1, y1, x2, y2 } = curve;

  const handleCopy = useCallback(() => {
    const cssValue = `cubic-bezier(${formatBezierValue(x1)}, ${formatBezierValue(y1)}, ${formatBezierValue(x2)}, ${formatBezierValue(y2)})`;
    navigator.clipboard.writeText(cssValue).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    });
  }, [x1, y1, x2, y2]);

  const handleSavePreset = useCallback(() => {
    if (!presetName.trim()) return;
    const newPreset: Preset = {
      id: `custom-${Date.now()}`,
      name: presetName.trim(),
      category: 'Custom',
      curve: { ...curve },
      isCustom: true,
    };
    saveCustomPreset(newPreset);
    setPresetName('');
    setShowSaveDialog(false);
    onPresetSaved();
  }, [presetName, curve, onPresetSaved]);

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLInputElement>) => {
      if (e.key === 'Enter') handleSavePreset();
      if (e.key === 'Escape') {
        setShowSaveDialog(false);
        setPresetName('');
      }
    },
    [handleSavePreset]
  );

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        gap: 0,
        padding: '14px 16px 12px',
        borderBottom: '1px solid rgba(255,255,255,0.06)',
      }}
    >
      {/* Logo row */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: 12,
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          {/* Logo mark */}
          <svg width="22" height="22" viewBox="0 0 22 22" fill="none">
            <rect width="22" height="22" rx="5" fill="#3b82f6" />
            <path
              d="M4 17 C7 17, 7 5, 11 11 C15 17, 15 5, 18 5"
              stroke="white"
              strokeWidth="2"
              strokeLinecap="round"
              fill="none"
            />
          </svg>
          <div>
            <div
              style={{
                fontFamily: 'Poppins, system-ui, sans-serif',
                fontWeight: 600,
                fontSize: 13,
                color: '#ECECEC',
                letterSpacing: '0.01em',
                lineHeight: 1.1,
              }}
            >
              Haast Flow
            </div>
            <div
              style={{
                fontFamily: 'Poppins, system-ui, sans-serif',
                fontSize: 9,
                color: '#444',
                letterSpacing: '0.08em',
                textTransform: 'uppercase',
              }}
            >
              Bezier Easing Editor
            </div>
          </div>
        </div>

        {/* Connection indicator */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
          <div
            style={{
              width: 6,
              height: 6,
              borderRadius: '50%',
              background: isConnected ? '#22c55e' : '#555',
              boxShadow: isConnected ? '0 0 6px #22c55e' : 'none',
            }}
          />
          <span
            style={{
              fontSize: 10,
              color: isConnected ? '#22c55e' : '#555',
              fontFamily: 'Poppins, system-ui, sans-serif',
            }}
          >
            {isConnected ? 'AE' : 'Dev'}
          </span>
        </div>
      </div>

      {/* Influence sliders */}
      <div style={{ display: 'flex', gap: 10, marginBottom: 10 }}>
        <SliderControl
          label="In %"
          value={inInfluence}
          min={1}
          max={100}
          onChange={onInInfluenceChange}
        />
        <SliderControl
          label="Out %"
          value={outInfluence}
          min={1}
          max={100}
          onChange={onOutInfluenceChange}
        />
      </div>

      {/* Action buttons row */}
      <div style={{ display: 'flex', gap: 6 }}>
        {/* Apply button */}
        <button
          onClick={onApply}
          disabled={isApplying}
          style={{
            flex: 1,
            padding: '9px 12px',
            borderRadius: 6,
            border: 'none',
            background: lastSuccess
              ? '#22c55e'
              : isApplying
              ? 'rgba(59,130,246,0.5)'
              : '#3b82f6',
            color: '#fff',
            fontFamily: 'Poppins, system-ui, sans-serif',
            fontWeight: 600,
            fontSize: 12,
            cursor: isApplying ? 'not-allowed' : 'pointer',
            transition: 'background 0.15s ease',
            letterSpacing: '0.02em',
          }}
          onMouseEnter={(e) => {
            if (!isApplying && !lastSuccess) {
              (e.currentTarget as HTMLButtonElement).style.background = '#2563eb';
            }
          }}
          onMouseLeave={(e) => {
            if (!isApplying && !lastSuccess) {
              (e.currentTarget as HTMLButtonElement).style.background = '#3b82f6';
            }
          }}
        >
          {lastSuccess ? 'Applied!' : isApplying ? 'Applying...' : 'Apply to Keyframes'}
        </button>

        {/* Copy CSS button */}
        <button
          onClick={handleCopy}
          title="Copy CSS cubic-bezier"
          style={{
            padding: '9px 10px',
            borderRadius: 6,
            border: '1px solid rgba(255,255,255,0.08)',
            background: copied ? 'rgba(34,197,94,0.12)' : 'rgba(255,255,255,0.04)',
            color: copied ? '#22c55e' : '#888',
            fontFamily: 'Poppins, system-ui, sans-serif',
            fontSize: 11,
            cursor: 'pointer',
            transition: 'all 0.12s ease',
            whiteSpace: 'nowrap',
          }}
        >
          {copied ? 'Copied!' : 'Copy CSS'}
        </button>

        {/* Save preset button */}
        <button
          onClick={() => setShowSaveDialog(true)}
          title="Save as preset"
          style={{
            padding: '9px 10px',
            borderRadius: 6,
            border: '1px solid rgba(255,255,255,0.08)',
            background: 'rgba(255,255,255,0.04)',
            color: '#888',
            fontFamily: 'Poppins, system-ui, sans-serif',
            fontSize: 11,
            cursor: 'pointer',
            transition: 'all 0.12s ease',
            whiteSpace: 'nowrap',
          }}
        >
          + Save
        </button>
      </div>

      {/* Error message */}
      {lastError && (
        <div
          style={{
            marginTop: 8,
            padding: '6px 10px',
            borderRadius: 4,
            background: 'rgba(239,68,68,0.08)',
            border: '1px solid rgba(239,68,68,0.2)',
            color: '#ef4444',
            fontSize: 10,
            fontFamily: 'Poppins, system-ui, sans-serif',
            lineHeight: 1.4,
          }}
        >
          {lastError}
        </div>
      )}

      {/* Save preset dialog */}
      {showSaveDialog && (
        <div
          style={{
            marginTop: 8,
            padding: '10px',
            borderRadius: 6,
            background: 'rgba(255,255,255,0.04)',
            border: '1px solid rgba(255,255,255,0.1)',
            display: 'flex',
            gap: 6,
          }}
        >
          <input
            autoFocus
            value={presetName}
            onChange={(e) => setPresetName(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Preset name..."
            style={{
              flex: 1,
              padding: '6px 10px',
              borderRadius: 4,
              border: '1px solid rgba(255,255,255,0.1)',
              background: '#0a0a0a',
              color: '#ECECEC',
              fontFamily: 'Poppins, system-ui, sans-serif',
              fontSize: 11,
              outline: 'none',
            }}
          />
          <button
            onClick={handleSavePreset}
            disabled={!presetName.trim()}
            style={{
              padding: '6px 12px',
              borderRadius: 4,
              border: 'none',
              background: presetName.trim() ? '#3b82f6' : '#222',
              color: presetName.trim() ? '#fff' : '#444',
              fontFamily: 'Poppins, system-ui, sans-serif',
              fontSize: 11,
              cursor: presetName.trim() ? 'pointer' : 'not-allowed',
            }}
          >
            Save
          </button>
          <button
            onClick={() => {
              setShowSaveDialog(false);
              setPresetName('');
            }}
            style={{
              padding: '6px 8px',
              borderRadius: 4,
              border: '1px solid rgba(255,255,255,0.08)',
              background: 'transparent',
              color: '#666',
              fontFamily: 'Poppins, system-ui, sans-serif',
              fontSize: 11,
              cursor: 'pointer',
            }}
          >
            Cancel
          </button>
        </div>
      )}
    </div>
  );
};

interface SliderControlProps {
  label: string;
  value: number;
  min: number;
  max: number;
  onChange: (value: number) => void;
}

const SliderControl: React.FC<SliderControlProps> = ({ label, value, min, max, onChange }) => {
  return (
    <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 3 }}>
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
        }}
      >
        <span
          style={{
            fontSize: 10,
            color: '#666',
            fontFamily: 'Poppins, system-ui, sans-serif',
          }}
        >
          {label}
        </span>
        <span
          style={{
            fontSize: 10,
            color: '#888',
            fontFamily: 'monospace',
          }}
        >
          {value}
        </span>
      </div>
      <input
        type="range"
        min={min}
        max={max}
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        style={{
          width: '100%',
          height: 3,
          accentColor: '#3b82f6',
          cursor: 'pointer',
        }}
      />
    </div>
  );
};
