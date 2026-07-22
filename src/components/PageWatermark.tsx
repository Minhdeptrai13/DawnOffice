interface PageWatermarkProps {
  watermarkText?: string;
}

export default function PageWatermark({ watermarkText }: PageWatermarkProps) {
  if (!watermarkText) return null;

  return (
    <div
      style={{
        position: 'absolute',
        top: '50%',
        left: '50%',
        transform: 'translate(-50%, -50%) rotate(-45deg)',
        fontSize: '72px',
        fontWeight: 'bold',
        color: 'rgba(200, 200, 200, 0.25)',
        pointerEvents: 'none',
        userSelect: 'none',
        zIndex: 0,
        whiteSpace: 'nowrap',
        letterSpacing: '10px',
        textTransform: 'uppercase',
      }}
    >
      {watermarkText}
    </div>
  );
}
