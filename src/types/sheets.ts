export type CellAlign = 'left' | 'center' | 'right';
export type CellVerticalAlign = 'top' | 'middle' | 'bottom';
export type NumberFormat = 'general' | 'currency' | 'percent' | 'decimal' | 'date' | 'scientific';
export type BorderStyle = 'thin' | 'thick' | 'double' | 'dashed';

export interface MergeInfo {
  isMaster: boolean;
  masterAddr?: string; // e.g. "A1"
  rowSpan?: number;
  colSpan?: number;
}

export interface DataValidation {
  type: 'list' | 'number' | 'textLength';
  values?: string[]; // e.g. ["Active", "Pending", "Closed"]
  min?: number;
  max?: number;
  errorMessage?: string;
}

export interface CellComment {
  author: string;
  text: string;
  date?: string;
}

export interface SparklineConfig {
  type: 'line' | 'bar';
  data: number[];
  color?: string;
}

export interface CellFormat {
  bold?: boolean;
  italic?: boolean;
  strikethrough?: boolean;
  underline?: boolean;
  fontSize?: number;
  fontFamily?: string;
  textColor?: string;
  bgColor?: string;
  align?: CellAlign;
  verticalAlign?: CellVerticalAlign;
  wrapText?: boolean;
  border?: boolean;
  borderStyle?: BorderStyle;
  numberFormat?: NumberFormat;
  textRotation?: number; // degrees e.g. 0, 45, 90
}

export interface CellData {
  rawValue: string; // raw input (e.g. "=SUM(A1:A5)" or "100" or "Hello")
  displayValue?: string; // computed value after formula evaluation
  format?: CellFormat;
  merge?: MergeInfo;
  validation?: DataValidation;
  comment?: CellComment;
  sparkline?: SparklineConfig;
}

export type CellsMap = Record<string, CellData>; // key e.g. "A1", "B4"

export interface ConditionalFormatRule {
  id: string;
  rangeStr: string; // e.g. "A1:A20"
  type: 'greaterThan' | 'lessThan' | 'contains' | 'dataBar' | 'colorScale';
  value?: string;
  color?: string;
}

export interface PivotTableConfig {
  id: string;
  sourceRange: string;
  rowFields: string[];
  colFields: string[];
  valFields: { field: string; func: 'SUM' | 'COUNT' | 'AVERAGE' }[];
}

export interface SheetData {
  id: string;
  name: string;
  cells: CellsMap;
  colWidths?: Record<string, number>;
  rowHeights?: Record<number, number>;
  tabColor?: string;
  freezePanes?: { rows: number; cols: number };
  activeFilters?: Record<string, string>; // col -> filter value
  conditionalFormats?: ConditionalFormatRule[];
  pivotTables?: PivotTableConfig[];
  hidden?: boolean;
}

export interface WorkbookData {
  id: string;
  title: string;
  activeSheetId: string;
  sheets: SheetData[];
}
