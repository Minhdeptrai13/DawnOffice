import { useState, useCallback } from 'react';
import { WorkbookData, SheetData, CellFormat, ConditionalFormatRule, DataValidation, PivotTableConfig, CellComment } from '../types/sheets';
import SheetsRibbon from '../components/sheets/SheetsRibbon';
import FormulaBar from '../components/sheets/FormulaBar';
import SpreadsheetGrid from '../components/sheets/SpreadsheetGrid';
import SheetTabs from '../components/sheets/SheetTabs';
import ConditionalFormatModal from '../components/sheets/ConditionalFormatModal';
import DataValidationModal from '../components/sheets/DataValidationModal';
import PivotTableModal from '../components/sheets/PivotTableModal';
import CommentModal from '../components/sheets/CommentModal';
import DawnLogoAnimated from '../components/DawnLogoAnimated';
import ZoomControls from '../components/ZoomControls';
import { Save, FolderOpen, FilePlus, Maximize2, Minimize2, Download } from 'lucide-react';
import { parseCellAddress, formatCellAddress, evaluateFormula } from '../utils/sheetFormula';

interface DawnSheetsProps {
  immersiveMode?: boolean;
  onImmersiveModeChange?: (enabled: boolean) => void;
  lang?: 'vi' | 'en';
}

export default function DawnSheets({
  immersiveMode = false,
  onImmersiveModeChange,
  lang = 'vi',
}: DawnSheetsProps) {
  const isVi = lang === 'vi';

  // Initial Workbook State
  const [workbook, setWorkbook] = useState<WorkbookData>(() => ({
    id: 'wb-1',
    title: isVi ? 'Bảng tính chưa đặt tên' : 'Untitled Spreadsheet',
    activeSheetId: 'sheet-1',
    sheets: [
      {
        id: 'sheet-1',
        name: 'Sheet1',
        freezePanes: { rows: 1, cols: 0 },
        conditionalFormats: [],
        cells: {
          A1: { rawValue: isVi ? 'Doanh Thu Quý 1' : 'Q1 Sales', format: { bold: true, bgColor: '#dbeafe', align: 'center' } },
          B1: { rawValue: isVi ? 'Số Lượng' : 'Quantity', format: { bold: true, bgColor: '#dbeafe', align: 'center' } },
          C1: { rawValue: isVi ? 'Đơn Giá ($)' : 'Unit Price ($)', format: { bold: true, bgColor: '#dbeafe', align: 'center' } },
          D1: { rawValue: isVi ? 'Thành Tiền ($)' : 'Total ($)', format: { bold: true, bgColor: '#dbeafe', align: 'center' } },
          E1: { rawValue: isVi ? 'Trạng Thái' : 'Status', format: { bold: true, bgColor: '#dbeafe', align: 'center' } },

          A2: { rawValue: isVi ? 'Sản phẩm A' : 'Product A' },
          B2: { rawValue: '150' },
          C2: { rawValue: '25' },
          D2: { rawValue: '=B2*C2', format: { numberFormat: 'currency', bold: true } },
          E2: { rawValue: isVi ? 'Hoàn thành' : 'Active', validation: { type: 'list', values: [isVi ? 'Hoàn thành' : 'Active', isVi ? 'Đang duyệt' : 'Pending', isVi ? 'Hủy bỏ' : 'Closed'] } },

          A3: { rawValue: isVi ? 'Sản phẩm B' : 'Product B' },
          B3: { rawValue: '200' },
          C3: { rawValue: '40' },
          D3: { rawValue: '=B3*C3', format: { numberFormat: 'currency', bold: true } },
          E3: { rawValue: isVi ? 'Đang duyệt' : 'Pending', validation: { type: 'list', values: [isVi ? 'Hoàn thành' : 'Active', isVi ? 'Đang duyệt' : 'Pending', isVi ? 'Hủy bỏ' : 'Closed'] } },

          A4: { rawValue: isVi ? 'Sản phẩm C' : 'Product C' },
          B4: { rawValue: '80' },
          C4: { rawValue: '15' },
          D4: { rawValue: '=B4*C4', format: { numberFormat: 'currency', bold: true } },
          E4: { rawValue: isVi ? 'Hoàn thành' : 'Active', validation: { type: 'list', values: [isVi ? 'Hoàn thành' : 'Active', isVi ? 'Đang duyệt' : 'Pending', isVi ? 'Hủy bỏ' : 'Closed'] } },

          A5: { rawValue: isVi ? 'TỔNG CỘNG' : 'TOTAL', format: { bold: true, bgColor: '#fef3c7' } },
          D5: { rawValue: '=SUM(D2:D4)', format: { numberFormat: 'currency', bold: true, bgColor: '#fef3c7' } },
        },
      },
    ],
  }));

  const [activeCellAddr, setActiveCellAddr] = useState('A1');
  const [formulaValue, setFormulaValue] = useState(workbook.sheets[0]?.cells['A1']?.rawValue || '');
  const [showFilterRow, setShowFilterRow] = useState(false);
  const [zoom, setZoom] = useState(100);

  // Modal States
  const [isCondModalOpen, setIsCondModalOpen] = useState(false);
  const [isValidationModalOpen, setIsValidationModalOpen] = useState(false);
  const [isPivotModalOpen, setIsPivotModalOpen] = useState(false);
  const [isCommentModalOpen, setIsCommentModalOpen] = useState(false);

  const activeSheetIndex = workbook.sheets.findIndex(s => s.id === workbook.activeSheetId);
  const activeSheet = workbook.sheets[activeSheetIndex >= 0 ? activeSheetIndex : 0];

  // Select Cell Handler
  const handleSelectCell = (addr: string) => {
    setActiveCellAddr(addr);
    const cell = activeSheet.cells[addr];
    setFormulaValue(cell ? cell.rawValue : '');
  };

  // Update Cell Handler
  const handleUpdateCell = useCallback((addr: string, rawValue: string, formatUpdates?: Partial<CellFormat>) => {
    setWorkbook(prev => ({
      ...prev,
      sheets: prev.sheets.map(s => {
        if (s.id !== activeSheet.id) return s;
        const existingCell = s.cells[addr] || { rawValue: '' };
        const updatedFormat = formatUpdates ? { ...existingCell.format, ...formatUpdates } : existingCell.format;
        return {
          ...s,
          cells: {
            ...s.cells,
            [addr]: {
              ...existingCell,
              rawValue,
              format: updatedFormat,
            },
          },
        };
      }),
    }));
    if (addr === activeCellAddr) {
      setFormulaValue(rawValue);
    }
  }, [activeSheet.id, activeCellAddr]);

  // Update Active Cell Format
  const handleUpdateActiveFormat = (formatUpdates: Partial<CellFormat>) => {
    const existingRaw = activeSheet.cells[activeCellAddr]?.rawValue || '';
    handleUpdateCell(activeCellAddr, existingRaw, formatUpdates);
  };

  // Merge Cells Handler (e.g. Merge A1:B1)
  const handleMergeCells = () => {
    handleUpdateActiveFormat({ align: 'center' });
    setWorkbook(prev => ({
      ...prev,
      sheets: prev.sheets.map(s => {
        if (s.id !== activeSheet.id) return s;
        const activeCell = s.cells[activeCellAddr] || { rawValue: '' };
        return {
          ...s,
          cells: {
            ...s.cells,
            [activeCellAddr]: {
              ...activeCell,
              merge: { isMaster: true, rowSpan: 1, colSpan: 2 },
            },
          },
        };
      }),
    }));
  };

  // Sort Range Handler
  const handleSort = (direction: 'asc' | 'desc') => {
    const pos = parseCellAddress(activeCellAddr);
    if (!pos) return;
    const colIdx = pos.colIndex;

    // Collect data rows (row 2 to 10)
    const rowIndices = [1, 2, 3];
    rowIndices.sort((rA, rB) => {
      const addrA = formatCellAddress(colIdx, rA);
      const addrB = formatCellAddress(colIdx, rB);
      const valA = activeSheet.cells[addrA]?.rawValue || '';
      const valB = activeSheet.cells[addrB]?.rawValue || '';
      return direction === 'asc' ? valA.localeCompare(valB) : valB.localeCompare(valA);
    });

    console.log('Sorted row indices:', rowIndices);
  };

  // Toggle Freeze Panes
  const handleToggleFreezePanes = () => {
    setWorkbook(prev => ({
      ...prev,
      sheets: prev.sheets.map(s => (s.id === activeSheet.id ? { ...s, freezePanes: s.freezePanes?.rows ? { rows: 0, cols: 0 } : { rows: 1, cols: 0 } } : s)),
    }));
  };

  // Sheet Tabs Actions
  const handleAddSheet = () => {
    const newId = `sheet-${Date.now()}`;
    const newSheet: SheetData = {
      id: newId,
      name: `Sheet${workbook.sheets.length + 1}`,
      cells: {},
    };
    setWorkbook(prev => ({
      ...prev,
      sheets: [...prev.sheets, newSheet],
      activeSheetId: newId,
    }));
    setActiveCellAddr('A1');
    setFormulaValue('');
  };

  const handleDeleteSheet = (id: string) => {
    if (workbook.sheets.length <= 1) return;
    const filtered = workbook.sheets.filter(s => s.id !== id);
    setWorkbook(prev => ({
      ...prev,
      sheets: filtered,
      activeSheetId: filtered[0].id,
    }));
  };

  const handleRenameSheet = (id: string, newName: string) => {
    setWorkbook(prev => ({
      ...prev,
      sheets: prev.sheets.map(s => (s.id === id ? { ...s, name: newName } : s)),
    }));
  };

  // Insert Row / Column Actions
  const handleInsertRow = () => {
    const pos = parseCellAddress(activeCellAddr);
    if (!pos) return;
    const newCells: Record<string, any> = {};
    Object.entries(activeSheet.cells).forEach(([addr, data]) => {
      const cellPos = parseCellAddress(addr);
      if (cellPos) {
        if (cellPos.rowIndex >= pos.rowIndex) {
          const shiftedAddr = formatCellAddress(cellPos.colIndex, cellPos.rowIndex + 1);
          newCells[shiftedAddr] = data;
        } else {
          newCells[addr] = data;
        }
      }
    });
    setWorkbook(prev => ({
      ...prev,
      sheets: prev.sheets.map(s => (s.id === activeSheet.id ? { ...s, cells: newCells } : s)),
    }));
  };

  const handleInsertCol = () => {
    const pos = parseCellAddress(activeCellAddr);
    if (!pos) return;
    const newCells: Record<string, any> = {};
    Object.entries(activeSheet.cells).forEach(([addr, data]) => {
      const cellPos = parseCellAddress(addr);
      if (cellPos) {
        if (cellPos.colIndex >= pos.colIndex) {
          const shiftedAddr = formatCellAddress(cellPos.colIndex + 1, cellPos.rowIndex);
          newCells[shiftedAddr] = data;
        } else {
          newCells[addr] = data;
        }
      }
    });
    setWorkbook(prev => ({
      ...prev,
      sheets: prev.sheets.map(s => (s.id === activeSheet.id ? { ...s, cells: newCells } : s)),
    }));
  };

  // Insert Function Quick Template
  const handleInsertFunction = (funcName: string) => {
    const template = `=${funcName}(A1:A5)`;
    setFormulaValue(template);
    handleUpdateCell(activeCellAddr, template);
  };

  // Apply Modals Results
  const handleApplyConditionalFormat = (rule: ConditionalFormatRule) => {
    setWorkbook(prev => ({
      ...prev,
      sheets: prev.sheets.map(s => (s.id === activeSheet.id ? { ...s, conditionalFormats: [...(s.conditionalFormats || []), rule] } : s)),
    }));
  };

  const handleApplyDataValidation = (validation: DataValidation) => {
    setWorkbook(prev => ({
      ...prev,
      sheets: prev.sheets.map(s => {
        if (s.id !== activeSheet.id) return s;
        const cell = s.cells[activeCellAddr] || { rawValue: '' };
        return {
          ...s,
          cells: {
            ...s.cells,
            [activeCellAddr]: { ...cell, validation },
          },
        };
      }),
    }));
  };

  const handleApplyPivotTable = (pivotConfig: PivotTableConfig) => {
    setWorkbook(prev => ({
      ...prev,
      sheets: prev.sheets.map(s => (s.id === activeSheet.id ? { ...s, pivotTables: [...(s.pivotTables || []), pivotConfig] } : s)),
    }));
  };

  const handleApplyComment = (comment: CellComment) => {
    setWorkbook(prev => ({
      ...prev,
      sheets: prev.sheets.map(s => {
        if (s.id !== activeSheet.id) return s;
        const cell = s.cells[activeCellAddr] || { rawValue: '' };
        return {
          ...s,
          cells: {
            ...s.cells,
            [activeCellAddr]: { ...cell, comment },
          },
        };
      }),
    }));
  };

  // Export CSV
  const handleExportCSV = () => {
    let csv = '';
    for (let r = 0; r < 30; r++) {
      const rowVals: string[] = [];
      for (let c = 0; c < 15; c++) {
        const addr = formatCellAddress(c, r);
        const cell = activeSheet.cells[addr];
        const val = cell ? evaluateFormula(cell.rawValue, activeSheet.cells) : '';
        rowVals.push(`"${val.replace(/"/g, '""')}"`);
      }
      csv += rowVals.join(',') + '\n';
    }

    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `${workbook.title}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Calculate Summary Metrics for Status Bar (SUM, AVG, COUNT)
  const populatedNumericValues: number[] = [];
  Object.values(activeSheet.cells).forEach(c => {
    if (c.rawValue) {
      const val = parseFloat(evaluateFormula(c.rawValue, activeSheet.cells));
      if (!isNaN(val)) populatedNumericValues.push(val);
    }
  });

  const sumMetrics = populatedNumericValues.reduce((a, b) => a + b, 0);
  const avgMetrics = populatedNumericValues.length > 0 ? sumMetrics / populatedNumericValues.length : 0;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', backgroundColor: 'var(--do-color-surface)' }}>
      {/* Top File Bar */}
      <div className="toolbar" style={{ height: '40px', borderBottom: '1px solid var(--do-color-border)', gap: '8px', padding: '0 1rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', paddingRight: 12, borderRight: '1px solid var(--do-color-border)' }}>
          <DawnLogoAnimated size={26} showWordmark replayOnHover />
        </div>

        <div className="toolbar-group">
          <button className="do-btn" style={{ borderRadius: '10px' }} title="New"><FilePlus size={14} /> {isVi ? 'Mới' : 'New'}</button>
          <button className="do-btn" style={{ borderRadius: '10px' }} title="Open"><FolderOpen size={14} /> {isVi ? 'Mở' : 'Open'}</button>
          <button className="do-btn" style={{ borderRadius: '10px' }} title="Save"><Save size={14} /> {isVi ? 'Lưu' : 'Save'}</button>
          <button className="do-btn" style={{ borderRadius: '10px' }} onClick={handleExportCSV} title="Export CSV"><Download size={14} /> {isVi ? 'Xuất CSV' : 'Export CSV'}</button>
        </div>

        <div style={{ marginLeft: '1rem', color: 'var(--do-color-text-muted)', fontSize: '0.85rem' }}>
          📊 {workbook.title}
        </div>

        {onImmersiveModeChange && (
          <button className="do-btn-icon" style={{ marginLeft: 'auto', borderRadius: '10px' }} onClick={() => onImmersiveModeChange(!immersiveMode)}>
            {immersiveMode ? <Minimize2 size={16} /> : <Maximize2 size={16} />}
          </button>
        )}
      </div>

      {/* Ribbon Bar */}
      <SheetsRibbon
        activeFormat={activeSheet.cells[activeCellAddr]?.format}
        onUpdateFormat={handleUpdateActiveFormat}
        onMergeCells={handleMergeCells}
        onUnmergeCells={() => {}}
        onInsertRow={handleInsertRow}
        onInsertCol={handleInsertCol}
        onDeleteRow={() => {}}
        onDeleteCol={() => {}}
        onInsertFunction={handleInsertFunction}
        onSort={handleSort}
        onToggleFilter={() => setShowFilterRow(!showFilterRow)}
        onOpenConditionalFormatModal={() => setIsCondModalOpen(true)}
        onOpenDataValidationModal={() => setIsValidationModalOpen(true)}
        onOpenPivotTableModal={() => setIsPivotModalOpen(true)}
        onOpenCommentModal={() => setIsCommentModalOpen(true)}
        onToggleFreezePanes={handleToggleFreezePanes}
        onExportCSV={handleExportCSV}
        onImportCSV={() => {}}
        onPrint={() => window.print()}
        lang={lang}
      />

      {/* Formula Bar */}
      <FormulaBar
        activeCellAddr={activeCellAddr}
        value={formulaValue}
        onChange={setFormulaValue}
        onCommit={() => handleUpdateCell(activeCellAddr, formulaValue)}
        onCancel={() => setFormulaValue(activeSheet.cells[activeCellAddr]?.rawValue || '')}
        lang={lang}
      />

      {/* Main Grid Area */}
      <SpreadsheetGrid
        cells={activeSheet.cells}
        activeCellAddr={activeCellAddr}
        onSelectCell={handleSelectCell}
        onUpdateCell={handleUpdateCell}
        freezePanes={activeSheet.freezePanes}
        conditionalFormats={activeSheet.conditionalFormats}
        showFilterRow={showFilterRow}
        lang={lang}
      />

      {/* Sheet Tabs Manager */}
      <SheetTabs
        sheets={workbook.sheets}
        activeSheetId={workbook.activeSheetId}
        onSelectSheet={id => setWorkbook(prev => ({ ...prev, activeSheetId: id }))}
        onAddSheet={handleAddSheet}
        onDeleteSheet={handleDeleteSheet}
        onRenameSheet={handleRenameSheet}
        lang={lang}
      />

      {/* Bottom Status Bar */}
      <div
        style={{
          height: '24px',
          backgroundColor: 'var(--do-color-surface)',
          borderTop: '1px solid var(--do-color-border)',
          display: 'flex',
          alignItems: 'center',
          padding: '0 1rem',
          fontSize: '11px',
          color: 'var(--do-color-text-muted)',
          justifyContent: 'space-between',
          userSelect: 'none',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <span>{isVi ? 'ĐÃ SẴN SÀNG' : 'READY'}</span>
          <span>•</span>
          <span>{isVi ? `Ô ĐANG CHỌN: ${activeCellAddr}` : `CELL: ${activeCellAddr}`}</span>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '16px', fontWeight: 500 }}>
          <span>COUNT: {populatedNumericValues.length}</span>
          <span>AVERAGE: {avgMetrics.toFixed(2)}</span>
          <span style={{ color: 'var(--do-color-primary)', fontWeight: 600 }}>SUM: {sumMetrics.toLocaleString()}</span>
          <ZoomControls zoom={zoom} onZoomChange={setZoom} lang={lang} />
        </div>
      </div>

      {/* Modals */}
      <ConditionalFormatModal
        isOpen={isCondModalOpen}
        onClose={() => setIsCondModalOpen(false)}
        onApply={handleApplyConditionalFormat}
        lang={lang}
      />

      <DataValidationModal
        isOpen={isValidationModalOpen}
        onClose={() => setIsValidationModalOpen(false)}
        onApply={handleApplyDataValidation}
        lang={lang}
      />

      <PivotTableModal
        isOpen={isPivotModalOpen}
        onClose={() => setIsPivotModalOpen(false)}
        onApply={handleApplyPivotTable}
        lang={lang}
      />

      <CommentModal
        isOpen={isCommentModalOpen}
        activeCellAddr={activeCellAddr}
        existingComment={activeSheet.cells[activeCellAddr]?.comment}
        onClose={() => setIsCommentModalOpen(false)}
        onApply={handleApplyComment}
        lang={lang}
      />
    </div>
  );
}
