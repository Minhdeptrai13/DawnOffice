import { useState } from 'react';
import { ChevronUp, ChevronDown, MessageSquare } from 'lucide-react';

interface SpeakerNotesProps {
  notes: string;
  onUpdateNotes: (notes: string) => void;
  lang: 'vi' | 'en';
}

export default function SpeakerNotes({ notes, onUpdateNotes, lang }: SpeakerNotesProps) {
  const [isOpen, setIsOpen] = useState(false);

  const isVi = lang === 'vi';

  return (
    <div
      style={{
        backgroundColor: 'var(--do-color-surface)',
        borderTop: '1px solid var(--do-color-border)',
        display: 'flex',
        flexDirection: 'column',
        userSelect: 'none',
      }}
    >
      {/* Header bar */}
      <div
        onClick={() => setIsOpen(!isOpen)}
        style={{
          height: '28px',
          padding: '0 1rem',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          cursor: 'pointer',
          fontSize: '12px',
          color: 'var(--do-color-text-muted)',
          fontWeight: 600,
        }}
      >
        <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          <MessageSquare size={14} />
          {isVi ? 'Ghi chú người thuyết trình (Speaker Notes)' : 'Speaker Notes'}
        </span>
        {isOpen ? <ChevronDown size={14} /> : <ChevronUp size={14} />}
      </div>

      {/* Expanded Textarea */}
      {isOpen && (
        <div style={{ padding: '8px 1rem' }}>
          <textarea
            value={notes}
            onChange={e => onUpdateNotes(e.target.value)}
            placeholder={isVi ? 'Nhập ghi chú cho slide này...' : 'Click to add speaker notes for this slide...'}
            style={{
              width: '100%',
              height: '80px',
              backgroundColor: 'var(--do-color-bg)',
              color: 'var(--do-color-text)',
              border: '1px solid var(--do-color-border)',
              borderRadius: '6px',
              padding: '8px',
              fontSize: '13px',
              fontFamily: 'inherit',
              resize: 'none',
              outline: 'none',
            }}
          />
        </div>
      )}
    </div>
  );
}
