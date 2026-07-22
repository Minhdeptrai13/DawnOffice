import { Node, mergeAttributes } from '@tiptap/core';

declare module '@tiptap/core' {
  interface Commands<ReturnType> {
    pageBreak: {
      insertPageBreak: () => ReturnType;
    };
  }
}

/**
 * PageBreak extension — inserts a visible page-break marker (Ctrl+Enter).
 * CSS in DawnDocument gives it the Word-style "--- Page Break ---" look.
 */
export const PageBreak = Node.create({
  name: 'pageBreak',
  group: 'block',
  atom: true,             // treated as a single unit, cannot enter it

  parseHTML() {
    return [{ tag: 'div[data-page-break]' }];
  },

  renderHTML({ HTMLAttributes }) {
    return ['div', mergeAttributes(HTMLAttributes, { 'data-page-break': 'true', class: 'dawn-page-break' })];
  },

  addCommands() {
    return {
      insertPageBreak:
        () =>
        ({ chain }) => {
          return chain()
            .insertContent({ type: this.name })
            .run();
        },
    };
  },

  addKeyboardShortcuts() {
    return {
      // Ctrl+Enter = insert page break (same as Word)
      'Mod-Enter': () => this.editor.commands.insertPageBreak(),
    };
  },
});
