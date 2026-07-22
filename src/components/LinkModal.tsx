import React, { useState, useEffect } from 'react';
import { X, Link as LinkIcon, ExternalLink } from 'lucide-react';

interface LinkModalProps {
  isOpen: boolean;
  onClose: () => void;
  onApplyLink: (url: string) => void;
  initialUrl?: string;
}

export default function LinkModal({ isOpen, onClose, onApplyLink, initialUrl = '' }: LinkModalProps) {
  const [url, setUrl] = useState(initialUrl);

  useEffect(() => {
    setUrl(initialUrl);
  }, [initialUrl]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (url.trim()) {
      let finalUrl = url.trim();
      if (!/^https?:\/\//i.test(finalUrl) && !finalUrl.startsWith('#') && !finalUrl.startsWith('mailto:')) {
        finalUrl = 'https://' + finalUrl;
      }
      onApplyLink(finalUrl);
      onClose();
    }
  };

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
          width: '400px',
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
            <LinkIcon size={18} color="var(--do-color-accent)" />
            <span>Chèn / Sửa Liên kết (Hyperlink)</span>
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

        <form onSubmit={handleSubmit} style={{ padding: '16px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
          <div>
            <label style={{ fontSize: '12px', fontWeight: 600, color: 'var(--do-color-text-muted)', display: 'block', marginBottom: '6px' }}>
              ĐỊA CHỈ LIÊN KẾT (URL / Web / Bookmark)
            </label>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', border: '1px solid var(--do-color-border)', borderRadius: '4px', padding: '4px 8px' }}>
              <ExternalLink size={16} color="var(--do-color-text-muted)" />
              <input
                type="text"
                value={url}
                onChange={e => setUrl(e.target.value)}
                placeholder="https://example.com hoặc #section1"
                style={{
                  flex: 1,
                  border: 'none',
                  outline: 'none',
                  fontSize: '13px',
                  background: 'transparent',
                  color: 'var(--do-color-text)',
                }}
                autoFocus
              />
            </div>
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px', marginTop: '8px' }}>
            <button
              type="button"
              onClick={() => {
                onApplyLink('');
                onClose();
              }}
              style={{
                padding: '6px 12px',
                borderRadius: '4px',
                border: '1px solid var(--do-color-border)',
                background: 'transparent',
                cursor: 'pointer',
                fontSize: '12px',
                color: 'var(--do-color-text-muted)',
              }}
            >
              Hủy liên kết
            </button>
            <button
              type="submit"
              style={{
                padding: '6px 16px',
                borderRadius: '4px',
                backgroundColor: 'var(--do-color-accent)',
                color: '#fff',
                border: 'none',
                cursor: 'pointer',
                fontSize: '12px',
                fontWeight: 500,
              }}
            >
              Áp dụng
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
