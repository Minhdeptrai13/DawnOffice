import { Home, FileText, Grid, Presentation, Settings } from 'lucide-react';
import DawnLogoAnimated from './DawnLogoAnimated';

export type ModuleType = 'welcome' | 'document' | 'spreadsheet' | 'presentation' | 'settings';

interface SidebarProps {
  activeModule: ModuleType;
  onSelectModule: (module: ModuleType) => void;
  immersiveMode?: boolean;
  visible?: boolean;
  onMouseEnter?: () => void;
  onMouseLeave?: () => void;
}

export default function Sidebar({
  activeModule,
  onSelectModule,
  immersiveMode = false,
  visible = true,
  onMouseEnter,
  onMouseLeave,
}: SidebarProps) {
  const getLinkStyle = (module: ModuleType) => {
    const isActive = activeModule === module;
    return {
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      width: '44px',
      height: '44px',
      borderRadius: '12px',
      color: isActive ? '#ffffff' : 'var(--do-color-text)',
      backgroundColor: isActive ? 'var(--do-color-primary)' : 'transparent',
      cursor: 'pointer',
      pointerEvents: 'auto' as const,
      transition: 'all 0.18s cubic-bezier(0.34, 1.56, 0.64, 1)',
      boxShadow: isActive ? '0 4px 14px rgba(37, 99, 235, 0.4)' : 'none',
      border: 'none',
      outline: 'none',
    };
  };

  return (
    <div
      className={`sidebar ${immersiveMode ? 'sidebar-immersive' : ''} ${visible ? 'is-visible' : ''}`}
      onMouseEnter={onMouseEnter}
      onMouseLeave={onMouseLeave}
      style={{
        zIndex: 10000,
        pointerEvents: 'auto',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        padding: '12px 8px',
      }}
    >
      {/* Animated Logo */}
      <div
        onClick={() => onSelectModule('welcome')}
        style={{ display: 'flex', justifyContent: 'center', marginBottom: '14px', cursor: 'pointer' }}
        title="DawnOffice Launch Hub"
      >
        <DawnLogoAnimated size={38} replayOnHover />
      </div>

      {/* Nav links (0: Welcome, 1: DawnDocument, 2: DawnSheets, 3: DawnSlides, 4: DawnSettings) */}
      <nav className="sidebar-nav" style={{ display: 'flex', flexDirection: 'column', gap: '10px', alignItems: 'center' }}>
        {/* 0. Welcome Launch Hub */}
        <button
          onClick={() => onSelectModule('welcome')}
          style={getLinkStyle('welcome')}
          title="Trang chủ (Welcome Launch Hub)"
        >
          <Home size={20} />
        </button>

        {/* 1. DawnDocument */}
        <button
          onClick={() => onSelectModule('document')}
          style={getLinkStyle('document')}
          title="1. DawnDocument (Soạn thảo văn bản Word)"
        >
          <FileText size={20} />
        </button>

        {/* 2. DawnSheets */}
        <button
          onClick={() => onSelectModule('spreadsheet')}
          style={getLinkStyle('spreadsheet')}
          title="2. DawnSheets (Bảng tính Excel)"
        >
          <Grid size={20} />
        </button>

        {/* 3. DawnSlides */}
        <button
          onClick={() => onSelectModule('presentation')}
          style={getLinkStyle('presentation')}
          title="3. DawnSlides (Trình chiếu PowerPoint)"
        >
          <Presentation size={20} />
        </button>
      </nav>

      {/* Divider */}
      <div style={{ width: '24px', height: '1px', backgroundColor: 'var(--do-color-border)', margin: '14px 0' }} />

      {/* 4. DawnSettings */}
      <button
        onClick={() => onSelectModule('settings')}
        style={getLinkStyle('settings')}
        title="4. DawnSettings (Cài đặt hệ thống)"
      >
        <Settings size={20} />
      </button>
    </div>
  );
}
