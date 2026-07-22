import { useState } from 'react';
import { SheetData } from '../../types/sheets';
import { Plus, X, Edit2 } from 'lucide-react';

interface SheetTabsProps {
  sheets: SheetData[];
  activeSheetId: string;
  onSelectSheet: (id: string) => void;
  onAddSheet: () => void;
  onDeleteSheet: (id: string) => void;
  onRenameSheet: (id: string, newName: string) => void;
  lang?: 'vi' | 'en';
}

export default function SheetTabs({
  sheets,
  activeSheetId,
  onSelectSheet,
  onAddSheet,
  onDeleteSheet,
  onRenameSheet,
  lang = 'vi',
}: SheetTabsProps) {
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editName, setEditName] = useState('');

  const isVi = lang === 'vi';

  const handleStartRename = (s: SheetData) => {
    setEditingId(s.id);
    setEditName(s.name);
  };

  const handleCommitRename = (id: string) => {
    if (editName.trim()) {
      onRenameSheet(id, editName.trim());
    }
    setEditingId(null);
  };

  return (
    <div
      style={{
        height: '32px',
        backgroundColor: 'var(--do-color-surface)',
        borderTop: '1px solid var(--do-color-border)',
        display: 'flex',
        alignItems: 'center',
        padding: '0 0.5rem',
        gap: '4px',
        fontSize: '12px',
        overflowX: 'auto',
        userSelect: 'none',
      }}
    >
      {/* Sheet Tabs */}
      {sheets.map(s => {
        const isActive = s.id === activeSheetId;
        const isEditing = s.id === editingId;

        return (
          <div
            key={s.id}
            onClick={() => onSelectSheet(s.id)}
            onDoubleClick={() => handleStartRename(s)}
            style={{
              padding: '4px 12px',
              borderRadius: '6px 6px 0 0',
              backgroundColor: isActive ? 'var(--do-color-bg)' : 'transparent',
              border: isActive ? '1px solid var(--do-color-border)' : '1px solid transparent',
              borderBottom: isActive ? '1px solid var(--do-color-bg)' : '1px solid transparent',
              fontWeight: isActive ? 600 : 400,
              color: isActive ? 'var(--do-color-primary)' : 'var(--do-color-text-muted)',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              cursor: 'pointer',
              whiteSpace: 'nowrap',
            }}
          >
            {isEditing ? (
              <input
                type="text"
                autoFocus
                value={editName}
                onChange={e => setEditName(e.target.value)}
                onBlur={() => handleCommitRename(s.id)}
                onKeyDown={e => {
                  if (e.key === 'Enter') handleCommitRename(s.id);
                }}
                style={{
                  width: '80px',
                  fontSize: '12px',
                  padding: '2px 4px',
                  borderRadius: '4px',
                  border: '1px solid var(--do-color-primary)',
                  outline: 'none',
                }}
              />
            ) : (
              <span>{s.name}</span>
            )}

            {isActive && (
              <button
                className="do-btn-icon"
                onClick={e => {
                  e.stopPropagation();
                  handleStartRename(s);
                }}
                style={{ width: '16px', height: '16px', borderRadius: '4px' }}
                title={isVi ? 'Đổi tên Sheet' : 'Rename Sheet'}
              >
                <Edit2 size={10} />
              </button>
            )}

            {sheets.length > 1 && isActive && (
              <button
                className="do-btn-icon"
                onClick={e => {
                  e.stopPropagation();
                  onDeleteSheet(s.id);
                }}
                style={{ width: '16px', height: '16px', borderRadius: '4px', color: '#ef4444' }}
                title={isVi ? 'Xóa Sheet' : 'Delete Sheet'}
              >
                <X size={10} />
              </button>
            )}
          </div>
        );
      })}

      {/* Add New Sheet Button */}
      <button
        onClick={onAddSheet}
        className="do-btn-icon"
        style={{ width: '24px', height: '24px', borderRadius: '6px' }}
        title={isVi ? 'Thêm Trang tính Mới' : 'Add New Sheet'}
      >
        <Plus size={14} />
      </button>
    </div>
  );
}
