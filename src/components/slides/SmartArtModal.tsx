import { useState } from 'react';
import { SmartArtKind, SmartArtData } from '../../types/slides';
import { X, Network, GitCommit, RefreshCw, Triangle } from 'lucide-react';

interface SmartArtModalProps {
  isOpen: boolean;
  onClose: () => void;
  onInsert: (smartartData: SmartArtData) => void;
  lang: 'vi' | 'en';
}

export default function SmartArtModal({ isOpen, onClose, onInsert, lang }: SmartArtModalProps) {
  const [kind, setKind] = useState<SmartArtKind>('process');
  const [nodes, setNodes] = useState([
    { id: '1', label: lang === 'vi' ? 'Bước 1: Khởi động' : 'Step 1: Start', sublabel: 'Lập kế hoạch', color: '#2563eb' },
    { id: '2', label: lang === 'vi' ? 'Bước 2: Thực thi' : 'Step 2: Execute', sublabel: 'Triển khai code', color: '#10b981' },
    { id: '3', label: lang === 'vi' ? 'Bước 3: Hoàn thành' : 'Step 3: Complete', sublabel: 'Bàn giao sản phẩm', color: '#f59e0b' },
  ]);

  if (!isOpen) return null;

  const isVi = lang === 'vi';

  const handleAddNode = () => {
    setNodes(prev => [
      ...prev,
      {
        id: String(Date.now()),
        label: isVi ? `Bước ${prev.length + 1}: Mới` : `Step ${prev.length + 1}: New`,
        sublabel: isVi ? 'Mô tả chi tiết' : 'Detailed description',
        color: '#8b5cf6',
      },
    ]);
  };

  const handleRemoveNode = (id: string) => {
    if (nodes.length <= 1) return;
    setNodes(prev => prev.filter(n => n.id !== id));
  };

  const handleNodeChange = (id: string, field: 'label' | 'sublabel' | 'color', val: string) => {
    setNodes(prev => prev.map(n => (n.id === id ? { ...n, [field]: val } : n)));
  };

  const handleInsert = () => {
    onInsert({ kind, nodes });
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
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        zIndex: 9999,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        backdropFilter: 'blur(4px)',
      }}
    >
      <div
        style={{
          width: '620px',
          backgroundColor: 'var(--do-color-surface)',
          borderRadius: '16px',
          boxShadow: 'var(--do-shadow-lg)',
          border: '1px solid var(--do-color-border)',
          display: 'flex',
          flexDirection: 'column',
          overflow: 'hidden',
        }}
      >
        {/* Modal Header */}
        <div style={{ padding: '1rem 1.25rem', borderBottom: '1px solid var(--do-color-border)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <h3 style={{ margin: 0, fontSize: '1.1rem', fontWeight: 600, color: 'var(--do-color-text)' }}>
            ✨ {isVi ? 'Chèn Đồ Họa Thông Minh SmartArt' : 'Insert SmartArt Graphic'}
          </h3>
          <button className="do-btn-icon" onClick={onClose} style={{ borderRadius: '8px' }}>
            <X size={18} />
          </button>
        </div>

        {/* Modal Body */}
        <div style={{ padding: '1.25rem', display: 'flex', flexDirection: 'column', gap: '1.25rem', maxHeight: '70vh', overflowY: 'auto' }}>
          {/* SmartArt Kind Selection */}
          <div>
            <label style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--do-color-text-muted)', marginBottom: '0.5rem', display: 'block' }}>
              {isVi ? 'Chọn Loại Sơ Đồ:' : 'Select Diagram Type:'}
            </label>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '0.75rem' }}>
              <button
                onClick={() => setKind('process')}
                className={`do-btn ${kind === 'process' ? 'active' : ''}`}
                style={{ flexDirection: 'column', padding: '0.75rem 0.5rem', gap: '6px', borderRadius: '10px', border: kind === 'process' ? '2px solid var(--do-color-primary)' : '1px solid var(--do-color-border)' }}
              >
                <GitCommit size={20} color="var(--do-color-primary)" />
                <span style={{ fontSize: '0.8rem' }}>{isVi ? 'Quy trình' : 'Process'}</span>
              </button>
              <button
                onClick={() => setKind('hierarchy')}
                className={`do-btn ${kind === 'hierarchy' ? 'active' : ''}`}
                style={{ flexDirection: 'column', padding: '0.75rem 0.5rem', gap: '6px', borderRadius: '10px', border: kind === 'hierarchy' ? '2px solid var(--do-color-primary)' : '1px solid var(--do-color-border)' }}
              >
                <Network size={20} color="#10b981" />
                <span style={{ fontSize: '0.8rem' }}>{isVi ? 'Phân cấp' : 'Hierarchy'}</span>
              </button>
              <button
                onClick={() => setKind('cycle')}
                className={`do-btn ${kind === 'cycle' ? 'active' : ''}`}
                style={{ flexDirection: 'column', padding: '0.75rem 0.5rem', gap: '6px', borderRadius: '10px', border: kind === 'cycle' ? '2px solid var(--do-color-primary)' : '1px solid var(--do-color-border)' }}
              >
                <RefreshCw size={20} color="#f59e0b" />
                <span style={{ fontSize: '0.8rem' }}>{isVi ? 'Chu kỳ' : 'Cycle'}</span>
              </button>
              <button
                onClick={() => setKind('pyramid')}
                className={`do-btn ${kind === 'pyramid' ? 'active' : ''}`}
                style={{ flexDirection: 'column', padding: '0.75rem 0.5rem', gap: '6px', borderRadius: '10px', border: kind === 'pyramid' ? '2px solid var(--do-color-primary)' : '1px solid var(--do-color-border)' }}
              >
                <Triangle size={20} color="#ec4899" />
                <span style={{ fontSize: '0.8rem' }}>{isVi ? 'Phễu / Kim tự tháp' : 'Pyramid'}</span>
              </button>
            </div>
          </div>

          {/* Node Edit Section */}
          <div>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
              <label style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--do-color-text-muted)' }}>
                {isVi ? 'Danh sách Khối Nút Nội dung:' : 'Content Nodes List:'}
              </label>
              <button className="do-btn" onClick={handleAddNode} style={{ borderRadius: '8px', fontSize: '0.8rem' }}>
                + {isVi ? 'Thêm nút' : 'Add Node'}
              </button>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              {nodes.map((node, idx) => (
                <div
                  key={node.id}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.5rem',
                    backgroundColor: 'var(--do-color-bg)',
                    padding: '0.5rem 0.75rem',
                    borderRadius: '8px',
                    border: '1px solid var(--do-color-border)',
                  }}
                >
                  <span style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--do-color-text-muted)', width: '20px' }}>
                    {idx + 1}.
                  </span>
                  <input
                    type="color"
                    value={node.color || '#2563eb'}
                    onChange={e => handleNodeChange(node.id, 'color', e.target.value)}
                    style={{ width: '28px', height: '28px', border: 'none', borderRadius: '4px', cursor: 'pointer' }}
                  />
                  <input
                    type="text"
                    value={node.label}
                    onChange={e => handleNodeChange(node.id, 'label', e.target.value)}
                    placeholder={isVi ? 'Tiêu đề khối' : 'Node title'}
                    style={{
                      flex: 1,
                      padding: '4px 8px',
                      borderRadius: '6px',
                      border: '1px solid var(--do-color-border)',
                      fontSize: '0.85rem',
                    }}
                  />
                  <input
                    type="text"
                    value={node.sublabel || ''}
                    onChange={e => handleNodeChange(node.id, 'sublabel', e.target.value)}
                    placeholder={isVi ? 'Mô tả phụ' : 'Sublabel'}
                    style={{
                      flex: 1,
                      padding: '4px 8px',
                      borderRadius: '6px',
                      border: '1px solid var(--do-color-border)',
                      fontSize: '0.85rem',
                    }}
                  />
                  <button
                    className="do-btn-icon"
                    onClick={() => handleRemoveNode(node.id)}
                    disabled={nodes.length <= 1}
                    style={{ color: '#ef4444', opacity: nodes.length <= 1 ? 0.4 : 1 }}
                  >
                    <X size={16} />
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Modal Footer */}
        <div style={{ padding: '1rem 1.25rem', borderTop: '1px solid var(--do-color-border)', display: 'flex', justifyContent: 'flex-end', gap: '0.5rem' }}>
          <button className="do-btn" onClick={onClose} style={{ borderRadius: '8px' }}>
            {isVi ? 'Hủy' : 'Cancel'}
          </button>
          <button className="do-btn" onClick={handleInsert} style={{ borderRadius: '8px', backgroundColor: 'var(--do-color-primary)', color: '#fff' }}>
            {isVi ? 'Chèn vào Slide' : 'Insert to Slide'}
          </button>
        </div>
      </div>
    </div>
  );
}
