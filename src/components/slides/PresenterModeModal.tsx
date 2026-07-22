import { useState, useEffect, useRef } from 'react';
import { Slide } from '../../types/slides';
import { X, ChevronLeft, ChevronRight, PenTool, Pointer, Clock, Moon, Sun, Eraser } from 'lucide-react';

interface PresenterModeModalProps {
  slides: Slide[];
  initialSlideId: string;
  aspectRatio: '16:9' | '4:3';
  onClose: () => void;
  lang: 'vi' | 'en';
}

export default function PresenterModeModal({
  slides,
  initialSlideId,
  aspectRatio,
  onClose,
  lang,
}: PresenterModeModalProps) {
  const [currentIndex, setCurrentIndex] = useState(() => {
    const idx = slides.findIndex(s => s.id === initialSlideId);
    return idx >= 0 ? idx : 0;
  });

  const [activeTool, setActiveTool] = useState<'none' | 'laser' | 'pen' | 'highlighter' | 'eraser'>('none');
  const [blankMode, setBlankMode] = useState<'none' | 'black' | 'white'>('none');
  const [mousePos, setMousePos] = useState({ x: -100, y: -100 });
  const [timerSeconds, setTimerSeconds] = useState(0);

  const canvasRef = useRef<HTMLCanvasElement>(null);
  const isDrawing = useRef(false);

  const isVi = lang === 'vi';
  const currentSlide = slides[currentIndex] || slides[0];

  // Timer Clock
  useEffect(() => {
    const timer = setInterval(() => setTimerSeconds(prev => prev + 1), 1000);
    return () => clearInterval(timer);
  }, []);

  const formatTimer = (totalSec: number) => {
    const m = Math.floor(totalSec / 60).toString().padStart(2, '0');
    const s = (totalSec % 60).toString().padStart(2, '0');
    return `${m}:${s}`;
  };

  const clearCanvasAnnotations = () => {
    if (canvasRef.current) {
      const ctx = canvasRef.current.getContext('2d');
      if (ctx) ctx.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height);
    }
  };

  // Comprehensive PowerPoint Presentation Shortcuts Handler
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Exit Presentation Mode
      if (e.key === 'Escape' || e.key === '-') {
        onClose();
        return;
      }

      // Clear all annotations on key E
      if (e.key.toLowerCase() === 'e' && !e.ctrlKey) {
        clearCanvasAnnotations();
        return;
      }

      // Next Slide Shortcuts (Space, Enter, PageDown, RightArrow)
      if (['ArrowRight', 'Space', 'Enter', 'PageDown'].includes(e.key)) {
        e.preventDefault();
        if (currentIndex < slides.length - 1) setCurrentIndex(prev => prev + 1);
        return;
      }

      // Previous Slide Shortcuts (LeftArrow, PageUp, Backspace)
      if (['ArrowLeft', 'PageUp', 'Backspace'].includes(e.key)) {
        e.preventDefault();
        if (currentIndex > 0) setCurrentIndex(prev => prev - 1);
        return;
      }

      // Black Screen Toggle (B or .)
      if (e.key.toLowerCase() === 'b' || e.key === '.') {
        setBlankMode(prev => (prev === 'black' ? 'none' : 'black'));
        return;
      }

      // White Screen Toggle (W or ,)
      if (e.key.toLowerCase() === 'w' || e.key === ',') {
        setBlankMode(prev => (prev === 'white' ? 'none' : 'white'));
        return;
      }

      // Ctrl Combinations for Presenter Tools
      if (e.ctrlKey) {
        if (e.key.toLowerCase() === 'p') {
          e.preventDefault();
          setActiveTool(prev => (prev === 'pen' ? 'none' : 'pen'));
        } else if (e.key.toLowerCase() === 'i') {
          e.preventDefault();
          setActiveTool(prev => (prev === 'highlighter' ? 'none' : 'highlighter'));
        } else if (e.key.toLowerCase() === 'l') {
          e.preventDefault();
          setActiveTool(prev => (prev === 'laser' ? 'none' : 'laser'));
        } else if (e.key.toLowerCase() === 'e') {
          e.preventDefault();
          setActiveTool(prev => (prev === 'eraser' ? 'none' : 'eraser'));
        } else if (e.key.toLowerCase() === 'a') {
          e.preventDefault();
          setActiveTool('none');
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [currentIndex, slides.length, onClose]);

  // Ink Pen Drawing Handlers
  const handleCanvasMouseDown = (e: React.MouseEvent) => {
    if (activeTool === 'none' || activeTool === 'laser' || !canvasRef.current) return;
    isDrawing.current = true;
    const ctx = canvasRef.current.getContext('2d');
    if (ctx) {
      const rect = canvasRef.current.getBoundingClientRect();
      const x = (e.clientX - rect.left) * (canvasRef.current.width / rect.width);
      const y = (e.clientY - rect.top) * (canvasRef.current.height / rect.height);
      ctx.beginPath();
      ctx.moveTo(x, y);
    }
  };

  const handleCanvasMouseMove = (e: React.MouseEvent) => {
    setMousePos({ x: e.clientX, y: e.clientY });
    if (!isDrawing.current || activeTool === 'none' || activeTool === 'laser' || !canvasRef.current) return;
    const ctx = canvasRef.current.getContext('2d');
    if (ctx) {
      const rect = canvasRef.current.getBoundingClientRect();
      const x = (e.clientX - rect.left) * (canvasRef.current.width / rect.width);
      const y = (e.clientY - rect.top) * (canvasRef.current.height / rect.height);

      if (activeTool === 'eraser') {
        ctx.clearRect(x - 20, y - 20, 40, 40);
      } else {
        ctx.lineTo(x, y);
        ctx.strokeStyle = activeTool === 'highlighter' ? 'rgba(253, 224, 71, 0.4)' : '#ef4444';
        ctx.lineWidth = activeTool === 'highlighter' ? 24 : 4;
        ctx.lineCap = 'round';
        ctx.stroke();
      }
    }
  };

  const handleCanvasMouseUp = () => {
    isDrawing.current = false;
  };

  const VIRTUAL_W = aspectRatio === '16:9' ? 1920 : 1440;

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        backgroundColor: '#000000',
        zIndex: 99999,
        display: 'flex',
        flexDirection: 'column',
        userSelect: 'none',
        overflow: 'hidden',
      }}
      onMouseMove={e => setMousePos({ x: e.clientX, y: e.clientY })}
    >
      {/* Laser Pointer overlay */}
      {activeTool === 'laser' && (
        <div
          style={{
            position: 'fixed',
            left: `${mousePos.x - 8}px`,
            top: `${mousePos.y - 8}px`,
            width: '16px',
            height: '16px',
            borderRadius: '50%',
            backgroundColor: '#ef4444',
            boxShadow: '0 0 18px 8px rgba(239, 68, 68, 0.95)',
            pointerEvents: 'none',
            zIndex: 100000,
          }}
        />
      )}

      {/* Main Presentation View */}
      <div
        style={{
          flex: 1,
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          position: 'relative',
          background: blankMode === 'black' ? '#000' : blankMode === 'white' ? '#fff' : 'transparent',
        }}
        onClick={() => {
          if (activeTool === 'none' && currentIndex < slides.length - 1) {
            setCurrentIndex(prev => prev + 1);
          }
        }}
      >
        {blankMode === 'none' && (
          <div
            style={{
              width: '100%',
              maxHeight: '92vh',
              aspectRatio: aspectRatio === '16:9' ? '16 / 9' : '4 / 3',
              backgroundColor: currentSlide.backgroundFill || '#ffffff',
              position: 'relative',
              boxShadow: '0 12px 48px rgba(0,0,0,0.5)',
              overflow: 'hidden',
            }}
          >
            {/* Ink Drawing Canvas */}
            <canvas
              ref={canvasRef}
              width={1920}
              height={1080}
              onMouseDown={handleCanvasMouseDown}
              onMouseMove={handleCanvasMouseMove}
              onMouseUp={handleCanvasMouseUp}
              style={{
                position: 'absolute',
                inset: 0,
                width: '100%',
                height: '100%',
                zIndex: 50,
                pointerEvents: activeTool !== 'none' && activeTool !== 'laser' ? 'auto' : 'none',
                cursor: activeTool === 'eraser' ? 'cell' : activeTool !== 'none' ? 'crosshair' : 'default',
              }}
            />

            {/* Elements Rendered Identically to Canvas */}
            {currentSlide.elements.map(el => {
              const filterCss = el.imageFilter
                ? `brightness(${el.imageFilter.brightness ?? 100}%) contrast(${el.imageFilter.contrast ?? 100}%) grayscale(${el.imageFilter.grayscale ?? 0}%) blur(${el.imageFilter.blur ?? 0}px)`
                : 'none';

              return (
                <div
                  key={el.id}
                  style={{
                    position: 'absolute',
                    left: `${(el.x / VIRTUAL_W) * 100}%`,
                    top: `${(el.y / 1080) * 100}%`,
                    width: `${(el.width / VIRTUAL_W) * 100}%`,
                    height: `${(el.height / 1080) * 100}%`,
                    transform: `rotate(${el.rotation}deg)`,
                    zIndex: el.zIndex,
                    borderRadius: el.shapeKind === 'circle' ? '50%' : '6px',
                    backgroundColor: el.fillColor || (el.type === 'shape' ? 'var(--do-color-primary)' : 'transparent'),
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
                  }}
                >
                  {(el.type === 'text' || el.type === 'wordart') && (
                    <div
                      style={{
                        width: '100%',
                        height: '100%',
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
                        wordBreak: 'break-word',
                        display: 'flex',
                        alignItems: el.verticalAlign === 'top' ? 'flex-start' : el.verticalAlign === 'bottom' ? 'flex-end' : 'center',
                      }}
                    >
                      {el.content}
                    </div>
                  )}

                  {el.type === 'shape' && (
                    <div
                      style={{
                        width: '100%',
                        height: '100%',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontSize: `${el.fontSize || 24}px`,
                        color: el.textColor || '#ffffff',
                        fontWeight: 'bold',
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
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Floating Presenter Navigation Bar */}
      <div
        style={{
          height: '48px',
          backgroundColor: 'rgba(20, 20, 20, 0.85)',
          backdropFilter: 'blur(12px)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '0 1.5rem',
          color: '#ffffff',
          fontSize: '13px',
          zIndex: 100001,
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <button
            onClick={() => { if (currentIndex > 0) setCurrentIndex(prev => prev - 1); }}
            disabled={currentIndex === 0}
            className="do-btn-icon"
            style={{ color: '#fff' }}
          >
            <ChevronLeft size={20} />
          </button>
          <span>
            {currentIndex + 1} / {slides.length}
          </span>
          <button
            onClick={() => { if (currentIndex < slides.length - 1) setCurrentIndex(prev => prev + 1); }}
            disabled={currentIndex === slides.length - 1}
            className="do-btn-icon"
            style={{ color: '#fff' }}
          >
            <ChevronRight size={20} />
          </button>
        </div>

        {/* Presenter Tools */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <button
            onClick={() => setActiveTool(prev => (prev === 'laser' ? 'none' : 'laser'))}
            className={`do-btn-icon ${activeTool === 'laser' ? 'active' : ''}`}
            style={{ color: activeTool === 'laser' ? '#ef4444' : '#fff' }}
            title={isVi ? "Con trỏ Laser (Ctrl+L)" : "Laser Pointer (Ctrl+L)"}
          >
            <Pointer size={18} />
          </button>
          <button
            onClick={() => setActiveTool(prev => (prev === 'pen' ? 'none' : 'pen'))}
            className={`do-btn-icon ${activeTool === 'pen' ? 'active' : ''}`}
            style={{ color: activeTool === 'pen' ? '#3b82f6' : '#fff' }}
            title={isVi ? "Bút vẽ chú thích (Ctrl+P)" : "Ink Pen (Ctrl+P)"}
          >
            <PenTool size={18} />
          </button>
          <button
            onClick={() => setActiveTool(prev => (prev === 'eraser' ? 'none' : 'eraser'))}
            className={`do-btn-icon ${activeTool === 'eraser' ? 'active' : ''}`}
            style={{ color: activeTool === 'eraser' ? '#f59e0b' : '#fff' }}
            title={isVi ? "Tẩy xóa (Ctrl+E, Phím E để xóa hết)" : "Eraser (Ctrl+E, Press E to clear all)"}
          >
            <Eraser size={18} />
          </button>
          <button
            onClick={() => setBlankMode(prev => (prev === 'black' ? 'none' : 'black'))}
            className={`do-btn-icon ${blankMode === 'black' ? 'active' : ''}`}
            style={{ color: '#fff' }}
            title={isVi ? "Màn hình đen (B)" : "Black Screen (B)"}
          >
            <Moon size={18} />
          </button>
          <button
            onClick={() => setBlankMode(prev => (prev === 'white' ? 'none' : 'white'))}
            className={`do-btn-icon ${blankMode === 'white' ? 'active' : ''}`}
            style={{ color: '#fff' }}
            title={isVi ? "Màn hình trắng (W)" : "White Screen (W)"}
          >
            <Sun size={18} />
          </button>

          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginLeft: '12px', color: '#94a3b8' }}>
            <Clock size={16} />
            <span>{formatTimer(timerSeconds)}</span>
          </div>
        </div>

        {/* Close Button */}
        <button onClick={onClose} className="do-btn-icon" style={{ color: '#fff' }} title={isVi ? "Thoát (Esc)" : "Exit (Esc)"}>
          <X size={20} />
        </button>
      </div>
    </div>
  );
}
