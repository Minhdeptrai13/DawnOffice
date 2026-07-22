import { X, FileText, Hash, Clock, AlignLeft, Layers } from 'lucide-react';

interface WordCountModalProps {
  isOpen: boolean;
  onClose: () => void;
  stats: {
    words: number;
    characters: number;
    charactersNoSpaces: number;
    paragraphs: number;
    pages: number;
    readingTimeMinutes: number;
  };
}

export default function WordCountModal({ isOpen, onClose, stats }: WordCountModalProps) {
  if (!isOpen) return null;

  return (
    <div
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'rgba(0, 0, 0, 0.4)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 1000,
      }}
      onClick={onClose}
    >
      <div
        style={{
          width: '380px',
          backgroundColor: 'var(--do-color-surface)',
          borderRadius: '8px',
          boxShadow: '0 8px 30px rgba(0,0,0,0.18)',
          border: '1px solid var(--do-color-border)',
          overflow: 'hidden',
          display: 'flex',
          flexDirection: 'column',
        }}
        onClick={e => e.stopPropagation()}
      >
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '12px 16px',
            borderBottom: '1px solid var(--do-color-border)',
            backgroundColor: 'var(--do-color-bg)',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontWeight: 600, fontSize: '14px' }}>
            <FileText size={18} color="var(--do-color-accent)" />
            <span>Thống kê Văn bản (Word Count)</span>
          </div>
          <button
            onClick={onClose}
            style={{
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              color: 'var(--do-color-text-muted)',
              display: 'flex',
              alignItems: 'center',
            }}
          >
            <X size={16} />
          </button>
        </div>

        <div style={{ padding: '16px', display: 'flex', flexDirection: 'column', gap: '12px', fontSize: '13px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid var(--do-color-border)', paddingBottom: '6px' }}>
            <span style={{ color: 'var(--do-color-text-muted)', display: 'flex', alignItems: 'center', gap: '6px' }}>
              <Layers size={14} /> Trang (Pages)
            </span>
            <span style={{ fontWeight: 600 }}>{stats.pages}</span>
          </div>

          <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid var(--do-color-border)', paddingBottom: '6px' }}>
            <span style={{ color: 'var(--do-color-text-muted)', display: 'flex', alignItems: 'center', gap: '6px' }}>
              <Hash size={14} /> Số từ (Words)
            </span>
            <span style={{ fontWeight: 600 }}>{stats.words}</span>
          </div>

          <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid var(--do-color-border)', paddingBottom: '6px' }}>
            <span style={{ color: 'var(--do-color-text-muted)', display: 'flex', alignItems: 'center', gap: '6px' }}>
              <AlignLeft size={14} /> Ký tự (có khoảng trắng)
            </span>
            <span style={{ fontWeight: 600 }}>{stats.characters}</span>
          </div>

          <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid var(--do-color-border)', paddingBottom: '6px' }}>
            <span style={{ color: 'var(--do-color-text-muted)', display: 'flex', alignItems: 'center', gap: '6px' }}>
              <AlignLeft size={14} /> Ký tự (không khoảng trắng)
            </span>
            <span style={{ fontWeight: 600 }}>{stats.charactersNoSpaces}</span>
          </div>

          <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid var(--do-color-border)', paddingBottom: '6px' }}>
            <span style={{ color: 'var(--do-color-text-muted)', display: 'flex', alignItems: 'center', gap: '6px' }}>
              <FileText size={14} /> Đoạn văn (Paragraphs)
            </span>
            <span style={{ fontWeight: 600 }}>{stats.paragraphs}</span>
          </div>

          <div style={{ display: 'flex', justifyContent: 'space-between', paddingBottom: '4px' }}>
            <span style={{ color: 'var(--do-color-text-muted)', display: 'flex', alignItems: 'center', gap: '6px' }}>
              <Clock size={14} /> Thời gian đọc ước tính
            </span>
            <span style={{ fontWeight: 600, color: 'var(--do-color-accent)' }}>~{stats.readingTimeMinutes} phút</span>
          </div>
        </div>

        <div style={{ padding: '12px 16px', borderTop: '1px solid var(--do-color-border)', display: 'flex', justifyContent: 'flex-end', backgroundColor: 'var(--do-color-bg)' }}>
          <button
            onClick={onClose}
            style={{
              padding: '6px 16px',
              borderRadius: '4px',
              backgroundColor: 'var(--do-color-accent)',
              color: '#fff',
              border: 'none',
              cursor: 'pointer',
              fontWeight: 500,
              fontSize: '12px',
            }}
          >
            Đóng
          </button>
        </div>
      </div>
    </div>
  );
}
