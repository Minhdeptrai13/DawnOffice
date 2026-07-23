import { useState, useEffect, useRef, useCallback } from 'react';
import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import { Underline } from '@tiptap/extension-underline';
import { Table } from '@tiptap/extension-table';
import { TableRow } from '@tiptap/extension-table-row';
import { TableCell } from '@tiptap/extension-table-cell';
import { TableHeader } from '@tiptap/extension-table-header';
import { TextStyle } from '@tiptap/extension-text-style';
import FontFamily from '@tiptap/extension-font-family';
import { Color } from '@tiptap/extension-color';
import Highlight from '@tiptap/extension-highlight';
import Subscript from '@tiptap/extension-subscript';
import Superscript from '@tiptap/extension-superscript';
import TextAlign from '@tiptap/extension-text-align';
import TaskList from '@tiptap/extension-task-list';
import TaskItem from '@tiptap/extension-task-item';
import CharacterCount from '@tiptap/extension-character-count';
import Link from '@tiptap/extension-link';
import Placeholder from '@tiptap/extension-placeholder';

import { save, open } from '@tauri-apps/plugin-dialog';
import { writeTextFile, readTextFile, readFile, writeFile } from '@tauri-apps/plugin-fs';
import { Save, FolderOpen, FileText, Download, FilePlus, Maximize2, Minimize2, ChevronUp, ChevronDown, X } from 'lucide-react';

import RibbonBar from '../components/RibbonBar';
import TableOptionsToolbar from '../components/TableOptionsToolbar';
import Ruler from '../components/Ruler';
import PageWatermark from '../components/PageWatermark';
import HeaderFooterOverlay from '../components/HeaderFooterOverlay';
import WordCountModal from '../components/WordCountModal';
import SymbolPickerModal from '../components/SymbolPickerModal';
import LinkModal from '../components/LinkModal';
import TocDrawer from '../components/TocDrawer';
import CommentsDrawer, { CommentItem } from '../components/CommentsDrawer';
import WordContextMenu from '../components/WordContextMenu';
import SelectionBubbleMenu from '../components/SelectionBubbleMenu';

import DawnLogoAnimated from '../components/DawnLogoAnimated';
import RecentFilesDropdown from '../components/RecentFilesDropdown';
import ZoomControls from '../components/ZoomControls';
import { useRecentFiles } from '../hooks/useRecentFiles';
import { convertDocxToHtml, convertHtmlToDocx } from '../utils/docxParser';

import { FontSize } from '../extensions/FontSize';
import { Indent } from '../extensions/Indent';
import { LineHeight } from '../extensions/LineHeight';
import { CustomImage } from '../extensions/CustomImage';
import { SearchAndReplace } from '../extensions/SearchAndReplace';
import { PageBreak } from '../extensions/PageBreak';
import { ChangeCase } from '../extensions/ChangeCase';
import { ParagraphSpacing } from '../extensions/ParagraphSpacing';
import { marked } from 'marked';
// @ts-ignore
import TurndownService from 'turndown';

interface StoredFormat {
  marks: { type: string; attrs: Record<string, any> }[];
  nodeAttrs: {
    textAlign?: string;
    lineHeight?: string;
  };
}

interface DawnDocumentProps { 
  immersiveMode: boolean; 
  onImmersiveModeChange: (enabled: boolean) => void;
  onFileInfoChange?: (filePath: string | null, title: string) => void;
  tabId?: string;
  initialFilePath?: string | null;
}

export default function DawnDocument({ immersiveMode, onImmersiveModeChange, onFileInfoChange, tabId, initialFilePath }: DawnDocumentProps) {
  const [currentFilePath, setCurrentFilePath] = useState<string | null>(initialFilePath || null);
  const draftKey = `dawn_doc_draft_${tabId || 'default'}`;
  const [saveStatus, setSaveStatus] = useState<'Saved' | 'Saving...' | 'Unsaved'>('Saved');
  const [showSearch, setShowSearch] = useState(false);
  const [showReplace, setShowReplace] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [replaceTerm, setReplaceTerm] = useState('');
  const [formatPainterActive, setFormatPainterActive] = useState(false);
  const [zoom, setZoom] = useState(100);
  const formatPainterData = useRef<StoredFormat | null>(null);
  const timeoutRef = useRef<number | null>(null);
  const editorContainerRef = useRef<HTMLDivElement>(null);
  const hideTimer = useRef<number | null>(null);
  const toolbarInside = useRef(false);
  const [toolbarVisible, setToolbarVisible] = useState(!immersiveMode);

  // Sync tab title whenever currentFilePath changes
  useEffect(() => {
    const fileName = currentFilePath
      ? (currentFilePath.split('\\').pop()?.split('/').pop() || 'Untitled Document')
      : 'Untitled Document';
    onFileInfoChange?.(currentFilePath, fileName);
  }, [currentFilePath, onFileInfoChange]);

  // Language setting (vi / en)
  const [lang, setLang] = useState<'vi' | 'en'>('vi');

  // Layout & Structure State
  const [margins, setMargins] = useState<'normal' | 'narrow' | 'wide'>('normal');
  const [orientation, setOrientation] = useState<'portrait' | 'landscape'>('portrait');
  const [paperSize, setPaperSize] = useState<'a4' | 'letter' | 'a3'>('a4');
  const [columns, setColumns] = useState<1 | 2 | 3>(1);
  const [watermark, setWatermark] = useState<string>('');
  const [paperTheme, setPaperTheme] = useState<'standard' | 'eye-care' | 'dark'>('standard');
  const [showRuler, setShowRuler] = useState(true);
  const [showHeaderFooter, setShowHeaderFooter] = useState(false);

  // Modals & Side Panels State
  const [showLinkModal, setShowLinkModal] = useState(false);
  const [showSymbolModal, setShowSymbolModal] = useState(false);
  const [showWordCountModal, setShowWordCountModal] = useState(false);
  const [showTocDrawer, setShowTocDrawer] = useState(false);
  const [showCommentsDrawer, setShowCommentsDrawer] = useState(false);
  
  const [headerText, setHeaderText] = useState('');
  const [footerText, setFooterText] = useState('');
  const [comments, setComments] = useState<CommentItem[]>([]);
  const [toc, setToc] = useState<{ id: string, text: string, level: number }[]>([]);

  const showToolbar = () => { if (hideTimer.current !== null) window.clearTimeout(hideTimer.current); setToolbarVisible(true); };
  const hideToolbar = () => { if (!immersiveMode || toolbarInside.current) return; if (hideTimer.current !== null) window.clearTimeout(hideTimer.current); hideTimer.current = window.setTimeout(() => { if (!toolbarInside.current) setToolbarVisible(false); }, 500); };
  
  useEffect(() => {
    const revealToolbar = () => showToolbar();
    window.addEventListener('dawn-immersive-reveal-toolbar', revealToolbar);
    return () => window.removeEventListener('dawn-immersive-reveal-toolbar', revealToolbar);
  });

  useEffect(() => {
    if (hideTimer.current !== null) window.clearTimeout(hideTimer.current);
    hideTimer.current = null;
    setToolbarVisible(!immersiveMode);
    return () => { if (hideTimer.current !== null) window.clearTimeout(hideTimer.current); };
  }, [immersiveMode]);
  const { recentFiles, addRecentFile, clearRecentFiles } = useRecentFiles();

  const actionsRef = useRef({
    save: () => {},
    saveAs: () => {},
    open: () => {},
    new: () => {},
    print: () => {},
    autoSave: () => {},
  });

  const editor = useEditor({
    extensions: [
      StarterKit,
      Underline,
      Table.configure({ resizable: true }),
      TableRow,
      TableHeader,
      TableCell,
      CustomImage,
      TextStyle,
      FontFamily,
      Color,
      Highlight.configure({ multicolor: true }),
      Subscript,
      Superscript,
      TextAlign.configure({ types: ['heading', 'paragraph'] }),
      TaskList,
      TaskItem.configure({ nested: true }),
      CharacterCount,
      FontSize,
      Indent,
      LineHeight,
      SearchAndReplace,
      PageBreak,
      ChangeCase,
      ParagraphSpacing,
      Link.configure({ openOnClick: false }),
      Placeholder.configure({
        placeholder: lang === 'vi' ? 'Bắt đầu viết tài liệu của bạn...' : 'Start typing your document...',
        emptyEditorClass: 'is-editor-empty',
      }),
    ],
    content: '',
    onUpdate: ({ editor }) => {
      setSaveStatus('Unsaved');
      try {
        const html = editor.getHTML();
        localStorage.setItem(draftKey, html);
      } catch (e) {
        console.error('Failed to save draft HTML:', e);
      }
      if (timeoutRef.current) window.clearTimeout(timeoutRef.current);
      timeoutRef.current = window.setTimeout(() => actionsRef.current.autoSave(), 3000);
      recalcToc();
    },
  });

  const recalcToc = useCallback(() => {
    if (!editor) return;
    const headings: { id: string, text: string, level: number }[] = [];
    editor.state.doc.descendants((node, pos) => {
      if (node.type.name === 'heading') {
        headings.push({
          id: `heading-${pos}`,
          text: node.textContent,
          level: node.attrs.level
        });
      }
    });
    setToc(headings);
  }, [editor]);

  useEffect(() => {
    if (editor) recalcToc();
  }, [editor, recalcToc]);

  // Helper to format raw text with newlines into clean HTML paragraphs
  const cleanHTMLContent = (raw: string) => {
    if (!raw) return '';
    let str = raw
      .replace(/\\n/g, '\n')
      .replace(/```[a-z]*\n?/g, '')
      .replace(/```/g, '')
      .trim();
    
    // Convert markdown bold **text** to <strong>text</strong>
    str = str.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
    
    const lines = str.split('\n');
    const formatted = lines
      .map(l => l.trim() ? `<p>${l.trim()}</p>` : '')
      .filter(Boolean)
      .join('');
    
    return formatted || `<p>${str}</p>`;
  };

  const pendingFilePathRef = useRef<string | null>(null);

  const loadFilePathIntoEditor = useCallback(async (filePath: string) => {
    if (!editor || !filePath) return;
    try {
      let content = '';
      if (filePath.endsWith('.docx')) {
        const uint8Array = await readFile(filePath);
        content = await convertDocxToHtml(uint8Array.buffer);
      } else if (filePath.endsWith('.md')) {
        const text = await readTextFile(filePath);
        content = await marked.parse(text);
      } else if (filePath.endsWith('.txt')) {
        const text = await readTextFile(filePath);
        content = text.split('\n').map(line => `<p>${line}</p>`).join('');
      } else {
        content = await readTextFile(filePath);
      }
      editor.commands.setContent(content);
      setCurrentFilePath(filePath);
      setSaveStatus('Saved');
      addRecentFile(filePath);
      localStorage.setItem('dawn-last-opened-doc-path', filePath);
      try {
        localStorage.setItem(draftKey, content);
      } catch (e) {}
      pendingFilePathRef.current = null;
    } catch (err) {
      console.error('Error opening file path into editor:', filePath, err);
    }
  }, [editor, addRecentFile, draftKey]);

  // Initial restoration of draft or file path
  const isLoadedRef = useRef(false);
  useEffect(() => {
    if (editor && !isLoadedRef.current) {
      isLoadedRef.current = true;
      const targetPath = pendingFilePathRef.current || initialFilePath;
      let savedDraft = localStorage.getItem(draftKey);

      // Clean up legacy page-line elements if present in draft HTML
      if (savedDraft && savedDraft.includes('dawn-page-line')) {
        savedDraft = savedDraft.replace(/<div[^>]*class="dawn-page-line"[^>]*>.*?<\/div>/gi, '');
        localStorage.setItem(draftKey, savedDraft);
      }

      if (targetPath && targetPath.trim()) {
        loadFilePathIntoEditor(targetPath.trim());
      } else if (savedDraft && savedDraft.trim() && savedDraft !== '<p></p>') {
        editor.commands.setContent(savedDraft);
      }
    }
  }, [editor, draftKey, initialFilePath, loadFilePathIntoEditor, onFileInfoChange]);

  useEffect(() => {
    if (!editor) return;

    const handleInsertText = (e: Event) => {
      const customEvent = e as CustomEvent<{ text: string }>;
      if (customEvent.detail?.text) {
        editor.chain().focus().insertContent(cleanHTMLContent(customEvent.detail.text)).run();
      }
    };

    const handleExecuteActions = (e: Event) => {
      const customEvent = e as CustomEvent<{ actions: any[] }>;
      const actions = customEvent.detail?.actions || [];
      actions.forEach(action => {
        try {
          switch (action.type) {
            case 'insert':
            case 'insert_text':
              if (action.text) editor.chain().focus().insertContent(cleanHTMLContent(action.text)).run();
              break;
            case 'font':
            case 'set_font':
              if (action.name || action.font) {
                // @ts-ignore
                if (editor.commands.setFontFamily) editor.commands.setFontFamily(action.name || action.font);
              }
              break;
            case 'size':
            case 'set_font_size':
              if (action.size) {
                // @ts-ignore
                if (editor.commands.setFontSize) editor.commands.setFontSize(action.size);
              }
              break;
            case 'heading':
            case 'add_heading':
              if (action.text) {
                const level = action.level ? Number(action.level) : 1;
                // @ts-ignore
                editor.chain().focus().toggleHeading({ level }).insertContent(cleanHTMLContent(action.text)).run();
              }
              break;
            case 'page_break':
            case 'create_page':
              // @ts-ignore
              if (editor.commands.setPageBreak) editor.commands.setPageBreak();
              break;
            case 'create_table':
            case 'table':
              if (action.html || action.content) {
                const rawTableHtml = action.html || action.content;
                const cleanTable = rawTableHtml.replace(/\\n/g, '').replace(/```html/gi, '').replace(/```/g, '');
                editor.chain().focus().insertContent(cleanTable).run();
              } else {
                const rows = action.rows ? Number(action.rows) : 3;
                const cols = action.cols ? Number(action.cols) : 3;
                editor.chain().focus().insertTable({ rows, cols, withHeaderRow: true }).run();
              }
              break;
            case 'clear':
              editor.chain().focus().setContent('').run();
              break;
          }
        } catch (err) {
          console.warn('Error executing Dawn AI action:', action, err);
        }
      });
    };

    const handleOpenFileEvent = (e: Event) => {
      const customEvent = e as CustomEvent<{ filePath: string }>;
      const filePath = customEvent.detail?.filePath;
      if (filePath) {
        pendingFilePathRef.current = filePath;
        localStorage.setItem('dawn-last-opened-doc-path', filePath);
        if (editor) {
          loadFilePathIntoEditor(filePath);
        }
      }
    };

    window.addEventListener('dawn-insert-copilot-text', handleInsertText);
    window.addEventListener('dawn-execute-ai-action', handleExecuteActions);
    window.addEventListener('dawn-open-file-path', handleOpenFileEvent);
    return () => {
      window.removeEventListener('dawn-insert-copilot-text', handleInsertText);
      window.removeEventListener('dawn-execute-ai-action', handleExecuteActions);
      window.removeEventListener('dawn-open-file-path', handleOpenFileEvent);
    };
  }, [editor, loadFilePathIntoEditor]);

  // File operations
  const handleAutoSave = useCallback(async () => {
    if (!currentFilePath || !editor) return;
    try {
      setSaveStatus('Saving...');
      const content = editor.getHTML();
      if (currentFilePath.endsWith('.docx')) {
        const blob = await convertHtmlToDocx(content);
        await writeFile(currentFilePath, new Uint8Array(await blob.arrayBuffer()));
      } else if (currentFilePath.endsWith('.md')) {
        const turndown = new TurndownService();
        const markdown = turndown.turndown(content);
        await writeTextFile(currentFilePath, markdown);
      } else if (currentFilePath.endsWith('.txt')) {
        await writeTextFile(currentFilePath, editor.getText());
      } else {
        await writeTextFile(currentFilePath, content);
      }
      setSaveStatus('Saved');
    } catch (err) {
      console.error('Auto save error', err);
      setSaveStatus('Unsaved');
    }
  }, [currentFilePath, editor]);

  useEffect(() => {
    actionsRef.current.autoSave = handleAutoSave;
  }, [handleAutoSave]);

  const handleSave = useCallback(async () => {
    if (currentFilePath) {
      await handleAutoSave();
    } else {
      await handleSaveAs();
    }
  }, [currentFilePath, editor, handleAutoSave]);

  const handleSaveAs = useCallback(async () => {
    if (!editor) return;
    try {
      const filePath = await save({ filters: [{ name: 'Documents', extensions: ['html', 'md', 'docx', 'txt'] }] });
      if (filePath) {
        setSaveStatus('Saving...');
        const content = editor.getHTML();
        if (filePath.endsWith('.docx')) {
          const blob = await convertHtmlToDocx(content);
          await writeFile(filePath, new Uint8Array(await blob.arrayBuffer()));
        } else if (filePath.endsWith('.md')) {
          const turndown = new TurndownService();
          const markdown = turndown.turndown(content);
          await writeTextFile(filePath, markdown);
        } else if (filePath.endsWith('.txt')) {
          await writeTextFile(filePath, editor.getText());
        } else {
          await writeTextFile(filePath, content);
        }
        setCurrentFilePath(filePath);
        setSaveStatus('Saved');
        addRecentFile(filePath);
      }
    } catch (err) {
      console.error('Save error', err);
    }
  }, [editor, addRecentFile]);

  const handleOpen = useCallback(async () => {
    try {
      const selected = await open({ multiple: false, filters: [{ name: 'Documents', extensions: ['html', 'md', 'docx', 'txt'] }] });
      if (selected && typeof selected === 'string') {
        let content = '';
        if (selected.endsWith('.docx')) {
          const uint8Array = await readFile(selected);
          content = await convertDocxToHtml(uint8Array.buffer);
        } else if (selected.endsWith('.md')) {
          const md = await readTextFile(selected);
          content = await marked(md);
        } else if (selected.endsWith('.txt')) {
          const txt = await readTextFile(selected);
          content = txt.split('\n').map(line => `<p>${line}</p>`).join('');
        } else {
          content = await readTextFile(selected);
        }
        editor?.commands.setContent(content);
        setCurrentFilePath(selected);
        setSaveStatus('Saved');
        addRecentFile(selected);
        recalcToc();
      }
    } catch (err) {
      console.error('Open error', err);
    }
  }, [editor, addRecentFile, recalcToc]);

  const handleOpenRecent = useCallback(async (filePath: string) => {
    try {
      let content = '';
      if (filePath.endsWith('.docx')) {
        const uint8Array = await readFile(filePath);
        content = await convertDocxToHtml(uint8Array.buffer);
      } else if (filePath.endsWith('.md')) {
        const md = await readTextFile(filePath);
        content = await marked(md);
      } else if (filePath.endsWith('.txt')) {
        const txt = await readTextFile(filePath);
        content = txt.split('\n').map(line => `<p>${line}</p>`).join('');
      } else {
        content = await readTextFile(filePath);
      }
      editor?.commands.setContent(content);
      setCurrentFilePath(filePath);
      setSaveStatus('Saved');
      addRecentFile(filePath);
      recalcToc();
    } catch (err) {
      console.error('Open recent error', err);
    }
  }, [editor, addRecentFile, recalcToc]);

  const handleNew = useCallback(() => {
    editor?.commands.setContent('');
    setCurrentFilePath(null);
    setSaveStatus('Saved');
  }, [editor]);

  const handlePrintToPDF = useCallback(() => {
    window.print();
  }, []);

  // Sync actions ref
  useEffect(() => {
    actionsRef.current = {
      save: handleSave,
      saveAs: handleSaveAs,
      open: handleOpen,
      new: handleNew,
      print: handlePrintToPDF,
      autoSave: handleAutoSave,
    };
  }, [handleSave, handleSaveAs, handleOpen, handleNew, handlePrintToPDF, handleAutoSave]);

  // Global Keyboard Shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.ctrlKey || e.metaKey) {
        switch (e.key.toLowerCase()) {
          case 's':
            e.preventDefault();
            if (e.shiftKey) actionsRef.current.saveAs();
            else actionsRef.current.save();
            break;
          case 'o':
            e.preventDefault();
            actionsRef.current.open();
            break;
          case 'n':
            e.preventDefault();
            actionsRef.current.new();
            break;
          case 'p':
            e.preventDefault();
            actionsRef.current.print();
            break;
          case 'f':
            if (e.shiftKey) {
              e.preventDefault();
              onImmersiveModeChange(!immersiveMode);
            } else {
              e.preventDefault();
              setShowSearch(true);
              setShowReplace(false);
            }
            break;
          case 'h':
            e.preventDefault();
            setShowSearch(true);
            setShowReplace(true);
            break;
        }
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [immersiveMode, onImmersiveModeChange]);

  // Format Painter
  const handleFormatPainterClick = () => {
    if (!editor) return;
    if (formatPainterActive) {
      setFormatPainterActive(false);
      formatPainterData.current = null;
    } else {
      const { state } = editor;
      const { selection } = state;
      const marks = state.doc.nodeAt(selection.from)?.marks.map(m => ({ type: m.type.name, attrs: m.attrs })) || [];
      const nodeAttrs = {
        textAlign: editor.getAttributes('paragraph').textAlign || editor.getAttributes('heading').textAlign,
      };
      formatPainterData.current = { marks, nodeAttrs };
      setFormatPainterActive(true);
    }
  };

  useEffect(() => {
    if (!editor || !formatPainterActive) return;
    const handleSelectionEnd = () => {
      if (formatPainterData.current && !editor.state.selection.empty) {
        const { marks, nodeAttrs } = formatPainterData.current;
        editor.chain().focus().unsetAllMarks().run();
        marks.forEach(m => {
          editor.chain().focus().setMark(m.type, m.attrs).run();
        });
        if (nodeAttrs.textAlign) {
          editor.chain().focus().setTextAlign(nodeAttrs.textAlign).run();
        }
        setFormatPainterActive(false);
        formatPainterData.current = null;
      }
    };
    editor.on('selectionUpdate', handleSelectionEnd);
    return () => { editor.off('selectionUpdate', handleSelectionEnd); };
  }, [editor, formatPainterActive]);

  // Comment Handlers
  const handleAddComment = (text: string) => {
    if (!editor) return;
    const selectedText = editor.state.doc.textBetween(editor.state.selection.from, editor.state.selection.to) || (lang === 'vi' ? 'Toàn văn bản' : 'Entire document');
    const newComment: CommentItem = {
      id: Math.random().toString(36).substring(2, 9),
      author: 'User',
      text,
      selectedText,
      createdAt: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      resolved: false,
      replies: [],
    };
    setComments([newComment, ...comments]);
  };

  const handleReplyComment = (id: string, text: string) => {
    setComments(prev =>
      prev.map(c =>
        c.id === id
          ? {
              ...c,
              replies: [
                ...c.replies,
                { author: 'User', text, createdAt: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) },
              ],
            }
          : c
      )
    );
  };

  const handleToggleResolveComment = (id: string) => {
    setComments(prev => prev.map(c => (c.id === id ? { ...c, resolved: !c.resolved } : c)));
  };

  const handleDeleteComment = (id: string) => {
    setComments(prev => prev.filter(c => c.id !== id));
  };

  const handleApplyLink = (url: string) => {
    if (!editor) return;
    if (!url) {
      editor.chain().focus().unsetLink().run();
    } else {
      editor.chain().focus().extendMarkRange('link').setLink({ href: url }).run();
    }
  };

  // Theme & Layout Calculations
  let paperBg = '#ffffff';
  let textColor = '#000000';
  let borderColor = '#d1d5db';
  if (paperTheme === 'eye-care') { paperBg = '#fbf0d9'; textColor = '#2c2523'; }
  else if (paperTheme === 'dark') { paperBg = '#1e1e1e'; textColor = '#d4d4d4'; borderColor = '#404040'; }

  let marginSize = '2.54cm';
  if (margins === 'narrow') marginSize = '1.27cm';
  else if (margins === 'wide') marginSize = '5.08cm';

  let paperW = '210mm';
  let paperH = '297mm';
  if (paperSize === 'letter') { paperW = '215.9mm'; paperH = '279.4mm'; }
  else if (paperSize === 'a3') { paperW = '297mm'; paperH = '420mm'; }

  if (orientation === 'landscape') {
    const temp = paperW;
    paperW = paperH;
    paperH = temp;
  }

  // Page height reference for orientation
  const PAGE_HEIGHT_PX = orientation === 'landscape' ? 793 : 1122;

  useEffect(() => {
    const style = document.createElement('style');
    style.innerHTML = `
      .editor-container {
        flex: 1;
        overflow-y: auto;
        background-color: var(--do-color-bg);
        padding: 2rem 0;
        display: flex;
        justify-content: center;
        align-items: flex-start;
        position: relative;
        transition: padding-top 0.3s cubic-bezier(0.34, 1.25, 0.64, 1);
      }
      .editor-container.immersive-pushed {
        padding-top: 130px;
      }
      .ProseMirror-wrapper {
        position: relative;
        flex-shrink: 0;
        margin: 0 auto;
        transition: transform 0.3s cubic-bezier(0.34, 1.25, 0.64, 1);
      }
      .ProseMirror {
        background: ${paperBg};
        color: ${textColor};
        width: ${paperW};
        min-height: ${paperH};
        padding: ${marginSize};
        outline: none;
        box-shadow: 0 1px 3px rgba(0,0,0,0.18), 0 4px 16px rgba(0,0,0,0.10);
        position: relative;
        column-count: ${columns};
        column-gap: 1.5cm;
        column-rule: 1px solid var(--do-color-border);
        transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
        box-sizing: border-box;
      }
      /* Placeholder text (fades away on typing) */
      .ProseMirror p.is-editor-empty:first-child::before {
        content: attr(data-placeholder);
        float: left;
        color: var(--do-color-text-muted);
        opacity: 0.45;
        pointer-events: none;
        height: 0;
        font-style: italic;
      }
      .ProseMirror table td, .ProseMirror table th { border: 1px solid ${borderColor}; }
      .format-painter-cursor * { cursor: crosshair !important; }

      /* Floating Pill Card for Text Selection Bubble Menu */
      .bubble-menu-vip {
        display: flex;
        align-items: center;
        background: var(--do-color-surface);
        backdrop-filter: blur(16px);
        -webkit-backdrop-filter: blur(16px);
        padding: 5px 12px;
        border-radius: 14px;
        box-shadow: 0 12px 32px rgba(0, 0, 0, 0.22), 0 0 0 1px var(--do-color-border);
        border: 1px solid var(--do-color-border);
        gap: 4px;
        z-index: 10000;
        animation: dawnBubbleMenuPop 0.18s cubic-bezier(0.34, 1.56, 0.64, 1);
        user-select: none;
      }
      .bm-logo-badge {
        display: flex;
        align-items: center;
        padding-right: 8px;
        border-right: 1px solid var(--do-color-border);
        margin-right: 2px;
      }
      .bm-group {
        display: flex;
        align-items: center;
        gap: 2px;
      }
      .bm-divider {
        width: 1px;
        height: 18px;
        background-color: var(--do-color-border);
        margin: 0 3px;
      }
      .bm-btn {
        display: flex;
        align-items: center;
        gap: 4px;
        padding: 4px 8px;
        border-radius: 6px;
        border: none;
        background: transparent;
        color: var(--do-color-text) !important;
        font-size: 12px;
        font-weight: 600;
        cursor: pointer;
        transition: background 0.15s ease, color 0.15s ease;
      }
      .bm-btn:hover {
        background-color: var(--do-color-accent-transparent, rgba(37, 99, 235, 0.12));
        color: var(--do-color-primary) !important;
      }
      .bm-btn-icon {
        display: flex;
        align-items: center;
        justify-content: center;
        width: 28px;
        height: 28px;
        border-radius: 6px;
        border: none;
        background: transparent;
        color: var(--do-color-text) !important;
        font-size: 12px;
        font-weight: 600;
        cursor: pointer;
        transition: background 0.15s ease, color 0.15s ease;
      }
      .bm-btn-icon:hover {
        background-color: var(--do-color-accent-transparent, rgba(37, 99, 235, 0.12));
        color: var(--do-color-primary) !important;
      }
      .bm-btn-icon.active {
        background-color: var(--do-color-primary) !important;
        color: #ffffff !important;
      }
      .bm-btn-icon.bm-delete:hover {
        background-color: #fee2e2 !important;
        color: #ef4444 !important;
      }
      .bm-popover {
        position: absolute;
        top: 100%;
        left: 0;
        margin-top: 6px;
        background: var(--do-color-surface);
        border: 1px solid var(--do-color-border);
        border-radius: 8px;
        padding: 6px;
        display: flex;
        gap: 6px;
        box-shadow: 0 8px 24px rgba(0, 0, 0, 0.18);
        z-index: 10001;
      }
      .bm-color-swatch {
        width: 20px;
        height: 20px;
        border-radius: 4px;
        cursor: pointer;
        transition: transform 0.15s ease;
      }
      .bm-color-swatch:hover {
        transform: scale(1.18);
      }
      .bm-popover-menu {
        position: absolute;
        top: 100%;
        left: 0;
        margin-top: 6px;
        width: 140px;
        background: var(--do-color-surface);
        border: 1px solid var(--do-color-border);
        border-radius: 8px;
        padding: 4px;
        display: flex;
        flex-direction: column;
        gap: 2px;
        box-shadow: 0 8px 24px rgba(0, 0, 0, 0.18);
        z-index: 10001;
      }
      .bm-popover-item {
        padding: 6px 8px;
        border-radius: 4px;
        font-size: 11px;
        font-weight: 500;
        cursor: pointer;
        color: var(--do-color-text);
        transition: background 0.15s ease;
      }
      .bm-popover-item:hover {
        background-color: var(--do-color-accent);
        color: #ffffff;
      }

      @keyframes dawnBubbleMenuPop {
        from { opacity: 0; transform: scale(0.92) translateY(6px); }
        to { opacity: 1; transform: scale(1) translateY(0); }
      }

      .do-context-item {
        display: flex;
        align-items: center;
        gap: 8px;
        width: 100%;
        padding: 6px 8px;
        border-radius: 6px;
        border: none;
        background: transparent;
        color: var(--do-color-text);
        font-size: 12px;
        font-weight: 500;
        cursor: pointer;
        text-align: left;
        transition: background 0.15s ease, color 0.15s ease;
      }
      .do-context-item:hover {
        background-color: var(--do-color-accent);
        color: #ffffff;
      }
      .do-context-item:hover .do-context-shortcut {
        color: rgba(255, 255, 255, 0.85);
      }
      .do-context-shortcut {
        margin-left: auto;
        font-size: 10px;
        color: var(--do-color-text-muted);
      }
      @keyframes dawnContextMenuFade {
        from { opacity: 0; transform: scale(0.96); }
        to { opacity: 1; transform: scale(1); }
      }

      @media print {
        body * { visibility: hidden; }
        .editor-container, .editor-container * { visibility: visible; }
        .editor-container { position: absolute; left: 0; top: 0; padding: 0; background: none; }
        .ProseMirror { box-shadow: none; min-height: auto; padding: 0; width: 100%; border: none !important; }
        .dawn-page-line, .dawn-header-footer { display: none !important; }
        .dawn-page-break { border: none !important; }
        .dawn-page-break::after { display: none !important; }
      }
    `;
    document.head.appendChild(style);
    return () => { document.head.removeChild(style); };
  }, [margins, orientation, columns, paperTheme, paperSize, paperW, paperH, marginSize, paperBg, textColor, borderColor]);

  const fileName = currentFilePath
    ? currentFilePath.split('\\').pop()?.split('/').pop() ?? (lang === 'vi' ? 'Tài liệu chưa đặt tên' : 'Untitled Document')
    : (lang === 'vi' ? 'Tài liệu chưa đặt tên' : 'Untitled Document');

  useEffect(() => {
    if (onFileInfoChange) {
      const displayTitle = fileName + (saveStatus === 'Unsaved' ? ' ●' : '');
      onFileInfoChange(currentFilePath, displayTitle);
    }
  }, [fileName, saveStatus, currentFilePath, onFileInfoChange]);

  useEffect(() => {
    document.title = currentFilePath ? `${fileName} — DawnOffice` : 'DawnOffice';
    return () => { document.title = 'DawnOffice'; };
  }, [currentFilePath, fileName]);

  // Dynamic page count estimation based on editor content height
  const [totalPages, setTotalPages] = useState(1);
  useEffect(() => {
    const calculatePages = () => {
      const el = editorContainerRef.current?.querySelector('.ProseMirror') as HTMLElement | null;
      if (el) {
        const pages = Math.max(1, Math.ceil(el.scrollHeight / PAGE_HEIGHT_PX));
        setTotalPages(pages);
      }
    };
    calculatePages();
    const timer = setInterval(calculatePages, 1000);
    return () => clearInterval(timer);
  }, [PAGE_HEIGHT_PX]);

  const wordStats = {
    words: editor?.storage.characterCount.words() || 0,
    characters: editor?.storage.characterCount.characters() || 0,
    charactersNoSpaces: (editor?.getText() || '').replace(/\s+/g, '').length,
    paragraphs: (editor?.getHTML() || '').split('</p>').length - 1 || 1,
    pages: totalPages,
    readingTimeMinutes: Math.ceil((editor?.storage.characterCount.words() || 0) / 200),
  };

  const isVi = lang === 'vi';

  return (
    <div
      style={{ display: 'flex', flexDirection: 'column', height: '100%', overflow: 'hidden', backgroundColor: 'var(--do-color-surface)', position: 'relative' }}
      onMouseMove={e => { if (immersiveMode && e.clientY <= 12) showToolbar(); else if (immersiveMode && !toolbarInside.current) hideToolbar(); }}
      className={formatPainterActive ? 'format-painter-cursor' : ''}
    >
      {/* Custom MS Word Right-Click Context Menu */}
      <WordContextMenu
        editor={editor}
        onOpenLinkModal={() => setShowLinkModal(true)}
        onOpenComment={() => handleAddComment(lang === 'vi' ? 'Bình luận mới' : 'New Comment')}
        lang={lang}
      />

      {/* File & App Top Bar */}
      <div className={`immersive-toolbar ${immersiveMode ? 'is-immersive' : ''} ${toolbarVisible ? 'is-visible' : ''}`} onMouseEnter={() => { toolbarInside.current = true; showToolbar(); }} onMouseLeave={() => { toolbarInside.current = false; hideToolbar(); }}>
        <div className="toolbar" style={{ height: '40px', borderBottom: 'none', gap: '4px' }}>
          <div style={{ display: 'flex', alignItems: 'center', paddingRight: 10, marginRight: 2, borderRight: '1px solid var(--do-color-border)', flexShrink: 0 }}>
            <DawnLogoAnimated size={26} showWordmark replayOnHover />
          </div>

          <div className="toolbar-group">
            <button className="do-btn" onClick={handleNew} title={isVi ? "Mới (Ctrl+N)" : "New (Ctrl+N)"}><FilePlus size={15} style={{ marginRight: '5px' }} /> {isVi ? "Mới" : "New"}</button>
            <button className="do-btn" onClick={handleOpen} title={isVi ? "Mở tài liệu (Ctrl+O)" : "Open (Ctrl+O)"}><FolderOpen size={15} style={{ marginRight: '5px' }} /> {isVi ? "Mở" : "Open"}</button>
            <RecentFilesDropdown recentFiles={recentFiles} onOpen={handleOpenRecent} onClear={clearRecentFiles} />
            <button className="do-btn" onClick={handleSave} title={isVi ? "Lưu (Ctrl+S)" : "Save (Ctrl+S)"}><Save size={15} style={{ marginRight: '5px' }} /> {isVi ? "Lưu" : "Save"}</button>
            <button className="do-btn" onClick={handleSaveAs} title={isVi ? "Lưu thành..." : "Save As"}>{isVi ? "Lưu thành" : "Save As"}</button>
            <button className="do-btn" onClick={handlePrintToPDF} title={isVi ? "In / PDF (Ctrl+P)" : "Print/PDF (Ctrl+P)"}><Download size={15} style={{ marginRight: '5px' }} /> {isVi ? "In / PDF" : "Print/PDF"}</button>
          </div>

          <div style={{ marginLeft: '1rem', display: 'flex', alignItems: 'center', color: 'var(--do-color-text-muted)', fontSize: '0.85rem', gap: '4px' }}>
            <FileText size={14} />
            <span>{fileName}</span>
          </div>

          <button className="do-btn-icon" onClick={() => onImmersiveModeChange(!immersiveMode)} title={immersiveMode ? (isVi ? "Thoát chế độ tập trung" : "Exit Focus Mode") : (isVi ? "Chế độ tập trung" : "Focus Mode")}>
            {immersiveMode ? <Minimize2 size={16} /> : <Maximize2 size={16} />}
          </button>

          <div className="save-indicator">
            {saveStatus === 'Saved' && <span style={{ color: '#16a34a' }}>✓ {isVi ? 'Đã lưu' : 'Saved'}</span>}
            {saveStatus === 'Saving...' && <span>{isVi ? 'Đang lưu...' : 'Saving...'}</span>}
            {saveStatus === 'Unsaved' && <span style={{ color: '#d97706' }}>● {isVi ? 'Chưa lưu' : 'Unsaved'}</span>}
          </div>
        </div>

        {/* Tabbed MS Word Style Ribbon Bar */}
        <RibbonBar
          editor={editor}
          onFormatPainterClick={handleFormatPainterClick}
          isFormatPainterActive={formatPainterActive}
          onOpenSearch={() => { setShowSearch(true); setShowReplace(false); }}
          onOpenReplace={() => { setShowSearch(true); setShowReplace(true); }}
          onOpenLinkModal={() => setShowLinkModal(true)}
          onOpenSymbolModal={() => setShowSymbolModal(true)}
          onOpenWordCountModal={() => setShowWordCountModal(true)}
          onToggleTocDrawer={() => setShowTocDrawer(!showTocDrawer)}
          onToggleCommentsDrawer={() => setShowCommentsDrawer(!showCommentsDrawer)}
          onToggleHeaderFooter={() => setShowHeaderFooter(!showHeaderFooter)}
          showHeaderFooter={showHeaderFooter}
          margins={margins}
          setMargins={setMargins}
          orientation={orientation}
          setOrientation={setOrientation}
          paperSize={paperSize}
          setPaperSize={setPaperSize}
          columns={columns}
          setColumns={setColumns}
          watermark={watermark}
          setWatermark={setWatermark}
          paperTheme={paperTheme}
          setPaperTheme={setPaperTheme}
          showRuler={showRuler}
          setShowRuler={setShowRuler}
          onToggleImmersiveMode={() => onImmersiveModeChange(!immersiveMode)}
          lang={lang}
          setLang={setLang}
        />

        {/* Contextual Table Tools */}
        <TableOptionsToolbar editor={editor} />
      </div>

      {/* Horizontal Ruler */}
      {showRuler && <Ruler width={paperW} />}

      {/* Editor & Side Panels Container */}
      <div style={{ flex: 1, display: 'flex', overflow: 'hidden' }}>
        {/* Toc Drawer */}
        <TocDrawer
          isOpen={showTocDrawer}
          onClose={() => setShowTocDrawer(false)}
          items={toc}
          onRefresh={recalcToc}
          onSelectItem={text => {
            if (editor) {
              const dom = editor.view.domAtPos(0).node as HTMLElement;
              const found = Array.from(dom.querySelectorAll('h1, h2, h3, h4')).find(h => h.textContent?.includes(text));
              if (found) found.scrollIntoView({ behavior: 'smooth', block: 'center' });
            }
          }}
        />

        {/* Main Paper Scroll Area (smoothly pushes down when toolbar reveals in Focus Mode) */}
        <div className={`editor-container ${immersiveMode && toolbarVisible ? 'immersive-pushed' : ''}`} ref={editorContainerRef}>
          <div style={{ flex: 1, display: 'flex', justifyContent: 'center', position: 'relative' }}>
            <SelectionBubbleMenu
              editor={editor}
              onOpenLinkModal={() => setShowLinkModal(true)}
              onAddComment={() => handleAddComment(lang === 'vi' ? 'Bình luận mới' : 'New Comment')}
              lang={lang}
            />

            <div className="ProseMirror-wrapper">
              <PageWatermark watermarkText={watermark} />
              <HeaderFooterOverlay
                visible={showHeaderFooter}
                headerText={headerText}
                footerText={footerText}
                onHeaderChange={setHeaderText}
                onFooterChange={setFooterText}
              />
              <EditorContent editor={editor} />
            </div>

            {/* Search & Replace Floating Card */}
            {showSearch && (
              <div style={{ position: 'absolute', top: '16px', right: '32px', background: 'var(--do-color-surface)', padding: '10px', borderRadius: '8px', boxShadow: 'var(--do-shadow-md)', display: 'flex', flexDirection: 'column', gap: '8px', zIndex: 100, border: '1px solid var(--do-color-border)', minWidth: '300px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <input
                    type="text"
                    placeholder={isVi ? "Tìm kiếm..." : "Find..."}
                    value={searchTerm}
                    onChange={e => { setSearchTerm(e.target.value); editor?.commands.setSearchTerm(e.target.value); }}
                    style={{ flex: 1, padding: '5px 8px', border: '1px solid var(--do-color-border)', borderRadius: '4px', fontSize: '13px' }}
                    autoFocus
                  />
                  <button onClick={() => editor?.commands.previousSearchResult()} className="do-btn-icon" title={isVi ? "Trước" : "Previous"}><ChevronUp size={16} /></button>
                  <button onClick={() => editor?.commands.nextSearchResult()} className="do-btn-icon" title={isVi ? "Sau" : "Next"}><ChevronDown size={16} /></button>
                  <button onClick={() => { setShowSearch(false); setShowReplace(false); }} className="do-btn-icon"><X size={16} /></button>
                </div>
                {showReplace && (
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <input
                      type="text"
                      placeholder={isVi ? "Thay thế bằng..." : "Replace with..."}
                      value={replaceTerm}
                      onChange={e => setReplaceTerm(e.target.value)}
                      style={{ flex: 1, padding: '5px 8px', border: '1px solid var(--do-color-border)', borderRadius: '4px', fontSize: '13px' }}
                    />
                    <button onClick={() => { editor?.commands.setReplaceTerm(replaceTerm); editor?.commands.replace(); }} className="do-btn" style={{ padding: '3px 10px', fontSize: '12px' }}>{isVi ? "Thay thế" : "Replace"}</button>
                    <button onClick={() => { editor?.commands.setReplaceTerm(replaceTerm); editor?.commands.replaceAll(); }} className="do-btn" style={{ padding: '3px 10px', fontSize: '12px' }}>{isVi ? "Tất cả" : "Replace All"}</button>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Comments Drawer */}
        <CommentsDrawer
          isOpen={showCommentsDrawer}
          onClose={() => setShowCommentsDrawer(false)}
          comments={comments}
          onAddComment={handleAddComment}
          onReplyComment={handleReplyComment}
          onToggleResolve={handleToggleResolveComment}
          onDeleteComment={handleDeleteComment}
        />
      </div>

      {/* Modals */}
      <WordCountModal isOpen={showWordCountModal} onClose={() => setShowWordCountModal(false)} stats={wordStats} />
      <SymbolPickerModal isOpen={showSymbolModal} onClose={() => setShowSymbolModal(false)} onSelectSymbol={sym => editor?.chain().focus().insertContent(sym).run()} />
      <LinkModal isOpen={showLinkModal} onClose={() => setShowLinkModal(false)} onApplyLink={handleApplyLink} initialUrl={editor?.getAttributes('link').href || ''} />

      {/* Bottom Status Bar */}
      <div
        style={{ height: '28px', backgroundColor: 'var(--do-color-surface)', borderTop: '1px solid var(--do-color-border)', display: 'flex', alignItems: 'center', padding: '0 1rem', fontSize: '0.78rem', color: 'var(--do-color-text-muted)', justifyContent: 'space-between', userSelect: 'none' }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', cursor: 'pointer' }} onClick={() => setShowWordCountModal(true)}>
          <span>{isVi ? `Trang ${totalPages}` : `Page ${totalPages}`}</span>
          <span style={{ color: 'var(--do-color-border)' }}>|</span>
          <span>{wordStats.words} {isVi ? 'từ' : 'words'}</span>
          <span>{wordStats.characters} {isVi ? 'ký tự' : 'characters'}</span>
          {formatPainterActive && <span style={{ color: 'var(--do-color-primary)', fontWeight: 600 }}>🖌 Format Painter — {isVi ? 'chọn văn bản để sao chép định dạng' : 'select text to apply format'}</span>}
        </div>

        <ZoomControls zoom={zoom} onZoomChange={setZoom} lang={isVi ? 'vi' : 'en'} />
      </div>
    </div>
  );
}
