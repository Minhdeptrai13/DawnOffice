import { useState } from 'react';
import { PivotTableConfig } from '../../types/sheets';
import { X } from 'lucide-react';

interface PivotTableModalProps {
  isOpen: boolean;
  onClose: () => void;
  onApply: (pivotConfig: PivotTableConfig) => void;
  lang?: 'vi' | 'en';
}

export default function PivotTableModal({
  isOpen,
  onClose,
  onApply,
  lang = 'vi',
}: PivotTableModalProps) {
  const isVi = lang === 'vi';

  const [sourceRange, setSourceRange] = useState('A1:D5');
  const [rowField, setRowField] = useState('A');
  const [colField] = useState('B');
  const [valField, setValField] = useState('D');
  const [func, setFunc] = useState<'SUM' | 'COUNT' | 'AVERAGE'>('SUM');

  if (!isOpen) return null;

  const handleApply = () => {
    onApply({
      id: `pivot-${Date.now()}`,
      sourceRange,
      rowFields: [rowField],
      colFields: [colField],
      valFields: [{ field: valField, func }],
    });
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
          width: '540px',
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
            📊 {isVi ? 'Tạo Bảng Tổng Hợp Thông Minh (Pivot Table)' : 'Create Pivot Table'}
          </h3>
          <button className="do-btn-icon" onClick={onClose} style={{ borderRadius: '8px' }}>
            <X size={18} />
          </button>
        </div>

        <div style={{ padding: '1.25rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <div>
            <label style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--do-color-text-muted)' }}>
              {isVi ? 'Vùng dữ liệu nguồn:' : 'Source Data Range:'}
            </label>
            <input
              type="text"
              value={sourceRange}
              onChange={e => setSourceRange(e.target.value)}
              placeholder="A1:D5"
              style={{ width: '100%', padding: '6px 10px', borderRadius: '6px', border: '1px solid var(--do-color-border)', fontSize: '0.9rem', marginTop: '4px' }}
            />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
            <div>
              <label style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--do-color-text-muted)' }}>
                {isVi ? 'Trường Hàng (Rows):' : 'Row Fields:'}
              </label>
              <select
                value={rowField}
                onChange={e => setRowField(e.target.value)}
                style={{ width: '100%', padding: '6px 10px', borderRadius: '6px', border: '1px solid var(--do-color-border)', fontSize: '0.9rem', marginTop: '4px' }}
              >
                <option value="A">Cột A (Sản phẩm)</option>
                <option value="B">Cột B (Số lượng)</option>
                <option value="C">Cột C (Đơn giá)</option>
              </select>
            </div>

            <div>
              <label style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--do-color-text-muted)' }}>
                {isVi ? 'Trường Giá Trị (Values):' : 'Value Fields:'}
              </label>
              <select
                value={valField}
                onChange={e => setValField(e.target.value)}
                style={{ width: '100%', padding: '6px 10px', borderRadius: '6px', border: '1px solid var(--do-color-border)', fontSize: '0.9rem', marginTop: '4px' }}
              >
                <option value="D">Cột D (Thành tiền)</option>
                <option value="B">Cột B (Số lượng)</option>
              </select>
            </div>
          </div>

          <div>
            <label style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--do-color-text-muted)' }}>
              {isVi ? 'Hàm tổng hợp:' : 'Summarize Values By:'}
            </label>
            <select
              value={func}
              onChange={e => setFunc(e.target.value as any)}
              style={{ width: '100%', padding: '6px 10px', borderRadius: '6px', border: '1px solid var(--do-color-border)', fontSize: '0.9rem', marginTop: '4px' }}
            >
              <option value="SUM">SUM (Tính tổng)</option>
              <option value="COUNT">COUNT (Đếm số lượng)</option>
              <option value="AVERAGE">AVERAGE (Tính trung bình)</option>
            </select>
          </div>
        </div>

        <div style={{ padding: '1rem 1.25rem', borderTop: '1px solid var(--do-color-border)', display: 'flex', justifyContent: 'flex-end', gap: '0.5rem' }}>
          <button className="do-btn" onClick={onClose} style={{ borderRadius: '8px' }}>
            {isVi ? 'Hủy' : 'Cancel'}
          </button>
          <button className="do-btn" onClick={handleApply} style={{ borderRadius: '8px', backgroundColor: 'var(--do-color-primary)', color: '#fff' }}>
            {isVi ? 'Tạo Pivot Table' : 'Create Pivot Table'}
          </button>
        </div>
      </div>
    </div>
  );
}
