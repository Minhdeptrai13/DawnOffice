import { useState, useEffect } from 'react';
import { Editor } from '@tiptap/react';
import {
  Bold, Italic, Underline, Strikethrough,
  List, ListOrdered, CheckSquare, Image as ImageIcon,
  Table as TableIcon, AlignLeft, AlignCenter, AlignRight, AlignJustify,
  Subscript, Superscript, Baseline, Type, PaintBucket, Paintbrush,
  Scissors, Copy, ClipboardPaste, Search, Replace,
  Undo2, Redo2, Link as LinkIcon, Sigma, SeparatorHorizontal,
  FileCheck, MessageSquare, ListTree, Sliders, Maximize2,
  Square, Circle, ArrowRight, Heading, Globe
} from 'lucide-react';
import FontPicker from './FontPicker';
import StyleGallery from './StyleGallery';
import { CaseType } from '../extensions/ChangeCase';

interface RibbonBarProps {
  editor: Editor | null;
  onFormatPainterClick?: () => void;
  isFormatPainterActive?: boolean;
  onOpenSearch: () => void;
  onOpenReplace: () => void;
  onOpenLinkModal: () => void;
  onOpenSymbolModal: () => void;
  onOpenWordCountModal: () => void;
  onToggleTocDrawer: () => void;
  onToggleCommentsDrawer: () => void;
  onToggleHeaderFooter: () => void;
  showHeaderFooter: boolean;
  margins: 'normal' | 'narrow' | 'wide';
  setMargins: (val: 'normal' | 'narrow' | 'wide') => void;
  orientation: 'portrait' | 'landscape';
  setOrientation: (val: 'portrait' | 'landscape') => void;
  paperSize: 'a4' | 'letter' | 'a3';
  setPaperSize: (val: 'a4' | 'letter' | 'a3') => void;
  columns: 1 | 2 | 3;
  setColumns: (val: 1 | 2 | 3) => void;
  watermark: string;
  setWatermark: (val: string) => void;
  paperTheme: 'standard' | 'eye-care' | 'dark';
  setPaperTheme: (val: 'standard' | 'eye-care' | 'dark') => void;
  showRuler: boolean;
  setShowRuler: (val: boolean) => void;
  onToggleImmersiveMode: () => void;
  lang: 'vi' | 'en';
  setLang: (lang: 'vi' | 'en') => void;
}

const FONT_SIZES = [8, 9, 10, 10.5, 11, 12, 14, 16, 18, 20, 22, 24, 26, 28, 36, 48, 72];

export default function RibbonBar({
  editor,
  onFormatPainterClick,
  isFormatPainterActive,
  onOpenSearch,
  onOpenReplace,
  onOpenLinkModal,
  onOpenSymbolModal,
  onOpenWordCountModal,
  onToggleTocDrawer,
  onToggleCommentsDrawer,
  onToggleHeaderFooter,
  showHeaderFooter,
  margins,
  setMargins,
  orientation,
  setOrientation,
  paperSize,
  setPaperSize,
  columns,
  setColumns,
  watermark,
  setWatermark,
  paperTheme,
  setPaperTheme,
  showRuler,
  setShowRuler,
  onToggleImmersiveMode,
  lang,
  setLang,
}: RibbonBarProps) {
  const [activeTab, setActiveTab] = useState<'home' | 'insert' | 'layout' | 'references' | 'review' | 'view'>('home');
  const [fontFamily, setFontFamily] = useState('Arial');
  const [fontSize, setFontSize] = useState('11pt');
  const [fontColor, setFontColor] = useState('#000000');
  const [hlColor, setHlColor] = useState('#ffff00');

  useEffect(() => {
    if (!editor) return;
    const sync = () => {
      const ts = editor.getAttributes('textStyle');
      if (ts.fontFamily) setFontFamily(ts.fontFamily);
      if (ts.fontSize) setFontSize(ts.fontSize);
      if (ts.color) setFontColor(ts.color);
      const hl = editor.getAttributes('highlight');
      if (hl.color) setHlColor(hl.color);
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

  const handleChangeCase = (type: CaseType) => {
    // @ts-ignore
    if (editor.commands.changeCase) {
      // @ts-ignore
      editor.commands.changeCase(type);
    }
  };

  const addImage = () => {
    const url = window.prompt(lang === 'vi' ? 'Nhập URL hình ảnh:' : 'Image URL:');
    if (url) editor.chain().focus().setImage({ src: url }).run();
  };

  const addTable = () => {
    editor.chain().focus().insertTable({ rows: 3, cols: 3, withHeaderRow: true }).run();
  };

  const insertShape = (shapeName: string) => {
    if (shapeName === 'rect') {
      editor.chain().focus().insertContent('<div style="width:120px;height:60px;border:2px solid #2563eb;background:#dbeafe;display:inline-block;margin:4px;"></div>').run();
    } else if (shapeName === 'circle') {
      editor.chain().focus().insertContent('<div style="width:80px;height:80px;border-radius:50%;border:2px solid #16a34a;background:#dcfce7;display:inline-block;margin:4px;"></div>').run();
    } else if (shapeName === 'arrow') {
      editor.chain().focus().insertContent('<span style="font-size:24px;color:#dc2626;font-weight:bold;margin:4px;">➔</span>').run();
    }
  };

  const sep = (
    <div style={{ width: '1px', background: 'var(--do-color-border)', alignSelf: 'stretch', margin: '0 4px' }} />
  );

  const isVi = lang === 'vi';

  return (
    <div
      style={{
        backgroundColor: 'var(--do-color-surface)',
        borderBottom: '1px solid var(--do-color-border)',
        display: 'flex',
        flexDirection: 'column',
      }}
    >
      {/* Ribbon Tabs Row */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          backgroundColor: 'var(--do-color-bg)',
          borderBottom: '1px solid var(--do-color-border)',
          padding: '2px 8px 0 8px',
          gap: '2px',
        }}
      >
        {(['home', 'insert', 'layout', 'references', 'review', 'view'] as const).map(tab => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            style={{
              padding: '4px 12px',
              fontSize: '12px',
              fontWeight: activeTab === tab ? 600 : 400,
              color: activeTab === tab ? 'var(--do-color-accent)' : 'var(--do-color-text-muted)',
              backgroundColor: activeTab === tab ? 'var(--do-color-surface)' : 'transparent',
              border: '1px solid',
              borderColor: activeTab === tab ? 'var(--do-color-border)' : 'transparent',
              borderBottom: activeTab === tab ? '1px solid var(--do-color-surface)' : 'none',
              borderTopLeftRadius: '4px',
              borderTopRightRadius: '4px',
              cursor: 'pointer',
              textTransform: 'capitalize',
              marginBottom: activeTab === tab ? '-1px' : '0',
              zIndex: activeTab === tab ? 2 : 1,
            }}
          >
            {tab === 'home' && (isVi ? 'Trang chủ' : 'Home')}
            {tab === 'insert' && (isVi ? 'Chèn' : 'Insert')}
            {tab === 'layout' && (isVi ? 'Bố cục' : 'Layout')}
            {tab === 'references' && (isVi ? 'Tham chiếu' : 'References')}
            {tab === 'review' && (isVi ? 'Kiểm duyệt' : 'Review')}
            {tab === 'view' && (isVi ? 'Hiển thị' : 'View')}
          </button>
        ))}

        {/* Language selector right side */}
        <div style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: '4px', paddingRight: '4px' }}>
          <Globe size={13} color="var(--do-color-text-muted)" />
          <select
            value={lang}
            onChange={e => setLang(e.target.value as 'vi' | 'en')}
            style={{
              fontSize: '11px',
              border: 'none',
              background: 'transparent',
              color: 'var(--do-color-text-muted)',
              cursor: 'pointer',
              fontWeight: 500,
            }}
          >
            <option value="vi">Tiếng Việt</option>
            <option value="en">English</option>
          </select>
        </div>
      </div>

      {/* Ribbon Content Panel */}
      <div style={{ padding: '6px 10px', minHeight: '40px', display: 'flex', alignItems: 'center', flexWrap: 'wrap', gap: '4px' }}>
        
        {/* --- HOME TAB --- */}
        {activeTab === 'home' && (
          <>
            {/* History & Clipboard */}
            <button className="do-btn-icon" onClick={() => editor.chain().focus().undo().run()} disabled={!editor.can().undo()} title={isVi ? "Hoàn tác (Ctrl+Z)" : "Undo (Ctrl+Z)"}><Undo2 size={15} /></button>
            <button className="do-btn-icon" onClick={() => editor.chain().focus().redo().run()} disabled={!editor.can().redo()} title={isVi ? "Làm lại (Ctrl+Y)" : "Redo (Ctrl+Y)"}><Redo2 size={15} /></button>
            {sep}
            <button className="do-btn-icon" onClick={() => document.execCommand('cut')} title={isVi ? "Cắt (Ctrl+X)" : "Cut (Ctrl+X)"}><Scissors size={15} /></button>
            <button className="do-btn-icon" onClick={() => document.execCommand('copy')} title={isVi ? "Sao chép (Ctrl+C)" : "Copy (Ctrl+C)"}><Copy size={15} /></button>
            <button className="do-btn-icon" onClick={() => document.execCommand('paste')} title={isVi ? "Dán (Ctrl+V)" : "Paste (Ctrl+V)"}><ClipboardPaste size={15} /></button>
            <button className={`do-btn-icon ${isFormatPainterActive ? 'active' : ''}`} onClick={onFormatPainterClick} title={isVi ? "Sao chép định dạng" : "Format Painter"}><Paintbrush size={15} /></button>
            {sep}

            {/* Font Family & Size */}
            <FontPicker value={fontFamily} onChange={applyFontFamily} />
            <select className="do-select" value={fontSize} onChange={e => applyFontSize(e.target.value)} style={{ width: '60px', height: '26px', fontSize: '12px' }} title={isVi ? "Cỡ chữ" : "Font Size"}>
              {FONT_SIZES.map(s => <option key={s} value={`${s}pt`}>{s}</option>)}
            </select>

            {/* Change Case Dropdown */}
            <select className="do-select" onChange={e => handleChangeCase(e.target.value as CaseType)} style={{ width: '100px', height: '26px', fontSize: '11px' }} title={isVi ? "Đổi kiểu chữ" : "Change Case"} defaultValue="">
              <option value="" disabled>{isVi ? "Đổi kiểu chữ" : "Change Case"}</option>
              <option value="uppercase">CHỮ HOA</option>
              <option value="lowercase">chữ thường</option>
              <option value="sentencecase">Viết hoa đầu câu</option>
              <option value="titlecase">Viết Hoa Mỗi Từ</option>
              <option value="togglecase">ĐỔi kIỂu cHỮ</option>
            </select>
            {sep}

            {/* Formatting */}
            <button onClick={() => editor.chain().focus().toggleBold().run()} className={`do-btn-icon ${editor.isActive('bold') ? 'active' : ''}`} title={isVi ? "In đậm (Ctrl+B)" : "Bold (Ctrl+B)"}><Bold size={15} /></button>
            <button onClick={() => editor.chain().focus().toggleItalic().run()} className={`do-btn-icon ${editor.isActive('italic') ? 'active' : ''}`} title={isVi ? "In nghiêng (Ctrl+I)" : "Italic (Ctrl+I)"}><Italic size={15} /></button>
            <button onClick={() => editor.chain().focus().toggleUnderline().run()} className={`do-btn-icon ${editor.isActive('underline') ? 'active' : ''}`} title={isVi ? "Gạch chân (Ctrl+U)" : "Underline (Ctrl+U)"}><Underline size={15} /></button>
            <button onClick={() => editor.chain().focus().toggleStrike().run()} className={`do-btn-icon ${editor.isActive('strike') ? 'active' : ''}`} title={isVi ? "Gạch ngang chữ" : "Strikethrough"}><Strikethrough size={15} /></button>
            <button onClick={() => editor.chain().focus().toggleSubscript().run()} className={`do-btn-icon ${editor.isActive('subscript') ? 'active' : ''}`} title={isVi ? "Chỉ số dưới" : "Subscript"}><Subscript size={15} /></button>
            <button onClick={() => editor.chain().focus().toggleSuperscript().run()} className={`do-btn-icon ${editor.isActive('superscript') ? 'active' : ''}`} title={isVi ? "Chỉ số trên" : "Superscript"}><Superscript size={15} /></button>
            <button onClick={() => editor.chain().focus().unsetAllMarks().run()} className="do-btn-icon" title={isVi ? "Xóa định dạng" : "Clear Formatting"}><Baseline size={15} /></button>
            {sep}

            {/* Colors */}
            <label title={isVi ? "Màu chữ" : "Font Color"} style={{ display: 'flex', alignItems: 'center', cursor: 'pointer', gap: '2px', padding: '3px' }}>
              <Type size={14} style={{ color: fontColor }} />
              <input type="color" value={fontColor} onChange={e => applyColor(e.target.value)} style={{ width: '18px', height: '18px', padding: 0, border: 'none', cursor: 'pointer' }} />
            </label>
            <label title={isVi ? "Màu tô (Highlight)" : "Highlight Color"} style={{ display: 'flex', alignItems: 'center', cursor: 'pointer', gap: '2px', padding: '3px' }}>
              <PaintBucket size={14} />
              <input type="color" value={hlColor} onChange={e => applyHighlight(e.target.value)} style={{ width: '18px', height: '18px', padding: 0, border: 'none', cursor: 'pointer' }} />
            </label>
            {sep}

            {/* Paragraph & Lists */}
            <button onClick={() => editor.chain().focus().toggleBulletList().run()} className={`do-btn-icon ${editor.isActive('bulletList') ? 'active' : ''}`} title={isVi ? "Danh sách dấu chấm" : "Bullet List"}><List size={15} /></button>
            <button onClick={() => editor.chain().focus().toggleOrderedList().run()} className={`do-btn-icon ${editor.isActive('orderedList') ? 'active' : ''}`} title={isVi ? "Danh sách số" : "Numbered List"}><ListOrdered size={15} /></button>
            <button onClick={() => editor.chain().focus().toggleTaskList().run()} className={`do-btn-icon ${editor.isActive('taskList') ? 'active' : ''}`} title={isVi ? "Danh sách công việc" : "Task List"}><CheckSquare size={15} /></button>
            {sep}

            <button onClick={() => editor.chain().focus().setTextAlign('left').run()} className={`do-btn-icon ${editor.isActive({ textAlign: 'left' }) ? 'active' : ''}`} title={isVi ? "Căn trái" : "Align Left"}><AlignLeft size={15} /></button>
            <button onClick={() => editor.chain().focus().setTextAlign('center').run()} className={`do-btn-icon ${editor.isActive({ textAlign: 'center' }) ? 'active' : ''}`} title={isVi ? "Căn giữa" : "Center"}><AlignCenter size={15} /></button>
            <button onClick={() => editor.chain().focus().setTextAlign('right').run()} className={`do-btn-icon ${editor.isActive({ textAlign: 'right' }) ? 'active' : ''}`} title={isVi ? "Căn phải" : "Align Right"}><AlignRight size={15} /></button>
            <button onClick={() => editor.chain().focus().setTextAlign('justify').run()} className={`do-btn-icon ${editor.isActive({ textAlign: 'justify' }) ? 'active' : ''}`} title={isVi ? "Căn đều 2 bên" : "Justify"}><AlignJustify size={15} /></button>
            {sep}

            {/* Styles Gallery */}
            <StyleGallery editor={editor} />
            {sep}

            {/* Find / Replace */}
            <button className="do-btn-icon" onClick={onOpenSearch} title={isVi ? "Tìm kiếm (Ctrl+F)" : "Find (Ctrl+F)"}><Search size={15} /></button>
            <button className="do-btn-icon" onClick={onOpenReplace} title={isVi ? "Thay thế (Ctrl+H)" : "Replace (Ctrl+H)"}><Replace size={15} /></button>
          </>
        )}

        {/* --- INSERT TAB --- */}
        {activeTab === 'insert' && (
          <>
            <button className="do-btn-icon" onClick={addTable} title={isVi ? "Chèn Bảng 3x3" : "Insert Table"}><TableIcon size={15} /> {isVi ? "Bảng" : "Table"}</button>
            <button className="do-btn-icon" onClick={addImage} title={isVi ? "Chèn Hình ảnh" : "Insert Image"}><ImageIcon size={15} /> {isVi ? "Hình ảnh" : "Image"}</button>
            <button className="do-btn-icon" onClick={onOpenLinkModal} title={isVi ? "Chèn Liên kết" : "Insert Link"}><LinkIcon size={15} /> {isVi ? "Liên kết" : "Link"}</button>
            {sep}

            <button className="do-btn-icon" onClick={() => editor.chain().focus().insertPageBreak().run()} title={isVi ? "Ngắt trang" : "Page Break"}><SeparatorHorizontal size={15} /> {isVi ? "Ngắt trang" : "Page Break"}</button>
            <button className="do-btn-icon" onClick={onOpenSymbolModal} title={isVi ? "Ký tự đặc biệt & Công thức" : "Symbol / Math"}><Sigma size={15} /> {isVi ? "Ký tự / Toán" : "Symbols"}</button>
            <button className={`do-btn-icon ${showHeaderFooter ? 'active' : ''}`} onClick={onToggleHeaderFooter} title={isVi ? "Bật/Tắt Tiêu đề & Chân trang" : "Toggle Header & Footer"}><Heading size={15} /> {isVi ? "Header / Footer" : "Header / Footer"}</button>
            {sep}

            {/* Shapes */}
            <span style={{ fontSize: '11px', color: 'var(--do-color-text-muted)', fontWeight: 600 }}>{isVi ? 'Hình khối:' : 'Shapes:'}</span>
            <button className="do-btn-icon" onClick={() => insertShape('rect')} title={isVi ? "Hình chữ nhật" : "Rectangle"}><Square size={14} /></button>
            <button className="do-btn-icon" onClick={() => insertShape('circle')} title={isVi ? "Hình tròn" : "Circle"}><Circle size={14} /></button>
            <button className="do-btn-icon" onClick={() => insertShape('arrow')} title={isVi ? "Mũi tên" : "Arrow"}><ArrowRight size={14} /></button>
          </>
        )}

        {/* --- LAYOUT TAB --- */}
        {activeTab === 'layout' && (
          <>
            {/* Margins */}
            <span style={{ fontSize: '11px', color: 'var(--do-color-text-muted)', fontWeight: 600 }}>{isVi ? 'Căn lề:' : 'Margins:'}</span>
            <select className="do-select" value={margins} onChange={e => setMargins(e.target.value as any)} style={{ fontSize: '12px' }}>
              <option value="normal">{isVi ? 'Bình thường (2.54cm)' : 'Normal (2.54cm)'}</option>
              <option value="narrow">{isVi ? 'Hẹp (1.27cm)' : 'Narrow (1.27cm)'}</option>
              <option value="wide">{isVi ? 'Rộng (5.08cm)' : 'Wide (5.08cm)'}</option>
            </select>
            {sep}

            {/* Orientation */}
            <span style={{ fontSize: '11px', color: 'var(--do-color-text-muted)', fontWeight: 600 }}>{isVi ? 'Hướng trang:' : 'Orientation:'}</span>
            <select className="do-select" value={orientation} onChange={e => setOrientation(e.target.value as any)} style={{ fontSize: '12px' }}>
              <option value="portrait">{isVi ? 'Dọc (Portrait)' : 'Portrait'}</option>
              <option value="landscape">{isVi ? 'Ngang (Landscape)' : 'Landscape'}</option>
            </select>
            {sep}

            {/* Paper Size */}
            <span style={{ fontSize: '11px', color: 'var(--do-color-text-muted)', fontWeight: 600 }}>{isVi ? 'Khổ giấy:' : 'Size:'}</span>
            <select className="do-select" value={paperSize} onChange={e => setPaperSize(e.target.value as any)} style={{ fontSize: '12px' }}>
              <option value="a4">A4 (210 x 297 mm)</option>
              <option value="letter">Letter (8.5 x 11 in)</option>
              <option value="a3">A3 (297 x 420 mm)</option>
            </select>
            {sep}

            {/* Columns */}
            <span style={{ fontSize: '11px', color: 'var(--do-color-text-muted)', fontWeight: 600 }}>{isVi ? 'Chia cột:' : 'Columns:'}</span>
            <select className="do-select" value={columns} onChange={e => setColumns(Number(e.target.value) as any)} style={{ fontSize: '12px' }}>
              <option value={1}>{isVi ? '1 Cột' : '1 Column'}</option>
              <option value={2}>{isVi ? '2 Cột' : '2 Columns'}</option>
              <option value={3}>{isVi ? '3 Cột' : '3 Columns'}</option>
            </select>
            {sep}

            {/* Watermark */}
            <span style={{ fontSize: '11px', color: 'var(--do-color-text-muted)', fontWeight: 600 }}>Watermark:</span>
            <select className="do-select" value={watermark} onChange={e => setWatermark(e.target.value)} style={{ fontSize: '12px' }}>
              <option value="">{isVi ? 'Không có' : 'None'}</option>
              <option value="DRAFT">DRAFT ({isVi ? 'Nháp' : 'Draft'})</option>
              <option value="CONFIDENTIAL">CONFIDENTIAL ({isVi ? 'Bảo mật' : 'Confidential'})</option>
              <option value="SAMPLE">SAMPLE ({isVi ? 'Mẫu' : 'Sample'})</option>
            </select>
            {sep}

            <button className={`do-btn-icon ${showHeaderFooter ? 'active' : ''}`} onClick={onToggleHeaderFooter} title={isVi ? "Bật/Tắt Tiêu đề & Chân trang" : "Header & Footer"}><Heading size={15} /> Header/Footer</button>
          </>
        )}

        {/* --- REFERENCES TAB --- */}
        {activeTab === 'references' && (
          <>
            <button className="do-btn-icon" onClick={onToggleTocDrawer} title={isVi ? "Mục lục tự động" : "Table of Contents"}><ListTree size={15} /> {isVi ? "Mục lục tự động" : "Table of Contents"}</button>
            <button className="do-btn-icon" onClick={onOpenSymbolModal} title={isVi ? "Công thức toán LaTeX & Ký tự" : "Math & Symbols"}><Sigma size={15} /> {isVi ? "Công thức toán" : "Math Equations"}</button>
          </>
        )}

        {/* --- REVIEW TAB --- */}
        {activeTab === 'review' && (
          <>
            <button className="do-btn-icon" onClick={onOpenWordCountModal} title={isVi ? "Thống kê số từ văn bản" : "Word Count"}><FileCheck size={15} /> {isVi ? "Thống kê từ (Word Count)" : "Word Count"}</button>
            <button className="do-btn-icon" onClick={onToggleCommentsDrawer} title={isVi ? "Mở ngăn Bình luận & Rà soát" : "Comments"}><MessageSquare size={15} /> {isVi ? "Bình luận (Comments)" : "Comments"}</button>
          </>
        )}

        {/* --- VIEW TAB --- */}
        {activeTab === 'view' && (
          <>
            <button className={`do-btn-icon ${showRuler ? 'active' : ''}`} onClick={() => setShowRuler(!showRuler)} title={isVi ? "Bật/Tắt Thước đo" : "Ruler"}><Sliders size={15} /> {isVi ? "Thước đo (Ruler)" : "Ruler"}</button>
            <button className="do-btn-icon" onClick={onToggleTocDrawer} title={isVi ? "Cây mục lục Navigation Pane" : "Navigation Pane"}><ListTree size={15} /> Nav Pane</button>
            <button className="do-btn-icon" onClick={onToggleImmersiveMode} title={isVi ? "Chế độ tập trung (Focus Mode)" : "Focus Mode"}><Maximize2 size={15} /> Focus Mode</button>
            {sep}

            <span style={{ fontSize: '11px', color: 'var(--do-color-text-muted)', fontWeight: 600 }}>{isVi ? 'Giao diện giấy:' : 'Paper Theme:'}</span>
            <select className="do-select" value={paperTheme} onChange={e => setPaperTheme(e.target.value as any)} style={{ fontSize: '12px' }}>
              <option value="standard">{isVi ? 'Trắng chuẩn' : 'Standard White'}</option>
              <option value="eye-care">{isVi ? 'Bảo vệ mắt (Vàng nhe)' : 'Eye-Care Sepia'}</option>
              <option value="dark">{isVi ? 'Chế độ tối (Dark)' : 'Dark Mode'}</option>
            </select>
          </>
        )}

      </div>
    </div>
  );
}
