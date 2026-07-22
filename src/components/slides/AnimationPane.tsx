import { SlideAnimation, SlideElement } from '../../types/slides';
import { Play, Trash2, Clock, Zap, X } from 'lucide-react';

interface AnimationPaneProps {
  isOpen: boolean;
  onClose: () => void;
  animations: SlideAnimation[];
  elements: SlideElement[];
  onRemoveAnimation: (animId: string) => void;
  onPreviewAnimations: () => void;
  lang: 'vi' | 'en';
}

export default function AnimationPane({
  isOpen,
  onClose,
  animations,
  elements,
  onRemoveAnimation,
  onPreviewAnimations,
  lang,
}: AnimationPaneProps) {
  if (!isOpen) return null;

  const isVi = lang === 'vi';

  return (
    <div
      style={{
        width: '280px',
        backgroundColor: 'var(--do-color-surface)',
        borderLeft: '1px solid var(--do-color-border)',
        display: 'flex',
        flexDirection: 'column',
        height: '100%',
        zIndex: 100,
        boxShadow: '-4px 0 20px rgba(0, 0, 0, 0.08)',
        animation: 'dawnSlideInRight 0.2s ease-out',
      }}
    >
      {/* Header */}
      <div
        style={{
          padding: '12px 16px',
          borderBottom: '1px solid var(--do-color-border)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
        }}
      >
        <span style={{ fontSize: '13px', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '6px' }}>
          <Zap size={16} color="var(--do-color-primary)" />
          {isVi ? 'Bảng Quản Lý Hiệu Ứng (Animation Pane)' : 'Animation Pane'}
        </span>
        <button onClick={onClose} className="do-btn-icon">
          <X size={16} />
        </button>
      </div>

      {/* Action Bar */}
      <div style={{ padding: '10px 16px', borderBottom: '1px solid var(--do-color-border)' }}>
        <button
          onClick={onPreviewAnimations}
          className="do-btn"
          style={{ width: '100%', justifyContent: 'center', backgroundColor: 'var(--do-color-primary)', color: '#fff', border: 'none' }}
        >
          <Play size={14} style={{ marginRight: '6px' }} />
          {isVi ? 'Xem trước Hiệu ứng' : 'Play All Animations'}
        </button>
      </div>

      {/* Animation Sequence List */}
      <div style={{ flex: 1, overflowY: 'auto', padding: '12px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
        {animations.length === 0 ? (
          <div style={{ textAlign: 'center', color: 'var(--do-color-text-muted)', fontSize: '12px', marginTop: '2rem' }}>
            {isVi ? 'Chưa có hiệu ứng nào. Chọn đối tượng trên slide và gán hiệu ứng từ thẻ Hiệu ứng.' : 'No animations added yet.'}
          </div>
        ) : (
          animations.map((anim, index) => {
            const targetElem = elements.find(e => e.id === anim.elementId);
            return (
              <div
                key={anim.id}
                style={{
                  padding: '10px 12px',
                  backgroundColor: 'var(--do-color-bg)',
                  borderRadius: '10px',
                  border: '1px solid var(--do-color-border)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  fontSize: '12px',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', overflow: 'hidden' }}>
                  <span style={{ fontWeight: 600, color: 'var(--do-color-primary)' }}>{index + 1}.</span>
                  <div style={{ overflow: 'hidden' }}>
                    <div style={{ fontWeight: 600, whiteSpace: 'nowrap', textOverflow: 'ellipsis', overflow: 'hidden' }}>
                      {targetElem?.content || 'Đối tượng'}
                    </div>
                    <div style={{ fontSize: '10px', color: 'var(--do-color-text-muted)', display: 'flex', alignItems: 'center', gap: '4px' }}>
                      <Clock size={10} /> {anim.type} • {anim.durationMs}ms
                    </div>
                  </div>
                </div>

                <button
                  onClick={() => onRemoveAnimation(anim.id)}
                  className="do-btn-icon"
                  style={{ color: '#ef4444' }}
                  title="Remove Animation"
                >
                  <Trash2 size={13} />
                </button>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
