import { useState, useCallback, useEffect, useRef } from 'react';
import { open as openFileDialog, save as saveDialog } from '@tauri-apps/plugin-dialog';
import { writeTextFile, readTextFile } from '@tauri-apps/plugin-fs';
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
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Initial Workbook State with localStorage Persistence
  const [workbook, setWorkbook] = useState<WorkbookData>(() => {
    try {
      const saved = localStorage.getItem('dawn_sheets_workbook_draft');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed && parsed.sheets) return parsed;
      }
    } catch (e) {
      console.error('Failed to restore saved workbook:', e);
    }
    return {
      id: 'wb-1',
      title: isVi ? 'Bảng tính doanh thu & dự án' : 'Sales & Project Spreadsheet',
      activeSheetId: 'sheet-1',
      sheets: [
        {
          id: 'sheet-1',
          name: isVi ? 'Báo Cáo Doanh Thu' : 'Revenue Report',
          freezePanes: { rows: 1, cols: 0 },
          conditionalFormats: [],
          cells: {
            A1: { rawValue: isVi ? 'Doanh Thu Quý 1' : 'Q1 Sales', format: { bold: true, bgColor: '#dbeafe', align: 'center' } },
            B1: { rawValue: isVi ? 'Số Lượng' : 'Quantity', format: { bold: true, bgColor: '#dbeafe', align: 'center' } },
            C1: { rawValue: isVi ? 'Đơn Giá ($)' : 'Unit Price ($)', format: { bold: true, bgColor: '#dbeafe', align: 'center' } },
            D1: { rawValue: isVi ? 'Thành Tiền ($)' : 'Total ($)', format: { bold: true, bgColor: '#dbeafe', align: 'center' } },
            E1: { rawValue: isVi ? 'Trạng Thái' : 'Status', format: { bold: true, bgColor: '#dbeafe', align: 'center' } },

            A2: { rawValue: isVi ? 'Sản phẩm DawnDoc Pro' : 'DawnDoc Pro' },
            B2: { rawValue: '150' },
            C2: { rawValue: '25' },
            D2: { rawValue: '=B2*C2', format: { numberFormat: 'currency', bold: true } },
            E2: { rawValue: isVi ? 'Hoàn thành' : 'Active' },

            A3: { rawValue: isVi ? 'Sản phẩm DawnSheets Enterprise' : 'DawnSheets Enterprise' },
            B3: { rawValue: '200' },
            C3: { rawValue: '40' },
            D3: { rawValue: '=B3*C3', format: { numberFormat: 'currency', bold: true } },
            E3: { rawValue: isVi ? 'Đang duyệt' : 'Pending' },

            A4: { rawValue: isVi ? 'Sản phẩm DawnSlides 4K' : 'DawnSlides 4K' },
            B4: { rawValue: '120' },
            C4: { rawValue: '35' },
            D4: { rawValue: '=B4*C4', format: { numberFormat: 'currency', bold: true } },
            E4: { rawValue: isVi ? 'Hoàn thành' : 'Active' },

            A5: { rawValue: isVi ? 'Gói Combo DawnOffice Suite' : 'DawnOffice Suite Bundle' },
            B5: { rawValue: '300' },
            C5: { rawValue: '85' },
            D5: { rawValue: '=B5*C5', format: { numberFormat: 'currency', bold: true } },
            E5: { rawValue: isVi ? 'Hoàn thành' : 'Active' },

            A6: { rawValue: isVi ? 'TỔNG CỘNG DOANH THU' : 'TOTAL REVENUE', format: { bold: true, bgColor: '#fef3c7' } },
            B6: { rawValue: '=SUM(B2:B5)', format: { bold: true, bgColor: '#fef3c7' } },
            D6: { rawValue: '=SUM(D2:D5)', format: { numberFormat: 'currency', bold: true, bgColor: '#fef3c7' } },
          },
        },
        {
          id: 'sheet-2',
          name: isVi ? 'Chi Phí Vận Hành' : 'Operational Expenses',
          freezePanes: { rows: 1, cols: 0 },
          conditionalFormats: [],
          cells: {
            A1: { rawValue: isVi ? 'Hạng Mục Chi Phí' : 'Expense Category', format: { bold: true, bgColor: '#fce7f3', align: 'center' } },
            B1: { rawValue: isVi ? 'Ngân Sách ($)' : 'Budget ($)', format: { bold: true, bgColor: '#fce7f3', align: 'center' } },
            C1: { rawValue: isVi ? 'Thực Chi ($)' : 'Actual ($)', format: { bold: true, bgColor: '#fce7f3', align: 'center' } },
            D1: { rawValue: isVi ? 'Chênh Lệch ($)' : 'Variance ($)', format: { bold: true, bgColor: '#fce7f3', align: 'center' } },

            A2: { rawValue: isVi ? 'Hạ Tầng Cloud & Server' : 'Cloud & Server Infra' },
            B2: { rawValue: '5000' },
            C2: { rawValue: '4200' },
            D2: { rawValue: '=B2-C2', format: { numberFormat: 'currency', bold: true } },

            A3: { rawValue: isVi ? 'Chi Phí API AI & LLM' : 'AI API Expenses' },
            B3: { rawValue: '3000' },
            C3: { rawValue: '2800' },
            D3: { rawValue: '=B3-C3', format: { numberFormat: 'currency', bold: true } },

            A4: { rawValue: isVi ? 'Marketing & Quảng Cáo' : 'Marketing & Ads' },
            B4: { rawValue: '4500' },
            C4: { rawValue: '4100' },
            D4: { rawValue: '=B4-C4', format: { numberFormat: 'currency', bold: true } },

            A5: { rawValue: isVi ? 'TỔNG CHI PHÍ' : 'TOTAL EXPENSES', format: { bold: true, bgColor: '#fee2e2' } },
            B5: { rawValue: '=SUM(B2:B4)', format: { bold: true, bgColor: '#fee2e2' } },
            C5: { rawValue: '=SUM(C2:C4)', format: { bold: true, bgColor: '#fee2e2' } },
            D5: { rawValue: '=SUM(D2:D4)', format: { numberFormat: 'currency', bold: true, bgColor: '#fee2e2' } },
          },
        },
        {
          id: 'sheet-3',
          name: isVi ? 'Nhân Sự & Đội Ngũ' : 'Team & HR Stats',
          freezePanes: { rows: 1, cols: 0 },
          conditionalFormats: [],
          cells: {
            A1: { rawValue: isVi ? 'Họ Và Tên' : 'Full Name', format: { bold: true, bgColor: '#e0e7ff', align: 'center' } },
            B1: { rawValue: isVi ? 'Chức Vụ' : 'Role', format: { bold: true, bgColor: '#e0e7ff', align: 'center' } },
            C1: { rawValue: isVi ? 'Phòng Ban' : 'Department', format: { bold: true, bgColor: '#e0e7ff', align: 'center' } },
            D1: { rawValue: isVi ? 'Lương Cơ Bản ($)' : 'Salary ($)', format: { bold: true, bgColor: '#e0e7ff', align: 'center' } },

            A2: { rawValue: 'Nguyễn Văn A' },
            B2: { rawValue: 'Lead Developer' },
            C2: { rawValue: 'Engineering' },
            D2: { rawValue: '3500' },

            A3: { rawValue: 'Trần Thị B' },
            B3: { rawValue: 'UI/UX Designer' },
            C3: { rawValue: 'Product Design' },
            D3: { rawValue: '2800' },

            A4: { rawValue: 'Lê Hoàng C' },
            B4: { rawValue: 'AI Product Specialist' },
            C4: { rawValue: 'AI Lab' },
            D4: { rawValue: '4000' },
          },
        }
      ],
    };
  });

  // Sync workbook draft to localStorage
  useEffect(() => {
    try {
      localStorage.setItem('dawn_sheets_workbook_draft', JSON.stringify(workbook));
    } catch (e) {
      console.error('Failed to save sheets draft:', e);
    }
  }, [workbook]);

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

  // AI Copilot Action & Text Insertion Event Handler
  useEffect(() => {
    const handleInsertText = (e: Event) => {
      const customEvent = e as CustomEvent<{ text: string }>;
      const text = customEvent.detail?.text;
      if (text) {
        setWorkbook(prev => {
          const sheet = prev.sheets.find(s => s.id === prev.activeSheetId) || prev.sheets[0];
          return {
            ...prev,
            sheets: prev.sheets.map(s => s.id === sheet.id ? {
              ...s,
              cells: {
                ...s.cells,
                [activeCellAddr]: { ...s.cells[activeCellAddr], rawValue: text },
              },
            } : s),
          };
        });
      }
    };

    const handleExecuteActions = (e: Event) => {
      const customEvent = e as CustomEvent<{ actions: any[] }>;
      const actions = customEvent.detail?.actions;
      if (!actions || !Array.isArray(actions)) return;

      actions.forEach(action => {
        try {
          const type = (action.type || '').toLowerCase();
          switch (type) {
            case 'set_cell':
            case 'set_value':
            case 'update_cell':
            case 'insert':
            case 'insert_text': {
              const targetAddr = action.cell || action.addr || activeCellAddr;
              const val = action.value ?? action.val ?? action.text ?? '';
              setWorkbook(prev => {
                const sheet = prev.sheets.find(s => s.id === prev.activeSheetId) || prev.sheets[0];
                return {
                  ...prev,
                  sheets: prev.sheets.map(s => s.id === sheet.id ? {
                    ...s,
                    cells: {
                      ...s.cells,
                      [targetAddr]: { ...s.cells[targetAddr], rawValue: String(val) },
                    },
                  } : s),
                };
              });
              break;
            }
            case 'bold':
            case 'set_font':
            case 'font': {
              const targetAddr = action.cell || activeCellAddr;
              setWorkbook(prev => {
                const sheet = prev.sheets.find(s => s.id === prev.activeSheetId) || prev.sheets[0];
                const existingCell = sheet.cells[targetAddr] || { rawValue: '' };
                const existingFmt = existingCell.format || {};
                return {
                  ...prev,
                  sheets: prev.sheets.map(s => s.id === sheet.id ? {
                    ...s,
                    cells: {
                      ...s.cells,
                      [targetAddr]: {
                        ...existingCell,
                        format: { ...existingFmt, bold: true, fontFamily: action.font || action.name },
                      },
                    },
                  } : s),
                };
              });
              break;
            }
            case 'create_table':
            case 'table':
            case 'fill_data': {
              if (action.data && Array.isArray(action.data)) {
                setWorkbook(prev => {
                  const sheet = prev.sheets.find(s => s.id === prev.activeSheetId) || prev.sheets[0];
                  const newCells = { ...sheet.cells };
                  action.data.forEach((rowValues: any[], rIdx: number) => {
                    rowValues.forEach((cellVal: any, cIdx: number) => {
                      const colLetter = String.fromCharCode(65 + cIdx);
                      const addr = `${colLetter}${rIdx + 1}`;
                      newCells[addr] = {
                        rawValue: String(cellVal),
                        format: rIdx === 0 ? { bold: true, bgColor: '#dbeafe', align: 'center' } : undefined,
                      };
                    });
                  });
                  return {
                    ...prev,
                    sheets: prev.sheets.map(s => s.id === sheet.id ? { ...s, cells: newCells } : s),
                  };
                });
              }
              break;
            }
            case 'clear':
            case 'clear_grid': {
              setWorkbook(prev => {
                const sheet = prev.sheets.find(s => s.id === prev.activeSheetId) || prev.sheets[0];
                return {
                  ...prev,
                  sheets: prev.sheets.map(s => s.id === sheet.id ? { ...s, cells: {} } : s),
                };
              });
              break;
            }
          }
        } catch (err) {
          console.warn('Error executing AI action in DawnSheets:', action, err);
        }
      });
    };

    window.addEventListener('dawn-insert-copilot-text', handleInsertText);
    window.addEventListener('dawn-execute-ai-action', handleExecuteActions);
    return () => {
      window.removeEventListener('dawn-insert-copilot-text', handleInsertText);
      window.removeEventListener('dawn-execute-ai-action', handleExecuteActions);
    };
  }, [activeCellAddr]);

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

  // New Workbook Action
  const handleNewWorkbook = () => {
    if (window.confirm(isVi ? 'Tạo bảng tính mới? Bảng tính hiện tại sẽ được đặt lại.' : 'Create new spreadsheet? Current spreadsheet will be reset.')) {
      setWorkbook({
        id: `wb-${Date.now()}`,
        title: isVi ? 'Bảng tính chưa đặt tên' : 'Untitled Spreadsheet',
        activeSheetId: 'sheet-1',
        sheets: [
          {
            id: 'sheet-1',
            name: 'Sheet1',
            cells: {},
          },
        ],
      });
      setActiveCellAddr('A1');
      setFormulaValue('');
    }
  };

  // Parse and Load CSV / JSON Content
  const parseAndLoadContent = (text: string, title?: string) => {
    try {
      if (text.trim().startsWith('{')) {
        const parsed = JSON.parse(text);
        if (parsed && parsed.sheets) {
          setWorkbook(parsed);
          return;
        }
      }
      const lines = text.split('\n');
      const newCells: Record<string, any> = {};
      lines.forEach((line, rIdx) => {
        const cols = line.split(',');
        cols.forEach((colVal, cIdx) => {
          const cleanVal = colVal.trim().replace(/^"|"$/g, '');
          if (cleanVal) {
            const addr = formatCellAddress(cIdx, rIdx);
            newCells[addr] = { rawValue: cleanVal };
          }
        });
      });
      setWorkbook(prev => ({
        ...prev,
        title: title || 'Imported Spreadsheet',
        sheets: [
          {
            id: 'sheet-1',
            name: 'Sheet1',
            cells: newCells,
          },
        ],
      }));
    } catch (e) {
      console.error('Error parsing spreadsheet file:', e);
    }
  };

  // Open Spreadsheet File
  const handleOpenSpreadsheet = async () => {
    try {
      const selected = await openFileDialog({
        multiple: false,
        filters: [{ name: 'Spreadsheet', extensions: ['csv', 'json'] }],
      });
      if (selected && typeof selected === 'string') {
        const text = await readTextFile(selected);
        const fileName = selected.split('\\').pop()?.split('/').pop() || 'Spreadsheet';
        parseAndLoadContent(text, fileName);
        return;
      }
    } catch (e) {
      console.log('Tauri open fallback, using file input:', e);
    }
    fileInputRef.current?.click();
  };

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (evt) => {
        const text = evt.target?.result as string;
        if (text) parseAndLoadContent(text, file.name);
      };
      reader.readAsText(file);
    }
  };

  // Save Spreadsheet Action
  const handleSaveSpreadsheet = async () => {
    try {
      const filePath = await saveDialog({
        filters: [{ name: 'JSON Workbook', extensions: ['json'] }, { name: 'CSV File', extensions: ['csv'] }],
      });
      if (filePath) {
        if (filePath.endsWith('.csv')) {
          handleExportCSV();
        } else {
          await writeTextFile(filePath, JSON.stringify(workbook, null, 2));
        }
      }
    } catch (err) {
      console.log('Tauri save fallback, downloading JSON:', err);
      const blob = new Blob([JSON.stringify(workbook, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${workbook.title}.json`;
      a.click();
    }
  };

  // Unmerge Cells Handler
  const handleUnmergeCells = () => {
    setWorkbook(prev => ({
      ...prev,
      sheets: prev.sheets.map(s => {
        if (s.id !== activeSheet.id) return s;
        const cell = s.cells[activeCellAddr];
        if (!cell) return s;
        const { merge, ...restCell } = cell;
        return {
          ...s,
          cells: { ...s.cells, [activeCellAddr]: restCell },
        };
      }),
    }));
  };

  // Merge Cells Handler
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

    const rowIndices = [1, 2, 3];
    rowIndices.sort((rA, rB) => {
      const addrA = formatCellAddress(colIdx, rA);
      const addrB = formatCellAddress(colIdx, rB);
      const valA = activeSheet.cells[addrA]?.rawValue || '';
      const valB = activeSheet.cells[addrB]?.rawValue || '';
      return direction === 'asc' ? valA.localeCompare(valB) : valB.localeCompare(valA);
    });
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

  // Delete Row / Column Actions
  const handleDeleteRow = () => {
    const pos = parseCellAddress(activeCellAddr);
    if (!pos) return;
    const newCells: Record<string, any> = {};
    Object.entries(activeSheet.cells).forEach(([addr, data]) => {
      const cellPos = parseCellAddress(addr);
      if (cellPos) {
        if (cellPos.rowIndex === pos.rowIndex) return;
        if (cellPos.rowIndex > pos.rowIndex) {
          const shiftedAddr = formatCellAddress(cellPos.colIndex, cellPos.rowIndex - 1);
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

  const handleDeleteCol = () => {
    const pos = parseCellAddress(activeCellAddr);
    if (!pos) return;
    const newCells: Record<string, any> = {};
    Object.entries(activeSheet.cells).forEach(([addr, data]) => {
      const cellPos = parseCellAddress(addr);
      if (cellPos) {
        if (cellPos.colIndex === pos.colIndex) return;
        if (cellPos.colIndex > pos.colIndex) {
          const shiftedAddr = formatCellAddress(cellPos.colIndex - 1, cellPos.rowIndex);
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
          <button className="do-btn" onClick={handleNewWorkbook} style={{ borderRadius: '10px' }} title="New"><FilePlus size={14} /> {isVi ? 'Mới' : 'New'}</button>
          <button className="do-btn" onClick={handleOpenSpreadsheet} style={{ borderRadius: '10px' }} title="Open"><FolderOpen size={14} /> {isVi ? 'Mở' : 'Open'}</button>
          <button className="do-btn" onClick={handleSaveSpreadsheet} style={{ borderRadius: '10px' }} title="Save"><Save size={14} /> {isVi ? 'Lưu' : 'Save'}</button>
          <button className="do-btn" onClick={handleExportCSV} style={{ borderRadius: '10px' }} title="Export CSV"><Download size={14} /> {isVi ? 'Xuất CSV' : 'Export CSV'}</button>
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
        onUnmergeCells={handleUnmergeCells}
        onInsertRow={handleInsertRow}
        onInsertCol={handleInsertCol}
        onDeleteRow={handleDeleteRow}
        onDeleteCol={handleDeleteCol}
        onInsertFunction={handleInsertFunction}
        onSort={handleSort}
        onToggleFilter={() => setShowFilterRow(!showFilterRow)}
        onOpenConditionalFormatModal={() => setIsCondModalOpen(true)}
        onOpenDataValidationModal={() => setIsValidationModalOpen(true)}
        onOpenPivotTableModal={() => setIsPivotModalOpen(true)}
        onOpenCommentModal={() => setIsCommentModalOpen(true)}
        onToggleFreezePanes={handleToggleFreezePanes}
        onExportCSV={handleExportCSV}
        onImportCSV={handleOpenSpreadsheet}
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

      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileInputChange}
        style={{ display: 'none' }}
        accept=".csv,.json"
      />
    </div>
  );
}
