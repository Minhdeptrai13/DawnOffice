import { useState } from 'react';
import { ConditionalFormatRule } from '../../types/sheets';
import { X } from 'lucide-react';

interface ConditionalFormatModalProps {
  isOpen: boolean;
  onClose: () => void;
  onApply: (rule: ConditionalFormatRule) => void;
  lang?: 'vi' | 'en';
}

export default function ConditionalFormatModal({
  isOpen,
  onClose,
  onApply,
  lang = 'vi',
}: ConditionalFormatModalProps) {
  const isVi = lang === 'vi';

  const [rangeStr, setRangeStr] = useState('A1:A20');
  const [type, setType] = useState<'greaterThan' | 'lessThan' | 'contains' | 'dataBar' | 'colorScale'>('greaterThan');
  const [value, setValue] = useState('100');
  const [color, setColor] = useState('#dcfce7');

  if (!isOpen) return null;

  const handleApply = () => {
    onApply({
      id: `rule-${Date.now()}`,
      rangeStr,
      type,
      value,
      color,
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
            🎨 {isVi ? 'Định Dạng Có Điều Kiện (Conditional Formatting)' : 'Conditional Formatting Rules'}
          </h3>
          <button className="do-btn-icon" onClick={onClose} style={{ borderRadius: '8px' }}>
            <X size={18} />
          </button>
        </div>

        <div style={{ padding: '1.25rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <div>
            <label style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--do-color-text-muted)' }}>
              {isVi ? 'Dải ô áp dụng:' : 'Apply to Range:'}
            </label>
            <input
              type="text"
              value={rangeStr}
              onChange={e => setRangeStr(e.target.value)}
              placeholder="A1:A20"
              style={{ width: '100%', padding: '6px 10px', borderRadius: '6px', border: '1px solid var(--do-color-border)', fontSize: '0.9rem', marginTop: '4px' }}
            />
          </div>

          <div>
            <label style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--do-color-text-muted)' }}>
              {isVi ? 'Quy tắc định dạng:' : 'Rule Type:'}
            </label>
            <select
              value={type}
              onChange={e => setType(e.target.value as any)}
              style={{ width: '100%', padding: '6px 10px', borderRadius: '6px', border: '1px solid var(--do-color-border)', fontSize: '0.9rem', marginTop: '4px' }}
            >
              <option value="greaterThan">{isVi ? 'Giá trị lớn hơn (Greater than)' : 'Greater Than'}</option>
              <option value="lessThan">{isVi ? 'Giá trị nhỏ hơn (Less than)' : 'Less Than'}</option>
              <option value="contains">{isVi ? 'Chứa chuỗi văn bản (Contains text)' : 'Contains Text'}</option>
              <option value="dataBar">{isVi ? 'Thanh dung lượng (Data Bars)' : 'Data Bars'}</option>
              <option value="colorScale">{isVi ? 'Bản đồ nhiệt màu (Color Scale)' : 'Color Scale'}</option>
            </select>
          </div>

          {(type === 'greaterThan' || type === 'lessThan' || type === 'contains') && (
            <div>
              <label style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--do-color-text-muted)' }}>
                {isVi ? 'Giá trị so sánh:' : 'Comparison Value:'}
              </label>
              <input
                type="text"
                value={value}
                onChange={e => setValue(e.target.value)}
                style={{ width: '100%', padding: '6px 10px', borderRadius: '6px', border: '1px solid var(--do-color-border)', fontSize: '0.9rem', marginTop: '4px' }}
              />
            </div>
          )}

          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <label style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--do-color-text-muted)' }}>
              {isVi ? 'Màu Highlight ô:' : 'Highlight Background Color:'}
            </label>
            <input
              type="color"
              value={color}
              onChange={e => setColor(e.target.value)}
              style={{ width: '40px', height: '34px', border: 'none', borderRadius: '6px', cursor: 'pointer' }}
            />
          </div>
        </div>

        <div style={{ padding: '1rem 1.25rem', borderTop: '1px solid var(--do-color-border)', display: 'flex', justifyContent: 'flex-end', gap: '0.5rem' }}>
          <button className="do-btn" onClick={onClose} style={{ borderRadius: '8px' }}>
            {isVi ? 'Hủy' : 'Cancel'}
          </button>
          <button className="do-btn" onClick={handleApply} style={{ borderRadius: '8px', backgroundColor: 'var(--do-color-primary)', color: '#fff' }}>
            {isVi ? 'Áp dụng quy tắc' : 'Apply Rule'}
          </button>
        </div>
      </div>
    </div>
  );
}
