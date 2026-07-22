import { useState, useRef, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { Clock, FileText, Trash2 } from 'lucide-react';
import { RecentFile } from '../hooks/useRecentFiles';

interface Props {
  recentFiles: RecentFile[];
  onOpen: (path: string) => void;
  onClear: () => void;
}

export default function RecentFilesDropdown({ recentFiles, onOpen, onClear }: Props) {
  const [open, setOpen] = useState(false);
  const [pos, setPos] = useState({ top: 0, left: 0 });
  const btnRef = useRef<HTMLButtonElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (open && btnRef.current) {
      const rect = btnRef.current.getBoundingClientRect();
      setPos({ top: rect.bottom + 4, left: rect.left });
    }
  }, [open]);

  useEffect(() => {
    if (!open) return;
    const handler = (e: MouseEvent) => {
      if (!btnRef.current?.contains(e.target as Node) && !containerRef.current?.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [open]);

  return (
    <>
      <button 
        ref={btnRef} 
        className="do-btn" 
        onClick={() => setOpen(!open)} 
        title="Recent Files"
        style={{ padding: '4px 8px' }}
      >
        <Clock size={15} style={{ marginRight: '4px' }} /> Recent
      </button>

      {open && createPortal(
        <div
          ref={containerRef}
          style={{
            position: 'absolute',
            top: pos.top,
            left: pos.left,
            zIndex: 9999,
            background: 'var(--do-color-surface)',
            border: '1px solid var(--do-color-border-focus)',
            borderRadius: '8px',
            boxShadow: 'var(--do-shadow-md)',
            width: '280px',
            maxHeight: '400px',
            overflowY: 'auto',
            animation: 'fontDropIn 0.15s ease-out forwards',
          }}
        >
          <div style={{ padding: '8px 12px', borderBottom: '1px solid var(--do-color-border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: '11px', fontWeight: 600, color: 'var(--do-color-text-muted)' }}>RECENT FILES</span>
            {recentFiles.length > 0 && (
              <button 
                onClick={() => { onClear(); setOpen(false); }}
                style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--do-color-danger, #ef4444)' }}
                title="Clear recent history"
              >
                <Trash2 size={13} />
              </button>
            )}
          </div>
          
          <div style={{ padding: '4px' }}>
            {recentFiles.length === 0 ? (
              <div style={{ padding: '16px', textAlign: 'center', fontSize: '12px', color: 'var(--do-color-text-muted)' }}>
                No recent files
              </div>
            ) : (
              recentFiles.map(f => (
                <div 
                  key={f.path}
                  className="recent-file-item"
                  onClick={() => { onOpen(f.path); setOpen(false); }}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    padding: '8px 12px',
                    cursor: 'pointer',
                    borderRadius: '6px',
                    transition: 'background 0.1s',
                  }}
                  onMouseEnter={e => e.currentTarget.style.background = 'var(--do-color-surface-hover)'}
                  onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                >
                  <FileText size={16} style={{ marginRight: '10px', color: 'var(--do-color-primary)' }} />
                  <div style={{ overflow: 'hidden' }}>
                    <div style={{ fontSize: '13px', fontWeight: 500, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {f.name}
                    </div>
                    <div style={{ fontSize: '10px', color: 'var(--do-color-text-muted)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {f.path}
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>,
        document.body
      )}
    </>
  );
}
