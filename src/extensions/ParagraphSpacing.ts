import { Extension } from '@tiptap/core';

declare module '@tiptap/core' {
  interface Commands<ReturnType> {
    paragraphSpacing: {
      setMarginBefore: (margin: string) => ReturnType;
      setMarginAfter: (margin: string) => ReturnType;
    };
  }
}

export const ParagraphSpacing = Extension.create({
  name: 'paragraphSpacing',

  addGlobalAttributes() {
    return [
      {
        types: ['paragraph', 'heading'],
        attributes: {
          marginTop: {
            default: null,
            parseHTML: element => element.style.marginTop || null,
            renderHTML: attributes => {
              if (!attributes.marginTop) return {};
              return { style: `margin-top: ${attributes.marginTop}` };
            },
          },
          marginBottom: {
            default: null,
            parseHTML: element => element.style.marginBottom || null,
            renderHTML: attributes => {
              if (!attributes.marginBottom) return {};
              return { style: `margin-bottom: ${attributes.marginBottom}` };
            },
          },
        },
      },
    ];
  },

  addCommands() {
    return {
      setMarginBefore:
        (margin: string) =>
        ({ commands }) => {
          return commands.updateAttributes('paragraph', { marginTop: margin }) ||
                 commands.updateAttributes('heading', { marginTop: margin });
        },
      setMarginAfter:
        (margin: string) =>
        ({ commands }) => {
          return commands.updateAttributes('paragraph', { marginBottom: margin }) ||
                 commands.updateAttributes('heading', { marginBottom: margin });
        },
    };
  },
});
