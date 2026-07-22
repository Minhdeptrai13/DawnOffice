import { Extension } from '@tiptap/core';
import { Plugin, PluginKey } from '@tiptap/pm/state';
import { Decoration, DecorationSet } from '@tiptap/pm/view';

declare module '@tiptap/core' {
  interface Commands<ReturnType> {
    searchAndReplace: {
      setSearchTerm: (searchTerm: string) => ReturnType;
      setReplaceTerm: (replaceTerm: string) => ReturnType;
      nextSearchResult: () => ReturnType;
      previousSearchResult: () => ReturnType;
      replace: () => ReturnType;
      replaceAll: () => ReturnType;
    };
  }
}

export interface SearchAndReplaceOptions {
  searchResultClass: string;
  searchResultCurrentClass: string;
}

export const SearchAndReplace = Extension.create<SearchAndReplaceOptions>({
  name: 'searchAndReplace',

  addOptions() {
    return {
      searchResultClass: 'search-result',
      searchResultCurrentClass: 'search-result-current',
    };
  },

  addStorage() {
    return {
      searchTerm: '',
      replaceTerm: '',
      results: [] as { from: number; to: number }[],
      currentIndex: -1,
    };
  },

  addCommands() {
    return {
      setSearchTerm:
        (searchTerm: string) =>
        ({ editor, dispatch }) => {
          this.storage.searchTerm = searchTerm;
          if (dispatch) {
            editor.view.dispatch(editor.state.tr);
          }
          return true;
        },

      setReplaceTerm:
        (replaceTerm: string) =>
        ({ dispatch }) => {
          this.storage.replaceTerm = replaceTerm;
          return true;
        },

      nextSearchResult:
        () =>
        ({ editor, dispatch }) => {
          const { results, currentIndex } = this.storage;
          if (results.length === 0) return false;
          this.storage.currentIndex = (currentIndex + 1) % results.length;
          if (dispatch) {
            const target = results[this.storage.currentIndex];
            editor.commands.setTextSelection({ from: target.from, to: target.to });
            editor.commands.scrollIntoView();
          }
          return true;
        },

      previousSearchResult:
        () =>
        ({ editor, dispatch }) => {
          const { results, currentIndex } = this.storage;
          if (results.length === 0) return false;
          this.storage.currentIndex = (currentIndex - 1 + results.length) % results.length;
          if (dispatch) {
            const target = results[this.storage.currentIndex];
            editor.commands.setTextSelection({ from: target.from, to: target.to });
            editor.commands.scrollIntoView();
          }
          return true;
        },

      replace:
        () =>
        ({ editor, dispatch }) => {
          const { searchTerm, replaceTerm, results, currentIndex } = this.storage;
          if (!searchTerm || results.length === 0 || currentIndex < 0) return false;
          const target = results[currentIndex];
          if (dispatch) {
            editor.chain().focus().insertContentAt({ from: target.from, to: target.to }, replaceTerm).run();
          }
          return true;
        },

      replaceAll:
        () =>
        ({ editor, dispatch }) => {
          const { searchTerm, replaceTerm } = this.storage;
          if (!searchTerm) return false;
          const content = editor.getText();
          if (!content.includes(searchTerm)) return false;
          if (dispatch) {
            const html = editor.getHTML();
            const regex = new RegExp(searchTerm.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'g');
            const newHtml = html.replace(regex, replaceTerm);
            editor.commands.setContent(newHtml);
          }
          return true;
        },
    };
  },

  addProseMirrorPlugins() {
    const extension = this;

    return [
      new Plugin({
        key: new PluginKey('searchAndReplace'),
        state: {
          init() {
            return DecorationSet.empty;
          },
          apply(tr, oldSet, oldState, newState) {
            const searchTerm = extension.storage.searchTerm;
            if (!searchTerm) {
              extension.storage.results = [];
              extension.storage.currentIndex = -1;
              return DecorationSet.empty;
            }

            const decorations: Decoration[] = [];
            const results: { from: number; to: number }[] = [];
            const query = searchTerm.toLowerCase();

            newState.doc.descendants((node, pos) => {
              if (node.isText && node.text) {
                const text = node.text.toLowerCase();
                let index = text.indexOf(query);
                while (index !== -1) {
                  const from = pos + index;
                  const to = from + query.length;
                  results.push({ from, to });
                  decorations.push(
                    Decoration.inline(from, to, {
                      class: extension.options.searchResultClass,
                    })
                  );
                  index = text.indexOf(query, index + query.length);
                }
              }
            });

            extension.storage.results = results;
            if (results.length > 0 && extension.storage.currentIndex === -1) {
              extension.storage.currentIndex = 0;
            }

            return DecorationSet.create(newState.doc, decorations);
          },
        },
        props: {
          decorations(state) {
            return this.getState(state);
          },
        },
      }),
    ];
  },
});
