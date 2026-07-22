import { useState } from 'react';
import { MessageSquare, Plus, CheckCircle, Trash2, X, Send } from 'lucide-react';

export interface CommentItem {
  id: string;
  author: string;
  text: string;
  selectedText: string;
  createdAt: string;
  resolved: boolean;
  replies: { author: string; text: string; createdAt: string }[];
}

interface CommentsDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  comments: CommentItem[];
  onAddComment: (text: string) => void;
  onReplyComment: (id: string, text: string) => void;
  onToggleResolve: (id: string) => void;
  onDeleteComment: (id: string) => void;
}

export default function CommentsDrawer({
  isOpen,
  onClose,
  comments,
  onAddComment,
  onReplyComment,
  onToggleResolve,
  onDeleteComment,
}: CommentsDrawerProps) {
  const [newCommentText, setNewCommentText] = useState('');
  const [replyInputs, setReplyInputs] = useState<Record<string, string>>({});

  if (!isOpen) return null;

  const handleAdd = () => {
    if (newCommentText.trim()) {
      onAddComment(newCommentText.trim());
      setNewCommentText('');
    }
  };

  const handleReply = (id: string) => {
    const val = replyInputs[id];
    if (val && val.trim()) {
      onReplyComment(id, val.trim());
      setReplyInputs(prev => ({ ...prev, [id]: '' }));
    }
  };

  return (
    <div
      style={{
        width: '280px',
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
          <MessageSquare size={16} color="var(--do-color-accent)" />
          <span>Bình luận & Rà soát</span>
        </div>
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

      {/* New Comment Input Box */}
      <div style={{ padding: '8px 12px', borderBottom: '1px solid var(--do-color-border)' }}>
        <div style={{ display: 'flex', gap: '6px' }}>
          <input
            type="text"
            value={newCommentText}
            onChange={e => setNewCommentText(e.target.value)}
            placeholder="Thêm bình luận cho đoạn văn..."
            style={{
              flex: 1,
              padding: '6px 8px',
              borderRadius: '4px',
              border: '1px solid var(--do-color-border)',
              fontSize: '12px',
              outline: 'none',
            }}
            onKeyDown={e => e.key === 'Enter' && handleAdd()}
          />
          <button
            onClick={handleAdd}
            style={{
              padding: '6px 10px',
              backgroundColor: 'var(--do-color-accent)',
              color: '#fff',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
            }}
          >
            <Plus size={14} />
          </button>
        </div>
      </div>

      {/* Comments list */}
      <div style={{ flex: 1, overflowY: 'auto', padding: '8px 12px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
        {comments.length === 0 ? (
          <div style={{ padding: '16px', fontSize: '12px', color: 'var(--do-color-text-muted)', textAlign: 'center' }}>
            Chưa có bình luận nào. Bôi đen văn bản và tạo bình luận mới.
          </div>
        ) : (
          comments.map(c => (
            <div
              key={c.id}
              style={{
                backgroundColor: c.resolved ? 'var(--do-color-bg)' : 'var(--do-color-surface)',
                border: '1px solid var(--do-color-border)',
                borderRadius: '6px',
                padding: '8px 10px',
                opacity: c.resolved ? 0.65 : 1,
              }}
            >
              {c.selectedText && (
                <div style={{ fontSize: '11px', fontStyle: 'italic', color: 'var(--do-color-accent)', marginBottom: '4px', borderLeft: '2px solid var(--do-color-accent)', paddingLeft: '4px' }}>
                  "{c.selectedText}"
                </div>
              )}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '11px', fontWeight: 600 }}>
                <span>{c.author}</span>
                <span style={{ fontWeight: 400, color: 'var(--do-color-text-muted)' }}>{c.createdAt}</span>
              </div>
              <div style={{ fontSize: '12px', marginTop: '4px', color: 'var(--do-color-text)' }}>{c.text}</div>

              {/* Replies */}
              {c.replies.map((r, idx) => (
                <div key={idx} style={{ marginLeft: '8px', marginTop: '6px', paddingLeft: '6px', borderLeft: '1px solid var(--do-color-border)', fontSize: '11px' }}>
                  <span style={{ fontWeight: 600 }}>{r.author}: </span>
                  <span>{r.text}</span>
                </div>
              ))}

              {/* Actions */}
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: '8px', paddingTop: '4px', borderTop: '1px solid var(--do-color-border)' }}>
                <button
                  onClick={() => onToggleResolve(c.id)}
                  style={{
                    background: 'none',
                    border: 'none',
                    cursor: 'pointer',
                    fontSize: '11px',
                    color: c.resolved ? 'var(--do-color-text-muted)' : 'var(--do-color-accent)',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '2px',
                  }}
                >
                  <CheckCircle size={12} /> {c.resolved ? 'Đã xong' : 'Giải quyết'}
                </button>

                <button
                  onClick={() => onDeleteComment(c.id)}
                  style={{
                    background: 'none',
                    border: 'none',
                    cursor: 'pointer',
                    fontSize: '11px',
                    color: 'var(--do-color-text-muted)',
                    display: 'flex',
                    alignItems: 'center',
                  }}
                  title="Xóa bình luận"
                >
                  <Trash2 size={12} />
                </button>
              </div>

              {/* Reply Input */}
              <div style={{ display: 'flex', gap: '4px', marginTop: '6px' }}>
                <input
                  type="text"
                  value={replyInputs[c.id] || ''}
                  onChange={e => setReplyInputs({ ...replyInputs, [c.id]: e.target.value })}
                  placeholder="Trả lời..."
                  style={{
                    flex: 1,
                    padding: '4px 6px',
                    borderRadius: '4px',
                    border: '1px solid var(--do-color-border)',
                    fontSize: '11px',
                    outline: 'none',
                  }}
                  onKeyDown={e => e.key === 'Enter' && handleReply(c.id)}
                />
                <button
                  onClick={() => handleReply(c.id)}
                  style={{
                    padding: '4px 6px',
                    backgroundColor: 'transparent',
                    border: 'none',
                    cursor: 'pointer',
                    color: 'var(--do-color-accent)',
                  }}
                >
                  <Send size={12} />
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
