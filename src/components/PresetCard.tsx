import React, { useMemo } from 'react';
import { Preset } from '../types';
import { generateCurvePoints } from '../utils/bezier';

interface PresetCardProps {
  preset: Preset;
  isSelected: boolean;
  onClick: () => void;
  onDelete?: () => void;
}

const CARD_SIZE = 72;
const CARD_PADDING = 8;
const INNER = CARD_SIZE - CARD_PADDING * 2;

export const PresetCard: React.FC<PresetCardProps> = ({ preset, isSelected, onClick, onDelete }) => {
  const { x1, y1, x2, y2 } = preset.curve;

  const pathD = useMemo(() => {
    const points = generateCurvePoints(x1, y1, x2, y2, 60);
    return points
      .map((pt, i) => {
        const px = CARD_PADDING + pt.x * INNER;
        const py = CARD_PADDING + (1 - pt.y) * INNER;
        return `${i === 0 ? 'M' : 'L'}${px.toFixed(2)},${py.toFixed(2)}`;
      })
      .join(' ');
  }, [x1, y1, x2, y2]);

  // Clamp display to visible area using clipPath
  const minY = Math.min(y1, y2);
  const maxY = Math.max(y1, y2);
  const hasOvershoot = minY < 0 || maxY > 1;

  return (
    <div
      onClick={onClick}
      title={`${preset.name}\ncubic-bezier(${x1}, ${y1}, ${x2}, ${y2})`}
      style={{
        position: 'relative',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: 4,
        padding: '8px 4px 6px',
        borderRadius: 6,
        cursor: 'pointer',
        background: isSelected ? 'rgba(59,130,246,0.12)' : 'rgba(255,255,255,0.02)',
        border: `1px solid ${isSelected ? 'rgba(59,130,246,0.5)' : 'rgba(255,255,255,0.06)'}`,
        transition: 'all 0.12s ease',
        userSelect: 'none',
      }}
      onMouseEnter={(e) => {
        if (!isSelected) {
          (e.currentTarget as HTMLDivElement).style.background = 'rgba(255,255,255,0.05)';
          (e.currentTarget as HTMLDivElement).style.borderColor = 'rgba(255,255,255,0.12)';
        }
      }}
      onMouseLeave={(e) => {
        if (!isSelected) {
          (e.currentTarget as HTMLDivElement).style.background = 'rgba(255,255,255,0.02)';
          (e.currentTarget as HTMLDivElement).style.borderColor = 'rgba(255,255,255,0.06)';
        }
      }}
    >
      {/* Delete button for custom presets */}
      {preset.isCustom && onDelete && (
        <button
          onClick={(e) => {
            e.stopPropagation();
            onDelete();
          }}
          style={{
            position: 'absolute',
            top: 2,
            right: 2,
            width: 14,
            height: 14,
            border: 'none',
            background: 'rgba(239,68,68,0.15)',
            color: '#ef4444',
            borderRadius: 3,
            cursor: 'pointer',
            fontSize: 9,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            lineHeight: 1,
            padding: 0,
          }}
          title="Delete preset"
        >
          x
        </button>
      )}

      {/* SVG curve preview */}
      <svg
        width={CARD_SIZE}
        height={CARD_SIZE}
        style={{
          overflow: 'hidden',
          borderRadius: 4,
        }}
      >
        <defs>
          <clipPath id={`clip-${preset.id}`}>
            <rect x={0} y={0} width={CARD_SIZE} height={CARD_SIZE} />
          </clipPath>
        </defs>

        {/* Grid */}
        <line x1={CARD_PADDING} y1={CARD_PADDING} x2={CARD_PADDING + INNER} y2={CARD_PADDING + INNER}
          stroke="rgba(255,255,255,0.04)" strokeWidth="0.5" />
        <line x1={CARD_PADDING + INNER} y1={CARD_PADDING} x2={CARD_PADDING} y2={CARD_PADDING + INNER}
          stroke="rgba(255,255,255,0.04)" strokeWidth="0.5" />

        {/* Border */}
        <rect
          x={CARD_PADDING}
          y={CARD_PADDING}
          width={INNER}
          height={INNER}
          fill="none"
          stroke="rgba(255,255,255,0.08)"
          strokeWidth="0.5"
        />

        {/* Curve */}
        <g clipPath={`url(#clip-${preset.id})`}>
          {/* Glow */}
          <path
            d={pathD}
            fill="none"
            stroke={isSelected ? 'rgba(59,130,246,0.25)' : 'rgba(255,255,255,0.06)'}
            strokeWidth="5"
            strokeLinecap="round"
          />
          {/* Main curve */}
          <path
            d={pathD}
            fill="none"
            stroke={isSelected ? '#3b82f6' : hasOvershoot ? '#60a5fa' : '#ECECEC'}
            strokeWidth="1.5"
            strokeLinecap="round"
          />
        </g>

        {/* Anchor dots */}
        <circle cx={CARD_PADDING} cy={CARD_PADDING + INNER} r="2" fill="#666" />
        <circle cx={CARD_PADDING + INNER} cy={CARD_PADDING} r="2" fill="#666" />
      </svg>

      {/* Name */}
      <span
        style={{
          fontSize: 9,
          color: isSelected ? '#3b82f6' : '#888',
          fontFamily: 'Poppins, system-ui, sans-serif',
          textAlign: 'center',
          lineHeight: 1.2,
          maxWidth: CARD_SIZE,
          overflow: 'hidden',
          textOverflow: 'ellipsis',
          whiteSpace: 'nowrap',
          width: '100%',
          paddingLeft: 2,
          paddingRight: 2,
        }}
      >
        {preset.name}
      </span>
    </div>
  );
};
