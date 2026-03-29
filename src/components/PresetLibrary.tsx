import React, { useState, useEffect, useCallback } from 'react';
import { Preset, PresetCategory } from '../types';
import { BUILT_IN_PRESETS, loadCustomPresets, deleteCustomPreset } from '../utils/presets';
import { PresetCard } from './PresetCard';

interface PresetLibraryProps {
  selectedPresetId: string | null;
  onPresetSelect: (preset: Preset) => void;
  onCustomPresetsChange?: () => void;
}

const CATEGORIES: PresetCategory[] = ['Basic', 'Ease In', 'Ease Out', 'Ease In-Out', 'Custom'];

export const PresetLibrary: React.FC<PresetLibraryProps> = ({
  selectedPresetId,
  onPresetSelect,
  onCustomPresetsChange,
}) => {
  const [activeCategory, setActiveCategory] = useState<PresetCategory>('Basic');
  const [customPresets, setCustomPresets] = useState<Preset[]>([]);

  const refreshCustomPresets = useCallback(() => {
    setCustomPresets(loadCustomPresets());
  }, []);

  useEffect(() => {
    refreshCustomPresets();
  }, [refreshCustomPresets]);

  const handleDelete = useCallback(
    (id: string) => {
      deleteCustomPreset(id);
      refreshCustomPresets();
      onCustomPresetsChange?.();
    },
    [refreshCustomPresets, onCustomPresetsChange]
  );

  const displayedPresets =
    activeCategory === 'Custom'
      ? customPresets
      : BUILT_IN_PRESETS.filter((p) => p.category === activeCategory);

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        gap: 0,
        flex: 1,
        minHeight: 0,
      }}
    >
      {/* Category tabs */}
      <div
        style={{
          display: 'flex',
          gap: 2,
          padding: '0 16px 10px',
          flexWrap: 'wrap',
        }}
      >
        {CATEGORIES.map((cat) => {
          const count =
            cat === 'Custom'
              ? customPresets.length
              : BUILT_IN_PRESETS.filter((p) => p.category === cat).length;
          const isActive = activeCategory === cat;
          return (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat)}
              style={{
                padding: '4px 10px',
                borderRadius: 4,
                border: `1px solid ${isActive ? 'rgba(59,130,246,0.5)' : 'rgba(255,255,255,0.07)'}`,
                background: isActive ? 'rgba(59,130,246,0.12)' : 'transparent',
                color: isActive ? '#3b82f6' : '#666',
                fontSize: 10,
                fontFamily: 'Poppins, system-ui, sans-serif',
                cursor: 'pointer',
                transition: 'all 0.12s ease',
                whiteSpace: 'nowrap',
              }}
            >
              {cat}
              <span
                style={{
                  marginLeft: 4,
                  fontSize: 9,
                  color: isActive ? 'rgba(59,130,246,0.7)' : 'rgba(255,255,255,0.2)',
                }}
              >
                {count}
              </span>
            </button>
          );
        })}
      </div>

      {/* Presets grid */}
      <div
        style={{
          flex: 1,
          overflowY: 'auto',
          padding: '2px 16px 16px',
          scrollbarWidth: 'thin',
          scrollbarColor: 'rgba(255,255,255,0.1) transparent',
        }}
      >
        {displayedPresets.length === 0 ? (
          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              padding: '32px 16px',
              gap: 8,
              color: '#444',
              fontFamily: 'Poppins, system-ui, sans-serif',
              fontSize: 12,
              textAlign: 'center',
            }}
          >
            <span style={{ fontSize: 24, opacity: 0.4 }}>+</span>
            <span>No custom presets yet.</span>
            <span style={{ fontSize: 10, color: '#333' }}>
              Use "Save Preset" to add your own curves here.
            </span>
          </div>
        ) : (
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(4, 1fr)',
              gap: 6,
            }}
          >
            {displayedPresets.map((preset) => (
              <PresetCard
                key={preset.id}
                preset={preset}
                isSelected={selectedPresetId === preset.id}
                onClick={() => onPresetSelect(preset)}
                onDelete={preset.isCustom ? () => handleDelete(preset.id) : undefined}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
