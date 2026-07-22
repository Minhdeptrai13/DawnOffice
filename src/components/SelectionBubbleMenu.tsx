import { useState } from 'react';
import { Editor } from '@tiptap/react';
import { BubbleMenu } from '@tiptap/react/menus';
import {
  AlignLeft, AlignCenter, AlignRight, AlignJustify,
  List, ListOrdered, CheckSquare, Link as LinkIcon, MessageSquare,
  Trash2, Copy, Scissors, ClipboardPaste, Palette, Highlighter, CaseSensitive
} from 'lucide-react';
import DawnLogoAnimated from './DawnLogoAnimated';
import { CaseType } from '../extensions/ChangeCase';

interface SelectionBubbleMenuProps {
  editor: Editor | null;
  onOpenLinkModal: () => void;
  onAddComment: () => void;
  lang: 'vi' | 'en';
}

export default function SelectionBubbleMenu({
  editor,
  onOpenLinkModal,
  onAddComment,
  lang,
}: SelectionBubbleMenuProps) {
  const [showColorPicker, setShowColorPicker] = useState(false);
  const [showHighlightPicker, setShowHighlightPicker] = useState(false);
  const [showCaseMenu, setShowCaseMenu] = useState(false);

  if (!editor) return null;

  const isVi = lang === 'vi';

  const fontColors = [
    { name: 'Default', color: 'inherit' },
    { name: 'Red', color: '#ef4444' },
    { name: 'Blue', color: '#2563eb' },
    { name: 'Green', color: '#16a34a' },
    { name: 'Gold', color: '#d97706' },
    { name: 'Purple', color: '#9333ea' },
  ];

  const highlightColors = [
    { name: 'None', color: 'transparent' },
    { name: 'Yellow', color: '#fef08a' },
    { name: 'Green', color: '#bbf7d0' },
    { name: 'Cyan', color: '#a5f3fc' },
    { name: 'Pink', color: '#fbcfe8' },
  ];

  const handleFontSizeChange = (delta: number) => {
    const currentSizeStr = editor.getAttributes('textStyle').fontSize || '16px';
    const currentSize = parseInt(currentSizeStr.replace('px', ''), 10) || 16;
    const newSize = Math.max(8, Math.min(72, currentSize + delta));
    // @ts-ignore
    if (editor.commands.setFontSize) {
      // @ts-ignore
      editor.commands.setFontSize(`${newSize}px`);
    }
  };

  const handleChangeCase = (type: CaseType) => {
    // @ts-ignore
    if (editor.commands.changeCase) {
      // @ts-ignore
      editor.commands.changeCase(type);
    }
    setShowCaseMenu(false);
  };

  const handleDelete = () => {
    if (editor.isActive('table')) {
      editor.chain().focus().deleteTable().run();
    } else {
      editor.chain().focus().deleteSelection().run();
    }
  };

  return (
    <BubbleMenu
      editor={editor}
      className="bubble-menu-vip"
      options={{ placement: 'top', offset: 14 }}
    >
      {/* Brand Logo Header */}
      <div className="bm-logo-badge" title="DawnOffice VIP Floating Toolbar">
        <DawnLogoAnimated size={20} showWordmark={false} />
      </div>

      {/* Clipboard Group */}
      <div className="bm-group">
        <button
          onClick={() => document.execCommand('copy')}
          className="bm-btn"
          title={isVi ? "Sao chép (Ctrl+C)" : "Copy"}
        >
          <Copy size={13} /> {isVi ? "Chép" : "Copy"}
        </button>
        <button
          onClick={() => document.execCommand('cut')}
          className="bm-btn"
          title={isVi ? "Cắt (Ctrl+X)" : "Cut"}
        >
          <Scissors size={13} /> {isVi ? "Cắt" : "Cut"}
        </button>
        <button
          onClick={() => document.execCommand('paste')}
          className="bm-btn"
          title={isVi ? "Dán (Ctrl+V)" : "Paste"}
        >
          <ClipboardPaste size={13} /> {isVi ? "Dán" : "Paste"}
        </button>
      </div>

      <div className="bm-divider" />

      {/* Font Size Adjusters */}
      <div className="bm-group">
        <button
          onClick={() => handleFontSizeChange(-1)}
          className="bm-btn-icon"
          title={isVi ? "Giảm cỡ chữ" : "Decrease Font Size"}
        >
          A<sup>-</sup>
        </button>
        <button
          onClick={() => handleFontSizeChange(1)}
          className="bm-btn-icon"
          title={isVi ? "Tăng cỡ chữ" : "Increase Font Size"}
        >
          A<sup>+</sup>
        </button>
      </div>

      <div className="bm-divider" />

      {/* Character Formatting */}
      <div className="bm-group">
        <button
          onClick={() => editor.chain().focus().toggleBold().run()}
          className={`bm-btn-icon ${editor.isActive('bold') ? 'active' : ''}`}
          title={isVi ? "In đậm (Ctrl+B)" : "Bold"}
        >
          <b>B</b>
        </button>
        <button
          onClick={() => editor.chain().focus().toggleItalic().run()}
          className={`bm-btn-icon ${editor.isActive('italic') ? 'active' : ''}`}
          title={isVi ? "In nghiêng (Ctrl+I)" : "Italic"}
        >
          <i>I</i>
        </button>
        <button
          onClick={() => editor.chain().focus().toggleUnderline().run()}
          className={`bm-btn-icon ${editor.isActive('underline') ? 'active' : ''}`}
          title={isVi ? "Gạch chân (Ctrl+U)" : "Underline"}
        >
          <u>U</u>
        </button>
        <button
          onClick={() => editor.chain().focus().toggleStrike().run()}
          className={`bm-btn-icon ${editor.isActive('strike') ? 'active' : ''}`}
          title={isVi ? "Gạch ngang" : "Strike"}
        >
          <s>S</s>
        </button>
      </div>

      <div className="bm-divider" />

      {/* Colors & Highlight */}
      <div className="bm-group" style={{ position: 'relative' }}>
        <button
          onClick={() => { setShowColorPicker(!showColorPicker); setShowHighlightPicker(false); setShowCaseMenu(false); }}
          className="bm-btn-icon"
          title={isVi ? "Màu chữ" : "Font Color"}
        >
          <Palette size={14} />
        </button>

        {showColorPicker && (
          <div className="bm-popover">
            {fontColors.map(c => (
              <div
                key={c.name}
                onClick={() => {
                  if (c.color === 'inherit') editor.chain().focus().unsetColor().run();
                  else editor.chain().focus().setColor(c.color).run();
                  setShowColorPicker(false);
                }}
                className="bm-color-swatch"
                style={{ backgroundColor: c.color === 'inherit' ? '#000' : c.color }}
                title={c.name}
              />
            ))}
          </div>
        )}

        <button
          onClick={() => { setShowHighlightPicker(!showHighlightPicker); setShowColorPicker(false); setShowCaseMenu(false); }}
          className="bm-btn-icon"
          title={isVi ? "Màu nền highlight" : "Highlight Color"}
        >
          <Highlighter size={14} />
        </button>

        {showHighlightPicker && (
          <div className="bm-popover">
            {highlightColors.map(c => (
              <div
                key={c.name}
                onClick={() => {
                  if (c.color === 'transparent') editor.chain().focus().unsetHighlight().run();
                  else editor.chain().focus().setHighlight({ color: c.color }).run();
                  setShowHighlightPicker(false);
                }}
                className="bm-color-swatch"
                style={{ backgroundColor: c.color === 'transparent' ? '#fff' : c.color, border: '1px solid #ddd' }}
                title={c.name}
              />
            ))}
          </div>
        )}

        {/* Change Case Dropdown */}
        <button
          onClick={() => { setShowCaseMenu(!showCaseMenu); setShowColorPicker(false); setShowHighlightPicker(false); }}
          className="bm-btn-icon"
          title={isVi ? "Đổi kiểu chữ (Aa)" : "Change Case"}
        >
          <CaseSensitive size={14} />
        </button>

        {showCaseMenu && (
          <div className="bm-popover-menu">
            <div onClick={() => handleChangeCase('uppercase')} className="bm-popover-item">CHỮ HOA</div>
            <div onClick={() => handleChangeCase('lowercase')} className="bm-popover-item">chữ thường</div>
            <div onClick={() => handleChangeCase('sentencecase')} className="bm-popover-item">Viết hoa đầu câu</div>
            <div onClick={() => handleChangeCase('titlecase')} className="bm-popover-item">Viết Hoa Mỗi Từ</div>
          </div>
        )}
      </div>

      <div className="bm-divider" />

      {/* Alignment Group */}
      <div className="bm-group">
        <button
          onClick={() => editor.chain().focus().setTextAlign('left').run()}
          className={`bm-btn-icon ${editor.isActive({ textAlign: 'left' }) ? 'active' : ''}`}
          title={isVi ? "Căn trái" : "Align Left"}
        >
          <AlignLeft size={14} />
        </button>
        <button
          onClick={() => editor.chain().focus().setTextAlign('center').run()}
          className={`bm-btn-icon ${editor.isActive({ textAlign: 'center' }) ? 'active' : ''}`}
          title={isVi ? "Căn giữa" : "Align Center"}
        >
          <AlignCenter size={14} />
        </button>
        <button
          onClick={() => editor.chain().focus().setTextAlign('right').run()}
          className={`bm-btn-icon ${editor.isActive({ textAlign: 'right' }) ? 'active' : ''}`}
          title={isVi ? "Căn phải" : "Align Right"}
        >
          <AlignRight size={14} />
        </button>
        <button
          onClick={() => editor.chain().focus().setTextAlign('justify').run()}
          className={`bm-btn-icon ${editor.isActive({ textAlign: 'justify' }) ? 'active' : ''}`}
          title={isVi ? "Căn đều hai bên" : "Justify"}
        >
          <AlignJustify size={14} />
        </button>
      </div>

      <div className="bm-divider" />

      {/* Lists Group */}
      <div className="bm-group">
        <button
          onClick={() => editor.chain().focus().toggleBulletList().run()}
          className={`bm-btn-icon ${editor.isActive('bulletList') ? 'active' : ''}`}
          title={isVi ? "Danh sách đầu dòng" : "Bullet List"}
        >
          <List size={14} />
        </button>
        <button
          onClick={() => editor.chain().focus().toggleOrderedList().run()}
          className={`bm-btn-icon ${editor.isActive('orderedList') ? 'active' : ''}`}
          title={isVi ? "Danh sách đánh số" : "Ordered List"}
        >
          <ListOrdered size={14} />
        </button>
        <button
          onClick={() => editor.chain().focus().toggleTaskList().run()}
          className={`bm-btn-icon ${editor.isActive('taskList') ? 'active' : ''}`}
          title={isVi ? "Danh sách công việc" : "Task List"}
        >
          <CheckSquare size={14} />
        </button>
      </div>

      <div className="bm-divider" />

      {/* Hyperlink, Comment & Delete */}
      <div className="bm-group">
        <button
          onClick={onOpenLinkModal}
          className={`bm-btn-icon ${editor.isActive('link') ? 'active' : ''}`}
          title={isVi ? "Chèn / Sửa Liên kết" : "Insert Link"}
        >
          <LinkIcon size={14} />
        </button>
        <button
          onClick={onAddComment}
          className="bm-btn-icon"
          title={isVi ? "Thêm bình luận" : "Add Comment"}
        >
          <MessageSquare size={14} />
        </button>
        <button
          onClick={handleDelete}
          className="bm-btn-icon bm-delete"
          title={isVi ? "Xóa phần bôi đen / Bảng / Ảnh (Del)" : "Delete"}
        >
          <Trash2 size={14} />
        </button>
      </div>
    </BubbleMenu>
  );
}
