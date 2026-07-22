import { useState } from 'react';
import { DataValidation } from '../../types/sheets';
import { X } from 'lucide-react';

interface DataValidationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onApply: (validation: DataValidation) => void;
  lang?: 'vi' | 'en';
}

export default function DataValidationModal({
  isOpen,
  onClose,
  onApply,
  lang = 'vi',
}: DataValidationModalProps) {
  const isVi = lang === 'vi';

  const [type, setType] = useState<'list' | 'number' | 'textLength'>('list');
  const [listValuesStr, setListValuesStr] = useState(isVi ? 'Đang duyệt, Hoàn thành, Hủy bỏ' : 'Active, Pending, Completed');
  const [min, setMin] = useState('0');
  const [max, setMax] = useState('100');

  if (!isOpen) return null;

  const handleApply = () => {
    const values = listValuesStr.split(',').map(s => s.trim()).filter(Boolean);

    onApply({
      type,
      values: type === 'list' ? values : undefined,
      min: type !== 'list' ? parseFloat(min) : undefined,
      max: type !== 'list' ? parseFloat(max) : undefined,
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
          width: '520px',
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
            ✅ {isVi ? 'Xác Thực Dữ Liệu & Danh Sách Xổ Xuống (Data Validation)' : 'Data Validation & Dropdown List'}
          </h3>
          <button className="do-btn-icon" onClick={onClose} style={{ borderRadius: '8px' }}>
            <X size={18} />
          </button>
        </div>

        <div style={{ padding: '1.25rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <div>
            <label style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--do-color-text-muted)' }}>
              {isVi ? 'Loại xác thực:' : 'Validation Criteria:'}
            </label>
            <select
              value={type}
              onChange={e => setType(e.target.value as any)}
              style={{ width: '100%', padding: '6px 10px', borderRadius: '6px', border: '1px solid var(--do-color-border)', fontSize: '0.9rem', marginTop: '4px' }}
            >
              <option value="list">{isVi ? 'Danh sách lựa chọn xổ xuống (Dropdown List)' : 'Dropdown List'}</option>
              <option value="number">{isVi ? 'Số nguyên trong khoảng (Number Range)' : 'Number Range'}</option>
              <option value="textLength">{isVi ? 'Độ dài văn bản (Text Length)' : 'Text Length'}</option>
            </select>
          </div>

          {type === 'list' ? (
            <div>
              <label style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--do-color-text-muted)' }}>
                {isVi ? 'Các lựa chọn (phân cách bởi dấu phẩy):' : 'List Items (comma separated):'}
              </label>
              <textarea
                value={listValuesStr}
                onChange={e => setListValuesStr(e.target.value)}
                rows={3}
                style={{ width: '100%', padding: '6px 10px', borderRadius: '6px', border: '1px solid var(--do-color-border)', fontSize: '0.9rem', marginTop: '4px' }}
              />
            </div>
          ) : (
            <div style={{ display: 'flex', gap: '1rem' }}>
              <div style={{ flex: 1 }}>
                <label style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--do-color-text-muted)' }}>
                  {isVi ? 'Tối thiểu (Min):' : 'Minimum:'}
                </label>
                <input
                  type="number"
                  value={min}
                  onChange={e => setMin(e.target.value)}
                  style={{ width: '100%', padding: '6px 10px', borderRadius: '6px', border: '1px solid var(--do-color-border)', fontSize: '0.9rem', marginTop: '4px' }}
                />
              </div>

              <div style={{ flex: 1 }}>
                <label style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--do-color-text-muted)' }}>
                  {isVi ? 'Tối đa (Max):' : 'Maximum:'}
                </label>
                <input
                  type="number"
                  value={max}
                  onChange={e => setMax(e.target.value)}
                  style={{ width: '100%', padding: '6px 10px', borderRadius: '6px', border: '1px solid var(--do-color-border)', fontSize: '0.9rem', marginTop: '4px' }}
                />
              </div>
            </div>
          )}
        </div>

        <div style={{ padding: '1rem 1.25rem', borderTop: '1px solid var(--do-color-border)', display: 'flex', justifyContent: 'flex-end', gap: '0.5rem' }}>
          <button className="do-btn" onClick={onClose} style={{ borderRadius: '8px' }}>
            {isVi ? 'Hủy' : 'Cancel'}
          </button>
          <button className="do-btn" onClick={handleApply} style={{ borderRadius: '8px', backgroundColor: 'var(--do-color-primary)', color: '#fff' }}>
            {isVi ? 'Tạo Dropdown List' : 'Apply Validation'}
          </button>
        </div>
      </div>
    </div>
  );
}
