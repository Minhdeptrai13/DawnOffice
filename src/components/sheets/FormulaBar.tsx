import { useState, KeyboardEvent } from 'react';
import { FunctionSquare, Check, X, Sparkles } from 'lucide-react';
import { getFormulaSuggestions, FunctionInfo } from '../../utils/sheetFormula';

interface FormulaBarProps {
  activeCellAddr: string;
  value: string;
  onChange: (val: string) => void;
  onCommit: () => void;
  onCancel: () => void;
  lang?: 'vi' | 'en';
}

export default function FormulaBar({
  activeCellAddr,
  value,
  onChange,
  onCommit,
  onCancel,
  lang = 'vi',
}: FormulaBarProps) {
  const isVi = lang === 'vi';
  const [showSuggestions, setShowSuggestions] = useState(false);

  const suggestions: FunctionInfo[] = value.startsWith('=') ? getFormulaSuggestions(value) : [];

  const handleKeyDown = (e: KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      setShowSuggestions(false);
      onCommit();
    } else if (e.key === 'Escape') {
      e.preventDefault();
      setShowSuggestions(false);
      onCancel();
    }
  };

  const handleSelectSuggestion = (fn: FunctionInfo) => {
    onChange(`=${fn.name}(`);
    setShowSuggestions(false);
  };

  return (
    <div
      style={{
        height: '34px',
        backgroundColor: 'var(--do-color-surface)',
        borderBottom: '1px solid var(--do-color-border)',
        display: 'flex',
        alignItems: 'center',
        padding: '0 0.75rem',
        gap: '8px',
        fontSize: '13px',
        position: 'relative',
      }}
    >
      {/* Active Cell Address Indicator */}
      <div
        style={{
          width: '64px',
          height: '24px',
          backgroundColor: 'var(--do-color-bg)',
          border: '1px solid var(--do-color-border)',
          borderRadius: '4px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontWeight: 600,
          color: 'var(--do-color-primary)',
          fontSize: '12px',
          userSelect: 'none',
        }}
      >
        {activeCellAddr || 'A1'}
      </div>

      <div style={{ width: '1px', height: '18px', backgroundColor: 'var(--do-color-border)' }} />

      {/* Action Buttons: Cancel, Commit, FX */}
      <button
        className="do-btn-icon"
        onClick={onCancel}
        style={{ width: '22px', height: '22px', borderRadius: '4px', color: '#ef4444' }}
        title={isVi ? 'Hủy bỏ (Esc)' : 'Cancel (Esc)'}
      >
        <X size={14} />
      </button>

      <button
        className="do-btn-icon"
        onClick={onCommit}
        style={{ width: '22px', height: '22px', borderRadius: '4px', color: '#10b981' }}
        title={isVi ? 'Xác nhận (Enter)' : 'Confirm (Enter)'}
      >
        <Check size={14} />
      </button>

      <div style={{ display: 'flex', alignItems: 'center', gap: '4px', color: 'var(--do-color-text-muted)', fontWeight: 600 }}>
        <FunctionSquare size={16} />
        <span style={{ fontSize: '12px' }}>fx</span>
      </div>

      <div style={{ width: '1px', height: '18px', backgroundColor: 'var(--do-color-border)' }} />

      {/* Formula Input */}
      <div style={{ flex: 1, position: 'relative' }}>
        <input
          type="text"
          value={value}
          onChange={e => {
            onChange(e.target.value);
            setShowSuggestions(e.target.value.startsWith('='));
          }}
          onFocus={() => setShowSuggestions(value.startsWith('='))}
          onKeyDown={handleKeyDown}
          placeholder={isVi ? 'Nhập giá trị hoặc công thức (ví dụ: =SUM(A1:A10)...)' : 'Enter value or formula (e.g. =SUM(A1:A10)...)'}
          style={{
            width: '100%',
            height: '24px',
            border: 'none',
            outline: 'none',
            backgroundColor: 'transparent',
            fontSize: '13px',
            fontFamily: 'var(--do-font-sans)',
            color: 'var(--do-color-text)',
          }}
        />

        {/* Autocomplete Popup List */}
        {showSuggestions && suggestions.length > 0 && (
          <div
            style={{
              position: 'absolute',
              top: '30px',
              left: 0,
              width: '320px',
              backgroundColor: 'var(--do-color-surface)',
              border: '1px solid var(--do-color-border)',
              borderRadius: '8px',
              boxShadow: 'var(--do-shadow-lg)',
              zIndex: 9999,
              maxHeight: '220px',
              overflowY: 'auto',
              padding: '4px',
            }}
          >
            {suggestions.map(fn => (
              <div
                key={fn.name}
                onClick={() => handleSelectSuggestion(fn)}
                style={{
                  padding: '6px 10px',
                  borderRadius: '6px',
                  cursor: 'pointer',
                  fontSize: '12px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  backgroundColor: 'transparent',
                }}
                onMouseEnter={e => (e.currentTarget.style.backgroundColor = 'var(--do-color-surface-hover)')}
                onMouseLeave={e => (e.currentTarget.style.backgroundColor = 'transparent')}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <Sparkles size={12} color="var(--do-color-primary)" />
                  <strong style={{ color: 'var(--do-color-primary)' }}>{fn.name}</strong>
                  <span style={{ color: 'var(--do-color-text-muted)', fontSize: '11px' }}>{fn.syntax}</span>
                </div>
                <span style={{ fontSize: '10px', color: 'var(--do-color-text-muted)' }}>{fn.category}</span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
