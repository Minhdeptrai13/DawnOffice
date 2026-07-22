import { ListTree, RefreshCw, X, ChevronRight } from 'lucide-react';

interface TocItem {
  id: string;
  text: string;
  level: number;
}

interface TocDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  items: TocItem[];
  onRefresh: () => void;
  onSelectItem: (text: string) => void;
}

export default function TocDrawer({ isOpen, onClose, items, onRefresh, onSelectItem }: TocDrawerProps) {
  if (!isOpen) return null;

  return (
    <div
      style={{
        width: '260px',
        backgroundColor: 'var(--do-color-surface)',
        borderLeft: '1px solid var(--do-color-border)',
        display: 'flex',
        flexDirection: 'column',
        height: '100%',
        zIndex: 50,
      }}
    >
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '10px 12px',
          borderBottom: '1px solid var(--do-color-border)',
          backgroundColor: 'var(--do-color-bg)',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontWeight: 600, fontSize: '13px' }}>
          <ListTree size={16} color="var(--do-color-accent)" />
          <span>Mục lục Tự động (TOC)</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
          <button
            onClick={onRefresh}
            title="Cập nhật Mục lục"
            style={{
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              color: 'var(--do-color-text-muted)',
              padding: '4px',
              borderRadius: '4px',
            }}
          >
            <RefreshCw size={14} />
          </button>
          <button
            onClick={onClose}
            style={{
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              color: 'var(--do-color-text-muted)',
              padding: '4px',
              borderRadius: '4px',
            }}
          >
            <X size={14} />
          </button>
        </div>
      </div>

      <div style={{ flex: 1, overflowY: 'auto', padding: '8px' }}>
        {items.length === 0 ? (
          <div style={{ padding: '16px', fontSize: '12px', color: 'var(--do-color-text-muted)', textAlign: 'center' }}>
            Chưa phát hiện các Heading (H1, H2, H3...). Thêm các tiêu đề để tạo mục lục tự động.
          </div>
        ) : (
          items.map(item => (
            <div
              key={item.id}
              onClick={() => onSelectItem(item.text)}
              style={{
                padding: '6px 8px',
                paddingLeft: `${(item.level - 1) * 12 + 8}px`,
                fontSize: '12px',
                borderRadius: '4px',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                color: 'var(--do-color-text)',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                whiteSpace: 'nowrap',
              }}
              onMouseEnter={e => e.currentTarget.style.backgroundColor = 'var(--do-color-border)'}
              onMouseLeave={e => e.currentTarget.style.backgroundColor = 'transparent'}
            >
              <ChevronRight size={12} color="var(--do-color-text-muted)" />
              <span style={{ fontWeight: item.level === 1 ? 600 : 400 }}>{item.text}</span>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
