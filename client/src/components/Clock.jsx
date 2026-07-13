import React from 'react';

export default function Clock({ praharIndex }) {
  const radius = 70;
  const circumference = 2 * Math.PI * radius; // 439.82
  const segmentLength = circumference / 8; // 54.98
  const center = 100;

  // Prahar names mapping
  const praharLabels = [
    { name: 'Dawn / P1', time: 'Sunrise' },
    { name: 'Morning / P2', time: 'Mid-Morning' },
    { name: 'Midday / P3', time: 'Noon' },
    { name: 'Afternoon / P4', time: 'Late-Afternoon' },
    { name: 'Dusk / P5', time: 'Sunset' },
    { name: 'Night I / P6', time: 'Early Night' },
    { name: 'Night II / P7', time: 'Midnight' },
    { name: 'Night III / P8', time: 'Late Night' }
  ];

  return (
    <div className="clock-container" style={{ textAlign: 'center', position: 'relative' }}>
      <svg width="220" height="220" viewBox="0 0 200 200">
        <defs>
          {/* Saffron glow filter for active segment */}
          <filter id="saffron-glow" x="-20%" y="-20%" width="140%" height="140%">
            <feGaussianBlur stdDeviation="4" result="blur" />
            <feComposite in="SourceGraphic" in2="blur" operator="over" />
          </filter>
        </defs>

        {/* Outer Ring */}
        <circle
          cx={center}
          cy={center}
          r={radius + 8}
          fill="none"
          stroke="rgba(255, 255, 255, 0.05)"
          strokeWidth="1"
        />

        {/* 8 Prahar Segments */}
        {Array.from({ length: 8 }).map((_, index) => {
          const pIdx = index + 1;
          const isActive = praharIndex === pIdx;
          
          // Rotate segments to start from the top (0 degrees is at the right, so we offset by -90 degrees)
          // Each segment is 45 degrees (360 / 8)
          // We add 1.5 degrees gap between segments
          const angle = index * 45 - 90;
          const strokeColor = isActive ? 'var(--color-accent)' : 'rgba(255, 255, 255, 0.1)';
          const strokeWidth = isActive ? 12 : 8;

          return (
            <circle
              key={pIdx}
              cx={center}
              cy={center}
              r={radius}
              fill="none"
              stroke={strokeColor}
              strokeWidth={strokeWidth}
              strokeDasharray={`${segmentLength - 3} 3`} // 3px gap
              strokeDashoffset={-index * segmentLength}
              transform={`rotate(${angle} ${center} ${center})`}
              filter={isActive ? "url(#saffron-glow)" : undefined}
              style={{ transition: 'all 0.5s ease-in-out' }}
            />
          );
        })}

        {/* Decorative inner sun/moon or text */}
        <circle
          cx={center}
          cy={center}
          r={radius - 15}
          fill="rgba(13, 11, 43, 0.6)"
          stroke="rgba(255, 255, 255, 0.05)"
          strokeWidth="1"
        />

        <text
          x={center}
          y={center - 5}
          textAnchor="middle"
          fill="var(--color-text-primary)"
          fontSize="14"
          fontWeight="bold"
          fontFamily="var(--font-headings)"
        >
          {praharIndex ? `Prahar ${praharIndex}` : 'Circadian'}
        </text>

        <text
          x={center}
          y={center + 12}
          textAnchor="middle"
          fill="var(--color-text-muted)"
          fontSize="9"
          fontWeight="500"
        >
          {praharIndex ? (praharIndex <= 4 ? 'Day Ragas' : 'Night Ragas') : 'Samay Clock'}
        </text>
      </svg>

      {/* Dynamic legend */}
      {praharIndex && (
        <div style={{ marginTop: '10px', fontSize: '0.85rem' }}>
          <span style={{ color: 'var(--color-accent)', fontWeight: 'bold' }}>
            Current: {praharLabels[praharIndex - 1].name}
          </span>
          <span className="text-muted" style={{ display: 'block', fontSize: '0.75rem' }}>
            Time Window: {praharLabels[praharIndex - 1].time}
          </span>
        </div>
      )}
    </div>
  );
}
