import { ReactNodeViewRenderer } from '@tiptap/react';
import Image from '@tiptap/extension-image';
import ImageResizeComponent from './ImageResizeComponent';

export const CustomImage = Image.extend({
  addAttributes() {
    return {
      ...this.parent?.(),
      width: {
        default: null,
        parseHTML: element => element.getAttribute('width'),
        renderHTML: attributes => {
          if (!attributes.width) return {};
          return {
            width: attributes.width,
          };
        },
      },
      align: {
        default: 'left',
        parseHTML: element => element.getAttribute('data-align') || 'left',
        renderHTML: attributes => {
          if (attributes.align === 'left') return {};
          return {
            'data-align': attributes.align,
          };
        },
      }
    };
  },

  addNodeView() {
    return ReactNodeViewRenderer(ImageResizeComponent);
  },
});
