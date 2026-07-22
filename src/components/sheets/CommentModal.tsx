import { useState } from 'react';
import { CellComment } from '../../types/sheets';
import { X } from 'lucide-react';

interface CommentModalProps {
  isOpen: boolean;
  activeCellAddr: string;
  existingComment?: CellComment;
  onClose: () => void;
  onApply: (comment: CellComment) => void;
  lang?: 'vi' | 'en';
}

export default function CommentModal({
  isOpen,
  activeCellAddr,
  existingComment,
  onClose,
  onApply,
  lang = 'vi',
}: CommentModalProps) {
  const isVi = lang === 'vi';

  const [author, setAuthor] = useState(existingComment?.author || (isVi ? 'Người dùng' : 'User'));
  const [text, setText] = useState(existingComment?.text || '');

  if (!isOpen) return null;

  const handleApply = () => {
    if (text.trim()) {
      onApply({
        author,
        text: text.trim(),
        date: new Date().toLocaleDateString(),
      });
    }
    onClose();
  };

  return (
    <div
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'rgba(0,0,0,0.5)',
        zIndex: 9999,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        backdropFilter: 'blur(4px)',
      }}
    >
      <div
        style={{
          width: '460px',
          backgroundColor: 'var(--do-color-surface)',
          borderRadius: '16px',
          boxShadow: 'var(--do-shadow-lg)',
          border: '1px solid var(--do-color-border)',
          display: 'flex',
          flexDirection: 'column',
          overflow: 'hidden',
        }}
      >
        <div style={{ padding: '1rem 1.25rem', borderBottom: '1px solid var(--do-color-border)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <h3 style={{ margin: 0, fontSize: '1.1rem', fontWeight: 600, color: 'var(--do-color-text)' }}>
            💬 {isVi ? `Ghi Chú Ô ${activeCellAddr}` : `Cell Comment (${activeCellAddr})`}
          </h3>
          <button className="do-btn-icon" onClick={onClose} style={{ borderRadius: '8px' }}>
            <X size={18} />
          </button>
        </div>

        <div style={{ padding: '1.25rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <div>
            <label style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--do-color-text-muted)' }}>
              {isVi ? 'Tên tác giả:' : 'Author Name:'}
            </label>
            <input
              type="text"
              value={author}
              onChange={e => setAuthor(e.target.value)}
              style={{ width: '100%', padding: '6px 10px', borderRadius: '6px', border: '1px solid var(--do-color-border)', fontSize: '0.9rem', marginTop: '4px' }}
            />
          </div>

          <div>
            <label style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--do-color-text-muted)' }}>
              {isVi ? 'Nội dung ghi chú:' : 'Comment Text:'}
            </label>
            <textarea
              value={text}
              onChange={e => setText(e.target.value)}
              rows={4}
              placeholder={isVi ? 'Nhập ghi chú hoặc lời nhắn tại đây...' : 'Enter note or message...'}
              style={{ width: '100%', padding: '6px 10px', borderRadius: '6px', border: '1px solid var(--do-color-border)', fontSize: '0.9rem', marginTop: '4px' }}
            />
          </div>
        </div>

        <div style={{ padding: '1rem 1.25rem', borderTop: '1px solid var(--do-color-border)', display: 'flex', justifyContent: 'flex-end', gap: '0.5rem' }}>
          <button className="do-btn" onClick={onClose} style={{ borderRadius: '8px' }}>
            {isVi ? 'Hủy' : 'Cancel'}
          </button>
          <button className="do-btn" onClick={handleApply} style={{ borderRadius: '8px', backgroundColor: 'var(--do-color-primary)', color: '#fff' }}>
            {isVi ? 'Lưu Ghi Chú' : 'Save Comment'}
          </button>
        </div>
      </div>
    </div>
  );
}
