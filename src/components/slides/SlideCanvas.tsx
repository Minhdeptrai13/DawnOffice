import { useState, useRef, useEffect } from 'react';
import { Slide, SlideElement, SlideAnimation } from '../../types/slides';
import { Lock, Bold, Italic, Layers, Sparkles, Zap, ArrowRight } from 'lucide-react';

interface SlideCanvasProps {
  slide: Slide;
  aspectRatio: '16:9' | '4:3';
  selectedElementId: string | null;
  animations?: SlideAnimation[];
  showGridlines?: boolean;
  showGuides?: boolean;
  onSelectElement: (id: string | null) => void;
  onUpdateElement: (elementId: string, updates: Partial<SlideElement>) => void;
  onUpdateSlideTitle: (title: string) => void;
  lang: 'vi' | 'en';
}

export default function SlideCanvas({
  slide,
  aspectRatio,
  selectedElementId,
  animations = [],
  showGridlines = false,
  showGuides = false,
  onSelectElement,
  onUpdateElement,
  onUpdateSlideTitle,
  lang,
}: SlideCanvasProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [draggingId, setDraggingId] = useState<string | null>(null);
  const dragStartPos = useRef<{ x: number; y: number; elemX: number; elemY: number } | null>(null);

  // Marquee Selection Box
  const [isMarqueeSelecting, setIsMarqueeSelecting] = useState(false);
  const [marqueeBox, setMarqueeBox] = useState<{ startX: number; startY: number; endX: number; endY: number } | null>(null);

  // Active playing preview element ID
  const [previewAnimElemId, setPreviewAnimElemId] = useState<string | null>(null);

  // Smart Alignment Guides State (Red Snapping Lines)
  const [snapGuides, setSnapGuides] = useState<{ xPct: number | null; yPct: number | null }>({ xPct: null, yPct: null });

  const isVi = lang === 'vi';

  // Canvas virtual coordinates (1920x1080 for 16:9, 1440x1080 for 4:3)
  const VIRTUAL_W = aspectRatio === '16:9' ? 1920 : 1440;
  const VIRTUAL_H = 1080;

  // Handle Selection & Dragging
  const handleElementMouseDown = (e: React.MouseEvent, element: SlideElement) => {
    e.stopPropagation();
    onSelectElement(element.id);

    if (element.locked) return; // Cannot drag locked elements

    setDraggingId(element.id);
    dragStartPos.current = {
      x: e.clientX,
      y: e.clientY,
      elemX: element.x,
      elemY: element.y,
    };
  };

  // Canvas Outer Drag / Deselect
  const handleCanvasMouseDown = (e: React.MouseEvent) => {
    if (e.target === containerRef.current) {
      onSelectElement(null);
      const rect = containerRef.current.getBoundingClientRect();
      setIsMarqueeSelecting(true);
      setMarqueeBox({
        startX: e.clientX - rect.left,
        startY: e.clientY - rect.top,
        endX: e.clientX - rect.left,
        endY: e.clientY - rect.top,
      });
    }
  };

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (draggingId && dragStartPos.current && containerRef.current) {
        const rect = containerRef.current.getBoundingClientRect();
        const scale = rect.width / VIRTUAL_W;

        const deltaX = (e.clientX - dragStartPos.current.x) / scale;
        const deltaY = (e.clientY - dragStartPos.current.y) / scale;

        let rawX = Math.round(dragStartPos.current.elemX + deltaX);
        let rawY = Math.round(dragStartPos.current.elemY + deltaY);

        const activeElem = slide.elements.find(el => el.id === draggingId);
        const elemW = activeElem ? activeElem.width : 200;
        const elemH = activeElem ? activeElem.height : 100;

        let snappedXPct: number | null = null;
        let snappedYPct: number | null = null;

        // 1. Canvas Center Snapping
        const centerX = rawX + elemW / 2;
        const centerY = rawY + elemH / 2;
        const canvasCenterX = VIRTUAL_W / 2;
        const canvasCenterY = VIRTUAL_H / 2;

        const SNAP_THRESH = 12;

        if (Math.abs(centerX - canvasCenterX) < SNAP_THRESH) {
          rawX = canvasCenterX - elemW / 2;
          snappedXPct = 50;
        }

        if (Math.abs(centerY - canvasCenterY) < SNAP_THRESH) {
          rawY = canvasCenterY - elemH / 2;
          snappedYPct = 50;
        }

        // 2. Alignment Snapping relative to other slide elements
        slide.elements.forEach(other => {
          if (other.id === draggingId) return;
          const otherCenterX = other.x + other.width / 2;
          const otherCenterY = other.y + other.height / 2;

          if (Math.abs(centerX - otherCenterX) < SNAP_THRESH) {
            rawX = otherCenterX - elemW / 2;
            snappedXPct = (otherCenterX / VIRTUAL_W) * 100;
          }

          if (Math.abs(centerY - otherCenterY) < SNAP_THRESH) {
            rawY = otherCenterY - elemH / 2;
            snappedYPct = (otherCenterY / VIRTUAL_H) * 100;
          }
        });

        setSnapGuides({ xPct: snappedXPct, yPct: snappedYPct });
        onUpdateElement(draggingId, { x: rawX, y: rawY });
      } else if (isMarqueeSelecting && marqueeBox && containerRef.current) {
        const rect = containerRef.current.getBoundingClientRect();
        setMarqueeBox(prev => (prev ? { ...prev, endX: e.clientX - rect.left, endY: e.clientY - rect.top } : null));
      }
    };

    const handleMouseUp = () => {
      setDraggingId(null);
      dragStartPos.current = null;
      setIsMarqueeSelecting(false);
      setMarqueeBox(null);
      setSnapGuides({ xPct: null, yPct: null });
    };

    if (draggingId || isMarqueeSelecting) {
      window.addEventListener('mousemove', handleMouseMove);
      window.addEventListener('mouseup', handleMouseUp);
    }
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    };
  }, [draggingId, isMarqueeSelecting, marqueeBox, VIRTUAL_W, VIRTUAL_H, slide.elements, onUpdateElement]);

  const triggerAnimPreview = (elemId: string) => {
    setPreviewAnimElemId(elemId);
    setTimeout(() => setPreviewAnimElemId(null), 1500);
  };

  return (
    <div
      style={{
        flex: 1,
        backgroundColor: 'var(--do-color-bg)',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        padding: '2rem',
        overflow: 'auto',
        position: 'relative',
      }}
      onClick={e => {
        if (e.target === e.currentTarget) onSelectElement(null);
      }}
    >
      <style>{`
        @keyframes animFlyIn {
          0% { transform: translateY(80px); opacity: 0; }
          100% { transform: translateY(0); opacity: 1; }
        }
        @keyframes animBounceIn {
          0% { transform: translateY(-40px); opacity: 0; }
          60% { transform: translateY(10px); }
          100% { transform: translateY(0); opacity: 1; }
        }
        @keyframes animPulse {
          0%, 100% { transform: scale(1); }
          50% { transform: scale(1.15); }
        }
        @keyframes animSpin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
      `}</style>

      {/* 16:9 / 4:3 Canvas Frame Container */}
      <div
        ref={containerRef}
        onMouseDown={handleCanvasMouseDown}
        style={{
          width: '100%',
          maxWidth: '1020px',
          aspectRatio: aspectRatio === '16:9' ? '16 / 9' : '4 / 3',
          background: slide.backgroundFill || '#ffffff',
          boxShadow: '0 12px 36px rgba(0, 0, 0, 0.16), 0 2px 8px rgba(0, 0, 0, 0.08)',
          borderRadius: '12px',
          position: 'relative',
          overflow: 'hidden',
          transition: 'background 0.3s ease',
          userSelect: 'none',
        }}
      >
        {/* Optional Gridlines */}
        {showGridlines && (
          <div
            style={{
              position: 'absolute',
              inset: 0,
              backgroundImage: 'linear-gradient(to right, rgba(0,0,0,0.05) 1px, transparent 1px), linear-gradient(to bottom, rgba(0,0,0,0.05) 1px, transparent 1px)',
              backgroundSize: '40px 40px',
              pointerEvents: 'none',
              zIndex: 1,
            }}
          />
        )}

        {/* Optional Center Guides */}
        {showGuides && (
          <>
            <div style={{ position: 'absolute', top: 0, bottom: 0, left: '50%', width: '1px', borderLeft: '1px dashed rgba(59, 130, 246, 0.5)', pointerEvents: 'none', zIndex: 2 }} />
            <div style={{ position: 'absolute', left: 0, right: 0, top: '50%', height: '1px', borderTop: '1px dashed rgba(59, 130, 246, 0.5)', pointerEvents: 'none', zIndex: 2 }} />
          </>
        )}

        {/* Dynamic Red Smart Alignment Snapping Lines */}
        {snapGuides.xPct !== null && (
          <div
            style={{
              position: 'absolute',
              top: 0,
              bottom: 0,
              left: `${snapGuides.xPct}%`,
              width: '1.5px',
              backgroundColor: '#ef4444',
              boxShadow: '0 0 4px #ef4444',
              pointerEvents: 'none',
              zIndex: 9999,
            }}
          />
        )}
        {snapGuides.yPct !== null && (
          <div
            style={{
              position: 'absolute',
              left: 0,
              right: 0,
              top: `${snapGuides.yPct}%`,
              height: '1.5px',
              backgroundColor: '#ef4444',
              boxShadow: '0 0 4px #ef4444',
              pointerEvents: 'none',
              zIndex: 9999,
            }}
          />
        )}

        {/* Marquee Selection Frame */}
        {isMarqueeSelecting && marqueeBox && (
          <div
            style={{
              position: 'absolute',
              left: `${Math.min(marqueeBox.startX, marqueeBox.endX)}px`,
              top: `${Math.min(marqueeBox.startY, marqueeBox.endY)}px`,
              width: `${Math.abs(marqueeBox.endX - marqueeBox.startX)}px`,
              height: `${Math.abs(marqueeBox.endY - marqueeBox.startY)}px`,
              border: '1.5px dashed var(--do-color-primary)',
              backgroundColor: 'rgba(37, 99, 235, 0.12)',
              pointerEvents: 'none',
              zIndex: 999,
            }}
          />
        )}

        {/* Render Slide Elements */}
        {slide.elements.map(el => {
          const isSelected = el.id === selectedElementId;
          const assignedAnimIndex = animations.findIndex(a => a.elementId === el.id);
          const assignedAnim = assignedAnimIndex >= 0 ? animations[assignedAnimIndex] : null;

          // Convert virtual 1920x1080 percentages to CSS %
          const leftPct = (el.x / VIRTUAL_W) * 100;
          const topPct = (el.y / VIRTUAL_H) * 100;
          const widthPct = (el.width / VIRTUAL_W) * 100;
          const heightPct = (el.height / VIRTUAL_H) * 100;

          const filterCss = el.imageFilter
            ? `brightness(${el.imageFilter.brightness ?? 100}%) contrast(${el.imageFilter.contrast ?? 100}%) grayscale(${el.imageFilter.grayscale ?? 0}%) blur(${el.imageFilter.blur ?? 0}px)`
            : 'none';

          const isPreviewingThis = previewAnimElemId === el.id;
          const previewAnimStyle: React.CSSProperties = isPreviewingThis && assignedAnim
            ? {
                animation:
                  assignedAnim.type === 'fly-in'
                    ? 'animFlyIn 0.8s ease-out'
                    : assignedAnim.type === 'bounce-in'
                    ? 'animBounceIn 0.8s ease-out'
                    : assignedAnim.type === 'pulse'
                    ? 'animPulse 0.8s ease-in-out'
                    : assignedAnim.type === 'spin'
                    ? 'animSpin 0.8s ease-in-out'
                    : 'none',
              }
            : {};

          return (
            <div
              key={el.id}
              onMouseDown={e => handleElementMouseDown(e, el)}
              onClick={e => e.stopPropagation()}
              style={{
                position: 'absolute',
                left: `${leftPct}%`,
                top: `${topPct}%`,
                width: `${widthPct}%`,
                height: `${heightPct}%`,
                transform: `rotate(${el.rotation}deg)`,
                zIndex: el.zIndex,
                outline: isSelected ? '2px solid var(--do-color-primary)' : 'none',
                outlineOffset: '2px',
                boxShadow: isSelected ? '0 0 12px rgba(37, 99, 235, 0.4)' : 'none',
                cursor: el.locked ? 'not-allowed' : draggingId === el.id ? 'grabbing' : 'grab',
                boxSizing: 'border-box',
                borderRadius: el.shapeKind === 'circle' ? '50%' : '6px',
                backgroundColor: el.fillColor || 'transparent',
                border: el.strokeColor ? `${el.strokeWidth || 2}px solid ${el.strokeColor}` : 'none',
                display: 'flex',
                alignItems: el.verticalAlign === 'top' ? 'flex-start' : el.verticalAlign === 'bottom' ? 'flex-end' : 'center',
                justifyContent: el.textAlign === 'center' ? 'center' : el.textAlign === 'right' ? 'flex-end' : 'flex-start',
                padding: '8px',
                filter: filterCss,
                clipPath:
                  el.shapeKind === 'triangle'
                    ? 'polygon(50% 0%, 0% 100%, 100% 100%)'
                    : el.shapeKind === 'star'
                    ? 'polygon(50% 0%, 61% 35%, 98% 35%, 68% 57%, 79% 91%, 50% 70%, 21% 91%, 32% 57%, 2% 35%, 39% 35%)'
                    : el.shapeKind === 'arrow-right'
                    ? 'polygon(0% 20%, 60% 20%, 60% 0%, 100% 50%, 60% 100%, 60% 80%, 0% 80%)'
                    : 'none',
                ...previewAnimStyle,
              }}
            >
              {/* PowerPoint Animation Order Badge on Top-Left */}
              {assignedAnim && (
                <div
                  onClick={e => {
                    e.stopPropagation();
                    triggerAnimPreview(el.id);
                  }}
                  style={{
                    position: 'absolute',
                    top: '-12px',
                    left: '-12px',
                    backgroundColor: 'var(--do-color-primary)',
                    color: '#ffffff',
                    borderRadius: '50%',
                    width: '22px',
                    height: '22px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '11px',
                    fontWeight: 'bold',
                    boxShadow: '0 2px 6px rgba(0, 0, 0, 0.25)',
                    cursor: 'pointer',
                    zIndex: 100,
                  }}
                  title={`Animation Order: ${assignedAnimIndex + 1} (${assignedAnim.type}). Click to preview.`}
                >
                  <Zap size={10} style={{ marginRight: '1px' }} />
                  {assignedAnimIndex + 1}
                </div>
              )}

              {/* Lock Badge */}
              {el.locked && (
                <div
                  style={{
                    position: 'absolute',
                    top: '4px',
                    right: '4px',
                    background: 'rgba(0,0,0,0.6)',
                    color: '#fff',
                    borderRadius: '4px',
                    padding: '2px 4px',
                    fontSize: '10px',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '2px',
                    zIndex: 10,
                  }}
                >
                  <Lock size={10} /> {isVi ? 'Khóa' : 'Locked'}
                </div>
              )}

              {/* Quick Floating Format Toolbar on Top of Selected Element */}
              {isSelected && !el.locked && (
                <div
                  onClick={e => e.stopPropagation()}
                  style={{
                    position: 'absolute',
                    top: '-46px',
                    left: '50%',
                    transform: 'translateX(-50%)',
                    backgroundColor: 'var(--do-color-surface)',
                    border: '1px solid var(--do-color-border)',
                    boxShadow: 'var(--do-shadow-lg)',
                    borderRadius: '10px',
                    padding: '4px 8px',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px',
                    zIndex: 1000,
                    animation: 'fadeIn 0.15s ease-out',
                  }}
                >
                  <button
                    onClick={() => onUpdateElement(el.id, { bold: !el.bold })}
                    className={`do-btn-icon ${el.bold ? 'active' : ''}`}
                    style={{ borderRadius: '6px' }}
                    title="Bold"
                  >
                    <Bold size={13} />
                  </button>
                  <button
                    onClick={() => onUpdateElement(el.id, { italic: !el.italic })}
                    className={`do-btn-icon ${el.italic ? 'active' : ''}`}
                    style={{ borderRadius: '6px' }}
                    title="Italic"
                  >
                    <Italic size={13} />
                  </button>
                  <button
                    onClick={() => onUpdateElement(el.id, { wordartGlow: !el.wordartGlow })}
                    className={`do-btn-icon ${el.wordartGlow ? 'active' : ''}`}
                    style={{ borderRadius: '6px' }}
                    title="3D Glow"
                  >
                    <Sparkles size={13} />
                  </button>
                  <button
                    onClick={() => onUpdateElement(el.id, { zIndex: el.zIndex + 1 })}
                    className="do-btn-icon"
                    style={{ borderRadius: '6px' }}
                    title="Bring Forward"
                  >
                    <Layers size={13} />
                  </button>
                  <div style={{ width: '1px', height: '16px', backgroundColor: 'var(--do-color-border)' }} />
                  <button
                    onClick={() => onUpdateElement(el.id, { locked: true })}
                    className="do-btn-icon"
                    style={{ borderRadius: '6px' }}
                    title="Lock Object"
                  >
                    <Lock size={13} />
                  </button>
                  <button
                    onClick={() => onUpdateElement(el.id, { fillColor: '#ec4899' })}
                    style={{ width: '16px', height: '16px', borderRadius: '50%', background: '#ec4899', border: 'none', cursor: 'pointer' }}
                    title="Pink Fill"
                  />
                  <button
                    onClick={() => onUpdateElement(el.id, { fillColor: '#3b82f6' })}
                    style={{ width: '16px', height: '16px', borderRadius: '50%', background: '#3b82f6', border: 'none', cursor: 'pointer' }}
                    title="Blue Fill"
                  />
                  <button
                    onClick={() => onUpdateElement(el.id, { fillColor: '#10b981' })}
                    style={{ width: '16px', height: '16px', borderRadius: '50%', background: '#10b981', border: 'none', cursor: 'pointer' }}
                    title="Emerald Fill"
                  />
                </div>
              )}

              {/* Element Types */}
              {(el.type === 'text' || el.type === 'wordart') && (
                <div
                  contentEditable={!el.locked}
                  suppressContentEditableWarning
                  onFocus={e => e.stopPropagation()}
                  onClick={e => e.stopPropagation()}
                  onBlur={e => {
                    const newText = e.currentTarget.innerText;
                    onUpdateElement(el.id, { content: newText });
                    if (el.id === 'title-elem') onUpdateSlideTitle(newText);
                  }}
                  style={{
                    width: '100%',
                    height: '100%',
                    outline: 'none',
                    fontSize: `${el.fontSize || 32}px`,
                    lineHeight: el.lineHeight || 1.3,
                    letterSpacing: `${el.letterSpacing || 0}px`,
                    fontFamily: el.fontFamily || 'Inter, sans-serif',
                    color: el.textColor || 'var(--do-color-text)',
                    fontWeight: el.bold ? 'bold' : 'normal',
                    fontStyle: el.italic ? 'italic' : 'normal',
                    textDecoration: `${el.underline ? 'underline' : ''} ${el.strikethrough ? 'line-through' : ''}`.trim() || 'none',
                    textAlign: el.textAlign || 'left',
                    textShadow: el.wordartGlow
                      ? '0 0 10px #3b82f6, 0 0 20px #3b82f6, 0 0 30px #3b82f6'
                      : el.shadow
                      ? '2px 4px 10px rgba(0, 0, 0, 0.3)'
                      : 'none',
                    userSelect: 'text',
                    cursor: el.locked ? 'default' : 'text',
                    wordBreak: 'break-word',
                    display: 'flex',
                    alignItems: el.verticalAlign === 'top' ? 'flex-start' : el.verticalAlign === 'bottom' ? 'flex-end' : 'center',
                  }}
                >
                  {el.content || (isVi ? 'Nhập văn bản tại đây...' : 'Click to add text...')}
                </div>
              )}

              {el.type === 'shape' && (
                <div
                  contentEditable={!el.locked}
                  suppressContentEditableWarning
                  onFocus={e => e.stopPropagation()}
                  onClick={e => e.stopPropagation()}
                  onBlur={e => onUpdateElement(el.id, { content: e.currentTarget.innerText })}
                  style={{
                    width: '100%',
                    height: '100%',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: `${el.fontSize || 24}px`,
                    color: el.textColor || '#ffffff',
                    fontWeight: 'bold',
                    outline: 'none',
                    textAlign: 'center',
                  }}
                >
                  {el.content}
                </div>
              )}

              {el.type === 'image' && (
                <img
                  src={el.content}
                  alt="Slide Graphic"
                  style={{ width: '100%', height: '100%', objectFit: 'contain', pointerEvents: 'none' }}
                />
              )}

              {el.type === 'table' && el.tableData && (
                <table style={{ width: '100%', height: '100%', borderCollapse: 'collapse' }}>
                  <tbody>
                    {el.tableData.map((row, r) => (
                      <tr key={r}>
                        {row.map((cell, c) => (
                          <td
                            key={c}
                            style={{
                              border: '1px solid var(--do-color-border)',
                              padding: '6px 10px',
                              fontSize: '14px',
                              textAlign: 'center',
                              background: r === 0 ? 'var(--do-color-primary)' : 'transparent',
                              color: r === 0 ? '#fff' : 'inherit',
                              fontWeight: r === 0 ? 600 : 400,
                            }}
                          >
                            {cell}
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}

              {/* Render SmartArt Elements */}
              {el.type === 'smartart' && el.smartartData && (
                <div style={{ width: '100%', height: '100%', display: 'flex', flexDirection: 'column', gap: '8px', padding: '8px', background: 'rgba(255,255,255,0.85)', borderRadius: '10px', border: '1.5px solid var(--do-color-primary)' }}>
                  <div style={{ fontSize: '12px', fontWeight: 'bold', color: 'var(--do-color-primary)', display: 'flex', alignItems: 'center', gap: '4px' }}>
                    <Sparkles size={14} /> SmartArt: {el.smartartData.kind.toUpperCase()}
                  </div>
                  <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'space-around', gap: '8px' }}>
                    {el.smartartData.nodes.map((node, i) => (
                      <div key={node.id} style={{ flex: 1, display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <div
                          style={{
                            flex: 1,
                            background: node.color || '#2563eb',
                            color: '#ffffff',
                            padding: '8px 10px',
                            borderRadius: '8px',
                            textAlign: 'center',
                            boxShadow: 'var(--do-shadow-sm)',
                          }}
                        >
                          <div style={{ fontWeight: 600, fontSize: '13px' }}>{node.label}</div>
                          {node.sublabel && <div style={{ fontSize: '10px', opacity: 0.85 }}>{node.sublabel}</div>}
                        </div>
                        {i < el.smartartData!.nodes.length - 1 && <ArrowRight size={16} color="var(--do-color-text-muted)" />}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Render Chart Elements */}
              {el.type === 'chart' && el.chartData && (
                <div style={{ width: '100%', height: '100%', display: 'flex', flexDirection: 'column', padding: '10px', background: '#ffffff', borderRadius: '10px', border: '1px solid var(--do-color-border)', boxShadow: 'var(--do-shadow-md)' }}>
                  <div style={{ fontWeight: 600, fontSize: '14px', marginBottom: '8px', textAlign: 'center', color: 'var(--do-color-text)' }}>
                    {el.chartData.title}
                  </div>
                  <div style={{ flex: 1, display: 'flex', alignItems: 'flex-end', justifyContent: 'space-around', gap: '12px', paddingBottom: '16px', borderBottom: '1px solid var(--do-color-border)' }}>
                    {el.chartData.labels.map((lbl, idx) => {
                      const val = el.chartData!.datasets[0]?.values[idx] || 50;
                      const maxVal = Math.max(...(el.chartData!.datasets[0]?.values || [100]), 1);
                      const heightPct = Math.max((val / maxVal) * 100, 10);
                      const barColor = el.chartData!.datasets[0]?.color || '#2563eb';

                      return (
                        <div key={idx} style={{ flex: 1, height: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'flex-end', gap: '4px' }}>
                          <span style={{ fontSize: '10px', fontWeight: 600, color: 'var(--do-color-text-muted)' }}>{val}</span>
                          <div
                            style={{
                              width: '80%',
                              height: `${heightPct}%`,
                              backgroundColor: barColor,
                              borderRadius: '4px 4px 0 0',
                              transition: 'height 0.4s ease',
                            }}
                          />
                          <span style={{ fontSize: '11px', fontWeight: 500, color: 'var(--do-color-text)', marginTop: '4px' }}>{lbl}</span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Bounding Box Resize Handles */}
              {isSelected && !el.locked && (
                <>
                  <div style={{ position: 'absolute', top: '-5px', left: '-5px', width: '10px', height: '10px', background: 'var(--do-color-primary)', border: '2px solid #fff', borderRadius: '50%' }} />
                  <div style={{ position: 'absolute', top: '-5px', right: '-5px', width: '10px', height: '10px', background: 'var(--do-color-primary)', border: '2px solid #fff', borderRadius: '50%' }} />
                  <div style={{ position: 'absolute', bottom: '-5px', left: '-5px', width: '10px', height: '10px', background: 'var(--do-color-primary)', border: '2px solid #fff', borderRadius: '50%' }} />
                  <div style={{ position: 'absolute', bottom: '-5px', right: '-5px', width: '10px', height: '10px', background: 'var(--do-color-primary)', border: '2px solid #fff', borderRadius: '50%' }} />
                </>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
