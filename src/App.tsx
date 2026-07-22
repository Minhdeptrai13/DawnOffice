import { useCallback, useEffect, useRef, useState } from 'react';
import Sidebar, { ModuleType } from './components/Sidebar';
import WelcomeHub from './pages/WelcomeHub';
import DocumentWorkspace from './pages/DocumentWorkspace';
import DawnSlides from './pages/DawnSlides';
import DawnSheets from './pages/DawnSheets';
import DawnSettings from './pages/DawnSettings';
import ModuleLaunchModal from './components/ModuleLaunchModal';
import GoogleAuthModal, { UserProfile } from './components/GoogleAuthModal';
import GoogleDriveDrawer from './components/GoogleDriveDrawer';

function App() {
  const [activeModule, setActiveModule] = useState<ModuleType>('welcome');
  const [lang, setLang] = useState<'vi' | 'en'>('vi');
  const [theme, setTheme] = useState<'standard' | 'eye-care' | 'dark' | 'system'>('standard');
  const [immersiveMode, setImmersiveMode] = useState(() => localStorage.getItem('dawn-document-immersive') === 'true');
  const [sidebarVisible, setSidebarVisible] = useState(false);

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
    if (module === 'welcome' || module === 'settings') {
      setActiveModule(module);
    } else {
      setLaunchModalModule(module);
    }
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

      <main className="main-content" style={{ flex: 1, overflow: 'hidden', display: 'flex', flexDirection: 'column', height: '100%' }}>
        {activeModule === 'welcome' && (
          <WelcomeHub onSelectModule={module => setLaunchModalModule(module)} lang={lang} />
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
                padding: '4px 10px 4px 6px',
                borderRadius: '20px',
                background: 'linear-gradient(135deg, rgba(255,215,0,0.12) 0%, rgba(139,92,246,0.12) 100%)',
                border: '2px solid transparent',
                backgroundImage: 'linear-gradient(var(--do-color-surface), var(--do-color-surface)), linear-gradient(135deg, #ffd700, #a855f7, #06b6d4)',
                backgroundOrigin: 'border-box',
                backgroundClip: 'padding-box, border-box',
                boxShadow: '0 4px 14px rgba(255,215,0,0.3)',
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                cursor: 'pointer',
                backdropFilter: 'blur(8px)',
              }}
            >
              <img src={userProfile.avatar} alt="Avatar" style={{ width: '24px', height: '24px', borderRadius: '50%', boxShadow: '0 0 8px rgba(255,215,0,0.6)' }} />
              <span style={{ fontSize: '0.78rem', fontWeight: 800, color: 'var(--do-color-text)' }}>{userProfile.name}</span>
              <span
                style={{
                  fontSize: '9px',
                  fontWeight: 900,
                  background: 'linear-gradient(135deg, #ffd700 0%, #f59e0b 100%)',
                  color: '#000000',
                  padding: '1px 6px',
                  borderRadius: '8px',
                  boxShadow: '0 2px 6px rgba(245,158,11,0.4)',
                  letterSpacing: '0.5px',
                }}
              >
                👑 PRO
              </span>
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
              🔑 {lang === 'vi' ? 'Đăng nhập Google' : 'Google Login'}
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
        onOpenFile={() => {
          if (launchModalModule) setActiveModule(launchModalModule);
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
