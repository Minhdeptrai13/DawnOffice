import { useState, useEffect } from 'react';
import { Palette, Keyboard, Check, ShieldCheck, Crown, Sun, Moon, Eye, Monitor, FileText, Sparkles, Sliders, Search, Command } from 'lucide-react';
import DawnLogoAnimated from '../components/DawnLogoAnimated';

interface DawnSettingsProps {
  lang: 'vi' | 'en';
  onLanguageChange: (lang: 'vi' | 'en') => void;
  theme: 'standard' | 'eye-care' | 'dark' | 'system';
  onThemeChange: (theme: 'standard' | 'eye-care' | 'dark' | 'system') => void;
}

const PRIMARY_ACCENT_COLORS = [
  { name: 'Royal Blue (Mặc định)', value: '#2563eb', gradient: 'linear-gradient(135deg, #2563eb, #3b82f6)' },
  { name: 'Emerald Green', value: '#10b981', gradient: 'linear-gradient(135deg, #10b981, #059669)' },
  { name: 'Violet Purple', value: '#8b5cf6', gradient: 'linear-gradient(135deg, #8b5cf6, #7c3aed)' },
  { name: 'Rose Pink', value: '#f43f5e', gradient: 'linear-gradient(135deg, #f43f5e, #e11d48)' },
  { name: 'Amber Gold', value: '#f59e0b', gradient: 'linear-gradient(135deg, #f59e0b, #d97706)' },
  { name: 'Cyber Cyan', value: '#06b6d4', gradient: 'linear-gradient(135deg, #06b6d4, #0891b2)' },
];

interface ShortcutItem {
  category: 'system' | 'word' | 'sheets' | 'slides';
  actionVi: string;
  actionEn: string;
  keys: string[];
}

const SHORTCUTS_DATA: ShortcutItem[] = [
  // System / General
  { category: 'system', actionVi: 'Lưu tài liệu hiện tại', actionEn: 'Save current document', keys: ['Ctrl', 'S'] },
  { category: 'system', actionVi: 'Mở tệp tin máy tính', actionEn: 'Open local file', keys: ['Ctrl', 'O'] },
  { category: 'system', actionVi: 'Tạo tài liệu mới', actionEn: 'Create new document', keys: ['Ctrl', 'N'] },
  { category: 'system', actionVi: 'In tệp / Xuất bản PDF', actionEn: 'Print / Export PDF', keys: ['Ctrl', 'P'] },
  { category: 'system', actionVi: 'Bật/Tắt Chế độ Tập trung (Immersive)', actionEn: 'Toggle Immersive Focus mode', keys: ['Ctrl', 'Shift', 'F'] },
  { category: 'system', actionVi: 'Bật/Tắt Toàn màn hình', actionEn: 'Toggle Fullscreen mode', keys: ['F11'] },
  { category: 'system', actionVi: 'Đóng tệp đang soạn thảo', actionEn: 'Close active file', keys: ['Ctrl', 'W'] },

  // Word (DawnDocument)
  { category: 'word', actionVi: 'In đậm văn bản (Bold)', actionEn: 'Bold selected text', keys: ['Ctrl', 'B'] },
  { category: 'word', actionVi: 'In nghiêng văn bản (Italic)', actionEn: 'Italicize selected text', keys: ['Ctrl', 'I'] },
  { category: 'word', actionVi: 'Gạch chân văn bản (Underline)', actionEn: 'Underline selected text', keys: ['Ctrl', 'U'] },
  { category: 'word', actionVi: 'Hoàn tác thao tác vừa làm', actionEn: 'Undo previous action', keys: ['Ctrl', 'Z'] },
  { category: 'word', actionVi: 'Làm lại thao tác vừa hoàn tác', actionEn: 'Redo action', keys: ['Ctrl', 'Y'] },
  { category: 'word', actionVi: 'Căn lề trái đoạn văn', actionEn: 'Align text left', keys: ['Ctrl', 'Shift', 'L'] },
  { category: 'word', actionVi: 'Căn giữa đoạn văn', actionEn: 'Align text center', keys: ['Ctrl', 'Shift', 'E'] },
  { category: 'word', actionVi: 'Căn lề phải đoạn văn', actionEn: 'Align text right', keys: ['Ctrl', 'Shift', 'R'] },
  { category: 'word', actionVi: 'Chèn liên kết đường dẫn Web', actionEn: 'Insert Web Hyperlink', keys: ['Ctrl', 'K'] },
  { category: 'word', actionVi: 'Tìm kiếm từ khóa trong bài', actionEn: 'Find text in document', keys: ['Ctrl', 'F'] },
  { category: 'word', actionVi: 'Tìm kiếm & Thay thế từ khóa', actionEn: 'Find and replace text', keys: ['Ctrl', 'H'] },

  // Sheets (DawnSheets)
  { category: 'sheets', actionVi: 'Nhập dữ liệu ô & Giữ nguyên vị trí ô', actionEn: 'Enter data & stay on cell', keys: ['Ctrl', 'Enter'] },
  { category: 'sheets', actionVi: 'Tính tổng tự động các ô (AutoSUM)', actionEn: 'AutoSUM formula', keys: ['Alt', '='] },
  { category: 'sheets', actionVi: 'Chọn toàn bộ các ô trong cột', actionEn: 'Select entire column', keys: ['Ctrl', 'Space'] },
  { category: 'sheets', actionVi: 'Chọn toàn bộ các ô trong hàng', actionEn: 'Select entire row', keys: ['Shift', 'Space'] },
  { category: 'sheets', actionVi: 'Định dạng ô dạng Tiền tệ ($)', actionEn: 'Apply Currency format', keys: ['Ctrl', 'Shift', '$'] },
  { category: 'sheets', actionVi: 'Định dạng ô dạng Phần trăm (%)', actionEn: 'Apply Percentage format', keys: ['Ctrl', 'Shift', '%'] },
  { category: 'sheets', actionVi: 'Định dạng ô dạng Số tiêu chuẩn', actionEn: 'Apply Standard Number format', keys: ['Ctrl', 'Shift', '!'] },
  { category: 'sheets', actionVi: 'Sao chép dữ liệu/công thức từ ô phía trên', actionEn: 'Fill down from cell above', keys: ['Ctrl', 'D'] },
  { category: 'sheets', actionVi: 'Sao chép dữ liệu/công thức từ ô bên trái', actionEn: 'Fill right from cell left', keys: ['Ctrl', 'R'] },

  // Slides (DawnSlides)
  { category: 'slides', actionVi: 'Bắt đầu trình chiếu từ slide đầu tiên', actionEn: 'Start presentation from start', keys: ['F5'] },
  { category: 'slides', actionVi: 'Trình chiếu từ trang slide hiện tại', actionEn: 'Present from current slide', keys: ['Shift', 'F5'] },
  { category: 'slides', actionVi: 'Thoát chế độ trình chiếu màn hình', actionEn: 'Exit presentation mode', keys: ['Esc'] },
  { category: 'slides', actionVi: 'Tạm thời làm đen màn hình khi chiếu', actionEn: 'Blackout presentation screen', keys: ['B'] },
  { category: 'slides', actionVi: 'Tạm thời làm trắng màn hình khi chiếu', actionEn: 'Whiteout presentation screen', keys: ['W'] },
  { category: 'slides', actionVi: 'Chuyển sang trang Slide tiếp theo', actionEn: 'Next Slide', keys: ['→'] },
  { category: 'slides', actionVi: 'Quay lại trang Slide phía trước', actionEn: 'Previous Slide', keys: ['←'] },
  { category: 'slides', actionVi: 'Chèn thêm trang Slide mới', actionEn: 'Insert new slide', keys: ['Ctrl', 'M'] },
];

export default function DawnSettings({
  lang,
  onLanguageChange,
  theme,
  onThemeChange,
}: DawnSettingsProps) {
  const [activeTab, setActiveTab] = useState<'general' | 'appearance' | 'account' | 'legal' | 'shortcuts'>('appearance');
  const [primaryColor, setPrimaryColor] = useState<string>(() => localStorage.getItem('dawn-primary-color') || '#2563eb');
  const [autoSaveInterval, setAutoSaveInterval] = useState<string>(() => localStorage.getItem('dawn-autosave-interval') || '30');
  const [fontFamily, setFontFamily] = useState<string>(() => localStorage.getItem('dawn-default-font') || 'Inter');
  const [activeLegalTab, setActiveLegalTab] = useState<'terms' | 'privacy' | 'license'>('terms');

  // Shortcuts Tab States
  const [shortcutCategory, setShortcutCategory] = useState<'all' | 'system' | 'word' | 'sheets' | 'slides'>('all');
  const [shortcutSearch, setShortcutSearch] = useState('');

  const isVi = lang === 'vi';

  // Apply Primary Accent Color dynamically to CSS variables
  const handleSelectPrimaryColor = (colorHex: string) => {
    setPrimaryColor(colorHex);
    localStorage.setItem('dawn-primary-color', colorHex);
    document.documentElement.style.setProperty('--do-color-primary', colorHex);
  };

  useEffect(() => {
    if (primaryColor) {
      document.documentElement.style.setProperty('--do-color-primary', primaryColor);
    }
  }, [primaryColor]);

  // Handle System Auto OS Theme preference
  useEffect(() => {
    if (theme === 'system') {
      const isDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
      document.documentElement.setAttribute('data-theme', isDark ? 'dark' : 'standard');
    }
  }, [theme]);

  const userProfile = (() => {
    const saved = localStorage.getItem('dawn-google-user');
    return saved ? JSON.parse(saved) : null;
  })();

  const filteredShortcuts = SHORTCUTS_DATA.filter(item => {
    const matchesCategory = shortcutCategory === 'all' || item.category === shortcutCategory;
    const searchLower = shortcutSearch.toLowerCase();
    const matchesSearch =
      !shortcutSearch ||
      item.actionVi.toLowerCase().includes(searchLower) ||
      item.actionEn.toLowerCase().includes(searchLower) ||
      item.keys.join(' ').toLowerCase().includes(searchLower);
    return matchesCategory && matchesSearch;
  });

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        height: '100%',
        backgroundColor: 'var(--do-color-surface)',
        color: 'var(--do-color-text)',
      }}
    >
      {/* Top Bar Header */}
      <div
        style={{
          height: '60px',
          borderBottom: '1px solid var(--do-color-border)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '0 2rem',
          backgroundColor: 'var(--do-color-bg)',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <DawnLogoAnimated size={32} showWordmark replayOnHover />
          <div style={{ width: '1px', height: '20px', backgroundColor: 'var(--do-color-border)' }} />
          <span style={{ fontSize: '1.05rem', fontWeight: 800 }}>
            {isVi ? 'Cài Đặt Hệ Thống & Tùy Chỉnh VIP Pro' : 'DawnOffice VIP Pro System Settings'}
          </span>
        </div>

        {/* User Account Status Indicator */}
        {userProfile ? (
          <div
            style={{
              padding: '4px 10px 4px 6px',
              borderRadius: '20px',
              background: 'linear-gradient(135deg, rgba(255,215,0,0.12) 0%, rgba(139,92,246,0.12) 100%)',
              border: '1px solid rgba(255,215,0,0.4)',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
            }}
          >
            <img src={userProfile.avatar} alt="Avatar" style={{ width: '22px', height: '22px', borderRadius: '50%' }} />
            <span style={{ fontSize: '0.78rem', fontWeight: 800 }}>{userProfile.name}</span>
            <span style={{ fontSize: '9px', fontWeight: 900, backgroundColor: '#ffd700', color: '#000', padding: '1px 6px', borderRadius: '8px' }}>
              👑 PRO
            </span>
          </div>
        ) : (
          <span style={{ fontSize: '0.78rem', color: 'var(--do-color-text-muted)', fontWeight: 600 }}>
            DawnOffice v2.5.0 Pro Build
          </span>
        )}
      </div>

      {/* Main Settings Body */}
      <div style={{ flex: 1, display: 'flex', overflow: 'hidden' }}>
        {/* Left Side Navigation Tabs */}
        <div
          style={{
            width: '260px',
            borderRight: '1px solid var(--do-color-border)',
            padding: '1.5rem 1rem',
            display: 'flex',
            flexDirection: 'column',
            gap: '8px',
            backgroundColor: 'var(--do-color-bg)',
          }}
        >
          <button
            onClick={() => setActiveTab('appearance')}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '10px',
              padding: '12px 14px',
              fontSize: '0.88rem',
              fontWeight: activeTab === 'appearance' ? 800 : 500,
              backgroundColor: activeTab === 'appearance' ? 'var(--do-color-primary)' : 'transparent',
              color: activeTab === 'appearance' ? '#ffffff' : 'var(--do-color-text)',
              border: 'none',
              borderRadius: '12px',
              cursor: 'pointer',
              transition: 'all 0.15s ease',
            }}
          >
            <Palette size={18} />
            <span>{isVi ? 'Giao Diện & Theme Pro' : 'Appearance & Themes'}</span>
          </button>

          <button
            onClick={() => setActiveTab('shortcuts')}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '10px',
              padding: '12px 14px',
              fontSize: '0.88rem',
              fontWeight: activeTab === 'shortcuts' ? 800 : 500,
              backgroundColor: activeTab === 'shortcuts' ? 'var(--do-color-primary)' : 'transparent',
              color: activeTab === 'shortcuts' ? '#ffffff' : 'var(--do-color-text)',
              border: 'none',
              borderRadius: '12px',
              cursor: 'pointer',
              transition: 'all 0.15s ease',
            }}
          >
            <Keyboard size={18} />
            <span>{isVi ? 'Bảng Phím Tắt Hệ Thống' : 'Keyboard Shortcuts'}</span>
          </button>

          <button
            onClick={() => setActiveTab('general')}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '10px',
              padding: '12px 14px',
              fontSize: '0.88rem',
              fontWeight: activeTab === 'general' ? 800 : 500,
              backgroundColor: activeTab === 'general' ? 'var(--do-color-primary)' : 'transparent',
              color: activeTab === 'general' ? '#ffffff' : 'var(--do-color-text)',
              border: 'none',
              borderRadius: '12px',
              cursor: 'pointer',
              transition: 'all 0.15s ease',
            }}
          >
            <Sliders size={18} />
            <span>{isVi ? 'Tùy Chỉnh Hệ Thống' : 'System Preferences'}</span>
          </button>

          <button
            onClick={() => setActiveTab('account')}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '10px',
              padding: '12px 14px',
              fontSize: '0.88rem',
              fontWeight: activeTab === 'account' ? 800 : 500,
              backgroundColor: activeTab === 'account' ? 'var(--do-color-primary)' : 'transparent',
              color: activeTab === 'account' ? '#ffffff' : 'var(--do-color-text)',
              border: 'none',
              borderRadius: '12px',
              cursor: 'pointer',
              transition: 'all 0.15s ease',
            }}
          >
            <Crown size={18} />
            <span>{isVi ? 'Tài Khoản & Bản Quyền' : 'Pro VIP Account'}</span>
          </button>

          <button
            onClick={() => setActiveTab('legal')}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '10px',
              padding: '12px 14px',
              fontSize: '0.88rem',
              fontWeight: activeTab === 'legal' ? 800 : 500,
              backgroundColor: activeTab === 'legal' ? 'var(--do-color-primary)' : 'transparent',
              color: activeTab === 'legal' ? '#ffffff' : 'var(--do-color-text)',
              border: 'none',
              borderRadius: '12px',
              cursor: 'pointer',
              transition: 'all 0.15s ease',
            }}
          >
            <FileText size={18} />
            <span>{isVi ? 'Điều Khoản & Bảo Mật' : 'Legal & Privacy Policy'}</span>
          </button>
        </div>

        {/* Right Side Tab Contents */}
        <div style={{ flex: 1, padding: '2.5rem 3rem', overflowY: 'auto', maxWidth: '880px' }}>
          {/* 1. APPEARANCE & THEME TAB */}
          {activeTab === 'appearance' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
              <div>
                <h3 style={{ fontSize: '1.2rem', fontWeight: 800, margin: '0 0 6px 0' }}>
                  {isVi ? 'Chủ Đề & Chế Độ Màn Hình (Theme)' : 'Theme & Screen Mode'}
                </h3>
                <p style={{ color: 'var(--do-color-text-muted)', fontSize: '0.85rem', margin: '0 0 1.2rem 0' }}>
                  {isVi ? 'Chọn chế độ hiển thị phù hợp với môi trường làm việc của bạn.' : 'Choose the display mode that best fits your working environment.'}
                </p>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '1rem' }}>
                  {/* System Auto Sync */}
                  <div
                    onClick={() => onThemeChange('system')}
                    style={{
                      padding: '1.25rem 1rem',
                      borderRadius: '14px',
                      border: `2px solid ${theme === 'system' ? 'var(--do-color-primary)' : 'var(--do-color-border)'}`,
                      backgroundColor: 'var(--do-color-bg)',
                      cursor: 'pointer',
                      textAlign: 'center',
                      fontWeight: 700,
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      gap: '8px',
                      transition: 'all 0.15s ease',
                    }}
                  >
                    <Monitor size={24} color={theme === 'system' ? 'var(--do-color-primary)' : 'var(--do-color-text-muted)'} />
                    <span style={{ fontSize: '0.85rem' }}>{isVi ? 'Theo Máy (Auto OS)' : 'Auto System'}</span>
                  </div>

                  {/* Standard Light */}
                  <div
                    onClick={() => onThemeChange('standard')}
                    style={{
                      padding: '1.25rem 1rem',
                      borderRadius: '14px',
                      border: `2px solid ${theme === 'standard' ? 'var(--do-color-primary)' : 'var(--do-color-border)'}`,
                      backgroundColor: '#ffffff',
                      color: '#000000',
                      cursor: 'pointer',
                      textAlign: 'center',
                      fontWeight: 700,
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      gap: '8px',
                      boxShadow: '0 2px 8px rgba(0,0,0,0.05)',
                    }}
                  >
                    <Sun size={24} color="#f59e0b" />
                    <span style={{ fontSize: '0.85rem' }}>{isVi ? 'Chế độ Sáng' : 'Standard Light'}</span>
                  </div>

                  {/* Dark Mode */}
                  <div
                    onClick={() => onThemeChange('dark')}
                    style={{
                      padding: '1.25rem 1rem',
                      borderRadius: '14px',
                      border: `2px solid ${theme === 'dark' ? 'var(--do-color-primary)' : 'var(--do-color-border)'}`,
                      backgroundColor: '#1e1e1e',
                      color: '#ffffff',
                      cursor: 'pointer',
                      textAlign: 'center',
                      fontWeight: 700,
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      gap: '8px',
                    }}
                  >
                    <Moon size={24} color="#8b5cf6" />
                    <span style={{ fontSize: '0.85rem' }}>{isVi ? 'Chế độ Tối (Dark)' : 'Dark Mode'}</span>
                  </div>

                  {/* Sepia Eye-Care */}
                  <div
                    onClick={() => onThemeChange('eye-care')}
                    style={{
                      padding: '1.25rem 1rem',
                      borderRadius: '14px',
                      border: `2px solid ${theme === 'eye-care' ? 'var(--do-color-primary)' : 'var(--do-color-border)'}`,
                      backgroundColor: '#fbf0d9',
                      color: '#2c2523',
                      cursor: 'pointer',
                      textAlign: 'center',
                      fontWeight: 700,
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      gap: '8px',
                    }}
                  >
                    <Eye size={24} color="#d97706" />
                    <span style={{ fontSize: '0.85rem' }}>{isVi ? 'Bảo Vệ Mắt (Sepia)' : 'Eye-Care Sepia'}</span>
                  </div>
                </div>
              </div>

              {/* Primary Accent Color Customizer */}
              <div style={{ paddingTop: '1rem', borderTop: '1px solid var(--do-color-border)' }}>
                <h3 style={{ fontSize: '1.2rem', fontWeight: 800, margin: '0 0 6px 0' }}>
                  {isVi ? 'Màu Nhấn Chủ Đạo (Primary Accent Color)' : 'Primary Accent Color'}
                </h3>
                <p style={{ color: 'var(--do-color-text-muted)', fontSize: '0.85rem', margin: '0 0 1.2rem 0' }}>
                  {isVi ? 'Tùy chỉnh sắc màu chủ đạo điểm nhấn của ứng dụng.' : 'Customize the primary accent color across the app.'}
                </p>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1rem' }}>
                  {PRIMARY_ACCENT_COLORS.map(c => (
                    <div
                      key={c.value}
                      onClick={() => handleSelectPrimaryColor(c.value)}
                      style={{
                        padding: '12px 14px',
                        borderRadius: '14px',
                        backgroundColor: 'var(--do-color-bg)',
                        border: `2px solid ${primaryColor === c.value ? c.value : 'var(--do-color-border)'}`,
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <div
                          style={{
                            width: '24px',
                            height: '24px',
                            borderRadius: '50%',
                            background: c.gradient,
                            boxShadow: '0 2px 8px rgba(0,0,0,0.15)',
                          }}
                        />
                        <span style={{ fontSize: '0.85rem', fontWeight: 700 }}>{c.name}</span>
                      </div>
                      {primaryColor === c.value && <Check size={18} color={c.value} />}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* 2. UPGRADED KEYBOARD SHORTCUTS TAB */}
          {activeTab === 'shortcuts' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
              <div>
                <h3 style={{ fontSize: '1.2rem', fontWeight: 900, margin: '0 0 4px 0', display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <Command size={22} color="var(--do-color-primary)" />
                  <span>{isVi ? 'Bảng Tra Cứu Phím Tắt Toàn Hệ Thống' : 'System Keyboard Shortcuts Suite'}</span>
                </h3>
                <p style={{ color: 'var(--do-color-text-muted)', fontSize: '0.85rem', margin: 0 }}>
                  {isVi
                    ? 'Tra cứu nhanh các tổ hợp phím tắt thao tác siêu tốc trên toàn bộ bộ ứng dụng DawnOffice.'
                    : 'Quick reference for keyboard shortcuts across all DawnOffice apps.'}
                </p>
              </div>

              {/* Search Bar & Category Controls */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '10px',
                    padding: '8px 14px',
                    borderRadius: '14px',
                    backgroundColor: 'var(--do-color-bg)',
                    border: '1px solid var(--do-color-border)',
                  }}
                >
                  <Search size={18} color="var(--do-color-text-muted)" />
                  <input
                    type="text"
                    placeholder={isVi ? 'Tìm kiếm phím tắt hoặc thao tác (vd: Ctrl+S, lưu, in đậm)...' : 'Search shortcuts or actions (e.g. Ctrl+S, save, bold)...'}
                    value={shortcutSearch}
                    onChange={e => setShortcutSearch(e.target.value)}
                    style={{
                      flex: 1,
                      border: 'none',
                      outline: 'none',
                      backgroundColor: 'transparent',
                      color: 'var(--do-color-text)',
                      fontSize: '0.88rem',
                      fontWeight: 600,
                    }}
                  />
                  {shortcutSearch && (
                    <button
                      onClick={() => setShortcutSearch('')}
                      style={{ border: 'none', background: 'none', color: 'var(--do-color-text-muted)', cursor: 'pointer', fontWeight: 800 }}
                    >
                      ✕
                    </button>
                  )}
                </div>

                {/* Category Filter Tabs */}
                <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                  {[
                    { id: 'all', labelVi: '🌐 Tất Cả', labelEn: '🌐 All Shortcuts' },
                    { id: 'system', labelVi: '⚙️ Hệ Thống', labelEn: '⚙️ System' },
                    { id: 'word', labelVi: '📄 DawnDocument (Word)', labelEn: '📄 Word' },
                    { id: 'sheets', labelVi: '📊 DawnSheets (Excel)', labelEn: '📊 Sheets' },
                    { id: 'slides', labelVi: '🎨 DawnSlides (Slides)', labelEn: '🎨 Slides' },
                  ].map(cat => (
                    <button
                      key={cat.id}
                      onClick={() => setShortcutCategory(cat.id as any)}
                      style={{
                        padding: '6px 14px',
                        borderRadius: '10px',
                        backgroundColor: shortcutCategory === cat.id ? 'var(--do-color-primary)' : 'var(--do-color-bg)',
                        color: shortcutCategory === cat.id ? '#ffffff' : 'var(--do-color-text)',
                        border: `1px solid ${shortcutCategory === cat.id ? 'var(--do-color-primary)' : 'var(--do-color-border)'}`,
                        fontWeight: 700,
                        fontSize: '0.8rem',
                        cursor: 'pointer',
                        transition: 'all 0.15s ease',
                      }}
                    >
                      {isVi ? cat.labelVi : cat.labelEn}
                    </button>
                  ))}
                </div>
              </div>

              {/* Shortcuts List Container */}
              <div
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '8px',
                  marginTop: '4px',
                  maxHeight: '460px',
                  overflowY: 'auto',
                  paddingRight: '4px',
                }}
              >
                {filteredShortcuts.length > 0 ? (
                  filteredShortcuts.map((item, index) => (
                    <div
                      key={index}
                      style={{
                        padding: '12px 16px',
                        borderRadius: '14px',
                        backgroundColor: 'var(--do-color-bg)',
                        border: '1px solid var(--do-color-border)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        transition: 'transform 0.1s ease',
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <span
                          style={{
                            fontSize: '10px',
                            fontWeight: 900,
                            padding: '2px 8px',
                            borderRadius: '8px',
                            backgroundColor:
                              item.category === 'system'
                                ? 'rgba(37,99,235,0.12)'
                                : item.category === 'word'
                                ? 'rgba(59,130,246,0.12)'
                                : item.category === 'sheets'
                                ? 'rgba(16,185,129,0.12)'
                                : 'rgba(245,158,11,0.12)',
                            color:
                              item.category === 'system'
                                ? '#2563eb'
                                : item.category === 'word'
                                ? '#3b82f6'
                                : item.category === 'sheets'
                                ? '#10b981'
                                : '#f59e0b',
                            textTransform: 'uppercase',
                          }}
                        >
                          {item.category}
                        </span>
                        <span style={{ fontSize: '0.88rem', fontWeight: 700, color: 'var(--do-color-text)' }}>
                          {isVi ? item.actionVi : item.actionEn}
                        </span>
                      </div>

                      {/* 3D Keycap Badges */}
                      <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                        {item.keys.map((k, kIdx) => (
                          <span key={kIdx} style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                            <kbd
                              style={{
                                padding: '4px 9px',
                                borderRadius: '7px',
                                backgroundColor: 'var(--do-color-surface)',
                                border: '1px solid var(--do-color-border)',
                                boxShadow: '0 2px 0 var(--do-color-border), 0 2px 6px rgba(0,0,0,0.06)',
                                fontFamily: 'var(--do-font-mono, monospace)',
                                fontWeight: 800,
                                fontSize: '0.8rem',
                                color: 'var(--do-color-text)',
                              }}
                            >
                              {k}
                            </kbd>
                            {kIdx < item.keys.length - 1 && (
                              <span style={{ fontSize: '0.75rem', fontWeight: 800, color: 'var(--do-color-text-muted)' }}>+</span>
                            )}
                          </span>
                        ))}
                      </div>
                    </div>
                  ))
                ) : (
                  <div style={{ textAlign: 'center', padding: '2rem', color: 'var(--do-color-text-muted)', fontSize: '0.85rem' }}>
                    🔍 {isVi ? 'Không tìm thấy phím tắt phù hợp với từ khóa.' : 'No shortcuts matching your query.'}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* 3. SYSTEM PREFERENCES TAB */}
          {activeTab === 'general' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
              <div>
                <h3 style={{ fontSize: '1.2rem', fontWeight: 800, margin: '0 0 6px 0' }}>
                  {isVi ? 'Ngôn Ngữ Giao Diện' : 'Interface Language'}
                </h3>
                <p style={{ color: 'var(--do-color-text-muted)', fontSize: '0.85rem', margin: '0 0 1rem 0' }}>
                  {isVi ? 'Chọn ngôn ngữ hiển thị chính cho toàn bộ DawnOffice.' : 'Select display language.'}
                </p>

                <div style={{ display: 'flex', gap: '1rem' }}>
                  <div
                    onClick={() => onLanguageChange('vi')}
                    style={{
                      flex: 1,
                      padding: '1.2rem',
                      borderRadius: '14px',
                      border: `2px solid ${lang === 'vi' ? 'var(--do-color-primary)' : 'var(--do-color-border)'}`,
                      backgroundColor: 'var(--do-color-bg)',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                    }}
                  >
                    <div>
                      <div style={{ fontWeight: 800, fontSize: '0.95rem' }}>🇻🇳 Tiếng Việt</div>
                      <div style={{ fontSize: '0.78rem', color: 'var(--do-color-text-muted)' }}>Giao diện Tiếng Việt chuẩn hóa</div>
                    </div>
                    {lang === 'vi' && <Check size={20} color="var(--do-color-primary)" />}
                  </div>

                  <div
                    onClick={() => onLanguageChange('en')}
                    style={{
                      flex: 1,
                      padding: '1.2rem',
                      borderRadius: '14px',
                      border: `2px solid ${lang === 'en' ? 'var(--do-color-primary)' : 'var(--do-color-border)'}`,
                      backgroundColor: 'var(--do-color-bg)',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                    }}
                  >
                    <div>
                      <div style={{ fontWeight: 800, fontSize: '0.95rem' }}>🇬🇧 English</div>
                      <div style={{ fontSize: '0.78rem', color: 'var(--do-color-text-muted)' }}>Standard English interface</div>
                    </div>
                    {lang === 'en' && <Check size={20} color="var(--do-color-primary)" />}
                  </div>
                </div>
              </div>

              {/* Auto Save & Preferences */}
              <div style={{ paddingTop: '1.5rem', borderTop: '1px solid var(--do-color-border)', display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <div>
                    <h4 style={{ margin: 0, fontSize: '0.95rem', fontWeight: 800 }}>{isVi ? 'Tự Động Lưu Tài Liệu (Auto-Save)' : 'Auto-Save Interval'}</h4>
                    <span style={{ fontSize: '0.78rem', color: 'var(--do-color-text-muted)' }}>{isVi ? 'Tự động lưu nội dung tệp định kỳ' : 'Save document content automatically'}</span>
                  </div>
                  <select
                    value={autoSaveInterval}
                    onChange={e => {
                      setAutoSaveInterval(e.target.value);
                      localStorage.setItem('dawn-autosave-interval', e.target.value);
                    }}
                    style={{
                      padding: '8px 14px',
                      borderRadius: '10px',
                      border: '1px solid var(--do-color-border)',
                      backgroundColor: 'var(--do-color-bg)',
                      color: 'var(--do-color-text)',
                      fontWeight: 700,
                      outline: 'none',
                    }}
                  >
                    <option value="15">15 {isVi ? 'Giây' : 'Seconds'}</option>
                    <option value="30">30 {isVi ? 'Giây' : 'Seconds'}</option>
                    <option value="60">60 {isVi ? 'Giây' : 'Seconds'}</option>
                    <option value="off">{isVi ? 'Tắt' : 'Off'}</option>
                  </select>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <div>
                    <h4 style={{ margin: 0, fontSize: '0.95rem', fontWeight: 800 }}>{isVi ? 'Phông Chữ Mặc Định (Default Font)' : 'Default Font Family'}</h4>
                    <span style={{ fontSize: '0.78rem', color: 'var(--do-color-text-muted)' }}>{isVi ? 'Phông chữ mặc định khi tạo mới tệp Word' : 'Default font family for documents'}</span>
                  </div>
                  <select
                    value={fontFamily}
                    onChange={e => {
                      setFontFamily(e.target.value);
                      localStorage.setItem('dawn-default-font', e.target.value);
                    }}
                    style={{
                      padding: '8px 14px',
                      borderRadius: '10px',
                      border: '1px solid var(--do-color-border)',
                      backgroundColor: 'var(--do-color-bg)',
                      color: 'var(--do-color-text)',
                      fontWeight: 700,
                      outline: 'none',
                    }}
                  >
                    <option value="Inter">Inter (Hiện đại)</option>
                    <option value="Segoe UI">Segoe UI (Windows System)</option>
                    <option value="Roboto">Roboto (Google Standard)</option>
                    <option value="Times New Roman">Times New Roman (Cổ điển)</option>
                    <option value="JetBrains Mono">JetBrains Mono (Mã nguồn)</option>
                  </select>
                </div>
              </div>
            </div>
          )}

          {/* 4. PRO VIP ACCOUNT TAB */}
          {activeTab === 'account' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
              <div
                style={{
                  padding: '1.75rem',
                  borderRadius: '24px',
                  background: 'linear-gradient(135deg, rgba(255,215,0,0.12) 0%, rgba(139,92,246,0.12) 100%)',
                  border: '2px solid transparent',
                  backgroundImage: 'linear-gradient(var(--do-color-surface), var(--do-color-surface)), linear-gradient(135deg, #ffd700, #a855f7, #06b6d4)',
                  backgroundOrigin: 'border-box',
                  backgroundClip: 'padding-box, border-box',
                  boxShadow: '0 8px 24px rgba(255,215,0,0.2)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                  <div
                    style={{
                      width: '64px',
                      height: '64px',
                      borderRadius: '50%',
                      background: 'linear-gradient(135deg, #ffd700 0%, #f59e0b 100%)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      boxShadow: '0 6px 18px rgba(245,158,11,0.4)',
                    }}
                  >
                    <Crown size={34} color="#000000" />
                  </div>

                  <div>
                    <h3 style={{ margin: '0 0 4px 0', fontSize: '1.2rem', fontWeight: 900, color: 'var(--do-color-text)', display: 'flex', alignItems: 'center', gap: '8px' }}>
                      DawnOffice Pro VIP Membership
                      <span style={{ fontSize: '10px', backgroundColor: '#ffd700', color: '#000', padding: '2px 8px', borderRadius: '10px', fontWeight: 900 }}>
                        👑 VIP ACTIVE
                      </span>
                    </h3>
                    <p style={{ margin: 0, fontSize: '0.85rem', color: 'var(--do-color-text-muted)' }}>
                      {userProfile ? `Kích hoạt bởi tài khoản Google Pro (${userProfile.email})` : 'Miễn phí kích hoạt cho toàn bộ người dùng DawnOffice v2.5.0!'}
                    </p>
                  </div>
                </div>
              </div>

              {/* Features List */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div style={{ padding: '1.2rem', borderRadius: '16px', backgroundColor: 'var(--do-color-bg)', border: '1px solid var(--do-color-border)', display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <ShieldCheck size={24} color="#10b981" />
                  <div>
                    <div style={{ fontWeight: 800, fontSize: '0.9rem' }}>Bảo Mật Mã Hóa OAuth 2.0</div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--do-color-text-muted)' }}>Bảo vệ 100% tài liệu cá nhân</div>
                  </div>
                </div>

                <div style={{ padding: '1.2rem', borderRadius: '16px', backgroundColor: 'var(--do-color-bg)', border: '1px solid var(--do-color-border)', display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <Sparkles size={24} color="#ffd700" />
                  <div>
                    <div style={{ fontWeight: 800, fontSize: '0.9rem' }}>Giao Diện Hoàng Gia Gold</div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--do-color-text-muted)' }}>Mở khóa hiệu ứng ánh kim</div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* 5. TERMS & PRIVACY TAB */}
          {activeTab === 'legal' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
              {/* Sub navigation */}
              <div style={{ display: 'flex', gap: '8px', borderBottom: '1px solid var(--do-color-border)', paddingBottom: '10px' }}>
                <button
                  onClick={() => setActiveLegalTab('terms')}
                  style={{
                    padding: '6px 14px',
                    borderRadius: '10px',
                    backgroundColor: activeLegalTab === 'terms' ? 'var(--do-color-primary)' : 'transparent',
                    color: activeLegalTab === 'terms' ? '#fff' : 'var(--do-color-text)',
                    border: 'none',
                    fontWeight: 700,
                    fontSize: '0.82rem',
                    cursor: 'pointer',
                  }}
                >
                  📜 {isVi ? 'Điều Khoản Dịch Vụ' : 'Terms of Service'}
                </button>

                <button
                  onClick={() => setActiveLegalTab('privacy')}
                  style={{
                    padding: '6px 14px',
                    borderRadius: '10px',
                    backgroundColor: activeLegalTab === 'privacy' ? 'var(--do-color-primary)' : 'transparent',
                    color: activeLegalTab === 'privacy' ? '#fff' : 'var(--do-color-text)',
                    border: 'none',
                    fontWeight: 700,
                    fontSize: '0.82rem',
                    cursor: 'pointer',
                  }}
                >
                  🔒 {isVi ? 'Chính Sách Bảo Mật' : 'Privacy Policy'}
                </button>

                <button
                  onClick={() => setActiveLegalTab('license')}
                  style={{
                    padding: '6px 14px',
                    borderRadius: '10px',
                    backgroundColor: activeLegalTab === 'license' ? 'var(--do-color-primary)' : 'transparent',
                    color: activeLegalTab === 'license' ? '#fff' : 'var(--do-color-text)',
                    border: 'none',
                    fontWeight: 700,
                    fontSize: '0.82rem',
                    cursor: 'pointer',
                  }}
                >
                  ⚖️ {isVi ? 'Giấy Phép Bản Quyền' : 'License Agreement'}
                </button>
              </div>

              {/* Content */}
              <div
                style={{
                  padding: '1.5rem',
                  borderRadius: '16px',
                  backgroundColor: 'var(--do-color-bg)',
                  border: '1px solid var(--do-color-border)',
                  lineHeight: 1.6,
                  fontSize: '0.88rem',
                }}
              >
                {activeLegalTab === 'terms' && (
                  <div>
                    <h3 style={{ margin: '0 0 1rem 0', fontWeight: 800, color: 'var(--do-color-text)' }}>
                      📜 Điều Khoản Sử Dụng Ứng Dụng DawnOffice
                    </h3>
                    <p style={{ color: 'var(--do-color-text-muted)' }}>
                      <strong>1. Quyền sở hữu trí tuệ:</strong> Toàn bộ mã nguồn và giao diện ứng dụng DawnOffice thuộc bản quyền của nhà phát triển. Người dùng có quyền truy cập, sử dụng miễn phí đầy đủ các tính năng văn phòng.
                    </p>
                    <p style={{ color: 'var(--do-color-text-muted)' }}>
                      <strong>2. Quy định sử dụng:</strong> Người dùng cam kết không tháo dỡ mã nguồn, không thực hiện hành vi vi phạm pháp luật bằng tài liệu được tạo trên hệ thống.
                    </p>
                  </div>
                )}

                {activeLegalTab === 'privacy' && (
                  <div>
                    <h3 style={{ margin: '0 0 1rem 0', fontWeight: 800, color: 'var(--do-color-text)' }}>
                      🔒 Chính Sách Bảo Vệ Quyền Riêng Tư & Dữ Liệu
                    </h3>
                    <p style={{ color: 'var(--do-color-text-muted)' }}>
                      <strong>1. Bảo vệ dữ liệu 100% nội địa:</strong> Mọi tệp tài liệu (Word, Sheets, Slides) của bạn đều được lưu giữ trực tiếp trên bộ nhớ máy tính nội địa. DawnOffice **tuyệt đối KHÔNG thu thập** dữ liệu cá nhân hay nội dung tệp của bạn.
                    </p>
                    <p style={{ color: 'var(--do-color-text-muted)' }}>
                      <strong>2. Xác thực Google OAuth 2.0:</strong> Phiên đăng nhập Google của bạn được mã hóa an toàn qua chuẩn kết nối OAuth chính thức.
                    </p>
                  </div>
                )}

                {activeLegalTab === 'license' && (
                  <div>
                    <h3 style={{ margin: '0 0 1rem 0', fontWeight: 800, color: 'var(--do-color-text)' }}>
                      ⚖️ Giấy Phép Bản Quyền Phần Mềm (Software License)
                    </h3>
                    <p style={{ color: 'var(--do-color-text-muted)' }}>
                      DawnOffice v2.5.0 Pro Build được phát hành dưới bản quyền thương hiệu phần mềm độc quyền. Được cấp phép hoạt động miễn phí trọn đời cho toàn bộ người dùng cá nhân và doanh nghiệp.
                    </p>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
