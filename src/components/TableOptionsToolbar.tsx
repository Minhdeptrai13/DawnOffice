import { Editor } from '@tiptap/react';
import { Table, Plus, Trash2, Combine, Split, PaintBucket } from 'lucide-react';

interface TableOptionsToolbarProps {
  editor: Editor | null;
}

export default function TableOptionsToolbar({ editor }: TableOptionsToolbarProps) {
  if (!editor || !editor.isActive('table')) return null;

  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: '4px',
        backgroundColor: 'var(--do-color-bg)',
        borderBottom: '1px solid var(--do-color-border)',
        padding: '2px 8px',
        fontSize: '11px',
        color: 'var(--do-color-text)',
      }}
    >
      <span style={{ fontWeight: 600, color: 'var(--do-color-accent)', display: 'flex', alignItems: 'center', gap: '4px', marginRight: '6px' }}>
        <Table size={14} /> Công cụ Bảng:
      </span>

      {/* Row & Column Actions */}
      <button onClick={() => editor.chain().focus().addRowBefore().run()} className="do-btn-icon" title="Thêm dòng phía trên"><Plus size={13} /> Dòng trên</button>
      <button onClick={() => editor.chain().focus().addRowAfter().run()} className="do-btn-icon" title="Thêm dòng phía dưới"><Plus size={13} /> Dòng dưới</button>
      <button onClick={() => editor.chain().focus().deleteRow().run()} className="do-btn-icon" title="Xóa dòng"><Trash2 size={13} /> Xóa dòng</button>

      <div style={{ width: '1px', height: '14px', background: 'var(--do-color-border)', margin: '0 4px' }} />

      <button onClick={() => editor.chain().focus().addColumnBefore().run()} className="do-btn-icon" title="Thêm cột phía trái"><Plus size={13} /> Cột trái</button>
      <button onClick={() => editor.chain().focus().addColumnAfter().run()} className="do-btn-icon" title="Thêm cột phía phải"><Plus size={13} /> Cột phải</button>
      <button onClick={() => editor.chain().focus().deleteColumn().run()} className="do-btn-icon" title="Xóa cột"><Trash2 size={13} /> Xóa cột</button>

      <div style={{ width: '1px', height: '14px', background: 'var(--do-color-border)', margin: '0 4px' }} />

      {/* Cell Merge & Split */}
      <button onClick={() => editor.chain().focus().mergeCells().run()} className="do-btn-icon" title="Gộp ô (Merge Cells)"><Combine size={13} /> Gộp ô</button>
      <button onClick={() => editor.chain().focus().splitCell().run()} className="do-btn-icon" title="Tách ô (Split Cell)"><Split size={13} /> Tách ô</button>
      <button onClick={() => editor.chain().focus().toggleHeaderRow().run()} className="do-btn-icon" title="Dòng Tiêu đề (Header Row)">Header Row</button>

      <div style={{ width: '1px', height: '14px', background: 'var(--do-color-border)', margin: '0 4px' }} />

      {/* Cell Background / Shading */}
      <label title="Màu nền ô (Cell Shading)" style={{ display: 'flex', alignItems: 'center', cursor: 'pointer', gap: '2px' }}>
        <PaintBucket size={13} />
        <input
          type="color"
          defaultValue="#f3f4f6"
          onChange={e => editor.chain().focus().setCellAttribute('backgroundColor', e.target.value).run()}
          style={{ width: '16px', height: '16px', border: 'none', background: 'transparent', cursor: 'pointer' }}
        />
      </label>

      {/* Delete Table */}
      <button onClick={() => editor.chain().focus().deleteTable().run()} className="do-btn-icon" style={{ color: '#ef4444', marginLeft: 'auto' }} title="Xóa toàn bộ bảng">
        <Trash2 size={13} /> Xóa bảng
      </button>
    </div>
  );
}
