import { useState } from 'react';
import { Slide, SlideLayout } from '../../types/slides';
import { Plus, Copy, Trash2, Eye, EyeOff, ChevronUp, ChevronDown, LayoutGrid } from 'lucide-react';

interface SlideThumbnailsProps {
  slides: Slide[];
  activeSlideId: string;
  onSelectSlide: (id: string) => void;
  onAddSlide: (layout: SlideLayout) => void;
  onDuplicateSlide: (id: string) => void;
  onDeleteSlide: (id: string) => void;
  onToggleHideSlide: (id: string) => void;
  onMoveSlide: (index: number, direction: 'up' | 'down') => void;
  lang: 'vi' | 'en';
}

export default function SlideThumbnails({
  slides,
  activeSlideId,
  onSelectSlide,
  onAddSlide,
  onDuplicateSlide,
  onDeleteSlide,
  onToggleHideSlide,
  onMoveSlide,
  lang,
}: SlideThumbnailsProps) {
  const [showLayoutMenu, setShowLayoutMenu] = useState(false);

  const isVi = lang === 'vi';

  const layouts: { id: SlideLayout; name: string }[] = [
    { id: 'title', name: isVi ? 'Trang Tiêu đề' : 'Title Slide' },
    { id: 'title-content', name: isVi ? 'Tiêu đề & Nội dung' : 'Title & Content' },
    { id: 'section-header', name: isVi ? 'Tiêu đề Phần' : 'Section Header' },
    { id: 'two-column', name: isVi ? 'Hai Cột Nội dung' : 'Two Content' },
    { id: 'comparison', name: isVi ? 'So sánh' : 'Comparison' },
    { id: 'blank', name: isVi ? 'Trang Trắng' : 'Blank' },
  ];

  return (
    <div
      style={{
        width: '220px',
        backgroundColor: 'var(--do-color-surface)',
        borderRight: '1px solid var(--do-color-border)',
        display: 'flex',
        flexDirection: 'column',
        userSelect: 'none',
        height: '100%',
      }}
    >
      {/* Top Controls */}
      <div style={{ padding: '10px', borderBottom: '1px solid var(--do-color-border)', position: 'relative' }}>
        <button
          onClick={() => setShowLayoutMenu(!showLayoutMenu)}
          className="do-btn"
          style={{ width: '100%', justifyContent: 'center', backgroundColor: 'var(--do-color-primary)', color: '#fff', border: 'none' }}
        >
          <Plus size={16} style={{ marginRight: '6px' }} />
          {isVi ? 'Slide Mới' : 'New Slide'}
        </button>

        {showLayoutMenu && (
          <div
            style={{
              position: 'absolute',
              top: '100%',
              left: '10px',
              right: '10px',
              backgroundColor: 'var(--do-color-surface)',
              border: '1px solid var(--do-color-border)',
              borderRadius: '8px',
              boxShadow: '0 8px 24px rgba(0, 0, 0, 0.18)',
              zIndex: 100,
              padding: '6px',
              display: 'flex',
              flexDirection: 'column',
              gap: '4px',
            }}
          >
            <div style={{ fontSize: '11px', fontWeight: 600, color: 'var(--do-color-text-muted)', padding: '4px 6px' }}>
              <LayoutGrid size={12} style={{ display: 'inline', marginRight: '4px' }} />
              {isVi ? 'CHỌN BỐ CỤC SLIDE' : 'SELECT SLIDE LAYOUT'}
            </div>
            {layouts.map(l => (
              <button
                key={l.id}
                onClick={() => {
                  onAddSlide(l.id);
                  setShowLayoutMenu(false);
                }}
                className="do-context-item"
                style={{ fontSize: '12px', padding: '6px 8px' }}
              >
                {l.name}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Thumbnails Scroll Area */}
      <div style={{ flex: 1, overflowY: 'auto', padding: '10px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
        {slides.map((slide, index) => {
          const isActive = slide.id === activeSlideId;
          return (
            <div
              key={slide.id}
              onClick={() => onSelectSlide(slide.id)}
              style={{
                display: 'flex',
                gap: '8px',
                alignItems: 'center',
                cursor: 'pointer',
                opacity: slide.hidden ? 0.5 : 1,
              }}
            >
              <span style={{ fontSize: '12px', fontWeight: 600, color: 'var(--do-color-text-muted)', width: '16px', textAlign: 'right' }}>
                {index + 1}
              </span>

              <div
                style={{
                  flex: 1,
                  aspectRatio: '16 / 9',
                  backgroundColor: slide.backgroundFill || '#ffffff',
                  border: `2px solid ${isActive ? 'var(--do-color-primary)' : 'var(--do-color-border)'}`,
                  borderRadius: '6px',
                  boxShadow: isActive ? '0 0 0 2px var(--do-color-accent-transparent)' : 'none',
                  position: 'relative',
                  overflow: 'hidden',
                  padding: '6px',
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'center',
                  alignItems: 'center',
                }}
              >
                {/* Mini Preview Representation */}
                <div style={{ fontSize: '9px', fontWeight: 600, color: 'var(--do-color-text)', textAlign: 'center', wordBreak: 'break-word', maxHeight: '100%', overflow: 'hidden' }}>
                  {slide.title || (isVi ? 'Slide Không Tiêu Đề' : 'Untitled Slide')}
                </div>
                {slide.hidden && (
                  <div style={{ position: 'absolute', top: '4px', right: '4px', background: 'rgba(0,0,0,0.6)', color: '#fff', borderRadius: '4px', padding: '2px 4px', fontSize: '9px' }}>
                    {isVi ? 'Ẩn' : 'Hidden'}
                  </div>
                )}
              </div>

              {/* Action Toolbar on Hover/Active */}
              {isActive && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
                  <button onClick={(e) => { e.stopPropagation(); onMoveSlide(index, 'up'); }} className="do-btn-icon" style={{ width: '20px', height: '20px' }} title="Up">
                    <ChevronUp size={12} />
                  </button>
                  <button onClick={(e) => { e.stopPropagation(); onMoveSlide(index, 'down'); }} className="do-btn-icon" style={{ width: '20px', height: '20px' }} title="Down">
                    <ChevronDown size={12} />
                  </button>
                  <button onClick={(e) => { e.stopPropagation(); onDuplicateSlide(slide.id); }} className="do-btn-icon" style={{ width: '20px', height: '20px' }} title="Duplicate">
                    <Copy size={12} />
                  </button>
                  <button onClick={(e) => { e.stopPropagation(); onToggleHideSlide(slide.id); }} className="do-btn-icon" style={{ width: '20px', height: '20px' }} title="Hide/Unhide">
                    {slide.hidden ? <Eye size={12} /> : <EyeOff size={12} />}
                  </button>
                  {slides.length > 1 && (
                    <button onClick={(e) => { e.stopPropagation(); onDeleteSlide(slide.id); }} className="do-btn-icon" style={{ width: '20px', height: '20px', color: '#ef4444' }} title="Delete">
                      <Trash2 size={12} />
                    </button>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
