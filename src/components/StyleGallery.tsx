import { Editor } from '@tiptap/react';
import { wordStyles, applyWordStyle } from '../utils/wordStyles';

export default function StyleGallery({ editor }: { editor: Editor | null }) {
  if (!editor) return null;

  return (
    <div
      style={{
        display: 'flex',
        flexWrap: 'wrap',         /* wrap all styles, no horizontal scroll */
        gap: '3px',
        alignItems: 'flex-start',
      }}
    >
      {wordStyles.map(style => (
        <button
          key={style.id}
          onClick={() => applyWordStyle(editor, style.id)}
          className="style-gallery-item"
          title={`Apply "${style.name}"`}
          style={{
            flex: '0 0 auto',
            width: '70px',
            height: '52px',
            border: '1px solid var(--do-color-border)',
            backgroundColor: 'var(--do-color-bg)',
            borderRadius: '4px',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: 'pointer',
            padding: '3px 2px',
            gap: '2px',
          }}
        >
          {/* Preview text in the style's own font/color */}
          <div
            style={{
              ...style.previewStyle,
              fontSize: '13px',   /* fixed size so card height stays consistent */
              lineHeight: 1.1,
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              whiteSpace: 'nowrap',
              width: '100%',
              textAlign: 'center',
            }}
          >
            AaBb
          </div>
          {/* Style name label */}
          <div
            style={{
              fontSize: '9px',
              color: 'var(--do-color-text-muted)',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              whiteSpace: 'nowrap',
              width: '100%',
              textAlign: 'center',
              lineHeight: 1.2,
            }}
          >
            {style.name}
          </div>
        </button>
      ))}
    </div>
  );
}
