import { Extension } from '@tiptap/core';

declare module '@tiptap/core' {
  interface Commands<ReturnType> {
    indent: {
      indent: () => ReturnType;
      outdent: () => ReturnType;
    };
  }
}

export const Indent = Extension.create({
  name: 'indent',

  addGlobalAttributes() {
    return [
      {
        types: ['paragraph', 'heading', 'blockquote'],
        attributes: {
          indent: {
            default: 0,
            parseHTML: element => {
              const paddingLeft = element.style.paddingLeft;
              if (paddingLeft) {
                return parseInt(paddingLeft, 10) / 20 || 0; // Giả sử mỗi cấp = 20px
              }
              return 0;
            },
            renderHTML: attributes => {
              if (!attributes.indent) {
                return {};
              }
              return {
                style: `padding-left: ${attributes.indent * 20}px`,
              };
            },
          },
        },
      },
    ];
  },

  addCommands() {
    return {
      indent: () => ({ tr, state, dispatch }) => {
        const { selection } = state;
        tr.doc.nodesBetween(selection.from, selection.to, (node, pos) => {
          if (['paragraph', 'heading', 'blockquote'].includes(node.type.name)) {
            const indent = (node.attrs.indent || 0) + 1;
            if (indent <= 8) { // Max indent
              tr.setNodeMarkup(pos, undefined, { ...node.attrs, indent });
            }
          }
        });
        if (dispatch) dispatch(tr);
        return true;
      },
      outdent: () => ({ tr, state, dispatch }) => {
        const { selection } = state;
        tr.doc.nodesBetween(selection.from, selection.to, (node, pos) => {
          if (['paragraph', 'heading', 'blockquote'].includes(node.type.name)) {
            const indent = (node.attrs.indent || 0) - 1;
            if (indent >= 0) {
              tr.setNodeMarkup(pos, undefined, { ...node.attrs, indent });
            }
          }
        });
        if (dispatch) dispatch(tr);
        return true;
      },
    };
  },
  
  addKeyboardShortcuts() {
    return {
      Tab: () => this.editor.commands.indent(),
      'Shift-Tab': () => this.editor.commands.outdent(),
    }
  }
});
