interface HeaderFooterOverlayProps {
  visible: boolean;
  headerText: string;
  footerText: string;
  onHeaderChange: (val: string) => void;
  onFooterChange: (val: string) => void;
  showNumbers?: boolean;
}

export default function HeaderFooterOverlay({
  visible,
  headerText,
  footerText,
  onHeaderChange,
  onFooterChange,
  showNumbers = true,
}: HeaderFooterOverlayProps) {
  if (!visible && !headerText && !footerText) return null;

  return (
    <div className="dawn-header-footer">
      {/* Header Band */}
      {(visible || headerText) && (
        <div
          style={{
            position: 'absolute',
            top: '12px',
            left: '54px',
            right: '54px',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            fontSize: '11px',
            color: 'var(--do-color-text-muted)',
            borderBottom: visible ? '1px dashed var(--do-color-border)' : 'none',
            paddingBottom: '4px',
            zIndex: 10,
          }}
        >
          <input
            type="text"
            value={headerText}
            onChange={e => onHeaderChange(e.target.value)}
            placeholder={visible ? '[Tiêu đề trang (Header) - Nhập nội dung...]' : ''}
            style={{
              border: 'none',
              background: 'transparent',
              color: 'inherit',
              fontSize: 'inherit',
              width: '100%',
              outline: 'none',
            }}
          />
        </div>
      )}

      {/* Footer Band */}
      {(visible || footerText) && (
        <div
          style={{
            position: 'absolute',
            bottom: '12px',
            left: '54px',
            right: '54px',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            fontSize: '11px',
            color: 'var(--do-color-text-muted)',
            borderTop: visible ? '1px dashed var(--do-color-border)' : 'none',
            paddingTop: '4px',
            zIndex: 10,
          }}
        >
          <input
            type="text"
            value={footerText}
            onChange={e => onFooterChange(e.target.value)}
            placeholder={visible ? '[Chân trang (Footer) - Nhập nội dung...]' : ''}
            style={{
              border: 'none',
              background: 'transparent',
              color: 'inherit',
              fontSize: 'inherit',
              flex: 1,
              outline: 'none',
            }}
          />
          {showNumbers && (
            <span style={{ marginLeft: '12px', fontWeight: 500 }}>Trang 1</span>
          )}
        </div>
      )}
    </div>
  );
}
