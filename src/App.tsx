import { useCallback, useEffect, useRef, useState } from 'react';
import { invoke } from '@tauri-apps/api/core';
import Sidebar, { ModuleType } from './components/Sidebar';
import WelcomeHub from './pages/WelcomeHub';
import DocumentWorkspace from './pages/DocumentWorkspace';
import DawnSlides from './pages/DawnSlides';
import DawnSheets from './pages/DawnSheets';
import DawnSettings from './pages/DawnSettings';
import ModuleLaunchModal from './components/ModuleLaunchModal';
import GoogleAuthModal, { UserProfile } from './components/GoogleAuthModal';
import GoogleDriveDrawer from './components/GoogleDriveDrawer';
import AICopilotDrawer from './components/AICopilotDrawer';
import { DawnBrainLogo } from './components/CustomBrandIcons';

function App() {
  const [activeModule, setActiveModule] = useState<ModuleType>('welcome');
  const [lang, setLang] = useState<'vi' | 'en'>('vi');
  const [theme, setTheme] = useState<'standard' | 'eye-care' | 'dark' | 'system'>(() => {
    return (localStorage.getItem('dawn-theme') as any) || 'standard';
  });
  const [immersiveMode, setImmersiveMode] = useState(() => localStorage.getItem('dawn-document-immersive') === 'true');
  const [sidebarVisible, setSidebarVisible] = useState(false);
  const [isAICopilotOpen, setIsAICopilotOpen] = useState(false);

  // Sync theme to root document attribute whenever theme changes
  useEffect(() => {
    localStorage.setItem('dawn-theme', theme);
    if (theme === 'system') {
      const isDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
      document.documentElement.setAttribute('data-theme', isDark ? 'dark' : 'standard');
    } else {
      document.documentElement.setAttribute('data-theme', theme);
    }
  }, [theme]);

  // Auto-open file on launch if opened via Windows file association / double-click
  useEffect(() => {
    // Clear legacy cached drafts that contained old page overlay divs
    try {
      const savedTabs = localStorage.getItem('dawn_workspace_tabs');
      if (savedTabs && savedTabs.includes('dawn-page-line')) {
        localStorage.removeItem('dawn_workspace_tabs');
      }
    } catch (e) {}

    invoke<string | null>('get_cli_opened_file')
      .then(openedFile => {
        if (openedFile && openedFile.trim()) {
          const cleanPath = openedFile.trim();
          localStorage.setItem('dawn-last-opened-doc-path', cleanPath);

          // Force set target file into initial tab in workspace
          const fileName = cleanPath.split('\\').pop()?.split('/').pop() || 'Opened Document';
          const cliTab = { id: 'tab-' + Date.now(), filePath: cleanPath, title: fileName };
          localStorage.setItem('dawn_workspace_tabs', JSON.stringify([cliTab]));
          localStorage.setItem('dawn_workspace_active_tab', cliTab.id);

          setActiveModule('document');
          setTimeout(() => {
            window.dispatchEvent(new CustomEvent('dawn-open-file-path', { detail: { filePath: cleanPath } }));
          }, 300);
        } else {
          const lastOpened = localStorage.getItem('dawn-last-opened-doc-path');
          if (lastOpened && lastOpened.trim()) {
            setActiveModule('document');
          }
        }
      })
      .catch(err => console.warn('CLI file check error:', err));
  }, []);

  useEffect(() => {
    const handleOpenCopilot = () => setIsAICopilotOpen(true);
    const handleToggleCopilot = () => setIsAICopilotOpen(prev => !prev);
    window.addEventListener('dawn-open-copilot', handleOpenCopilot);
    window.addEventListener('dawn-toggle-copilot', handleToggleCopilot);
    return () => {
      window.removeEventListener('dawn-open-copilot', handleOpenCopilot);
      window.removeEventListener('dawn-toggle-copilot', handleToggleCopilot);
    };
  }, []);

  // Module Launch Preview Modal State
  const [launchModalModule, setLaunchModalModule] = useState<ModuleType | null>(null);

  // Google Auth & Ecosystem State
  const [loginToast, setLoginToast] = useState<string | null>(null);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(() => {
    const saved = localStorage.getItem('dawn-google-user');
    return saved ? JSON.parse(saved) : null;
  });
  const [isGoogleAuthOpen, setIsGoogleAuthOpen] = useState(false);
  const [isGoogleDriveOpen, setIsGoogleDriveOpen] = useState(false);

  const hideTimer = useRef<number | null>(null);

  const clearHideTimer = useCallback(() => {
    if (hideTimer.current !== null) window.clearTimeout(hideTimer.current);
    hideTimer.current = null;
  }, []);

  const showSidebar = useCallback(() => {
    clearHideTimer();
    setSidebarVisible(true);
  }, [clearHideTimer]);

  const hideSidebar = useCallback(() => {
    clearHideTimer();
    hideTimer.current = window.setTimeout(() => setSidebarVisible(false), 500);
  }, [clearHideTimer]);

  const setImmersivePreference = useCallback((enabled: boolean) => {
    setImmersiveMode(enabled);
    localStorage.setItem('dawn-document-immersive', String(enabled));
    setSidebarVisible(false);
  }, []);

  const handleSelectSidebarModule = (module: ModuleType) => {
    setActiveModule(module);
  };

  const handleLoginGoogleSuccess = (profile: UserProfile) => {
    setUserProfile(profile);
    localStorage.setItem('dawn-google-user', JSON.stringify(profile));
    setLoginToast(lang === 'vi' ? `🎉 Đăng nhập Google thành công! Chào mừng ${profile.name}` : `🎉 Successfully logged in with Google! Welcome ${profile.name}`);
    setTimeout(() => setLoginToast(null), 5000);
  };

  const handleLogoutGoogle = () => {
    setUserProfile(null);
    localStorage.removeItem('dawn-google-user');
  };

  useEffect(() => () => clearHideTimer(), [clearHideTimer]);

  return (
    <div
      className={`app-layout ${immersiveMode ? 'immersive-mode' : ''}`}
      onMouseMove={e => {
        if (!immersiveMode) return;
        if (e.clientY <= 22) window.dispatchEvent(new Event('dawn-immersive-reveal-toolbar'));
        if (e.clientX <= 22) showSidebar();
      }}
      style={{ display: 'flex', width: '100vw', height: '100vh', overflow: 'hidden', position: 'relative' }}
    >
      <Sidebar
        activeModule={activeModule}
        onSelectModule={handleSelectSidebarModule}
        immersiveMode={immersiveMode}
        visible={sidebarVisible}
        onMouseEnter={showSidebar}
        onMouseLeave={hideSidebar}
      />

      <main
        className="main-content"
        style={{
          flex: 1,
          overflow: 'hidden',
          display: 'flex',
          flexDirection: 'column',
          height: '100%',
          marginRight: isAICopilotOpen ? '420px' : '0px',
          transition: 'margin-right 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
        }}
      >
        {activeModule === 'welcome' && (
          <WelcomeHub
            onSelectModule={module => setActiveModule(module)}
            onOpenDirectFile={(filePath, module) => {
              setActiveModule(module);
              if (filePath && filePath.trim()) {
                const cleanPath = filePath.trim();
                localStorage.setItem('dawn-last-opened-doc-path', cleanPath);
                setTimeout(() => {
                  window.dispatchEvent(new CustomEvent('dawn-open-file-path', { detail: { filePath: cleanPath } }));
                }, 150);
              }
            }}
            lang={lang}
          />
        )}
        {activeModule === 'document' && (
          <DocumentWorkspace immersiveMode={immersiveMode} onImmersiveModeChange={setImmersivePreference} />
        )}
        {activeModule === 'spreadsheet' && (
          <DawnSheets immersiveMode={immersiveMode} onImmersiveModeChange={setImmersivePreference} lang={lang} />
        )}
        {activeModule === 'presentation' && (
          <DawnSlides immersiveMode={immersiveMode} onImmersiveModeChange={setImmersivePreference} lang={lang} />
        )}
        {activeModule === 'settings' && (
          <DawnSettings
            lang={lang}
            onLanguageChange={setLang}
            theme={theme}
            onThemeChange={setTheme}
          />
        )}
      </main>

      {/* Floating AI Copilot Trigger Button */}
      <button
        onClick={() => setIsAICopilotOpen(prev => !prev)}
        style={{
          position: 'fixed',
          bottom: '24px',
          right: isAICopilotOpen ? '436px' : '24px',
          zIndex: 99990,
          display: 'flex',
          alignItems: 'center',
          gap: '10px',
          padding: '10px 20px',
          borderRadius: '30px',
          background: 'linear-gradient(135deg, #2563eb 0%, #7c3aed 100%)',
          color: '#ffffff',
          border: 'none',
          boxShadow: '0 6px 22px rgba(37, 99, 235, 0.4)',
          cursor: 'pointer',
          fontWeight: 700,
          fontSize: '0.9rem',
          transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
          backdropFilter: 'blur(8px)',
        }}
        title={lang === 'vi' ? 'Mở DawnChat AI Assistant' : 'Open DawnChat AI Assistant'}
      >
        <DawnBrainLogo size={22} />
        <span>
          {isAICopilotOpen
            ? (lang === 'vi' ? 'Đóng DawnChat' : 'Close DawnChat')
            : 'DawnChat AI'}
        </span>
      </button>

      {/* g4f AI Copilot Drawer */}
      <AICopilotDrawer
        isOpen={isAICopilotOpen}
        onClose={() => setIsAICopilotOpen(false)}
        userProfile={userProfile}
        onLogoutGoogle={handleLogoutGoogle}
        activeModule={activeModule}
        lang={lang}
        theme={theme}
      />

      {/* Header Top-Right Control Group - Google Pro Account Badge (Only on Home Screen) */}
      {activeModule === 'welcome' && (
        <div
          style={{
            position: 'fixed',
            top: '12px',
            right: '18px',
            zIndex: 9998,
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
          }}
        >
          {userProfile ? (
            <div
              onClick={() => setIsGoogleDriveOpen(true)}
              style={{
                padding: '4px 12px 4px 6px',
                borderRadius: '20px',
                backgroundColor: 'var(--do-color-surface)',
                border: '1px solid var(--do-color-border)',
                boxShadow: 'var(--do-shadow-sm)',
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                cursor: 'pointer',
                backdropFilter: 'blur(8px)',
              }}
            >
              <img src={userProfile.avatar} alt="Avatar" style={{ width: '22px', height: '22px', borderRadius: '50%' }} />
              <span style={{ fontSize: '0.78rem', fontWeight: 700, color: 'var(--do-color-text)' }}>{userProfile.name}</span>
            </div>
          ) : (
            <button
              onClick={() => setIsGoogleAuthOpen(true)}
              style={{
                padding: '6px 14px',
                borderRadius: '18px',
                backgroundColor: 'var(--do-color-surface)',
                color: 'var(--do-color-text)',
                border: '1px solid var(--do-color-border)',
                boxShadow: '0 4px 12px rgba(0,0,0,0.08)',
                fontSize: '0.78rem',
                fontWeight: 700,
                cursor: 'pointer',
                backdropFilter: 'blur(8px)',
              }}
            >
              {lang === 'vi' ? 'Đăng nhập Google' : 'Google Login'}
            </button>
          )}
        </div>
      )}

      {/* Sidebar Module Launch Preview Modal */}
      <ModuleLaunchModal
        isOpen={launchModalModule !== null}
        module={launchModalModule}
        onClose={() => setLaunchModalModule(null)}
        onCreateNew={() => {
          if (launchModalModule) setActiveModule(launchModalModule);
          setLaunchModalModule(null);
        }}
        onOpenFile={(filePath?: string) => {
          if (launchModalModule) {
            const targetMod = launchModalModule;
            setActiveModule(targetMod);
            if (filePath && filePath.trim()) {
              const cleanPath = filePath.trim();
              localStorage.setItem('dawn-last-opened-doc-path', cleanPath);
              setTimeout(() => {
                window.dispatchEvent(new CustomEvent('dawn-open-file-path', { detail: { filePath: cleanPath } }));
              }, 150);
            }
          }
          setLaunchModalModule(null);
        }}
        lang={lang}
      />

      {/* Google Authentication Modal */}
      <GoogleAuthModal
        isOpen={isGoogleAuthOpen}
        onClose={() => setIsGoogleAuthOpen(false)}
        onLoginSuccess={handleLoginGoogleSuccess}
        lang={lang}
      />

      {/* Google Workspace & Drive Cloud Drawer */}
      <GoogleDriveDrawer
        isOpen={isGoogleDriveOpen}
        onClose={() => setIsGoogleDriveOpen(false)}
        userProfile={userProfile}
        onOpenGoogleLogin={() => setIsGoogleAuthOpen(true)}
        onLogoutGoogle={handleLogoutGoogle}
        activeModule={activeModule}
        lang={lang}
      />

      {/* Toast Notification Banner */}
      {loginToast && (
        <div
          style={{
            position: 'fixed',
            top: '20px',
            right: '20px',
            backgroundColor: '#10b981',
            color: '#ffffff',
            padding: '12px 20px',
            borderRadius: '12px',
            boxShadow: '0 8px 24px rgba(16, 185, 129, 0.35)',
            zIndex: 100000,
            fontWeight: 700,
            fontSize: '0.9rem',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            animation: 'fadeIn 0.3s ease',
          }}
        >
          <span>{loginToast}</span>
        </div>
      )}
    </div>
  );
}

export default App;
