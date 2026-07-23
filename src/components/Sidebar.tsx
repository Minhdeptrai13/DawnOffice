import DawnLogoAnimated from './DawnLogoAnimated';
import { DawnHomeLogo, DawnWordLogo, DawnExcelLogo, DawnPowerPointLogo, DawnSettingsLogo } from './CustomBrandIcons';

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
      width: '46px',
      height: '46px',
      borderRadius: '14px',
      backgroundColor: isActive ? 'rgba(37,99,235,0.15)' : 'transparent',
      border: isActive ? '1.5px solid var(--do-color-primary)' : '1.5px solid transparent',
      cursor: 'pointer',
      pointerEvents: 'auto' as const,
      transition: 'all 0.22s cubic-bezier(0.34, 1.56, 0.64, 1)',
      transform: isActive ? 'scale(1.08)' : 'scale(1)',
      boxShadow: isActive ? '0 4px 16px rgba(37, 99, 235, 0.35)' : 'none',
      outline: 'none',
      padding: 0,
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
      <nav className="sidebar-nav" style={{ display: 'flex', flexDirection: 'column', gap: '12px', alignItems: 'center' }}>
        {/* 0. Welcome Launch Hub */}
        <button
          onClick={() => onSelectModule('welcome')}
          style={getLinkStyle('welcome')}
          title="Trang chủ (Welcome Launch Hub)"
        >
          <DawnHomeLogo size={32} />
        </button>

        {/* 1. DawnDocument */}
        <button
          onClick={() => onSelectModule('document')}
          style={getLinkStyle('document')}
          title="1. DawnDocument (Soạn thảo văn bản Word)"
        >
          <DawnWordLogo size={32} />
        </button>

        {/* 2. DawnSheets */}
        <button
          onClick={() => onSelectModule('spreadsheet')}
          style={getLinkStyle('spreadsheet')}
          title="2. DawnSheets (Bảng tính Excel)"
        >
          <DawnExcelLogo size={32} />
        </button>

        {/* 3. DawnSlides */}
        <button
          onClick={() => onSelectModule('presentation')}
          style={getLinkStyle('presentation')}
          title="3. DawnSlides (Trình chiếu PowerPoint)"
        >
          <DawnPowerPointLogo size={32} />
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
        <DawnSettingsLogo size={32} />
      </button>
    </div>
  );
}
