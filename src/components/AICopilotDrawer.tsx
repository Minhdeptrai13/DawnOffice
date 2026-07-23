import { useState, useEffect, useRef } from 'react';
import { invoke } from '@tauri-apps/api/core';
import { UserProfile } from './GoogleAuthModal';
import { ModuleType } from './Sidebar';
import { X, Send, LogOut, Copy, Check, PlusCircle, Brain, ChevronDown, CheckCircle2, FileText, Paperclip, Mic, RefreshCw, ThumbsUp, Sparkles } from 'lucide-react';
import { DawnBrainLogo, DawnWordLogo, DawnExcelLogo, DawnPowerPointLogo, DawnHomeLogo, DawnSettingsLogo } from './CustomBrandIcons';

interface AICopilotDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  userProfile?: UserProfile | null;
  onLogoutGoogle?: () => void;
  activeModule?: ModuleType;
  lang?: 'vi' | 'en';
  theme?: 'standard' | 'eye-care' | 'dark' | 'system';
}

export interface AIAction {
  type: string;
  [key: string]: any;
}

interface ChatMessage {
  id: string;
  sender: 'ai' | 'user';
  text: string;
  thinkingText?: string;
  actions?: AIAction[];
  approved?: boolean;
  timestamp: string;
}

// Official Model Brand SVG Logos
const OpenAILogo = ({ size = 14, color = 'currentColor' }: { size?: number; color?: string }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M22.2819 9.8211C22.6847 8.5822 22.4274 7.2096 21.6033 6.2081C20.5533 4.9288 18.8476 4.3013 17.2023 4.5888C16.6457 3.3275 15.4851 2.4172 14.1207 2.1856C12.3789 1.8887 10.6015 2.6565 9.71261 4.0863C8.4738 3.6834 7.1011 3.9407 6.0997 4.7648C4.8204 5.8148 4.1929 7.5205 4.4804 9.1658C3.2191 9.7224 2.3088 10.883 2.0772 12.2474C1.7803 13.9892 2.5481 15.7666 3.9779 16.6555C3.575 17.8943 3.8323 19.2669 4.6564 20.2683C5.7064 21.5476 7.4121 22.1751 9.0574 21.8876C9.614 23.1489 10.7746 24.0592 12.139 24.2908C13.8808 24.5877 15.6582 23.8199 16.5471 22.3901C17.7859 22.793 19.1585 22.5357 20.1599 21.7116C21.4392 20.6616 22.0667 18.9559 21.7792 17.3106C23.0405 16.754 23.9508 15.5934 24.1824 14.229C24.4793 12.4872 23.7115 10.7098 22.2819 9.8211Z" fill={color} />
  </svg>
);

const GeminiLogo = ({ size = 14 }: { size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M12 0C12 6.627 6.627 12 0 12C6.627 12 12 17.373 12 24C12 17.373 17.373 12 24 12C17.373 12 12 6.627 12 0Z" fill="url(#gemini_grad_logo)" />
    <defs>
      <linearGradient id="gemini_grad_logo" x1="0" y1="0" x2="24" y2="24" gradientUnits="userSpaceOnUse">
        <stop stopColor="#1E88E5" />
        <stop offset="0.5" stopColor="#9C27B0" />
        <stop offset="1" stopColor="#E91E63" />
      </linearGradient>
    </defs>
  </svg>
);

const DeepSeekLogo = ({ size = 14 }: { size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M12 2L15.09 8.26L22 9.27L17 14.14L18.18 21.02L12 17.77L5.82 21.02L7 14.14L2 9.27L8.91 8.26L12 2Z" fill="#3B82F6" />
  </svg>
);

// Smooth animated toggle switch (replaces native checkbox for a polished feel)
function ToggleSwitch({ checked, onChange, id }: { checked: boolean; onChange: (v: boolean) => void; id: string }) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      id={id}
      onClick={() => onChange(!checked)}
      className="do-copilot-toggle-track"
      style={{
        width: '32px',
        height: '18px',
        borderRadius: '999px',
        border: 'none',
        padding: '2px',
        position: 'relative',
        cursor: 'pointer',
        backgroundColor: checked ? 'var(--do-color-primary)' : 'var(--do-color-border)',
        flexShrink: 0,
      }}
    >
      <span
        className="do-copilot-toggle-knob"
        style={{
          position: 'absolute',
          top: '2px',
          left: checked ? '16px' : '2px',
          width: '14px',
          height: '14px',
          borderRadius: '50%',
          backgroundColor: '#ffffff',
          boxShadow: '0 1px 3px rgba(0,0,0,0.25)',
        }}
      />
    </button>
  );
}

const GLYPH_CHARS = '!<>-_\\/[]{}—=+*^?#_ABCDEF0123456789';

// Text Scramble (Decode) Effect Component using requestAnimationFrame & Accessibility standards
function TextScrambleEffect({ text, isLatest }: { text: string; isLatest: boolean }) {
  const [scrambledText, setScrambledText] = useState(isLatest ? '' : text);
  const animRef = useRef<number | null>(null);

  useEffect(() => {
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    if (!isLatest || prefersReducedMotion || !text) {
      setScrambledText(text);
      return;
    }

    let frame = 0;
    const totalChars = text.length;
    const cyclesPerChar = 2.5;

    const updateScramble = () => {
      frame++;
      let output = '';
      let completeCount = 0;

      for (let i = 0; i < totalChars; i++) {
        const char = text[i];
        if (char === ' ' || char === '\n') {
          output += char;
          completeCount++;
          continue;
        }

        const charSettleFrame = i * cyclesPerChar;
        if (frame >= charSettleFrame + cyclesPerChar * 2) {
          output += char;
          completeCount++;
        } else if (frame >= charSettleFrame) {
          const randomGlyph = GLYPH_CHARS[Math.floor(Math.random() * GLYPH_CHARS.length)];
          output += randomGlyph;
        } else {
          output += ' ';
        }
      }

      setScrambledText(output);

      if (completeCount < totalChars && frame < totalChars * cyclesPerChar + 25) {
        animRef.current = requestAnimationFrame(updateScramble);
      } else {
        setScrambledText(text);
      }
    };

    animRef.current = requestAnimationFrame(updateScramble);

    return () => {
      if (animRef.current) cancelAnimationFrame(animRef.current);
    };
  }, [text, isLatest]);

  return (
    <span
      aria-label={text}
      style={{
        fontFamily: 'Consolas, Monaco, "Courier New", monospace',
        fontVariantNumeric: 'tabular-nums',
        whiteSpace: 'pre-wrap',
        lineHeight: 1.5,
      }}
    >
      <span aria-hidden="true">{scrambledText}</span>
    </span>
  );
}

// Helper to parse AI Reasoning & Action Triggers
function parseAIActions(rawText: string): { thinkingText?: string; displayText: string; actions: AIAction[] } {
  let textToParse = rawText;
  let thinkingText: string | undefined = undefined;

  // Extract <think>...</think> block
  const thinkRegex = /<think>([\s\S]*?)<\/think>/i;
  const thinkMatch = thinkRegex.exec(textToParse);
  if (thinkMatch) {
    thinkingText = thinkMatch[1].trim();
    textToParse = textToParse.replace(thinkRegex, '').trim();
  } else {
    const thinkBracketRegex = /\[THINK\]([\s\S]*?)\[\/THINK\]/i;
    const thinkBracketMatch = thinkBracketRegex.exec(textToParse);
    if (thinkBracketMatch) {
      thinkingText = thinkBracketMatch[1].trim();
      textToParse = textToParse.replace(thinkBracketRegex, '').trim();
    }
  }

  const actions: AIAction[] = [];

  const actionRegex = /\[ACTION:([A-Z_]+)([^\]]*)\]/g;
  let match;
  while ((match = actionRegex.exec(textToParse)) !== null) {
    const actionType = match[1].toLowerCase();
    const paramsString = match[2];
    const params: AIAction = { type: actionType };

    const paramRegex = /([a-zA-Z0-9_]+)\s*=\s*(?:"([^"]*)"|'([^']*)'|(\S+))/g;
    let pMatch;
    while ((pMatch = paramRegex.exec(paramsString)) !== null) {
      const key = pMatch[1];
      const val = pMatch[2] ?? pMatch[3] ?? pMatch[4];
      params[key] = val;
    }
    actions.push(params);
  }

  const jsonActionRegex = /```action\s*\n?([\s\S]*?)\n?```/g;
  let jsonMatch;
  while ((jsonMatch = jsonActionRegex.exec(textToParse)) !== null) {
    try {
      const parsedJson = JSON.parse(jsonMatch[1]);
      if (Array.isArray(parsedJson)) {
        actions.push(...parsedJson);
      } else if (typeof parsedJson === 'object') {
        actions.push(parsedJson);
      }
    } catch { }
  }

  let displayText = textToParse
    .replace(/\[ACTION:[^\]]+\]/g, '')
    .replace(/```action\s*\n?[\s\S]*?\n?```/g, '')
    .trim();

  return { thinkingText, displayText, actions };
}

export default function AICopilotDrawer({
  isOpen,
  onClose,
  userProfile,
  onLogoutGoogle,
  activeModule = 'document',
  lang = 'vi',
  theme = 'standard',
}: AICopilotDrawerProps) {
  const isVi = lang === 'vi';

  // Dynamic OS & DawnSettings Theme Resolution
  const [systemIsDark, setSystemIsDark] = useState(() => window.matchMedia('(prefers-color-scheme: dark)').matches);

  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    const handleChange = (e: MediaQueryListEvent) => setSystemIsDark(e.matches);
    mediaQuery.addEventListener('change', handleChange);
    return () => mediaQuery.removeEventListener('change', handleChange);
  }, []);

  const isDarkMode = theme === 'dark' || (theme === 'system' && systemIsDark);
  const isEyeCareMode = theme === 'eye-care';

  // Theme Palette Tokens
  const themeColors = {
    bg: isDarkMode ? '#09090b' : isEyeCareMode ? '#fbf0d9' : 'rgba(255, 255, 255, 0.72)',
    surface: isDarkMode ? '#18181b' : isEyeCareMode ? '#f5e5c9' : '#ffffff',
    text: isDarkMode ? '#f4f4f5' : isEyeCareMode ? '#433422' : '#0f172a',
    mutedText: isDarkMode ? '#a1a1aa' : isEyeCareMode ? '#7a6449' : '#64748b',
    border: isDarkMode ? 'rgba(255, 255, 255, 0.08)' : isEyeCareMode ? 'rgba(122, 100, 73, 0.2)' : 'rgba(0, 0, 0, 0.08)',
    inputBg: isDarkMode ? '#161b26' : isEyeCareMode ? '#ebd8b6' : 'rgba(255, 255, 255, 0.9)',
    backdropFilter: theme === 'system' ? 'blur(30px) saturate(180%)' : 'blur(20px)',
  };
  const [inputVal, setInputVal] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [selectedModel, setSelectedModel] = useState<'gpt-4o' | 'gemini' | 'deepseek-v3' | 'auto'>('auto');
  const [isModelMenuOpen, setIsModelMenuOpen] = useState(false);
  const [isInputFocused, setIsInputFocused] = useState(false);
  const [enableWebSearch, setEnableWebSearch] = useState(true);
  const [autoApplyActions, setAutoApplyActions] = useState(false);
  const [showThinkingProcess, setShowThinkingProcess] = useState(true);
  const [expandedThinking, setExpandedThinking] = useState<Record<string, boolean>>({});
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const modelMenuRef = useRef<HTMLDivElement>(null);

  // Close model menu when clicking outside of it
  useEffect(() => {
    if (!isModelMenuOpen) return;
    const handleClickOutside = (e: MouseEvent) => {
      if (modelMenuRef.current && !modelMenuRef.current.contains(e.target as Node)) {
        setIsModelMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isModelMenuOpen]);

  // Auto-expand textarea height dynamically (Gemini style)
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = '24px';
      const scrollH = textareaRef.current.scrollHeight;
      textareaRef.current.style.height = `${Math.min(Math.max(24, scrollH), 280)}px`;
    }
  }, [inputVal]);

  const initialWelcomeMsg: ChatMessage = {
    id: 'm-1',
    sender: 'ai',
    text: isVi
      ? `Xin chào! Tôi là DawnChat AI - Trợ lý AI suy nghĩ và lập kế hoạch tự động hóa bộ ứng dụng DawnOffice (${activeModule.toUpperCase()}). Bạn có thể đặt câu hỏi hoặc yêu cầu tạo báo cáo, tạo bảng, đổi font. Tôi sẽ suy nghĩ, trình bày kế hoạch đề xuất và chờ bạn đồng ý trước khi áp dụng vào văn bản!`
      : `Hello! I am DawnChat AI - Autonomous AI Reasoning Copilot for DawnOffice (${activeModule.toUpperCase()}). I will think, plan, and propose changes for your approval before modifying the document!`,
    timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
  };

  const [messages, setMessages] = useState<ChatMessage[]>([initialWelcomeMsg]);

  // Auto-scroll to latest message, smoothly (placed after `messages` is declared)
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth', block: 'end' });
  }, [messages, isLoading]);

  // Insert AI text directly into active DawnOffice editor
  const handleInsertToWorkspace = (text: string, msgId: string) => {
    window.dispatchEvent(new CustomEvent('dawn-insert-copilot-text', { detail: { text } }));
    setCopiedId(`inserted-${msgId}`);
    setTimeout(() => setCopiedId(null), 2500);
  };

  // Copy text to clipboard
  const handleCopyText = (text: string, msgId: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(`copy-${msgId}`);
    setTimeout(() => setCopiedId(null), 2000);
  };

  // Execute AI Actions upon user approval
  const handleApproveActions = (msgId: string, actions: AIAction[]) => {
    window.dispatchEvent(new CustomEvent('dawn-execute-ai-action', { detail: { actions } }));
    setMessages(prev => prev.map(m => m.id === msgId ? { ...m, approved: true } : m));
  };

  const handleSendMessage = async (customPrompt?: string) => {
    const textToSend = customPrompt || inputVal.trim();
    if (!textToSend) return;

    const userMsg: ChatMessage = {
      id: `u-${Date.now()}`,
      sender: 'user',
      text: textToSend,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages(prev => [...prev, userMsg]);
    if (!customPrompt) setInputVal('');
    setIsLoading(true);

    try {
      let responseText = '';

      const prompt = isVi
        ? `Bạn là Dawn AI Agent - Trợ lý AI cao cấp đa năng được tích hợp trực tiếp vào bộ ứng dụng văn phòng DawnOffice (Đang hoạt động trên: ${activeModule.toUpperCase()}).
KĨ NĂNG & QUY TẮC THỰC THI:
1. Viết văn & Soạn thảo chuyên nghiệp: Viết báo cáo, hợp đồng, thư từ, bài phân tích sắc bén, câu từ mượt mà, trình bày đẹp đẽ bằng Markdown.
2. Xử lý Ảnh & Minh họa: Khi người dùng cần ảnh minh họa hoặc tìm ảnh ghép vào văn bản/slide, hãy tự động chèn ảnh trực quan từ Unsplash với cú pháp Markdown: ![Mô tả ảnh](https://source.unsplash.com/featured/?keyword).
3. Tương tác với DawnDoc (Word), DawnSheets (Excel) & DawnSlides (PowerPoint):
   - Nếu ở DawnDoc: Hỗ trợ viết văn, đổi font/cỡ chữ, chèn bảng đẹp, tạo tiêu đề, ngắt trang.
   - Nếu ở DawnSheets: Viết công thức Excel chuẩn (XLOOKUP, SUMIFS, INDEX/MATCH, IFERROR), giải thích logic và lập bảng số liệu.
   - Nếu ở DawnSlides: Thiết kế dàn ý bài thuyết trình chuyên nghiệp, tóm tắt slide, phân chia lộ trình slide 3-5 bước.

HÃY TRẢ LỜI THEO CẤU TRÚC:
1. Viết quá trình suy nghĩ & phân tích kế hoạch vào thẻ <think>1. Phân tích ngữ cảnh... 2. Xây dựng nội dung... 3. Lập lệnh tác động...</think>.
2. Trình bày nội dung chi tiết, văn phong hay, giàu hình ảnh minh họa cho người dùng.
3. Thêm các lệnh tác động tự động [ACTION:...] ở cuối nếu cần:
- [ACTION:INSERT text="Nội dung văn bản"]
- [ACTION:FONT name="Arial"]
- [ACTION:SIZE size="18px"]
- [ACTION:HEADING level="1" text="Tên tiêu đề"]
- [ACTION:PAGE_BREAK]
- [ACTION:TABLE html="<table border='1'>...</table>"]

Thắc mắc người dùng: ${textToSend}`
        : `You are Dawn AI Agent on ${activeModule.toUpperCase()} with full document, spreadsheet formula, presentation design, writing, and image capabilities. Write thinking process inside <think>...</think>, produce beautiful markdown responses with images if requested: ${textToSend}`;

      try {
        const rustResult = await invoke<string>('ask_ai_copilot', { prompt, model: selectedModel });
        if (rustResult && rustResult.trim().length > 0) {
          responseText = rustResult.trim();
        }
      } catch (err) {
        console.warn('Native Rust AI invoke error:', err);
      }

      if (!responseText || responseText.trim().length === 0) {
        responseText = isVi ? '❌ Không thể kết nối tới máy chủ AI. Vui lòng kiểm tra kết nối mạng.' : '❌ Could not reach AI server. Please check your network connection.';
      }

      const { thinkingText, displayText, actions } = parseAIActions(responseText.trim());

      const aiMsg: ChatMessage = {
        id: `ai-${Date.now()}`,
        sender: 'ai',
        text: displayText || responseText.trim(),
        thinkingText,
        actions: actions.length > 0 ? actions : undefined,
        approved: false,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };
      setMessages(prev => [...prev, aiMsg]);
    } catch (err: any) {
      const errorMsg: ChatMessage = {
        id: `ai-${Date.now()}`,
        sender: 'ai',
        text: `❌ Lỗi kết nối AI: ${err?.message || err}`,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };
      setMessages(prev => [...prev, errorMsg]);
    } finally {
      setIsLoading(false);
    }
  };

  // Quick prompt chips depending on active module
  const quickPrompts = activeModule === 'spreadsheet'
    ? [
      isVi ? 'Lập công thức XLOOKUP & Tổng hợp' : 'XLOOKUP & Summary',
      isVi ? 'Tính tổng doanh thu SUMIFS' : 'SUMIFS Total',
      isVi ? 'Bọc chống lỗi IFERROR' : 'IFERROR formula',
    ]
    : activeModule === 'presentation'
      ? [
        isVi ? 'Dàn ý Slide giới thiệu dự án' : 'Project Pitch Outline',
        isVi ? 'Lộ trình 4 bước triển khai' : '4-Step Roadmap',
      ]
      : [
        isVi ? 'Soạn Báo cáo So sánh các AI' : 'Draft AI Comparison Report',
        isVi ? 'Đổi font chữ sang Arial 16px' : 'Change Font Arial 16px',
        isVi ? 'Chèn bảng So sánh AI nổi tiếng' : 'Insert AI Comparison Table',
        isVi ? 'Tạo trang mới' : 'Insert New Page',
      ];

  if (!isOpen) return null;

  return (
    <>
      <style>{`
        @keyframes do-fade-in { from { opacity: 0; } to { opacity: 1; } }
        @keyframes do-slide-in-right { from { transform: translateX(100%); } to { transform: translateX(0); } }
        @keyframes do-fade-in-up { from { opacity: 0; transform: translateY(6px); } to { opacity: 1; transform: translateY(0); } }
        @keyframes do-pop-in { from { opacity: 0; transform: scale(0.92) translateY(6px); } to { opacity: 1; transform: scale(1) translateY(0); } }
        @keyframes do-bounce-dot { 0%, 60%, 100% { transform: translateY(0); opacity: 0.45; } 30% { transform: translateY(-4px); opacity: 1; } }
        @keyframes do-border-beam {
          0% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
          100% { background-position: 0% 50%; }
        }

        .do-copilot-backdrop { animation: do-fade-in 0.2s ease; }
        .do-copilot-drawer { animation: do-slide-in-right 0.3s cubic-bezier(0.16, 1, 0.3, 1); }
        .do-copilot-msg { animation: do-fade-in-up 0.25s cubic-bezier(0.16, 1, 0.3, 1) both; position: relative; }
        .do-copilot-menu-pop { animation: do-pop-in 0.16s cubic-bezier(0.16, 1, 0.3, 1) both; }

        .do-copilot-scroll::-webkit-scrollbar { width: 5px; }
        .do-copilot-scroll::-webkit-scrollbar-track { background: transparent; }
        .do-copilot-scroll::-webkit-scrollbar-thumb { background: rgba(255,255,255,0.12); border-radius: 10px; }
        .do-copilot-scroll::-webkit-scrollbar-thumb:hover { background: #6366f1; }

        .do-copilot-iconbtn { transition: transform 0.15s ease, background-color 0.15s ease; }
        .do-copilot-iconbtn:hover { transform: scale(1.08); }
        .do-copilot-iconbtn:active { transform: scale(0.92); }

        .do-copilot-chip { transition: transform 0.18s cubic-bezier(0.16, 1, 0.3, 1), box-shadow 0.18s ease, background-color 0.18s ease, border-color 0.18s ease; }
        .do-copilot-chip:hover { transform: translateY(-2px); box-shadow: 0 6px 16px rgba(99,102,241,0.22); border-color: rgba(99,102,241,0.4) !important; }
        .do-copilot-chip:active { transform: translateY(0); }

        .do-copilot-send { transition: transform 0.15s cubic-bezier(0.4,0,0.2,1), opacity 0.15s ease, background-color 0.15s ease; }
        .do-copilot-send:hover:not(:disabled) { transform: scale(1.08); box-shadow: 0 4px 14px rgba(99,102,241,0.5); }
        .do-copilot-send:active:not(:disabled) { transform: scale(0.92); }

        .do-copilot-action-bar { opacity: 0; transition: opacity 0.2s ease, transform 0.2s ease; transform: translateY(2px); }
        .do-copilot-msg:hover .do-copilot-action-bar { opacity: 1; transform: translateY(0); }

        .do-copilot-thinking-box {
          background: linear-gradient(90deg, rgba(99,102,241,0.15), rgba(139,92,246,0.15), rgba(16,185,129,0.15));
          background-size: 200% 200%;
          animation: do-border-beam 4s ease infinite;
        }

        .do-copilot-model-btn { transition: transform 0.15s ease, box-shadow 0.15s ease; }
        .do-copilot-model-btn:hover { transform: translateY(-1px); }
        .do-copilot-model-btn:active { transform: translateY(0); }

        .do-copilot-approve-btn { transition: transform 0.15s ease, box-shadow 0.15s ease; }
        .do-copilot-approve-btn:hover { transform: translateY(-1px); box-shadow: 0 4px 14px rgba(99,102,241,0.4); }
        .do-copilot-approve-btn:active { transform: translateY(0); }

        .do-copilot-toggle-track { transition: background-color 0.2s ease; }
        .do-copilot-toggle-knob { transition: left 0.2s cubic-bezier(0.4, 0, 0.2, 1); }

        .do-copilot-thinking-body { transition: grid-template-rows 0.22s cubic-bezier(0.4, 0, 0.2, 1); display: grid; }

        @media (prefers-reduced-motion: reduce) {
          .do-copilot-backdrop, .do-copilot-drawer, .do-copilot-msg, .do-copilot-menu-pop { animation: none !important; }
          .do-copilot-iconbtn, .do-copilot-chip, .do-copilot-send, .do-copilot-model-btn, .do-copilot-approve-btn { transition: none !important; }
        }
      `}</style>

      <div
        className="do-copilot-backdrop"
        onClick={onClose}
        style={{
          position: 'fixed',
          inset: 0,
          backgroundColor: 'rgba(15, 23, 42, 0.28)',
          zIndex: 99998,
        }}
      />

      <div
        className="do-copilot-drawer"
        style={{
          position: 'fixed',
          top: '12px',
          right: '12px',
          bottom: '12px',
          width: 'min(500px, calc(100vw - 24px))',
          backgroundColor: themeColors.bg,
          borderRadius: '20px',
          boxShadow: isDarkMode ? '0 25px 60px rgba(0,0,0,0.7), 0 0 0 1px rgba(255,255,255,0.1)' : '0 20px 50px rgba(0,0,0,0.15), 0 0 0 1px ' + themeColors.border,
          zIndex: 99999,
          display: 'flex',
          flexDirection: 'column',
          backdropFilter: themeColors.backdropFilter,
          overflow: 'hidden',
          color: themeColors.text,
          fontFamily: '"Plus Jakarta Sans", "Inter", -apple-system, sans-serif',
          transition: 'background-color 0.3s ease, color 0.3s ease',
        }}
      >
        {/* Drawer Main Header */}
        <div
          style={{
            padding: '1rem 1.25rem',
            borderBottom: `1px solid ${themeColors.border}`,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            background: 'linear-gradient(135deg, rgba(99,102,241,0.15) 0%, rgba(139,92,246,0.15) 100%)',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <DawnBrainLogo size={36} />
            <div>
              <h3 style={{ margin: 0, fontSize: '1.08rem', fontWeight: 800, color: themeColors.text, letterSpacing: '-0.2px' }}>
                DawnChat AI
              </h3>
              <div style={{ fontSize: '0.74rem', color: '#818cf8', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '5px', marginTop: '2px' }}>
                {activeModule === 'document' && <><DawnWordLogo size={16} /> <span>DawnDoc (Word)</span></>}
                {activeModule === 'spreadsheet' && <><DawnExcelLogo size={16} /> <span>DawnSheets (Excel)</span></>}
                {activeModule === 'presentation' && <><DawnPowerPointLogo size={16} /> <span>DawnSlides (PowerPoint)</span></>}
                {activeModule === 'welcome' && <><DawnHomeLogo size={16} /> <span>Welcome Hub</span></>}
                {activeModule === 'settings' && <><DawnSettingsLogo size={16} /> <span>Cài đặt</span></>}
              </div>
            </div>
          </div>

          <button className="do-btn-icon do-copilot-iconbtn" onClick={onClose} style={{ borderRadius: '8px', color: themeColors.mutedText, border: 'none', background: 'none', cursor: 'pointer' }}>
            <X size={18} />
          </button>
        </div>

        {/* Clean Options Toolbar */}
        <div
          style={{
            padding: '0.55rem 1.25rem',
            backgroundColor: isDarkMode ? '#0f0f13' : 'rgba(0,0,0,0.02)',
            borderBottom: `1px solid ${themeColors.border}`,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            fontSize: '0.76rem',
            flexWrap: 'wrap',
            gap: '12px',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <ToggleSwitch id="switch-web-search" checked={enableWebSearch} onChange={setEnableWebSearch} />
            <label htmlFor="switch-web-search" style={{ fontWeight: 600, color: themeColors.mutedText, cursor: 'pointer', userSelect: 'none' }}>
              {isVi ? 'Tìm kiếm Web' : 'Web Search'}
            </label>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <ToggleSwitch id="switch-auto-apply" checked={autoApplyActions} onChange={setAutoApplyActions} />
            <label htmlFor="switch-auto-apply" style={{ fontWeight: 600, color: themeColors.mutedText, cursor: 'pointer', userSelect: 'none' }}>
              {isVi ? 'Tự áp dụng' : 'Auto Apply'}
            </label>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <ToggleSwitch id="choice-show-thinking" checked={showThinkingProcess} onChange={setShowThinkingProcess} />
            <label htmlFor="choice-show-thinking" style={{ fontWeight: 600, color: themeColors.mutedText, cursor: 'pointer', userSelect: 'none' }}>
              {isVi ? 'Hiện suy nghĩ' : 'Show Thinking'}
            </label>
          </div>
        </div>

        {/* Clean User Profile Header */}
        {userProfile && (
          <div style={{ padding: '0.55rem 1.25rem', backgroundColor: 'rgba(99,102,241,0.04)', borderBottom: '1px solid rgba(255,255,255,0.06)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <img src={userProfile.avatar} alt="Avatar" style={{ width: '26px', height: '26px', borderRadius: '50%', border: '1.5px solid #6366f1' }} />
              <span style={{ fontSize: '0.78rem', fontWeight: 800, color: '#f4f4f5' }}>{userProfile.name}</span>
              <span style={{ fontSize: '0.70rem', color: '#71717a' }}>({userProfile.email})</span>
            </div>
            {onLogoutGoogle && (
              <button className="do-btn-icon do-copilot-iconbtn" onClick={onLogoutGoogle} title={isVi ? 'Đăng xuất Google' : 'Logout Google'} style={{ padding: '4px', borderRadius: '6px' }}>
                <LogOut size={14} color="#ef4444" />
              </button>
            )}
          </div>
        )}

        {/* Frameless Flat Messages List */}
        <div className="do-copilot-scroll" style={{ flex: 1, padding: '1.2rem', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '1.25rem', backgroundColor: 'transparent' }}>
          {messages.map((msg, idx) => (
            <div key={msg.id} className="do-copilot-msg" style={{ display: 'flex', flexDirection: 'column', alignItems: 'stretch' }}>
              {/* Frameless Flat Layout Box */}
              <div
                style={{
                  padding: msg.sender === 'ai' ? '14px 16px' : '10px 14px',
                  borderRadius: msg.sender === 'ai' ? '16px' : '16px 16px 4px 16px',
                  backgroundColor: msg.sender === 'ai' ? themeColors.surface : 'rgba(99,102,241,0.2)',
                  color: themeColors.text,
                  border: msg.sender === 'ai' ? `1px solid ${themeColors.border}` : '1px solid rgba(99,102,241,0.35)',
                  fontSize: '0.88rem',
                  lineHeight: 1.6,
                  boxShadow: msg.sender === 'ai' ? (isDarkMode ? '0 4px 20px rgba(0,0,0,0.3)' : '0 4px 14px rgba(0,0,0,0.05)') : 'none',
                  alignSelf: msg.sender === 'user' ? 'flex-end' : 'stretch',
                  maxWidth: msg.sender === 'user' ? '88%' : '100%',
                }}
              >
                {msg.sender === 'ai' && (
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: '11px', fontWeight: 800, color: '#818cf8', marginBottom: '10px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <DawnBrainLogo size={20} />
                      <span>DawnChat AI Agent</span>
                    </div>
                    <span style={{ fontSize: '10px', color: '#71717a', fontWeight: 500 }}>{msg.timestamp}</span>
                  </div>
                )}

                {/* Thinking / Reasoning Accordion Drawer with Border Beam Effect */}
                {msg.thinkingText && showThinkingProcess && (
                  <div
                    className="do-copilot-thinking-box"
                    style={{
                      marginBottom: '12px',
                      borderRadius: '12px',
                      padding: '1px',
                      overflow: 'hidden',
                    }}
                  >
                    <div style={{ backgroundColor: '#0f0f13', borderRadius: '11px', overflow: 'hidden' }}>
                      <div
                        onClick={() => setExpandedThinking(prev => ({ ...prev, [msg.id]: !prev[msg.id] }))}
                        style={{
                          padding: '8px 12px',
                          fontSize: '0.75rem',
                          fontWeight: 700,
                          color: '#a1a1aa',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'space-between',
                          cursor: 'pointer',
                          userSelect: 'none',
                        }}
                      >
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                          <span style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: '#6366f1', boxShadow: '0 0 8px #6366f1' }} />
                          <Brain size={14} color="#818cf8" />
                          <span>{isVi ? '🧠 Quá trình Suy nghĩ & Kế hoạch AI' : '🧠 AI Reasoning & Planning'}</span>
                        </div>
                        <ChevronDown
                          size={14}
                          style={{
                            transition: 'transform 0.2s ease',
                            transform: expandedThinking[msg.id] !== false ? 'rotate(180deg)' : 'rotate(0deg)',
                          }}
                        />
                      </div>
                      <div
                        className="do-copilot-thinking-body"
                        style={{ gridTemplateRows: expandedThinking[msg.id] !== false ? '1fr' : '0fr' }}
                      >
                        <div style={{ overflow: 'hidden', minHeight: 0 }}>
                          <div
                            style={{
                              padding: '10px 12px',
                              borderTop: '1px solid rgba(255,255,255,0.06)',
                              fontSize: '0.75rem',
                              color: '#71717a',
                              fontFamily: 'Consolas, Monaco, monospace',
                              lineHeight: 1.5,
                              whiteSpace: 'pre-wrap',
                              backgroundColor: '#09090b',
                            }}
                          >
                            {msg.thinkingText}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* Message Content */}
                <div style={{ color: msg.sender === 'user' ? '#ffffff' : '#e4e4e7' }}>
                  {msg.sender === 'ai' ? (
                    <TextScrambleEffect text={msg.text} isLatest={idx === messages.length - 1} />
                  ) : (
                    msg.text
                  )}
                </div>

                {/* Action Plan Report Card & Approval Request */}
                {msg.actions && msg.actions.length > 0 && (
                  <div
                    style={{
                      marginTop: '12px',
                      padding: '12px 14px',
                      borderRadius: '12px',
                      backgroundColor: msg.approved ? 'rgba(16,185,129,0.08)' : 'rgba(99,102,241,0.08)',
                      border: msg.approved ? '1px solid rgba(16,185,129,0.3)' : '1px solid rgba(99,102,241,0.25)',
                      fontSize: '0.78rem',
                      display: 'flex',
                      flexDirection: 'column',
                      gap: '8px',
                    }}
                  >
                    <div style={{ fontWeight: 800, color: msg.approved ? '#10b981' : '#818cf8', display: 'flex', alignItems: 'center', gap: '6px' }}>
                      {msg.approved ? <CheckCircle2 size={15} color="#10b981" /> : <FileText size={15} color="#818cf8" />}
                      <span>{msg.approved ? '✅ Đã áp dụng thành công vào Văn bản:' : `📋 Kế hoạch Đề xuất Thay đổi (${msg.actions.length} tác vụ):`}</span>
                    </div>

                    <div style={{ color: '#a1a1aa', fontSize: '0.74rem', paddingLeft: '4px' }}>
                      {msg.actions.map((act, idx) => (
                        <div key={idx} style={{ marginBottom: '3px' }}>
                          • {act.type === 'insert' || act.type === 'insert_text' ? `Chèn nội dung văn bản` :
                            act.type === 'font' || act.type === 'set_font' ? `Đổi Font: ${act.name || act.font}` :
                              act.type === 'size' || act.type === 'set_font_size' ? `Đổi cỡ chữ: ${act.size}` :
                                act.type === 'heading' || act.type === 'add_heading' ? `Tạo Tiêu đề: "${act.text}"` :
                                  act.type === 'page_break' || act.type === 'create_page' ? `Ngắt trang mới` :
                                    act.type === 'table' || act.type === 'create_table' ? `Tạo bảng (${act.rows || 3}x${act.cols || 3})` :
                                      act.type}
                        </div>
                      ))}
                    </div>

                    {!msg.approved ? (
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: '4px' }}>
                        <button
                          onClick={() => msg.actions && handleApproveActions(msg.id, msg.actions)}
                          className="do-copilot-approve-btn"
                          style={{
                            padding: '6px 14px',
                            borderRadius: '8px',
                            background: 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)',
                            color: '#ffffff',
                            border: 'none',
                            fontSize: '0.76rem',
                            fontWeight: 700,
                            cursor: 'pointer',
                            boxShadow: '0 3px 12px rgba(99,102,241,0.4)',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '5px',
                          }}
                        >
                          <Check size={14} />
                          <span>Đồng ý & Áp dụng ngay</span>
                        </button>
                      </div>
                    ) : (
                      <button
                        onClick={() => msg.actions && handleApproveActions(msg.id, msg.actions)}
                        style={{
                          alignSelf: 'flex-start',
                          marginTop: '2px',
                          padding: '4px 10px',
                          borderRadius: '6px',
                          backgroundColor: 'transparent',
                          color: '#a1a1aa',
                          border: '1px solid rgba(255,255,255,0.12)',
                          fontSize: '0.72rem',
                          fontWeight: 600,
                          cursor: 'pointer',
                        }}
                      >
                        Áp dụng lại
                      </button>
                    )}
                  </div>
                )}

                {/* Action Toolbar (Visible on Hover for AI Messages) */}
                {msg.sender === 'ai' && msg.id !== 'm-1' && (
                  <div className="do-copilot-action-bar" style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: '10px', paddingTop: '8px', borderTop: '1px solid rgba(255,255,255,0.06)' }}>
                    <button
                      onClick={() => handleInsertToWorkspace(msg.text, msg.id)}
                      className="do-copilot-approve-btn"
                      style={{
                        padding: '4px 10px',
                        borderRadius: '6px',
                        backgroundColor: '#6366f1',
                        color: '#ffffff',
                        border: 'none',
                        fontSize: '0.73rem',
                        fontWeight: 700,
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '4px',
                      }}
                    >
                      {copiedId === `inserted-${msg.id}` ? <Check size={13} /> : <PlusCircle size={13} />}
                      <span>{copiedId === `inserted-${msg.id}` ? (isVi ? 'Đã chèn!' : 'Inserted!') : (isVi ? 'Chèn vào trang' : 'Insert')}</span>
                    </button>

                    <button
                      onClick={() => handleCopyText(msg.text, msg.id)}
                      className="do-copilot-iconbtn"
                      style={{
                        padding: '4px 8px',
                        borderRadius: '6px',
                        backgroundColor: 'rgba(255,255,255,0.05)',
                        color: '#a1a1aa',
                        border: '1px solid rgba(255,255,255,0.08)',
                        fontSize: '0.73rem',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '4px',
                      }}
                    >
                      {copiedId === `copy-${msg.id}` ? <Check size={13} color="#10b981" /> : <Copy size={13} />}
                      <span>{copiedId === `copy-${msg.id}` ? 'Đã chép' : 'Sao chép'}</span>
                    </button>

                    <button className="do-copilot-iconbtn" style={{ padding: '4px 6px', borderRadius: '6px', backgroundColor: 'transparent', color: '#71717a', border: 'none', cursor: 'pointer' }} title="Hài lòng">
                      <ThumbsUp size={13} />
                    </button>
                    <button className="do-copilot-iconbtn" style={{ padding: '4px 6px', borderRadius: '6px', backgroundColor: 'transparent', color: '#71717a', border: 'none', cursor: 'pointer' }} title="Thử lại">
                      <RefreshCw size={13} />
                    </button>
                  </div>
                )}
              </div>
            </div>
          ))}

          {isLoading && (
            <div className="do-copilot-msg" style={{ fontSize: '0.82rem', color: '#818cf8', fontStyle: 'italic', display: 'flex', alignItems: 'center', gap: '10px', padding: '12px 16px', backgroundColor: '#18181b', borderRadius: '16px', border: '1px solid rgba(99,102,241,0.2)' }}>
              <span style={{ display: 'flex', gap: '4px', alignItems: 'center' }}>
                <span style={{ width: '6px', height: '6px', borderRadius: '50%', backgroundColor: '#6366f1', display: 'inline-block', animation: 'do-bounce-dot 1.1s ease-in-out infinite' }} />
                <span style={{ width: '6px', height: '6px', borderRadius: '50%', backgroundColor: '#8b5cf6', display: 'inline-block', animation: 'do-bounce-dot 1.1s ease-in-out 0.15s infinite' }} />
                <span style={{ width: '6px', height: '6px', borderRadius: '50%', backgroundColor: '#10b981', display: 'inline-block', animation: 'do-bounce-dot 1.1s ease-in-out 0.3s infinite' }} />
              </span>
              <span>{isVi ? 'Dawn AI Agent đang suy nghĩ & lập kế hoạch...' : 'Dawn AI Agent is thinking & planning...'}</span>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Bento Grid Suggestion Prompt Cards */}
        <div style={{ padding: '8px 1.2rem', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))', gap: '8px', backgroundColor: 'transparent', borderTop: `1px solid ${themeColors.border}` }}>
          {quickPrompts.map((p, i) => (
            <button
              key={i}
              onClick={() => handleSendMessage(p)}
              className="do-copilot-chip"
              style={{
                textAlign: 'left',
                padding: '8px 10px',
                borderRadius: '12px',
                backgroundColor: themeColors.surface,
                color: themeColors.text,
                border: `1px solid ${themeColors.border}`,
                fontSize: '0.74rem',
                fontWeight: 600,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
              }}
            >
              <Sparkles size={12} color="#6366f1" />
              <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{p}</span>
            </button>
          ))}
        </div>

        {/* Floating Glassmorphism Input Bar (border-radius 24px, Backdrop Blur, Integrated File & Mic) */}
        <div style={{ padding: '0.85rem 1.2rem', backgroundColor: 'transparent', borderTop: `1px solid ${themeColors.border}` }}>
          <div style={{ fontSize: '0.7rem', color: themeColors.mutedText, marginBottom: '8px', display: 'flex', alignItems: 'center', gap: '6px' }}>
            <span style={{ display: 'inline-block', width: '6px', height: '6px', borderRadius: '50%', backgroundColor: '#10b981' }} />
            <span>{isVi ? 'Đang hoạt động trên:' : 'Currently on:'}</span>
            <span style={{ color: '#818cf8', fontWeight: 700 }}>
              {activeModule === 'document' ? 'DawnDoc (Word)' :
                activeModule === 'spreadsheet' ? 'DawnSheets (Excel)' :
                  activeModule === 'presentation' ? 'DawnSlides (PowerPoint)' :
                    activeModule === 'welcome' ? 'Welcome Hub' : 'Cài đặt'}
            </span>
          </div>

          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              backgroundColor: themeColors.inputBg,
              border: isInputFocused ? '1.5px solid #6366f1' : `1px solid ${themeColors.border}`,
              borderRadius: '24px',
              padding: '6px 8px 6px 14px',
              boxShadow: isInputFocused ? '0 0 20px rgba(99,102,241,0.25)' : (isDarkMode ? '0 4px 20px rgba(0,0,0,0.4)' : '0 4px 16px rgba(0,0,0,0.06)'),
              transition: 'all 0.22s cubic-bezier(0.4, 0, 0.2, 1)',
              position: 'relative',
              backdropFilter: 'blur(12px)',
            }}
          >
            {/* File Attachment Button */}
            <button
              type="button"
              className="do-copilot-iconbtn"
              style={{ background: 'none', border: 'none', color: themeColors.mutedText, cursor: 'pointer', padding: '4px' }}
              title={isVi ? 'Đính kèm tệp' : 'Attach File'}
            >
              <Paperclip size={16} />
            </button>

            <textarea
              ref={textareaRef}
              rows={1}
              className="do-chat-input"
              disabled={isLoading}
              value={inputVal}
              onChange={e => setInputVal(e.target.value)}
              onFocus={() => setIsInputFocused(true)}
              onBlur={() => setIsInputFocused(false)}
              onKeyDown={e => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault();
                  handleSendMessage();
                }
              }}
              placeholder={
                activeModule === 'spreadsheet' ? (isVi ? 'Hỏi DawnChat AI về Bảng tính Excel...' : 'Ask DawnChat AI about Excel...') :
                  activeModule === 'document' ? (isVi ? 'Hỏi DawnChat AI về Văn bản Word...' : 'Ask DawnChat AI about Word...') :
                    activeModule === 'presentation' ? (isVi ? 'Hỏi DawnChat AI về Slide PowerPoint...' : 'Ask DawnChat AI about PowerPoint...') :
                      (isVi ? 'Nhập tin nhắn cho DawnChat AI...' : 'Type a message to DawnChat AI...')
              }
              style={{
                flex: 1,
                border: 'none',
                outline: 'none',
                boxShadow: 'none',
                backgroundColor: 'transparent',
                fontSize: '0.88rem',
                color: themeColors.text,
                padding: '6px 0',
                resize: 'none',
                lineHeight: '1.45',
                maxHeight: '280px',
                overflowY: 'auto',
                fontFamily: 'inherit',
              }}
            />

            {/* Microphone Voice Button */}
            <button
              type="button"
              className="do-copilot-iconbtn"
              style={{ background: 'none', border: 'none', color: '#71717a', cursor: 'pointer', padding: '4px' }}
              title={isVi ? 'Nhập bằng giọng nói' : 'Voice Input'}
            >
              <Mic size={16} />
            </button>

            {/* Embedded Model Selector Badge inside Input Box */}
            <div ref={modelMenuRef} style={{ position: 'relative' }}>
              <button
                type="button"
                className="do-copilot-model-btn"
                onClick={() => setIsModelMenuOpen(prev => !prev)}
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '6px',
                  padding: '5px 10px',
                  borderRadius: '20px',
                  background: selectedModel === 'auto' ? 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)' : '#27272a',
                  color: '#ffffff',
                  border: 'none',
                  fontSize: '0.74rem',
                  fontWeight: 700,
                  cursor: 'pointer',
                  whiteSpace: 'nowrap',
                }}
                title={isVi ? 'Đổi mô hình AI' : 'Change AI Model'}
              >
                {selectedModel === 'auto' && <DawnBrainLogo size={15} />}
                {selectedModel === 'gpt-4o' && <OpenAILogo size={13} color="#10a37f" />}
                {selectedModel === 'gemini' && <GeminiLogo size={13} />}
                {selectedModel === 'deepseek-v3' && <DeepSeekLogo size={13} />}
                <span>
                  {selectedModel === 'auto' ? 'Tự động' :
                    selectedModel === 'gpt-4o' ? 'GPT-4o' :
                      selectedModel === 'gemini' ? 'Gemini' : 'DeepSeek-V3'}
                </span>
                <ChevronDown size={12} style={{ opacity: 0.7 }} />
              </button>

              {/* Model Selector Popup Menu */}
              {isModelMenuOpen && (
                <div
                  className="do-copilot-menu-pop"
                  style={{
                    position: 'absolute',
                    bottom: 'calc(100% + 12px)',
                    right: 0,
                    transformOrigin: 'bottom right',
                    backgroundColor: '#18181b',
                    border: '1px solid rgba(255,255,255,0.1)',
                    borderRadius: '16px',
                    boxShadow: '0 16px 40px rgba(0,0,0,0.6)',
                    padding: '8px',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '3px',
                    zIndex: 99999,
                    minWidth: '210px',
                  }}
                >
                  <div style={{ padding: '4px 8px 6px', fontSize: '0.68rem', fontWeight: 700, color: '#71717a', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                    {isVi ? 'Chọn mô hình AI' : 'Choose AI model'}
                  </div>
                  {[
                    { id: 'auto', label: 'Tự động', desc: 'Auto Smart Router', logo: <DawnBrainLogo size={18} />, bg: 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)' },
                    { id: 'gpt-4o', label: 'GPT-4o', desc: 'OpenAI GPT-4o', logo: <OpenAILogo size={15} color="#10a37f" />, bg: 'rgba(16,163,127,0.15)' },
                    { id: 'gemini', label: 'Gemini', desc: 'Google Gemini Pro', logo: <GeminiLogo size={15} />, bg: 'rgba(156,39,176,0.15)' },
                    { id: 'deepseek-v3', label: 'DeepSeek-V3', desc: 'DeepSeek Thinking', logo: <DeepSeekLogo size={15} />, bg: 'rgba(59,130,246,0.15)' },
                  ].map(m => (
                    <button
                      key={m.id}
                      type="button"
                      onClick={() => {
                        setSelectedModel(m.id as any);
                        setIsModelMenuOpen(false);
                      }}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '10px',
                        padding: '7px 8px',
                        borderRadius: '10px',
                        border: 'none',
                        backgroundColor: selectedModel === m.id ? 'rgba(99,102,241,0.15)' : 'transparent',
                        color: '#f4f4f5',
                        cursor: 'pointer',
                        textAlign: 'left',
                        width: '100%',
                      }}
                    >
                      <span
                        style={{
                          width: '28px',
                          height: '28px',
                          borderRadius: '8px',
                          background: m.bg,
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          flexShrink: 0,
                        }}
                      >
                        {m.logo}
                      </span>
                      <span style={{ display: 'flex', flexDirection: 'column', gap: '1px', minWidth: 0 }}>
                        <span style={{ fontSize: '0.8rem', fontWeight: 700, color: selectedModel === m.id ? '#818cf8' : '#f4f4f5' }}>
                          {m.label}
                        </span>
                        <span style={{ fontSize: '0.68rem', color: '#71717a', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                          {m.desc}
                        </span>
                      </span>
                      {selectedModel === m.id && <CheckCircle2 size={15} style={{ marginLeft: 'auto', color: '#6366f1', flexShrink: 0 }} />}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Send Button */}
            <button
              onClick={() => handleSendMessage()}
              disabled={!inputVal.trim() || isLoading}
              className="do-btn do-copilot-send"
              style={{
                width: '34px',
                height: '34px',
                borderRadius: '50%',
                padding: 0,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                backgroundColor: '#6366f1',
                color: '#ffffff',
                opacity: !inputVal.trim() || isLoading ? 0.4 : 1,
                border: 'none',
                flexShrink: 0,
                cursor: 'pointer',
              }}
            >
              <Send size={15} />
            </button>
          </div>
        </div>
      </div>
    </>
  );
}