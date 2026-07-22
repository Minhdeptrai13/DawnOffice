export type ElementType = 'text' | 'shape' | 'image' | 'table' | 'wordart' | 'media' | 'smartart' | 'chart';

export type ShapeKind = 'rectangle' | 'circle' | 'triangle' | 'star' | 'arrow-right' | 'callout' | 'polygon' | 'line';

export type SmartArtKind = 'process' | 'hierarchy' | 'cycle' | 'pyramid';
export type ChartKind = 'bar' | 'line' | 'pie' | 'column';

export interface SmartArtData {
  kind: SmartArtKind;
  nodes: { id: string; label: string; sublabel?: string; color?: string }[];
}

export interface ChartData {
  kind: ChartKind;
  title: string;
  labels: string[];
  datasets: { label: string; values: number[]; color: string }[];
}

export type TransitionType = 'none' | 'fade' | 'push' | 'wipe' | 'split' | 'zoom' | 'flip' | 'dissolve' | 'morph';

export type AnimationType = 'none' | 'fade-in' | 'fly-in' | 'zoom-in' | 'bounce-in' | 'pulse' | 'spin' | 'color-flash' | 'fly-out';

export interface SlideAnimation {
  id: string;
  elementId: string;
  type: AnimationType;
  trigger: 'on-click' | 'with-previous' | 'after-previous';
  durationMs: number;
  delayMs: number;
  easing?: string;
}

export interface SlideElement {
  id: string;
  type: ElementType;
  x: number; // virtual coordinates on 1920x1080 canvas
  y: number;
  width: number;
  height: number;
  rotation: number; // degrees
  zIndex: number;
  content: string; // text content or HTML or image/media URL
  shapeKind?: ShapeKind;
  smartartData?: SmartArtData;
  chartData?: ChartData;
  fillColor?: string;
  strokeColor?: string;
  strokeWidth?: number;
  strokeDashArray?: string; // e.g. "5,5" for dashed border
  textColor?: string;
  fontSize?: number;
  fontFamily?: string;
  textAlign?: 'left' | 'center' | 'right' | 'justify';
  verticalAlign?: 'top' | 'middle' | 'bottom';
  lineHeight?: number;
  letterSpacing?: number;
  bold?: boolean;
  italic?: boolean;
  underline?: boolean;
  strikethrough?: boolean;
  shadow?: boolean;
  wordartGlow?: boolean;
  tableData?: string[][]; // 2D array for table cells
  locked?: boolean;
  imageFilter?: {
    brightness?: number; // 0..200%
    contrast?: number;   // 0..200%
    grayscale?: number;  // 0..100%
    blur?: number;       // px
  };
}

export type SlideLayout =
  | 'title'
  | 'title-content'
  | 'section-header'
  | 'two-column'
  | 'comparison'
  | 'blank';

export interface SlideSection {
  id: string;
  name: string;
  slideIds: string[];
}

export interface Slide {
  id: string;
  title: string;
  layout: SlideLayout;
  elements: SlideElement[];
  backgroundFill: string; // solid, gradient, or image
  transition: TransitionType;
  transitionDurationMs: number;
  speakerNotes: string;
  hidden?: boolean;
}

export interface Presentation {
  id: string;
  title: string;
  aspectRatio: '16:9' | '4:3';
  slides: Slide[];
  activeSlideId: string;
  theme: 'modern' | 'dark' | 'sunset' | 'emerald';
  animations: SlideAnimation[];
  sections?: SlideSection[];
}
