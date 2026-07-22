import { NodeViewWrapper } from '@tiptap/react';
import React, { useRef, useState, useEffect } from 'react';

export default function ImageResize(props: any) {
  const { src, alt, width, align = 'left' } = props.node.attrs;
  const [isResizing, setIsResizing] = useState(false);
  const imgRef = useRef<HTMLImageElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const startResize = (e: React.MouseEvent) => {
    e.preventDefault();
    setIsResizing(true);
  };

  useEffect(() => {
    if (!isResizing) return;
    
    const handleMouseMove = (e: MouseEvent) => {
      if (!imgRef.current) return;
      const rect = imgRef.current.getBoundingClientRect();
      const newWidth = e.clientX - rect.left;
      if (newWidth > 50) {
        props.updateAttributes({ width: newWidth });
      }
    };

    const handleMouseUp = () => {
      setIsResizing(false);
    };

    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);
    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isResizing, props]);

  return (
    <NodeViewWrapper 
      className={`image-resizer-wrapper align-${align}`}
      style={{ display: 'flex', justifyContent: align === 'center' ? 'center' : align === 'right' ? 'flex-end' : 'flex-start' }}
    >
      <div 
        ref={containerRef}
        style={{ position: 'relative', display: 'inline-block' }}
        className={props.selected ? 'ProseMirror-selectednode' : ''}
      >
        <img
          ref={imgRef}
          src={src}
          alt={alt}
          style={{ width: width ? `${width}px` : 'auto', display: 'block', maxWidth: '100%' }}
        />
        {props.selected && (
          <div 
            className="resize-handle"
            onMouseDown={startResize}
            style={{
              position: 'absolute',
              bottom: '-5px',
              right: '-5px',
              width: '12px',
              height: '12px',
              backgroundColor: 'var(--do-color-primary)',
              border: '2px solid white',
              borderRadius: '50%',
              cursor: 'nwse-resize',
              zIndex: 10
            }}
          />
        )}
      </div>
    </NodeViewWrapper>
  );
}
