import { Editor } from '@tiptap/react';

export interface WordStyle {
  id: string;
  name: string;
  type: 'paragraph' | 'heading' | 'blockquote' | 'codeBlock';
  headingLevel?: 1 | 2 | 3 | 4 | 5 | 6;
  /** Inline styles used ONLY for Style Gallery preview cards */
  previewStyle: {
    fontSize?: string;
    color?: string;
    lineHeight?: string | number;
    fontFamily?: string;
    fontWeight?: string;
    fontStyle?: string;
    textDecoration?: string;
  };
  attributes: {
    fontFamily?: string;
    fontSize?: string;
    color?: string;
    lineHeight?: string;
    textAlign?: string;
  };
  marks: {
    bold?: boolean;
    italic?: boolean;
    underline?: boolean;
    strike?: boolean;
  };
}

export const wordStyles: WordStyle[] = [
  {
    id: 'normal', name: 'Normal', type: 'paragraph',
    previewStyle: { fontSize: '13px', color: '#000', lineHeight: 1.5, fontFamily: 'Arial' },
    attributes: { fontSize: '11pt', color: '#000000', lineHeight: '1.5', fontFamily: 'Arial' },
    marks: {},
  },
  {
    id: 'no-spacing', name: 'No Spacing', type: 'paragraph',
    previewStyle: { fontSize: '13px', color: '#000', lineHeight: 1, fontFamily: 'Arial' },
    attributes: { fontSize: '11pt', color: '#000000', lineHeight: '1', fontFamily: 'Arial' },
    marks: {},
  },
  {
    id: 'heading-1', name: 'Heading 1', type: 'heading', headingLevel: 1,
    previewStyle: { fontSize: '18px', color: '#2F5496', fontWeight: 'bold', fontFamily: 'Arial' },
    attributes: { fontSize: '16pt', color: '#2F5496', fontFamily: 'Arial' },
    marks: {},
  },
  {
    id: 'heading-2', name: 'Heading 2', type: 'heading', headingLevel: 2,
    previewStyle: { fontSize: '15px', color: '#2F5496', fontWeight: 'bold', fontFamily: 'Arial' },
    attributes: { fontSize: '13pt', color: '#2F5496', fontFamily: 'Arial' },
    marks: {},
  },
  {
    id: 'heading-3', name: 'Heading 3', type: 'heading', headingLevel: 3,
    previewStyle: { fontSize: '13px', color: '#1F3763', fontWeight: 'bold', fontFamily: 'Arial' },
    attributes: { fontSize: '12pt', color: '#1F3763', fontFamily: 'Arial' },
    marks: {},
  },
  {
    id: 'heading-4', name: 'Heading 4', type: 'heading', headingLevel: 4,
    previewStyle: { fontSize: '13px', color: '#2F5496', fontWeight: 'bold', fontStyle: 'italic', fontFamily: 'Arial' },
    attributes: { fontSize: '11pt', color: '#2F5496', fontFamily: 'Arial' },
    marks: { italic: true },
  },
  {
    id: 'heading-5', name: 'Heading 5', type: 'heading', headingLevel: 5,
    previewStyle: { fontSize: '12px', color: '#2F5496', fontFamily: 'Arial' },
    attributes: { fontSize: '11pt', color: '#2F5496', fontFamily: 'Arial' },
    marks: {},
  },
  {
    id: 'heading-6', name: 'Heading 6', type: 'heading', headingLevel: 6,
    previewStyle: { fontSize: '12px', color: '#1F3763', fontStyle: 'italic', fontFamily: 'Arial' },
    attributes: { fontSize: '11pt', color: '#1F3763', fontFamily: 'Arial' },
    marks: { italic: true },
  },
  {
    id: 'title', name: 'Title', type: 'heading', headingLevel: 1,
    previewStyle: { fontSize: '20px', color: '#000', fontFamily: 'Arial' },
    attributes: { fontSize: '28pt', color: '#000000', fontFamily: 'Arial', textAlign: 'center' },
    marks: {},
  },
  {
    id: 'subtitle', name: 'Subtitle', type: 'heading', headingLevel: 2,
    previewStyle: { fontSize: '13px', color: '#595959', fontFamily: 'Arial' },
    attributes: { fontSize: '11pt', color: '#595959', fontFamily: 'Arial', textAlign: 'center' },
    marks: {},
  },
  {
    id: 'subtle-emphasis', name: 'Subtle Emphasis', type: 'paragraph',
    previewStyle: { fontSize: '13px', color: '#595959', fontStyle: 'italic', fontFamily: 'Arial' },
    attributes: { fontSize: '11pt', color: '#595959', fontFamily: 'Arial' },
    marks: { italic: true },
  },
  {
    id: 'emphasis', name: 'Emphasis', type: 'paragraph',
    previewStyle: { fontSize: '13px', color: '#000', fontStyle: 'italic', fontFamily: 'Arial' },
    attributes: { fontSize: '11pt', color: '#000000', fontFamily: 'Arial' },
    marks: { italic: true },
  },
  {
    id: 'intense-emphasis', name: 'Intense Emphasis', type: 'paragraph',
    previewStyle: { fontSize: '13px', color: '#4472C4', fontStyle: 'italic', fontWeight: 'bold', fontFamily: 'Arial' },
    attributes: { fontSize: '11pt', color: '#4472C4', fontFamily: 'Arial' },
    marks: { italic: true, bold: true },
  },
  {
    id: 'strong', name: 'Strong', type: 'paragraph',
    previewStyle: { fontSize: '13px', color: '#000', fontWeight: 'bold', fontFamily: 'Arial' },
    attributes: { fontSize: '11pt', color: '#000000', fontFamily: 'Arial' },
    marks: { bold: true },
  },
  {
    id: 'quote', name: 'Quote', type: 'blockquote',
    previewStyle: { fontSize: '12px', color: '#595959', fontStyle: 'italic', fontFamily: 'Arial' },
    attributes: { fontSize: '11pt', color: '#595959', fontFamily: 'Arial' },
    marks: { italic: true },
  },
  {
    id: 'intense-quote', name: 'Intense Quote', type: 'blockquote',
    previewStyle: { fontSize: '12px', color: '#4472C4', fontStyle: 'italic', fontWeight: 'bold', fontFamily: 'Arial' },
    attributes: { fontSize: '11pt', color: '#4472C4', fontFamily: 'Arial' },
    marks: { italic: true, bold: true },
  },
  {
    id: 'code', name: 'Code', type: 'codeBlock',
    previewStyle: { fontSize: '11px', color: '#333', fontFamily: 'monospace' },
    attributes: { fontSize: '10pt', color: '#333333', fontFamily: 'monospace' },
    marks: {},
  },
];

export function applyWordStyle(editor: Editor, styleId: string) {
  const style = wordStyles.find(s => s.id === styleId);
  if (!style) return;

  const chain = editor.chain().focus();

  // 1. Clear all inline marks first
  chain.unsetAllMarks();

  // 2. Set block node type
  if (style.type === 'paragraph') {
    chain.setParagraph();
  } else if (style.type === 'heading') {
    chain.setHeading({ level: style.headingLevel! });
  } else if (style.type === 'blockquote') {
    // Wrap in blockquote
    chain.setBlockquote();
  } else if (style.type === 'codeBlock') {
    chain.setCodeBlock();
  }

  // 3. Apply text-level marks
  if (style.marks.bold) chain.setBold();
  if (style.marks.italic) chain.setItalic();
  if (style.marks.underline) chain.setUnderline();
  if (style.marks.strike) chain.setStrike();

  // 4. Apply TextStyle attributes (color, fontSize, fontFamily)
  if (style.attributes.color) chain.setColor(style.attributes.color);
  if (style.attributes.fontSize) chain.setFontSize(style.attributes.fontSize);
  if (style.attributes.fontFamily) chain.setFontFamily(style.attributes.fontFamily);

  // 5. Node-level attributes
  if (style.attributes.textAlign) {
    chain.setTextAlign(style.attributes.textAlign);
  } else {
    chain.setTextAlign('left');
  }
  if (style.attributes.lineHeight) {
    chain.setLineHeight(style.attributes.lineHeight);
  } else {
    chain.unsetLineHeight();
  }

  chain.run();
}
