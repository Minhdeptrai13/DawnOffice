import { useState, useRef, useEffect } from 'react';
import { CellsMap, CellFormat, ConditionalFormatRule } from '../../types/sheets';
import {
  indexToColLetter,
  formatCellAddress,
  parseCellAddress,
  evaluateFormula,
  formatCellValue,
} from '../../utils/sheetFormula';
import { ChevronDown } from 'lucide-react';

interface SpreadsheetGridProps {
  cells: CellsMap;
  activeCellAddr: string;
  onSelectCell: (addr: string) => void;
  onUpdateCell: (addr: string, rawValue: string, format?: Partial<CellFormat>) => void;
  colWidths?: Record<string, number>;
  rowHeights?: Record<number, number>;
  freezePanes?: { rows: number; cols: number };
  conditionalFormats?: ConditionalFormatRule[];
  showFilterRow?: boolean;
  lang?: 'vi' | 'en';
}

const DEFAULT_COL_WIDTH = 110;
const DEFAULT_ROW_HEIGHT = 28;
const NUM_COLS = 26; // A to Z
const NUM_ROWS = 60; // 1 to 60

export default function SpreadsheetGrid({
  cells,
  activeCellAddr,
  onSelectCell,
  onUpdateCell,
  colWidths = {},
  rowHeights = {},
  freezePanes = { rows: 0, cols: 0 },
  conditionalFormats = [],
  showFilterRow = false,
  lang: _lang = 'vi',
}: SpreadsheetGridProps) {
  const [editingAddr, setEditingAddr] = useState<string | null>(null);
  const [editValue, setEditValue] = useState('');
  const gridContainerRef = useRef<HTMLDivElement>(null);

  // Range Selection Drag & Fill Handle State
  const [selectionRange, setSelectionRange] = useState<{ start: string; end: string } | null>(null);
  const isMouseDownRef = useRef(false);
  const isFillHandleDragging = useRef(false);

  // Active parsed cell position
  const activePos = parseCellAddress(activeCellAddr) || { colIndex: 0, rowIndex: 0, colStr: 'A' };

  // Handle Cell Click & Mouse Down
  const handleCellMouseDown = (c: number, r: number) => {
    const addr = formatCellAddress(c, r);
    onSelectCell(addr);
    setSelectionRange({ start: addr, end: addr });
    isMouseDownRef.current = true;

    if (editingAddr && editingAddr !== addr) {
      commitEdit();
    }
  };

  const handleCellMouseEnter = (c: number, r: number) => {
    if (isMouseDownRef.current && selectionRange) {
      const currentAddr = formatCellAddress(c, r);
      setSelectionRange(prev => (prev ? { ...prev, end: currentAddr } : null));

      // Fill Handle Drag: Auto-copy formula / series down
      if (isFillHandleDragging.current) {
        const sourceVal = cells[activeCellAddr]?.rawValue || '';
        onUpdateCell(currentAddr, sourceVal);
      }
    }
  };

  const handleMouseUp = () => {
    isMouseDownRef.current = false;
    isFillHandleDragging.current = false;
  };

  useEffect(() => {
    window.addEventListener('mouseup', handleMouseUp);
    return () => window.removeEventListener('mouseup', handleMouseUp);
  }, []);

  // Double Click Cell -> Enter Edit Mode
  const handleCellDoubleClick = (addr: string) => {
    setEditingAddr(addr);
    const cell = cells[addr];
    setEditValue(cell ? cell.rawValue : '');
  };

  // Commit Cell Edit
  const commitEdit = () => {
    if (editingAddr) {
      onUpdateCell(editingAddr, editValue);
      setEditingAddr(null);
      setEditValue('');
    }
  };

  // Global Keyboard Navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (editingAddr) return; // Typing inside inline editor

      const active = parseCellAddress(activeCellAddr);
      if (!active) return;

      if (e.key === 'ArrowUp' && active.rowIndex > 0) {
        e.preventDefault();
        onSelectCell(formatCellAddress(active.colIndex, active.rowIndex - 1));
      } else if (e.key === 'ArrowDown' && active.rowIndex < NUM_ROWS - 1) {
        e.preventDefault();
        onSelectCell(formatCellAddress(active.colIndex, active.rowIndex + 1));
      } else if (e.key === 'ArrowLeft' && active.colIndex > 0) {
        e.preventDefault();
        onSelectCell(formatCellAddress(active.colIndex - 1, active.rowIndex));
      } else if (e.key === 'ArrowRight' && active.colIndex < NUM_COLS - 1) {
        e.preventDefault();
        onSelectCell(formatCellAddress(active.colIndex + 1, active.rowIndex));
      } else if (e.key === 'Enter') {
        e.preventDefault();
        setEditingAddr(activeCellAddr);
        setEditValue(cells[activeCellAddr]?.rawValue || '');
      } else if (e.key === 'Delete' || e.key === 'Backspace') {
        e.preventDefault();
        onUpdateCell(activeCellAddr, '');
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [activeCellAddr, editingAddr, cells, onSelectCell, onUpdateCell]);

  return (
    <div
      ref={gridContainerRef}
      style={{
        flex: 1,
        overflow: 'auto',
        backgroundColor: 'var(--do-color-surface)',
        position: 'relative',
        userSelect: 'none',
      }}
    >
      <table style={{ borderCollapse: 'collapse', tableLayout: 'fixed', minWidth: '100%' }}>
        {/* Column Header Row */}
        <thead>
          <tr>
            {/* Top-Left Corner Cell */}
            <th
              style={{
                width: '46px',
                height: '26px',
                backgroundColor: 'var(--do-color-bg)',
                borderRight: '1px solid var(--do-color-border)',
                borderBottom: '1px solid var(--do-color-border)',
                position: 'sticky',
                top: 0,
                left: 0,
                zIndex: 4,
              }}
            />

            {/* Columns A, B, C... */}
            {Array.from({ length: NUM_COLS }).map((_, c) => {
              const colLetter = indexToColLetter(c);
              const isColActive = activePos.colIndex === c;
              const width = colWidths[colLetter] || DEFAULT_COL_WIDTH;
              const isFrozenCol = c < freezePanes.cols;

              return (
                <th
                  key={colLetter}
                  style={{
                    width: `${width}px`,
                    height: '26px',
                    backgroundColor: isColActive ? 'var(--do-color-surface-active)' : 'var(--do-color-bg)',
                    borderRight: '1px solid var(--do-color-border)',
                    borderBottom: '1px solid var(--do-color-border)',
                    fontSize: '12px',
                    fontWeight: 600,
                    color: isColActive ? 'var(--do-color-primary)' : 'var(--do-color-text-muted)',
                    textAlign: 'center',
                    position: 'sticky',
                    top: 0,
                    left: isFrozenCol ? `${46 + c * DEFAULT_COL_WIDTH}px` : undefined,
                    zIndex: isFrozenCol ? 3 : 2,
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '4px' }}>
                    <span>{colLetter}</span>
                    {showFilterRow && <ChevronDown size={11} style={{ cursor: 'pointer', opacity: 0.7 }} />}
                  </div>
                </th>
              );
            })}
          </tr>
        </thead>

        {/* Data Cell Grid */}
        <tbody>
          {Array.from({ length: NUM_ROWS }).map((_, r) => {
            const rowNum = r + 1;
            const isRowActive = activePos.rowIndex === r;
            const height = rowHeights[rowNum] || DEFAULT_ROW_HEIGHT;
            const isFrozenRow = r < freezePanes.rows;

            return (
              <tr key={rowNum} style={{ height: `${height}px` }}>
                {/* Row Header (1, 2, 3...) */}
                <td
                  style={{
                    width: '46px',
                    height: `${height}px`,
                    backgroundColor: isRowActive ? 'var(--do-color-surface-active)' : 'var(--do-color-bg)',
                    borderRight: '1px solid var(--do-color-border)',
                    borderBottom: '1px solid var(--do-color-border)',
                    fontSize: '12px',
                    fontWeight: 600,
                    color: isRowActive ? 'var(--do-color-primary)' : 'var(--do-color-text-muted)',
                    textAlign: 'center',
                    position: 'sticky',
                    left: 0,
                    top: isFrozenRow ? `${26 + r * DEFAULT_ROW_HEIGHT}px` : undefined,
                    zIndex: isFrozenRow ? 3 : 1,
                  }}
                >
                  {rowNum}
                </td>

                {/* Cells A1, B1, C1... */}
                {Array.from({ length: NUM_COLS }).map((_, c) => {
                  const addr = formatCellAddress(c, r);
                  const cell = cells[addr];

                  // Skip rendering merged slave cells
                  if (cell?.merge && !cell.merge.isMaster) {
                    return null;
                  }

                  const isSelected = activeCellAddr === addr;
                  const isEditing = editingAddr === addr;

                  // Compute Display Value
                  const rawVal = cell ? cell.rawValue : '';
                  const computedVal = evaluateFormula(rawVal, cells);
                  const formattedVal = formatCellValue(computedVal, cell?.format?.numberFormat);

                  const fmt = cell?.format || {};

                  // Check Conditional Formatting Rule match
                  let cfBgColor: string | undefined = undefined;
                  conditionalFormats.forEach(rule => {
                    const numVal = parseFloat(computedVal);
                    if (!isNaN(numVal) && rule.value) {
                      const ruleNum = parseFloat(rule.value);
                      if (rule.type === 'greaterThan' && numVal > ruleNum) cfBgColor = rule.color || '#dcfce7';
                      if (rule.type === 'lessThan' && numVal < ruleNum) cfBgColor = rule.color || '#fee2e2';
                    }
                  });

                  return (
                    <td
                      key={addr}
                      colSpan={cell?.merge?.colSpan}
                      rowSpan={cell?.merge?.rowSpan}
                      onMouseDown={() => handleCellMouseDown(c, r)}
                      onMouseEnter={() => handleCellMouseEnter(c, r)}
                      onDoubleClick={() => handleCellDoubleClick(addr)}
                      style={{
                        height: `${height}px`,
                        borderRight: '1px solid var(--do-color-border)',
                        borderBottom: '1px solid var(--do-color-border)',
                        border: fmt.border ? '1.5px solid var(--do-color-primary)' : undefined,
                        outline: isSelected ? '2px solid var(--do-color-primary)' : 'none',
                        outlineOffset: '-2px',
                        backgroundColor: cfBgColor || fmt.bgColor || (isSelected ? 'rgba(37, 99, 235, 0.08)' : 'transparent'),
                        padding: '2px 6px',
                        fontSize: `${fmt.fontSize || 13}px`,
                        fontFamily: fmt.fontFamily || 'var(--do-font-sans)',
                        fontWeight: fmt.bold ? 'bold' : 'normal',
                        fontStyle: fmt.italic ? 'italic' : 'normal',
                        textDecoration: `${fmt.underline ? 'underline' : ''} ${fmt.strikethrough ? 'line-through' : ''}`.trim() || 'none',
                        color: fmt.textColor || 'var(--do-color-text)',
                        textAlign: fmt.align || (isNaN(parseFloat(computedVal)) ? 'left' : 'right'),
                        whiteSpace: fmt.wrapText ? 'normal' : 'nowrap',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        position: 'relative',
                        cursor: 'cell',
                      }}
                    >
                      {/* Red Comment Badge on Top Right Corner */}
                      {cell?.comment && (
                        <div
                          style={{
                            position: 'absolute',
                            top: 0,
                            right: 0,
                            width: 0,
                            height: 0,
                            borderStyle: 'solid',
                            borderWidth: '0 6px 6px 0',
                            borderColor: 'transparent #ef4444 transparent transparent',
                            zIndex: 10,
                          }}
                          title={`Comment by ${cell.comment.author}: ${cell.comment.text}`}
                        />
                      )}

                      {/* Cell Content Editor or Display */}
                      {isEditing ? (
                        <input
                          type="text"
                          autoFocus
                          value={editValue}
                          onChange={e => setEditValue(e.target.value)}
                          onBlur={commitEdit}
                          onKeyDown={e => {
                            if (e.key === 'Enter') commitEdit();
                          }}
                          style={{
                            width: '100%',
                            height: '100%',
                            border: 'none',
                            outline: 'none',
                            background: '#ffffff',
                            color: '#000000',
                            fontSize: '13px',
                            fontFamily: 'var(--do-font-sans)',
                            padding: 0,
                          }}
                        />
                      ) : cell?.validation?.type === 'list' && cell.validation.values ? (
                        /* Data Validation Dropdown Cell */
                        <select
                          value={rawVal}
                          onChange={e => onUpdateCell(addr, e.target.value)}
                          style={{ width: '100%', height: '100%', border: 'none', background: 'transparent', outline: 'none', cursor: 'pointer', fontWeight: fmt.bold ? 'bold' : 'normal' }}
                        >
                          <option value="">-- Choose --</option>
                          {cell.validation.values.map(opt => (
                            <option key={opt} value={opt}>{opt}</option>
                          ))}
                        </select>
                      ) : (
                        formattedVal
                      )}

                      {/* Fill Handle Corner Box on Active Selected Cell */}
                      {isSelected && !isEditing && (
                        <div
                          onMouseDown={e => {
                            e.stopPropagation();
                            isFillHandleDragging.current = true;
                          }}
                          style={{
                            position: 'absolute',
                            bottom: '-4px',
                            right: '-4px',
                            width: '7px',
                            height: '7px',
                            backgroundColor: 'var(--do-color-primary)',
                            border: '1px solid #ffffff',
                            cursor: 'crosshair',
                            zIndex: 10,
                          }}
                          title="Drag Fill Handle to Auto-fill"
                        />
                      )}
                    </td>
                  );
                })}
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
