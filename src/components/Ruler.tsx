interface RulerProps {
  width?: string | number;
  marginLeft?: number; // in mm or px
  marginRight?: number;
}

export default function Ruler({ width = '100%', marginLeft = 25, marginRight = 25 }: RulerProps) {
  const ticks = [];
  const totalMm = 210;

  for (let i = 0; i <= totalMm; i += 5) {
    const isMajor = i % 10 === 0;
    const isMid = i % 5 === 0 && !isMajor;
    ticks.push(
      <div
        key={i}
        style={{
          position: 'absolute',
          left: `${(i / totalMm) * 100}%`,
          bottom: 0,
          width: '1px',
          height: isMajor ? '10px' : isMid ? '6px' : '4px',
          backgroundColor: 'var(--do-color-text-muted)',
          opacity: 0.6,
        }}
      >
        {isMajor && i > 0 && i < totalMm && (
          <span
            style={{
              position: 'absolute',
              top: '-12px',
              left: '-50%',
              fontSize: '9px',
              color: 'var(--do-color-text-muted)',
              transform: 'translateX(-50%)',
              userSelect: 'none',
            }}
          >
            {i / 10}
          </span>
        )}
      </div>
    );
  }

  return (
    <div
      style={{
        width,
        height: '18px',
        backgroundColor: 'var(--do-color-bg)',
        borderBottom: '1px solid var(--do-color-border)',
        position: 'relative',
        overflow: 'hidden',
        boxSizing: 'border-box',
        margin: '0 auto',
        maxWidth: '816px',
      }}
    >
      <div
        style={{
          position: 'absolute',
          left: 0,
          top: 0,
          bottom: 0,
          width: `${(marginLeft / totalMm) * 100}%`,
          backgroundColor: 'rgba(0,0,0,0.06)',
          borderRight: '1px solid var(--do-color-accent)',
        }}
      />
      <div
        style={{
          position: 'absolute',
          right: 0,
          top: 0,
          bottom: 0,
          width: `${(marginRight / totalMm) * 100}%`,
          backgroundColor: 'rgba(0,0,0,0.06)',
          borderLeft: '1px solid var(--do-color-accent)',
        }}
      />
      {ticks}
    </div>
  );
}
