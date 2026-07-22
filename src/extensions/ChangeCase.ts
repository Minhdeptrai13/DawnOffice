import { Extension } from '@tiptap/core';

export type CaseType = 'uppercase' | 'lowercase' | 'titlecase' | 'sentencecase' | 'togglecase';

declare module '@tiptap/core' {
  interface Commands<ReturnType> {
    changeCase: {
      changeCase: (type: CaseType) => ReturnType;
    };
  }
}

export const ChangeCase = Extension.create({
  name: 'changeCase',

  addCommands() {
    return {
      changeCase:
        (type: CaseType) =>
        ({ tr, dispatch, state }) => {
          const { selection } = state;
          if (selection.empty) return false;

          if (dispatch) {
            const text = state.doc.textBetween(selection.from, selection.to);
            let transformed = text;

            switch (type) {
              case 'uppercase':
                transformed = text.toUpperCase();
                break;
              case 'lowercase':
                transformed = text.toLowerCase();
                break;
              case 'titlecase':
                transformed = text.replace(
                  /\w\S*/g,
                  txt => txt.charAt(0).toUpperCase() + txt.slice(1).toLowerCase()
                );
                break;
              case 'sentencecase':
                transformed = text.toLowerCase().replace(/(^\s*\w|[.!?]\s*\w)/g, c => c.toUpperCase());
                break;
              case 'togglecase':
                transformed = text
                  .split('')
                  .map(c => (c === c.toUpperCase() ? c.toLowerCase() : c.toUpperCase()))
                  .join('');
                break;
            }

            tr.insertText(transformed, selection.from, selection.to);
          }

          return true;
        },
    };
  },
});
