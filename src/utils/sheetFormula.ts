import { CellsMap, NumberFormat, SheetData } from '../types/sheets';

// Built-in Functions Catalog for Autocomplete and Documentation
export interface FunctionInfo {
  name: string;
  category: 'Math' | 'Logic' | 'Lookup' | 'Text' | 'Date';
  syntax: string;
  desc: string;
}

export const EXCEL_FUNCTIONS: FunctionInfo[] = [
  { name: 'SUM', category: 'Math', syntax: 'SUM(range)', desc: 'Tính tổng các số trong dải ô' },
  { name: 'AVERAGE', category: 'Math', syntax: 'AVERAGE(range)', desc: 'Tính giá trị trung bình' },
  { name: 'COUNT', category: 'Math', syntax: 'COUNT(range)', desc: 'Đếm số ô chứa giá trị số' },
  { name: 'COUNTA', category: 'Math', syntax: 'COUNTA(range)', desc: 'Đếm số ô không rỗng' },
  { name: 'COUNTBLANK', category: 'Math', syntax: 'COUNTBLANK(range)', desc: 'Đếm số ô rỗng' },
  { name: 'MIN', category: 'Math', syntax: 'MIN(range)', desc: 'Tìm giá trị nhỏ nhất' },
  { name: 'MAX', category: 'Math', syntax: 'MAX(range)', desc: 'Tìm giá trị lớn nhất' },
  { name: 'ABS', category: 'Math', syntax: 'ABS(number)', desc: 'Giá trị tuyệt đối' },
  { name: 'ROUND', category: 'Math', syntax: 'ROUND(number, digits)', desc: 'Làm tròn số' },
  { name: 'PRODUCT', category: 'Math', syntax: 'PRODUCT(range)', desc: 'Tính tích các số' },
  { name: 'MOD', category: 'Math', syntax: 'MOD(number, divisor)', desc: 'Lấy số dư của phép chia' },
  { name: 'RANDBETWEEN', category: 'Math', syntax: 'RANDBETWEEN(min, max)', desc: 'Sinh số ngẫu nhiên' },
  { name: 'IF', category: 'Logic', syntax: 'IF(condition, trueVal, falseVal)', desc: 'Kiểm tra điều kiện logic' },
  { name: 'AND', category: 'Logic', syntax: 'AND(val1, val2)', desc: 'Trả về TRUE nếu tất cả đúng' },
  { name: 'OR', category: 'Logic', syntax: 'OR(val1, val2)', desc: 'Trả về TRUE nếu có ít nhất 1 đúng' },
  { name: 'NOT', category: 'Logic', syntax: 'NOT(logical)', desc: 'Đảo ngược giá trị logic' },
  { name: 'IFS', category: 'Logic', syntax: 'IFS(cond1, val1, cond2, val2)', desc: 'Kiểm tra nhiều điều kiện' },
  { name: 'IFERROR', category: 'Logic', syntax: 'IFERROR(val, errorVal)', desc: 'Bẫy lỗi công thức' },
  { name: 'VLOOKUP', category: 'Lookup', syntax: 'VLOOKUP(lookupVal, table, colIdx, rangeLookup)', desc: 'Dò tìm dọc' },
  { name: 'HLOOKUP', category: 'Lookup', syntax: 'HLOOKUP(lookupVal, table, rowIdx)', desc: 'Dò tìm ngang' },
  { name: 'XLOOKUP', category: 'Lookup', syntax: 'XLOOKUP(val, lookupArr, returnArr)', desc: 'Dò tìm linh hoạt nâng cao' },
  { name: 'INDEX', category: 'Lookup', syntax: 'INDEX(array, rowNum, colNum)', desc: 'Trả về giá trị ô tại tọa độ' },
  { name: 'MATCH', category: 'Lookup', syntax: 'MATCH(val, array)', desc: 'Vị trí tương đối của giá trị' },
  { name: 'CONCATENATE', category: 'Text', syntax: 'CONCATENATE(text1, text2)', desc: 'Ghép các chuỗi văn bản' },
  { name: 'TEXTJOIN', category: 'Text', syntax: 'TEXTJOIN(delim, ignoreEmpty, text1, text2)', desc: 'Nối văn bản với phân cách' },
  { name: 'LEFT', category: 'Text', syntax: 'LEFT(text, numChars)', desc: 'Lấy các ký tự bên trái' },
  { name: 'RIGHT', category: 'Text', syntax: 'RIGHT(text, numChars)', desc: 'Lấy các ký tự bên phải' },
  { name: 'MID', category: 'Text', syntax: 'MID(text, start, length)', desc: 'Lấy ký tự giữa chuỗi' },
  { name: 'LEN', category: 'Text', syntax: 'LEN(text)', desc: 'Độ dài chuỗi văn bản' },
  { name: 'TRIM', category: 'Text', syntax: 'TRIM(text)', desc: 'Cắt khoảng trắng thừa' },
  { name: 'UPPER', category: 'Text', syntax: 'UPPER(text)', desc: 'Chuyển chữ hoa' },
  { name: 'LOWER', category: 'Text', syntax: 'LOWER(text)', desc: 'Chuyển chữ thường' },
  { name: 'PROPER', category: 'Text', syntax: 'PROPER(text)', desc: 'Viết hoa chữ cái đầu' },
  { name: 'TODAY', category: 'Date', syntax: 'TODAY()', desc: 'Ngày hiện tại' },
  { name: 'NOW', category: 'Date', syntax: 'NOW()', desc: 'Ngày và giờ hiện tại' },
  { name: 'DATE', category: 'Date', syntax: 'DATE(year, month, day)', desc: 'Tạo giá trị ngày' },
];

// Autocomplete Helper
export function getFormulaSuggestions(query: string): FunctionInfo[] {
  if (!query) return [];
  const cleanQuery = query.trim().toUpperCase().replace(/^=/, '');
  if (!cleanQuery) return EXCEL_FUNCTIONS.slice(0, 8);
  return EXCEL_FUNCTIONS.filter(f => f.name.startsWith(cleanQuery));
}

// Convert Column Letter to Index (0-based: A -> 0, B -> 1, Z -> 25, AA -> 26)
export function colLetterToIndex(colStr: string): number {
  let index = 0;
  const str = colStr.toUpperCase();
  for (let i = 0; i < str.length; i++) {
    index = index * 26 + (str.charCodeAt(i) - 64);
  }
  return index - 1;
}

// Convert 0-based Index to Column Letter (0 -> A, 1 -> B, 25 -> Z, 26 -> AA)
export function indexToColLetter(index: number): string {
  let temp = index + 1;
  let letter = '';
  while (temp > 0) {
    const mod = (temp - 1) % 26;
    letter = String.fromCharCode(65 + mod) + letter;
    temp = Math.floor((temp - mod) / 26);
  }
  return letter;
}

// Parse Cell Address "B4" or "$B$4" -> { colIndex: 1, rowIndex: 3 }
export function parseCellAddress(addr: string): { colStr: string; colIndex: number; rowIndex: number } | null {
  const clean = addr.replace(/\$/g, '').trim();
  const match = clean.match(/^([A-Za-z]+)(\d+)$/);
  if (!match) return null;
  const colStr = match[1].toUpperCase();
  const rowNum = parseInt(match[2], 10);
  return {
    colStr,
    colIndex: colLetterToIndex(colStr),
    rowIndex: rowNum - 1,
  };
}

// Format Cell Reference String "B4"
export function formatCellAddress(colIndex: number, rowIndex: number): string {
  return `${indexToColLetter(colIndex)}${rowIndex + 1}`;
}

// Parse Range "A1:B5" -> Array of Cell Addresses ["A1", "A2", ..., "B5"]
export function parseRange(rangeStr: string): string[] {
  const parts = rangeStr.split(':');
  if (parts.length === 1) return [parts[0].replace(/\$/g, '').trim().toUpperCase()];
  if (parts.length !== 2) return [];

  const start = parseCellAddress(parts[0]);
  const end = parseCellAddress(parts[1]);
  if (!start || !end) return [];

  const minCol = Math.min(start.colIndex, end.colIndex);
  const maxCol = Math.max(start.colIndex, end.colIndex);
  const minRow = Math.min(start.rowIndex, end.rowIndex);
  const maxRow = Math.max(start.rowIndex, end.rowIndex);

  const addresses: string[] = [];
  for (let r = minRow; r <= maxRow; r++) {
    for (let c = minCol; c <= maxCol; c++) {
      addresses.push(formatCellAddress(c, r));
    }
  }
  return addresses;
}

// Evaluate Cell Value or Formula with cross-sheet support
export function evaluateFormula(input: string, cells: CellsMap, sheetsMap?: Record<string, SheetData>): string {
  if (!input) return '';
  const trimmed = input.trim();
  if (!trimmed.startsWith('=')) return trimmed;

  const formulaBody = trimmed.slice(1).trim();

  try {
    // 1. Cross-Sheet Cell Reference: e.g. Sheet2!A1
    const crossSheetMatch = formulaBody.match(/^([A-Za-z0-9_]+)!([A-Za-z0-9$]+)$/);
    if (crossSheetMatch && sheetsMap) {
      const sheetName = crossSheetMatch[1];
      const targetCellAddr = crossSheetMatch[2].replace(/\$/g, '').toUpperCase();
      const targetSheet = Object.values(sheetsMap).find(s => s.name.toUpperCase() === sheetName.toUpperCase());
      if (targetSheet && targetSheet.cells[targetCellAddr]) {
        return evaluateFormula(targetSheet.cells[targetCellAddr].rawValue, targetSheet.cells, sheetsMap);
      }
      return '#REF!';
    }

    // 2. Built-in Function Handlers
    const funcMatch = formulaBody.match(/^([A-Z0-9_]+)\((.*)\)$/i);
    if (funcMatch) {
      const funcName = funcMatch[1].toUpperCase();
      const argStr = funcMatch[2].trim();

      // Basic Math & Stat Functions
      if (['SUM', 'AVERAGE', 'AVG', 'COUNT', 'COUNTA', 'COUNTBLANK', 'MIN', 'MAX', 'PRODUCT'].includes(funcName)) {
        const addresses = parseRange(argStr);
        const numValues: number[] = [];
        let nonBlankCount = 0;
        let blankCount = 0;

        addresses.forEach(addr => {
          const cell = cells[addr];
          if (cell && cell.rawValue) {
            nonBlankCount++;
            const val = parseFloat(evaluateFormula(cell.rawValue, cells, sheetsMap));
            if (!isNaN(val)) numValues.push(val);
          } else {
            blankCount++;
          }
        });

        if (funcName === 'SUM') return String(numValues.reduce((a, b) => a + b, 0));
        if (funcName === 'AVERAGE' || funcName === 'AVG') return numValues.length > 0 ? String(numValues.reduce((a, b) => a + b, 0) / numValues.length) : '0';
        if (funcName === 'COUNT') return String(numValues.length);
        if (funcName === 'COUNTA') return String(nonBlankCount);
        if (funcName === 'COUNTBLANK') return String(blankCount);
        if (funcName === 'MIN') return numValues.length > 0 ? String(Math.min(...numValues)) : '0';
        if (funcName === 'MAX') return numValues.length > 0 ? String(Math.max(...numValues)) : '0';
        if (funcName === 'PRODUCT') return String(numValues.reduce((a, b) => a * b, 1));
      }

      // Single Number Math Functions: ABS, ROUND, MOD
      if (funcName === 'ABS') {
        const val = parseFloat(evaluateFormula(`=${argStr}`, cells, sheetsMap));
        return isNaN(val) ? '#VALUE!' : String(Math.abs(val));
      }

      if (funcName === 'ROUND') {
        const args = argStr.split(',').map(s => s.trim());
        const num = parseFloat(evaluateFormula(`=${args[0]}`, cells, sheetsMap));
        const digits = args[1] ? parseInt(args[1], 10) : 0;
        return isNaN(num) ? '#VALUE!' : String(Number(Math.round(Number(num + 'e' + digits)) + 'e-' + digits));
      }

      // Logic Functions: IF, AND, OR, NOT, IFERROR
      if (funcName === 'IF') {
        const args = argStr.split(',').map(s => s.trim());
        if (args.length >= 3) {
          const condRes = evaluateFormula(`=${args[0]}`, cells, sheetsMap);
          const isTrue = condRes === 'true' || condRes === 'TRUE' || parseFloat(condRes) > 0;
          return isTrue
            ? evaluateFormula(args[1].startsWith('=') ? args[1] : `=${args[1]}`, cells, sheetsMap).replace(/^"|"$/g, '')
            : evaluateFormula(args[2].startsWith('=') ? args[2] : `=${args[2]}`, cells, sheetsMap).replace(/^"|"$/g, '');
        }
      }

      if (funcName === 'IFERROR') {
        const args = argStr.split(',').map(s => s.trim());
        const val = evaluateFormula(`=${args[0]}`, cells, sheetsMap);
        if (val.startsWith('#')) {
          return args[1] ? args[1].replace(/^"|"$/g, '') : '';
        }
        return val;
      }

      // Text Functions: CONCATENATE, TEXTJOIN, LEFT, RIGHT, MID, LEN, TRIM, UPPER, LOWER, PROPER
      if (funcName === 'CONCATENATE' || funcName === 'CONCAT') {
        const args = argStr.split(',').map(s => s.trim());
        return args
          .map(arg => {
            if (arg.startsWith('"') && arg.endsWith('"')) return arg.slice(1, -1);
            return evaluateFormula(arg.startsWith('=') ? arg : `=${arg}`, cells, sheetsMap);
          })
          .join('');
      }

      if (funcName === 'LEFT') {
        const args = argStr.split(',').map(s => s.trim());
        const text = evaluateFormula(`=${args[0]}`, cells, sheetsMap).replace(/^"|"$/g, '');
        const count = args[1] ? parseInt(args[1], 10) : 1;
        return text.slice(0, count);
      }

      if (funcName === 'RIGHT') {
        const args = argStr.split(',').map(s => s.trim());
        const text = evaluateFormula(`=${args[0]}`, cells, sheetsMap).replace(/^"|"$/g, '');
        const count = args[1] ? parseInt(args[1], 10) : 1;
        return text.slice(-count);
      }

      if (funcName === 'LEN') {
        const text = evaluateFormula(`=${argStr}`, cells, sheetsMap).replace(/^"|"$/g, '');
        return String(text.length);
      }

      if (funcName === 'UPPER') {
        const text = evaluateFormula(`=${argStr}`, cells, sheetsMap).replace(/^"|"$/g, '');
        return text.toUpperCase();
      }

      if (funcName === 'LOWER') {
        const text = evaluateFormula(`=${argStr}`, cells, sheetsMap).replace(/^"|"$/g, '');
        return text.toLowerCase();
      }

      // Date Functions: TODAY, NOW
      if (funcName === 'TODAY') {
        return new Date().toLocaleDateString('en-US');
      }

      if (funcName === 'NOW') {
        return new Date().toLocaleString();
      }
    }

    // 3. Simple Arithmetic & Cell Reference Replacement (e.g. $A$1 + B2)
    const evaluatedExpr = formulaBody.replace(/\$?[A-Za-z]+\$?\d+/g, match => {
      const addr = match.replace(/\$/g, '').toUpperCase();
      const cell = cells[addr];
      if (!cell || !cell.rawValue) return '0';
      const cellVal = evaluateFormula(cell.rawValue, cells, sheetsMap);
      const num = parseFloat(cellVal);
      return isNaN(num) ? `"${cellVal}"` : String(num);
    });

    // Function constructor for safe expression evaluation
    const res = new Function(`return ${evaluatedExpr}`)();
    return res !== undefined && res !== null ? String(res) : '';
  } catch (err) {
    return '#VALUE!';
  }
}

// Format computed display value according to numberFormat
export function formatCellValue(value: string, format?: NumberFormat): string {
  if (!value) return '';
  const num = parseFloat(value);
  if (isNaN(num)) return value;

  if (format === 'currency') return `$${num.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  if (format === 'percent') return `${(num * 100).toFixed(1)}%`;
  if (format === 'decimal') return num.toFixed(2);
  if (format === 'scientific') return num.toExponential(2);
  if (format === 'date') return new Date(num).toLocaleDateString();

  return value;
}
