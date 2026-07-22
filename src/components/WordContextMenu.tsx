import { useState, useEffect, useRef } from 'react';
import { Editor } from '@tiptap/react';
import {
  Scissors, Copy, ClipboardPaste, Bold, Italic, Underline,
  AlignLeft, AlignCenter, AlignRight,
  Link as LinkIcon, MessageSquare, CaseSensitive, BoxSelect,
  Baseline, Trash2
} from 'lucide-react';
import { CaseType } from '../extensions/ChangeCase';

interface WordContextMenuProps {
  editor: Editor | null;
  onOpenLinkModal: () => void;
  onOpenComment: () => void;
  lang: 'vi' | 'en';
}

interface ContextMenuState {
  visible: boolean;
  x: number;
  y: number;
}

export default function WordContextMenu({ editor, onOpenLinkModal, onOpenComment, lang }: WordContextMenuProps) {
  const [menuState, setMenuState] = useState<ContextMenuState>({ visible: false, x: 0, y: 0 });
  const [showCaseSubmenu, setShowCaseSubmenu] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  const isVi = lang === 'vi';

  useEffect(() => {
    const handleContextMenu = (e: MouseEvent) => {
      const target = e.target as HTMLElement | null;
      if (target && (target.closest('.ProseMirror') || target.closest('.editor-container') || target.closest('.app-layout'))) {
        e.preventDefault();
        
        const menuWidth = 240;
        const menuHeight = 360;
        let x = e.clientX;
        let y = e.clientY;

        if (x + menuWidth > window.innerWidth) x = window.innerWidth - menuWidth - 10;
        if (y + menuHeight > window.innerHeight) y = window.innerHeight - menuHeight - 10;

        setMenuState({ visible: true, x, y });
        setShowCaseSubmenu(false);
      }
    };

    const handleClickOutside = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setMenuState(prev => ({ ...prev, visible: false }));
      }
    };

    const handleScroll = () => {
      setMenuState(prev => ({ ...prev, visible: false }));
    };

    window.addEventListener('contextmenu', handleContextMenu);
    window.addEventListener('click', handleClickOutside);
    window.addEventListener('scroll', handleScroll, true);

    return () => {
      window.removeEventListener('contextmenu', handleContextMenu);
      window.removeEventListener('click', handleClickOutside);
      window.removeEventListener('scroll', handleScroll, true);
    };
  }, []);

  if (!menuState.visible || !editor) return null;

  const handleChangeCase = (type: CaseType) => {
    // @ts-ignore
    if (editor.commands.changeCase) {
      // @ts-ignore
      editor.commands.changeCase(type);
    }
    setMenuState(prev => ({ ...prev, visible: false }));
  };

  const handleDeleteSelection = () => {
    if (editor.isActive('table')) {
      editor.chain().focus().deleteTable().run();
    } else if (editor.isActive('image')) {
      editor.chain().focus().deleteSelection().run();
    } else {
      editor.chain().focus().deleteSelection().run();
    }
    setMenuState(prev => ({ ...prev, visible: false }));
  };

  return (
    <div
      ref={menuRef}
      style={{
        position: 'fixed',
        top: `${menuState.y}px`,
        left: `${menuState.x}px`,
        width: '240px',
        backgroundColor: 'var(--do-color-surface)',
        borderRadius: '12px',
        boxShadow: '0 12px 36px rgba(0, 0, 0, 0.22), 0 2px 8px rgba(0, 0, 0, 0.12)',
        border: '1px solid var(--do-color-border)',
        zIndex: 10000,
        padding: '6px',
        fontSize: '12px',
        userSelect: 'none',
        animation: 'dawnContextMenuFade 0.15s ease-out',
      }}
    >
      {/* ── TOP MINI TOOLBAR (MS Word style mini formatting toolbar) ── */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '4px 6px',
          backgroundColor: 'var(--do-color-bg)',
          borderRadius: '8px',
          marginBottom: '6px',
          border: '1px solid var(--do-color-border)',
        }}
      >
        <button
          onClick={() => editor.chain().focus().toggleBold().run()}
          className={`do-btn-icon ${editor.isActive('bold') ? 'active' : ''}`}
          title="In đậm (Ctrl+B)"
        >
          <Bold size={13} />
        </button>
        <button
          onClick={() => editor.chain().focus().toggleItalic().run()}
          className={`do-btn-icon ${editor.isActive('italic') ? 'active' : ''}`}
          title="In nghiêng (Ctrl+I)"
        >
          <Italic size={13} />
        </button>
        <button
          onClick={() => editor.chain().focus().toggleUnderline().run()}
          className={`do-btn-icon ${editor.isActive('underline') ? 'active' : ''}`}
          title="Gạch chân (Ctrl+U)"
        >
          <Underline size={13} />
        </button>
        <div style={{ width: '1px', height: '14px', background: 'var(--do-color-border)' }} />
        <button
          onClick={() => editor.chain().focus().setTextAlign('left').run()}
          className={`do-btn-icon ${editor.isActive({ textAlign: 'left' }) ? 'active' : ''}`}
          title="Căn trái"
        >
          <AlignLeft size={13} />
        </button>
        <button
          onClick={() => editor.chain().focus().setTextAlign('center').run()}
          className={`do-btn-icon ${editor.isActive({ textAlign: 'center' }) ? 'active' : ''}`}
          title="Căn giữa"
        >
          <AlignCenter size={13} />
        </button>
        <button
          onClick={() => editor.chain().focus().setTextAlign('right').run()}
          className={`do-btn-icon ${editor.isActive({ textAlign: 'right' }) ? 'active' : ''}`}
          title="Căn phải"
        >
          <AlignRight size={13} />
        </button>
      </div>

      {/* ── CONTEXT MENU ITEMS ── */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
        <button
          onClick={() => {
            document.execCommand('cut');
            setMenuState(prev => ({ ...prev, visible: false }));
          }}
          className="do-context-item"
        >
          <Scissors size={14} /> <span>{isVi ? 'Cắt' : 'Cut'}</span> <span className="do-context-shortcut">Ctrl+X</span>
        </button>

        <button
          onClick={() => {
            document.execCommand('copy');
            setMenuState(prev => ({ ...prev, visible: false }));
          }}
          className="do-context-item"
        >
          <Copy size={14} /> <span>{isVi ? 'Sao chép' : 'Copy'}</span> <span className="do-context-shortcut">Ctrl+C</span>
        </button>

        <button
          onClick={() => {
            document.execCommand('paste');
            setMenuState(prev => ({ ...prev, visible: false }));
          }}
          className="do-context-item"
        >
          <ClipboardPaste size={14} /> <span>{isVi ? 'Dán' : 'Paste'}</span> <span className="do-context-shortcut">Ctrl+V</span>
        </button>

        <div style={{ height: '1px', backgroundColor: 'var(--do-color-border)', margin: '4px 0' }} />

        {/* Change Case Submenu Trigger */}
        <div
          onMouseEnter={() => setShowCaseSubmenu(true)}
          onMouseLeave={() => setShowCaseSubmenu(false)}
          style={{ position: 'relative' }}
        >
          <button className="do-context-item" style={{ justifyContent: 'space-between' }}>
            <span style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <CaseSensitive size={14} /> {isVi ? 'Đổi kiểu chữ' : 'Change Case'}
            </span>
            <span>▸</span>
          </button>

          {showCaseSubmenu && (
            <div
              style={{
                position: 'absolute',
                top: 0,
                left: '100%',
                marginLeft: '4px',
                width: '160px',
                backgroundColor: 'var(--do-color-surface)',
                borderRadius: '8px',
                boxShadow: '0 8px 24px rgba(0, 0, 0, 0.18)',
                border: '1px solid var(--do-color-border)',
                padding: '4px',
                display: 'flex',
                flexDirection: 'column',
                gap: '2px',
                zIndex: 10001,
              }}
            >
              <button onClick={() => handleChangeCase('uppercase')} className="do-context-item">CHỮ HOA</button>
              <button onClick={() => handleChangeCase('lowercase')} className="do-context-item">chữ thường</button>
              <button onClick={() => handleChangeCase('sentencecase')} className="do-context-item">Viết hoa đầu câu</button>
              <button onClick={() => handleChangeCase('titlecase')} className="do-context-item">Viết Hoa Mỗi Từ</button>
            </div>
          )}
        </div>

        <button
          onClick={() => {
            onOpenLinkModal();
            setMenuState(prev => ({ ...prev, visible: false }));
          }}
          className="do-context-item"
        >
          <LinkIcon size={14} /> <span>{isVi ? 'Chèn / Sửa Hyperlink' : 'Insert Link'}</span>
        </button>

        <button
          onClick={() => {
            onOpenComment();
            setMenuState(prev => ({ ...prev, visible: false }));
          }}
          className="do-context-item"
        >
          <MessageSquare size={14} /> <span>{isVi ? 'Thêm bình luận' : 'Add Comment'}</span>
        </button>

        <button
          onClick={() => {
            editor.chain().focus().unsetAllMarks().run();
            setMenuState(prev => ({ ...prev, visible: false }));
          }}
          className="do-context-item"
        >
          <Baseline size={14} /> <span>{isVi ? 'Xóa định dạng' : 'Clear Formatting'}</span>
        </button>

        {/* Delete Selection / Table / Image option */}
        <button
          onClick={handleDeleteSelection}
          className="do-context-item"
          style={{ color: '#ef4444' }}
        >
          <Trash2 size={14} /> <span>{isVi ? 'Xóa phần chọn / Bảng / Ảnh' : 'Delete Selection'}</span> <span className="do-context-shortcut">Del</span>
        </button>

        <div style={{ height: '1px', backgroundColor: 'var(--do-color-border)', margin: '4px 0' }} />

        <button
          onClick={() => {
            editor.chain().focus().selectAll().run();
            setMenuState(prev => ({ ...prev, visible: false }));
          }}
          className="do-context-item"
        >
          <BoxSelect size={14} /> <span>{isVi ? 'Chọn tất cả' : 'Select All'}</span> <span className="do-context-shortcut">Ctrl+A</span>
        </button>
      </div>
    </div>
  );
}
