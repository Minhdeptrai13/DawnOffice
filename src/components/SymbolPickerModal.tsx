import { useState } from 'react';
import { X, Sigma, Plus } from 'lucide-react';

interface SymbolPickerModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectSymbol: (symbol: string) => void;
}

const COMMON_SYMBOLS = [
  'α', 'β', 'γ', 'δ', 'ε', 'θ', 'λ', 'μ', 'π', 'σ', 'ω',
  'Δ', 'Ω', '∑', '∏', '∫', '√', '∞', '≈', '≠', '≤', '≥',
  '±', '×', '÷', '°', '‰', '€', '£', '¥', '¢', '©', '®',
  '™', '←', '→', '↑', '↓', '↔', '⇒', '⇔', '∀', '∃', '∈'
];

export default function SymbolPickerModal({ isOpen, onClose, onSelectSymbol }: SymbolPickerModalProps) {
  const [customMath, setCustomMath] = useState('');

  if (!isOpen) return null;

  const handleInsertMath = () => {
    if (customMath.trim()) {
      onSelectSymbol(`$${customMath.trim()}$`);
      setCustomMath('');
      onClose();
    }
  };

  return (
    <div
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'rgba(0, 0, 0, 0.4)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 1000,
      }}
      onClick={onClose}
    >
      <div
        style={{
          width: '420px',
          backgroundColor: 'var(--do-color-surface)',
          borderRadius: '8px',
          boxShadow: '0 8px 30px rgba(0,0,0,0.18)',
          border: '1px solid var(--do-color-border)',
          overflow: 'hidden',
          display: 'flex',
          flexDirection: 'column',
        }}
        onClick={e => e.stopPropagation()}
      >
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '12px 16px',
            borderBottom: '1px solid var(--do-color-border)',
            backgroundColor: 'var(--do-color-bg)',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontWeight: 600, fontSize: '14px' }}>
            <Sigma size={18} color="var(--do-color-accent)" />
            <span>Ký tự Đặc biệt & Công thức Toán</span>
          </div>
          <button
            onClick={onClose}
            style={{
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              color: 'var(--do-color-text-muted)',
              display: 'flex',
              alignItems: 'center',
            }}
          >
            <X size={16} />
          </button>
        </div>

        <div style={{ padding: '16px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div>
            <div style={{ fontSize: '12px', fontWeight: 600, color: 'var(--do-color-text-muted)', marginBottom: '8px' }}>
              KÝ TỰ ĐẶC BIỆT THƯỜNG DÙNG
            </div>
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(9, 1fr)',
                gap: '4px',
                maxHeight: '140px',
                overflowY: 'auto',
                padding: '4px',
                border: '1px solid var(--do-color-border)',
                borderRadius: '4px',
              }}
            >
              {COMMON_SYMBOLS.map(sym => (
                <button
                  key={sym}
                  onClick={() => {
                    onSelectSymbol(sym);
                    onClose();
                  }}
                  style={{
                    padding: '6px',
                    fontSize: '14px',
                    borderRadius: '4px',
                    border: '1px solid transparent',
                    backgroundColor: 'var(--do-color-bg)',
                    cursor: 'pointer',
                    color: 'var(--do-color-text)',
                  }}
                  onMouseEnter={e => e.currentTarget.style.backgroundColor = 'var(--do-color-border)'}
                  onMouseLeave={e => e.currentTarget.style.backgroundColor = 'var(--do-color-bg)'}
                >
                  {sym}
                </button>
              ))}
            </div>
          </div>

          <div>
            <div style={{ fontSize: '12px', fontWeight: 600, color: 'var(--do-color-text-muted)', marginBottom: '8px' }}>
              CÔNG THỨC TOÁN HỌC (LaTeX Math)
            </div>
            <div style={{ display: 'flex', gap: '6px' }}>
              <input
                type="text"
                value={customMath}
                onChange={e => setCustomMath(e.target.value)}
                placeholder="Ví dụ: E = mc^2 hoặc \int_{0}^{\infty}"
                style={{
                  flex: 1,
                  padding: '6px 10px',
                  borderRadius: '4px',
                  border: '1px solid var(--do-color-border)',
                  outline: 'none',
                  fontSize: '12px',
                }}
                onKeyDown={e => e.key === 'Enter' && handleInsertMath()}
              />
              <button
                onClick={handleInsertMath}
                style={{
                  padding: '6px 12px',
                  borderRadius: '4px',
                  backgroundColor: 'var(--do-color-accent)',
                  color: '#fff',
                  border: 'none',
                  cursor: 'pointer',
                  fontSize: '12px',
                  fontWeight: 500,
                  display: 'flex',
                  alignItems: 'center',
                  gap: '4px',
                }}
              >
                <Plus size={14} /> Chèn
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
