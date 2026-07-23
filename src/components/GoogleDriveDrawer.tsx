import { UserProfile } from './GoogleAuthModal';
import { X, LogOut, ShieldCheck, Crown, Sparkles, CheckCircle2, Zap, Lock, Star } from 'lucide-react';

interface GoogleDriveDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  userProfile?: UserProfile | null;
  onOpenGoogleLogin: () => void;
  onLogoutGoogle: () => void;
  activeModule?: string;
  lang?: 'vi' | 'en';
}

export default function GoogleDriveDrawer({
  isOpen,
  onClose,
  userProfile,
  onOpenGoogleLogin,
  onLogoutGoogle,
  lang = 'vi',
}: GoogleDriveDrawerProps) {
  if (!isOpen) return null;

  const isVi = lang === 'vi';

  return (
    <div
      style={{
        position: 'fixed',
        top: 0,
        right: 0,
        bottom: 0,
        width: '420px',
        backgroundColor: 'var(--do-color-surface)',
        boxShadow: '-6px 0 32px rgba(0,0,0,0.22)',
        zIndex: 99999,
        display: 'flex',
        flexDirection: 'column',
        borderLeft: '1px solid var(--do-color-border)',
        backdropFilter: 'blur(12px)',
      }}
    >
      {/* Header */}
      <div
        style={{
          padding: '1.25rem 1.5rem',
          borderBottom: '1px solid var(--do-color-border)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          background: 'linear-gradient(135deg, rgba(255,215,0,0.08) 0%, rgba(139,92,246,0.08) 100%)',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <div>
            <h3 style={{ margin: 0, fontSize: '1.05rem', fontWeight: 800, color: 'var(--do-color-text)' }}>
              {isVi ? 'Tài Khoản Google' : 'Google Account'}
            </h3>
            <span style={{ fontSize: '0.75rem', color: '#10b981', fontWeight: 600 }}>
              ● {isVi ? 'Đã kết nối tài khoản' : 'Connected Account'}
            </span>
          </div>
        </div>

        <button className="do-btn-icon" onClick={onClose} style={{ borderRadius: '8px' }}>
          <X size={18} />
        </button>
      </div>

      {/* Main Drawer Body */}
      <div style={{ flex: 1, padding: '1.5rem', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
        {userProfile ? (
          <div
            style={{
              padding: '1.5rem',
              borderRadius: '20px',
              backgroundColor: 'var(--do-color-bg)',
              border: '1px solid var(--do-color-border)',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              textAlign: 'center',
              gap: '1rem',
            }}
          >
            {/* Avatar */}
            <img
              src={userProfile.avatar}
              alt="Avatar"
              style={{
                width: '64px',
                height: '64px',
                borderRadius: '50%',
                border: '2px solid var(--do-color-border)',
              }}
            />

            <div>
              <div style={{ fontSize: '1.1rem', fontWeight: 800, color: 'var(--do-color-text)' }}>
                {userProfile.name}
              </div>
              <div style={{ fontSize: '0.82rem', color: 'var(--do-color-text-muted)', marginTop: '2px' }}>
                {userProfile.email}
              </div>
            </div>
          </div>
        ) : (
          <div
            style={{
              padding: '1.5rem',
              borderRadius: '20px',
              backgroundColor: 'var(--do-color-bg)',
              border: '1px solid var(--do-color-border)',
              textAlign: 'center',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: '12px',
            }}
          >
            <div>
              <h4 style={{ margin: '0 0 4px 0', fontSize: '1.05rem', fontWeight: 800, color: 'var(--do-color-text)' }}>
                {isVi ? 'Đăng nhập với Google' : 'Sign in with Google'}
              </h4>
              <p style={{ margin: 0, fontSize: '0.82rem', color: 'var(--do-color-text-muted)', lineHeight: 1.45 }}>
                {isVi
                  ? 'Đăng nhập tài khoản Google để bảo mật và đồng bộ dữ liệu ứng dụng.'
                  : 'Sign in with Google to secure and sync your application data.'}
              </p>
            </div>
            <button
              onClick={onOpenGoogleLogin}
              style={{
                marginTop: '6px',
                width: '100%',
                padding: '12px',
                borderRadius: '12px',
                backgroundColor: 'var(--do-color-primary)',
                color: '#ffffff',
                border: 'none',
                fontWeight: 700,
                fontSize: '0.9rem',
                cursor: 'pointer',
              }}
            >
              <span>{isVi ? 'Đăng nhập bằng Google' : 'Sign in with Google'}</span>
            </button>
          </div>
        )}

        {/* Feature List */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
          <h4 style={{ margin: '0 0 4px 0', fontSize: '0.82rem', fontWeight: 800, color: 'var(--do-color-text-muted)', textTransform: 'uppercase', letterSpacing: '0.6px' }}>
            {isVi ? 'Tính Năng Đã Kích Hoạt' : 'Active Features'}
          </h4>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            <div
              style={{
                padding: '12px 14px',
                borderRadius: '14px',
                backgroundColor: 'var(--do-color-bg)',
                border: '1px solid var(--do-color-border)',
              }}
            >
              <div style={{ fontSize: '0.85rem', fontWeight: 800, color: 'var(--do-color-text)' }}>
                {isVi ? 'Đồng bộ đám mây' : 'Cloud sync'}
              </div>
              <div style={{ fontSize: '0.74rem', color: 'var(--do-color-text-muted)', marginTop: '2px' }}>
                {isVi ? 'Tự động sao lưu và đồng bộ tài liệu' : 'Automatic backup and document sync'}
              </div>
            </div>

            <div
              style={{
                padding: '12px 14px',
                borderRadius: '14px',
                backgroundColor: 'var(--do-color-bg)',
                border: '1px solid var(--do-color-border)',
              }}
            >
              <div style={{ fontSize: '0.85rem', fontWeight: 800, color: 'var(--do-color-text)' }}>
                {isVi ? 'Bảo mật xác thực' : 'Authentication security'}
              </div>
              <div style={{ fontSize: '0.74rem', color: 'var(--do-color-text-muted)', marginTop: '2px' }}>
                {isVi ? 'Kết nối an toàn chuẩn OAuth 2.0' : 'Secure OAuth 2.0 connection'}
              </div>
            </div>
          </div>
        </div>

        {/* Logout Button */}
        {userProfile && onLogoutGoogle && (
          <button
            onClick={onLogoutGoogle}
            style={{
              marginTop: 'auto',
              padding: '12px',
              borderRadius: '14px',
              backgroundColor: 'rgba(239, 68, 68, 0.08)',
              color: '#ef4444',
              border: '1px solid rgba(239, 68, 68, 0.2)',
              fontWeight: 800,
              fontSize: '0.88rem',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '8px',
              transition: 'background 0.2s ease',
            }}
          >
            <LogOut size={16} />
            <span>{isVi ? 'Đăng xuất tài khoản Google' : 'Logout Google Account'}</span>
          </button>
        )}
      </div>
    </div>
  );
}
