import { useState } from 'react';
import { CellFormat } from '../../types/sheets';
import {
  Bold, Italic, Strikethrough, AlignLeft, AlignCenter, AlignRight,
  Plus, Download, DollarSign, Percent,
  Calculator, Palette, Combine, WrapText, Filter, ArrowDownAZ, ArrowUpAZ,
  Sparkles, CheckSquare, TableProperties, MessageSquare, Snowflake, Printer
} from 'lucide-react';

interface SheetsRibbonProps {
  activeFormat?: CellFormat;
  onUpdateFormat: (updates: Partial<CellFormat>) => void;
  onMergeCells: () => void;
  onUnmergeCells: () => void;
  onInsertRow: () => void;
  onInsertCol: () => void;
  onDeleteRow: () => void;
  onDeleteCol: () => void;
  onInsertFunction: (funcName: string) => void;
  onSort: (direction: 'asc' | 'desc') => void;
  onToggleFilter: () => void;
  onOpenConditionalFormatModal: () => void;
  onOpenDataValidationModal: () => void;
  onOpenPivotTableModal: () => void;
  onOpenCommentModal: () => void;
  onToggleFreezePanes: () => void;
  onExportCSV: () => void;
  onImportCSV: () => void;
  onPrint: () => void;
  lang?: 'vi' | 'en';
}

type RibbonTab = 'home' | 'insert' | 'formulas' | 'data' | 'review' | 'view';

export default function SheetsRibbon({
  activeFormat = {},
  onUpdateFormat,
  onMergeCells,
  onUnmergeCells: _onUnmergeCells,
  onInsertRow,
  onInsertCol,
  onDeleteRow: _onDeleteRow,
  onDeleteCol: _onDeleteCol,
  onInsertFunction,
  onSort,
  onToggleFilter,
  onOpenConditionalFormatModal,
  onOpenDataValidationModal,
  onOpenPivotTableModal,
  onOpenCommentModal,
  onToggleFreezePanes,
  onExportCSV,
  onImportCSV: _onImportCSV,
  onPrint,
  lang = 'vi',
}: SheetsRibbonProps) {
  const [activeTab, setActiveTab] = useState<RibbonTab>('home');
  const isVi = lang === 'vi';

  const fillColors = [
    '#ffffff', '#f8fafc', '#dbeafe', '#dcfce7', '#fef3c7', '#fce7f3',
    '#3b82f6', '#10b981', '#f59e0b', '#ef4444', 'transparent'
  ];

  return (
    <div className="ribbon-bar" style={{ backgroundColor: 'var(--do-color-surface)', borderBottom: '1px solid var(--do-color-border)' }}>
      {/* Ribbon Tabs */}
      <div className="ribbon-tabs" style={{ display: 'flex', alignItems: 'center', borderBottom: '1px solid var(--do-color-border)', padding: '0 1rem', gap: '4px' }}>
        {(['home', 'insert', 'formulas', 'data', 'review', 'view'] as RibbonTab[]).map(tab => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`ribbon-tab ${activeTab === tab ? 'active' : ''}`}
            style={{
              padding: '8px 14px',
              fontSize: '13px',
              fontWeight: activeTab === tab ? 600 : 400,
              color: activeTab === tab ? 'var(--do-color-primary)' : 'var(--do-color-text)',
              borderBottom: activeTab === tab ? '2px solid var(--do-color-primary)' : '2px solid transparent',
              border: 'none',
              backgroundColor: 'transparent',
              cursor: 'pointer',
              textTransform: 'capitalize',
            }}
          >
            {tab === 'home' && (isVi ? 'Trang chủ' : 'Home')}
            {tab === 'insert' && (isVi ? 'Chèn & Cấu trúc' : 'Insert')}
            {tab === 'formulas' && (isVi ? 'Công thức' : 'Formulas')}
            {tab === 'data' && (isVi ? 'Dữ liệu & Phân tích' : 'Data')}
            {tab === 'review' && (isVi ? 'Kiểm duyệt & Ghi chú' : 'Review')}
            {tab === 'view' && (isVi ? 'Hiển thị & In' : 'View')}
          </button>
        ))}
      </div>

      {/* Tab Content Panel */}
      <div className="ribbon-panel" style={{ display: 'flex', alignItems: 'center', padding: '10px 1rem', gap: '14px', minHeight: '74px', overflowX: 'auto' }}>
        {/* HOME TAB */}
        {activeTab === 'home' && (
          <>
            {/* Font Styling */}
            <div className="ribbon-group" style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
              <button
                onClick={() => onUpdateFormat({ bold: !activeFormat.bold })}
                className={`do-btn-icon ${activeFormat.bold ? 'active' : ''}`}
                style={{ borderRadius: '8px' }}
                title="Bold (Ctrl+B)"
              >
                <Bold size={15} />
              </button>
              <button
                onClick={() => onUpdateFormat({ italic: !activeFormat.italic })}
                className={`do-btn-icon ${activeFormat.italic ? 'active' : ''}`}
                style={{ borderRadius: '8px' }}
                title="Italic (Ctrl+I)"
              >
                <Italic size={15} />
              </button>
              <button
                onClick={() => onUpdateFormat({ strikethrough: !activeFormat.strikethrough })}
                className={`do-btn-icon ${activeFormat.strikethrough ? 'active' : ''}`}
                style={{ borderRadius: '8px' }}
                title="Strikethrough"
              >
                <Strikethrough size={15} />
              </button>
            </div>

            <div style={{ width: '1px', height: '36px', backgroundColor: 'var(--do-color-border)' }} />

            {/* Alignment & Merge */}
            <div className="ribbon-group" style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
              <button
                onClick={() => onUpdateFormat({ align: 'left' })}
                className={`do-btn-icon ${activeFormat.align === 'left' ? 'active' : ''}`}
                style={{ borderRadius: '8px' }}
                title="Align Left"
              >
                <AlignLeft size={15} />
              </button>
              <button
                onClick={() => onUpdateFormat({ align: 'center' })}
                className={`do-btn-icon ${activeFormat.align === 'center' ? 'active' : ''}`}
                style={{ borderRadius: '8px' }}
                title="Align Center"
              >
                <AlignCenter size={15} />
              </button>
              <button
                onClick={() => onUpdateFormat({ align: 'right' })}
                className={`do-btn-icon ${activeFormat.align === 'right' ? 'active' : ''}`}
                style={{ borderRadius: '8px' }}
                title="Align Right"
              >
                <AlignRight size={15} />
              </button>
              <button
                onClick={onMergeCells}
                className="do-btn"
                style={{ borderRadius: '8px', gap: '4px' }}
                title="Merge & Center"
              >
                <Combine size={14} /> {isVi ? 'Trộn ô (Merge)' : 'Merge & Center'}
              </button>
              <button
                onClick={() => onUpdateFormat({ wrapText: !activeFormat.wrapText })}
                className={`do-btn ${activeFormat.wrapText ? 'active' : ''}`}
                style={{ borderRadius: '8px', gap: '4px' }}
                title="Wrap Text"
              >
                <WrapText size={14} /> {isVi ? 'Xuống dòng (Wrap)' : 'Wrap Text'}
              </button>
            </div>

            <div style={{ width: '1px', height: '36px', backgroundColor: 'var(--do-color-border)' }} />

            {/* Cell Fill Colors & Borders */}
            <div className="ribbon-group" style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <span style={{ fontSize: '11px', fontWeight: 600, color: 'var(--do-color-text-muted)' }}>
                <Palette size={13} style={{ marginRight: '4px' }} />
                {isVi ? 'Fill ô:' : 'Fill:'}
              </span>
              {fillColors.map((col, i) => (
                <div
                  key={i}
                  onClick={() => onUpdateFormat({ bgColor: col })}
                  style={{
                    width: '20px',
                    height: '20px',
                    borderRadius: '4px',
                    background: col,
                    border: '1px solid var(--do-color-border)',
                    cursor: 'pointer',
                    boxShadow: activeFormat.bgColor === col ? '0 0 0 2px var(--do-color-primary)' : 'none',
                  }}
                  title={col}
                />
              ))}
            </div>

            <div style={{ width: '1px', height: '36px', backgroundColor: 'var(--do-color-border)' }} />

            {/* Number Formats & Conditional Formatting */}
            <div className="ribbon-group" style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
              <button
                onClick={() => onUpdateFormat({ numberFormat: 'currency' })}
                className={`do-btn ${activeFormat.numberFormat === 'currency' ? 'active' : ''}`}
                style={{ borderRadius: '8px' }}
                title="Currency ($)"
              >
                <DollarSign size={14} /> Tiền tệ ($)
              </button>
              <button
                onClick={() => onUpdateFormat({ numberFormat: 'percent' })}
                className={`do-btn ${activeFormat.numberFormat === 'percent' ? 'active' : ''}`}
                style={{ borderRadius: '8px' }}
                title="Percentage (%)"
              >
                <Percent size={14} /> Phần trăm (%)
              </button>
              <button
                onClick={onOpenConditionalFormatModal}
                className="do-btn"
                style={{ borderRadius: '8px', backgroundColor: 'rgba(99, 102, 241, 0.1)', color: '#6366f1' }}
                title="Conditional Formatting"
              >
                <Sparkles size={14} /> {isVi ? 'Định dạng điều kiện' : 'Conditional Format'}
              </button>
            </div>
          </>
        )}

        {/* INSERT TAB */}
        {activeTab === 'insert' && (
          <>
            <div className="ribbon-group" style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <button className="do-btn" onClick={onInsertRow} style={{ borderRadius: '8px' }}>
                <Plus size={14} /> {isVi ? 'Thêm Hàng' : 'Insert Row'}
              </button>
              <button className="do-btn" onClick={onInsertCol} style={{ borderRadius: '8px' }}>
                <Plus size={14} /> {isVi ? 'Thêm Cột' : 'Insert Column'}
              </button>
            </div>

            <div style={{ width: '1px', height: '36px', backgroundColor: 'var(--do-color-border)' }} />

            <div className="ribbon-group" style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <button className="do-btn" onClick={onOpenPivotTableModal} style={{ borderRadius: '8px', backgroundColor: 'rgba(37, 99, 235, 0.1)', color: 'var(--do-color-primary)' }}>
                <TableProperties size={14} /> Pivot Table
              </button>
            </div>
          </>
        )}

        {/* FORMULAS TAB */}
        {activeTab === 'formulas' && (
          <div className="ribbon-group" style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <button className="do-btn" onClick={() => onInsertFunction('SUM')} style={{ borderRadius: '8px', backgroundColor: 'rgba(37, 99, 235, 0.1)', color: 'var(--do-color-primary)' }}>
              <Calculator size={14} /> SUM
            </button>
            <button className="do-btn" onClick={() => onInsertFunction('AVERAGE')} style={{ borderRadius: '8px', backgroundColor: 'rgba(16, 185, 129, 0.1)', color: '#10b981' }}>
              <Calculator size={14} /> AVERAGE
            </button>
            <button className="do-btn" onClick={() => onInsertFunction('VLOOKUP')} style={{ borderRadius: '8px', backgroundColor: 'rgba(245, 158, 11, 0.1)', color: '#f59e0b' }}>
              VLOOKUP
            </button>
            <button className="do-btn" onClick={() => onInsertFunction('IF')} style={{ borderRadius: '8px' }}>
              IF
            </button>
            <button className="do-btn" onClick={() => onInsertFunction('CONCATENATE')} style={{ borderRadius: '8px' }}>
              CONCATENATE
            </button>
          </div>
        )}

        {/* DATA TAB */}
        {activeTab === 'data' && (
          <div className="ribbon-group" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <button className="do-btn" onClick={() => onSort('asc')} style={{ borderRadius: '8px' }}>
              <ArrowDownAZ size={14} /> {isVi ? 'Sắp xếp A-Z' : 'Sort A-Z'}
            </button>
            <button className="do-btn" onClick={() => onSort('desc')} style={{ borderRadius: '8px' }}>
              <ArrowUpAZ size={14} /> {isVi ? 'Sắp xếp Z-A' : 'Sort Z-A'}
            </button>
            <button className="do-btn" onClick={onToggleFilter} style={{ borderRadius: '8px', backgroundColor: 'rgba(37, 99, 235, 0.1)', color: 'var(--do-color-primary)' }}>
              <Filter size={14} /> {isVi ? 'Bật/Tắt AutoFilter' : 'AutoFilter'}
            </button>
            <button className="do-btn" onClick={onOpenDataValidationModal} style={{ borderRadius: '8px', backgroundColor: 'rgba(16, 185, 129, 0.1)', color: '#10b981' }}>
              <CheckSquare size={14} /> {isVi ? 'Xác thực Data Validation' : 'Data Validation'}
            </button>
          </div>
        )}

        {/* REVIEW TAB */}
        {activeTab === 'review' && (
          <div className="ribbon-group" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <button className="do-btn" onClick={onOpenCommentModal} style={{ borderRadius: '8px' }}>
              <MessageSquare size={14} /> {isVi ? 'Thêm Ghi Chú (Comment)' : 'Add Comment'}
            </button>
          </div>
        )}

        {/* VIEW TAB */}
        {activeTab === 'view' && (
          <div className="ribbon-group" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <button className="do-btn" onClick={onToggleFreezePanes} style={{ borderRadius: '8px' }}>
              <Snowflake size={14} /> {isVi ? 'Cố định Tiêu đề (Freeze Panes)' : 'Freeze Panes'}
            </button>
            <button className="do-btn" onClick={onPrint} style={{ borderRadius: '8px' }}>
              <Printer size={14} /> {isVi ? 'In ấn / Xuất PDF' : 'Print / Export PDF'}
            </button>
            <button className="do-btn" onClick={onExportCSV} style={{ borderRadius: '8px', backgroundColor: 'var(--do-color-primary)', color: '#fff' }}>
              <Download size={14} /> {isVi ? 'Xuất File CSV' : 'Export CSV'}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
