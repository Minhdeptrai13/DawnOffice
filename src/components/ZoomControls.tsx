import { ZoomIn, ZoomOut, RotateCcw } from 'lucide-react';

interface ZoomControlsProps {
  zoom: number; // percentage e.g. 100
  onZoomChange: (newZoom: number) => void;
  lang?: 'vi' | 'en';
}

export default function ZoomControls({
  zoom,
  onZoomChange,
  lang = 'vi',
}: ZoomControlsProps) {
  const isVi = lang === 'vi';

  const handleZoomOut = () => {
    onZoomChange(Math.max(50, zoom - 10));
  };

  const handleZoomIn = () => {
    onZoomChange(Math.min(200, zoom + 10));
  };

  const handleResetZoom = () => {
    onZoomChange(100);
  };

  return (
    <div
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: '6px',
        backgroundColor: 'var(--do-color-bg)',
        border: '1px solid var(--do-color-border)',
        borderRadius: '8px',
        padding: '2px 6px',
        fontSize: '11px',
        userSelect: 'none',
      }}
    >
      <button
        className="do-btn-icon"
        onClick={handleZoomOut}
        style={{ width: '20px', height: '20px', borderRadius: '4px' }}
        title={isVi ? 'Thu nhỏ (-10%)' : 'Zoom Out (-10%)'}
      >
        <ZoomOut size={12} />
      </button>

      <input
        type="range"
        min={50}
        max={200}
        step={5}
        value={zoom}
        onChange={e => onZoomChange(parseInt(e.target.value, 10))}
        style={{
          width: '70px',
          height: '4px',
          accentColor: 'var(--do-color-primary)',
          cursor: 'pointer',
        }}
      />

      <button
        className="do-btn-icon"
        onClick={handleZoomIn}
        style={{ width: '20px', height: '20px', borderRadius: '4px' }}
        title={isVi ? 'Phóng to (+10%)' : 'Zoom In (+10%)'}
      >
        <ZoomIn size={12} />
      </button>

      <button
        onClick={handleResetZoom}
        style={{
          border: 'none',
          background: 'none',
          padding: '0 4px',
          fontWeight: 600,
          color: zoom === 100 ? 'var(--do-color-text-muted)' : 'var(--do-color-primary)',
          fontSize: '11px',
          cursor: 'pointer',
          display: 'flex',
          alignItems: 'center',
          gap: '3px',
        }}
        title={isVi ? 'Reset về 100%' : 'Reset to 100%'}
      >
        <span>{zoom}%</span>
        {zoom !== 100 && <RotateCcw size={10} />}
      </button>
    </div>
  );
}
