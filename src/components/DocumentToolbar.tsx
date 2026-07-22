import { useState, useEffect } from 'react';
import { Editor } from '@tiptap/react';
import {
  Bold, Italic, Underline, Strikethrough,
  List, ListOrdered, CheckSquare, Image as ImageIcon,
  Table as TableIcon, AlignLeft, AlignCenter, AlignRight, AlignJustify,
  Subscript, Superscript, Baseline, Type, PaintBucket, Paintbrush,
  Scissors, Copy, ClipboardPaste, Search, Replace, Indent, Outdent, SeparatorHorizontal,
  Undo2, Redo2
} from 'lucide-react';
import StyleGallery from './StyleGallery';
import FontPicker from './FontPicker';

interface DocumentToolbarProps {
  editor: Editor | null;
  onFormatPainterClick?: () => void;
  isFormatPainterActive?: boolean;
}

const FONT_SIZES = [8, 9, 10, 10.5, 11, 12, 14, 16, 18, 20, 22, 24, 26, 28, 36, 48, 72];

export default function DocumentToolbar({ editor, onFormatPainterClick, isFormatPainterActive }: DocumentToolbarProps) {
  // Local state — avoids the controlled-select "reset" bug where
  // getAttributes() returns undefined between renders
  const [fontFamily, setFontFamily] = useState('Arial');
  const [fontSize, setFontSize]     = useState('11pt');
  const [fontColor, setFontColor]   = useState('#000000');
  const [hlColor, setHlColor]       = useState('#ffff00');

  // Sync local state whenever the cursor moves or editor updates
  useEffect(() => {
    if (!editor) return;
    const sync = () => {
      const ts = editor.getAttributes('textStyle');
      if (ts.fontFamily) setFontFamily(ts.fontFamily);
      if (ts.fontSize)   setFontSize(ts.fontSize);
      if (ts.color)      setFontColor(ts.color);
      const hl = editor.getAttributes('highlight');
      if (hl.color)      setHlColor(hl.color);
    };
    editor.on('transaction', sync);
    editor.on('selectionUpdate', sync);
    return () => {
      editor.off('transaction', sync);
      editor.off('selectionUpdate', sync);
    };
  }, [editor]);

  if (!editor) return null;

  const applyFontFamily = (ff: string) => {
    setFontFamily(ff);
    editor.chain().focus().setFontFamily(ff).run();
  };

  const applyFontSize = (fs: string) => {
    setFontSize(fs);
    editor.chain().focus().setFontSize(fs).run();
  };

  const applyColor = (c: string) => {
    setFontColor(c);
    editor.chain().focus().setColor(c).run();
  };

  const applyHighlight = (c: string) => {
    setHlColor(c);
    editor.chain().focus().toggleHighlight({ color: c }).run();
  };

  const addImage = () => {
    const url = window.prompt('URL hình ảnh:');
    if (url) editor.chain().focus().setImage({ src: url }).run();
  };

  const addTable = () => {
    editor.chain().focus().insertTable({ rows: 3, cols: 3, withHeaderRow: true }).run();
  };

  const sep = (
    <div style={{ width: '1px', background: 'var(--do-color-border)', alignSelf: 'stretch', margin: '0 4px' }} />
  );

  return (
    <div style={{
      backgroundColor: 'var(--do-color-surface)',
      borderBottom: '1px solid var(--do-color-border)',
      padding: '4px 8px',
      display: 'flex',
      flexDirection: 'column',
      gap: '4px',
    }}>

      {/* ── ROW 1: Clipboard | Font | Bold/Italic… | Colors | Find ── */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '2px', flexWrap: 'wrap' }}>

        {/* History */}
        <button className="do-btn-icon" onClick={() => editor.chain().focus().undo().run()} disabled={!editor.can().undo()} title="Undo (Ctrl+Z)"><Undo2 size={15} /></button>
        <button className="do-btn-icon" onClick={() => editor.chain().focus().redo().run()} disabled={!editor.can().redo()} title="Redo (Ctrl+Y)"><Redo2 size={15} /></button>
        {sep}

        {/* Clipboard */}
        <button className="do-btn-icon" onClick={() => document.execCommand('cut')} title="Cut (Ctrl+X)"><Scissors size={15} /></button>
        <button className="do-btn-icon" onClick={() => document.execCommand('copy')} title="Copy (Ctrl+C)"><Copy size={15} /></button>
        <button className="do-btn-icon" onClick={() => document.execCommand('paste')} title="Paste (Ctrl+V)"><ClipboardPaste size={15} /></button>
        <button
          className={`do-btn-icon ${isFormatPainterActive ? 'active' : ''}`}
          onClick={onFormatPainterClick}
          title="Format Painter (Ctrl+Shift+C)"
        ><Paintbrush size={15} /></button>

        {sep}

        {/* Font Family — searchable, loads ALL system fonts */}
        <FontPicker value={fontFamily} onChange={applyFontFamily} />

        {/* Font Size — LOCAL state */}
        <select
          className="do-select"
          value={fontSize}
          onChange={e => applyFontSize(e.target.value)}
          style={{ width: '60px', height: '26px', fontSize: '12px' }}
          title="Font Size"
        >
          {FONT_SIZES.map(s => (
            <option key={s} value={`${s}pt`}>{s}</option>
          ))}
        </select>

        {sep}

        {/* Bold / Italic / Underline / Strike / Sub / Super / Clear */}
        <button onClick={() => editor.chain().focus().toggleBold().run()} className={`do-btn-icon ${editor.isActive('bold') ? 'active' : ''}`} title="Bold (Ctrl+B)"><Bold size={15} /></button>
        <button onClick={() => editor.chain().focus().toggleItalic().run()} className={`do-btn-icon ${editor.isActive('italic') ? 'active' : ''}`} title="Italic (Ctrl+I)"><Italic size={15} /></button>
        <button onClick={() => editor.chain().focus().toggleUnderline().run()} className={`do-btn-icon ${editor.isActive('underline') ? 'active' : ''}`} title="Underline (Ctrl+U)"><Underline size={15} /></button>
        <button onClick={() => editor.chain().focus().toggleStrike().run()} className={`do-btn-icon ${editor.isActive('strike') ? 'active' : ''}`} title="Strikethrough (Ctrl+Shift+X)"><Strikethrough size={15} /></button>
        <button onClick={() => editor.chain().focus().toggleSubscript().run()} className={`do-btn-icon ${editor.isActive('subscript') ? 'active' : ''}`} title="Subscript (Ctrl+=)"><Subscript size={15} /></button>
        <button onClick={() => editor.chain().focus().toggleSuperscript().run()} className={`do-btn-icon ${editor.isActive('superscript') ? 'active' : ''}`} title="Superscript (Ctrl+Shift+=)"><Superscript size={15} /></button>
        <button onClick={() => editor.chain().focus().unsetAllMarks().run()} className="do-btn-icon" title="Clear Formatting"><Baseline size={15} /></button>

        {sep}

        {/* Font Color — local state */}
        <label title="Font Color" style={{ display: 'flex', alignItems: 'center', cursor: 'pointer', gap: '2px', padding: '3px' }}>
          <Type size={14} style={{ color: fontColor }} />
          <input
            type="color"
            value={fontColor}
            onChange={e => applyColor(e.target.value)}
            style={{ width: '18px', height: '18px', padding: 0, border: 'none', cursor: 'pointer', borderRadius: '2px' }}
          />
        </label>

        {/* Highlight Color — local state */}
        <label title="Highlight Color" style={{ display: 'flex', alignItems: 'center', cursor: 'pointer', gap: '2px', padding: '3px' }}>
          <PaintBucket size={14} />
          <input
            type="color"
            value={hlColor}
            onChange={e => applyHighlight(e.target.value)}
            style={{ width: '18px', height: '18px', padding: 0, border: 'none', cursor: 'pointer', borderRadius: '2px' }}
          />
        </label>

        {sep}

        {/* Find / Replace */}
        <button className="do-btn-icon" onClick={() => window.dispatchEvent(new CustomEvent('dawn-open-search'))} title="Find (Ctrl+F)"><Search size={15} /></button>
        <button className="do-btn-icon" onClick={() => window.dispatchEvent(new CustomEvent('dawn-open-replace'))} title="Replace (Ctrl+H)"><Replace size={15} /></button>
      </div>

      {/* ── ROW 2: Lists | Indent | Align | Spacing | Insert | Styles ── */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '2px', flexWrap: 'wrap' }}>

        {/* Lists */}
        <button onClick={() => editor.chain().focus().toggleBulletList().run()} className={`do-btn-icon ${editor.isActive('bulletList') ? 'active' : ''}`} title="Bullet List"><List size={15} /></button>
        <button onClick={() => editor.chain().focus().toggleOrderedList().run()} className={`do-btn-icon ${editor.isActive('orderedList') ? 'active' : ''}`} title="Numbered List"><ListOrdered size={15} /></button>
        <button onClick={() => editor.chain().focus().toggleTaskList().run()} className={`do-btn-icon ${editor.isActive('taskList') ? 'active' : ''}`} title="Task List"><CheckSquare size={15} /></button>

        {sep}

        {/* Indent */}
        <button onClick={() => editor.chain().focus().outdent().run()} className="do-btn-icon" title="Decrease Indent (Shift+Tab)"><Outdent size={15} /></button>
        <button onClick={() => editor.chain().focus().indent().run()} className="do-btn-icon" title="Increase Indent (Tab)"><Indent size={15} /></button>

        {sep}

        {/* Alignment */}
        <button onClick={() => editor.chain().focus().setTextAlign('left').run()} className={`do-btn-icon ${editor.isActive({ textAlign: 'left' }) ? 'active' : ''}`} title="Align Left (Ctrl+L)"><AlignLeft size={15} /></button>
        <button onClick={() => editor.chain().focus().setTextAlign('center').run()} className={`do-btn-icon ${editor.isActive({ textAlign: 'center' }) ? 'active' : ''}`} title="Center (Ctrl+E)"><AlignCenter size={15} /></button>
        <button onClick={() => editor.chain().focus().setTextAlign('right').run()} className={`do-btn-icon ${editor.isActive({ textAlign: 'right' }) ? 'active' : ''}`} title="Align Right (Ctrl+R)"><AlignRight size={15} /></button>
        <button onClick={() => editor.chain().focus().setTextAlign('justify').run()} className={`do-btn-icon ${editor.isActive({ textAlign: 'justify' }) ? 'active' : ''}`} title="Justify (Ctrl+J)"><AlignJustify size={15} /></button>

        {sep}

        {/* Line Spacing */}
        <select
          className="do-select"
          onChange={e => editor.chain().focus().setLineHeight(e.target.value).run()}
          title="Line Spacing"
          defaultValue="1.5"
          style={{ width: '58px', height: '26px', fontSize: '12px' }}
        >
          <option value="1">1.0</option>
          <option value="1.15">1.15</option>
          <option value="1.5">1.5</option>
          <option value="2">2.0</option>
          <option value="2.5">2.5</option>
          <option value="3">3.0</option>
        </select>

        {sep}

        {/* Insert */}
        <button onClick={addTable} className="do-btn-icon" title="Insert Table"><TableIcon size={15} /></button>
        <button onClick={addImage} className="do-btn-icon" title="Insert Image"><ImageIcon size={15} /></button>
        <button
          onClick={() => editor.chain().focus().insertPageBreak().run()}
          className="do-btn-icon"
          title="Insert Page Break (Ctrl+Enter)"
        ><SeparatorHorizontal size={15} /></button>

        {sep}

        {/* Style Gallery */}
        <StyleGallery editor={editor} />
      </div>

    </div>
  );
}
