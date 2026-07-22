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
          <div
            style={{
              width: '38px',
              height: '38px',
              borderRadius: '12px',
              background: 'linear-gradient(135deg, #ffd700 0%, #f59e0b 100%)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: '0 4px 14px rgba(245,158,11,0.4)',
            }}
          >
            <Crown size={22} color="#000000" />
          </div>
          <div>
            <h3 style={{ margin: 0, fontSize: '1.05rem', fontWeight: 900, color: 'var(--do-color-text)', display: 'flex', alignItems: 'center', gap: '6px' }}>
              Google Pro Account
            </h3>
            <span style={{ fontSize: '0.75rem', color: '#10b981', fontWeight: 700 }}>
              ● {isVi ? 'Tài khoản Pro VIP đã kích hoạt' : 'Pro VIP Account Active'}
            </span>
          </div>
        </div>

        <button className="do-btn-icon" onClick={onClose} style={{ borderRadius: '8px' }}>
          <X size={18} />
        </button>
      </div>

      {/* Main Drawer Body - Minimalist Pro Account Hub */}
      <div style={{ flex: 1, padding: '1.5rem', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
        {/* Pro Account Membership Card */}
        {userProfile ? (
          <div
            style={{
              padding: '1.5rem',
              borderRadius: '24px',
              background: 'linear-gradient(135deg, rgba(255,215,0,0.1) 0%, rgba(139,92,246,0.1) 100%)',
              border: '2px solid transparent',
              backgroundImage: 'linear-gradient(var(--do-color-surface), var(--do-color-surface)), linear-gradient(135deg, #ffd700, #a855f7, #06b6d4)',
              backgroundOrigin: 'border-box',
              backgroundClip: 'padding-box, border-box',
              boxShadow: '0 8px 28px rgba(255,215,0,0.2)',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              textAlign: 'center',
              gap: '1rem',
              position: 'relative',
              overflow: 'hidden',
            }}
          >
            {/* Background Glow Effect */}
            <div
              style={{
                position: 'absolute',
                top: '-50px',
                right: '-50px',
                width: '120px',
                height: '120px',
                borderRadius: '50%',
                background: 'radial-gradient(circle, rgba(255,215,0,0.2) 0%, transparent 70%)',
                pointerEvents: 'none',
              }}
            />

            {/* Glowing Avatar */}
            <div style={{ position: 'relative', marginTop: '0.5rem' }}>
              <img
                src={userProfile.avatar}
                alt="Avatar"
                style={{
                  width: '72px',
                  height: '72px',
                  borderRadius: '50%',
                  boxShadow: '0 0 20px rgba(255,215,0,0.6)',
                  border: '3px solid #ffd700',
                }}
              />
              <div
                style={{
                  position: 'absolute',
                  bottom: '0',
                  right: '0',
                  backgroundColor: '#ffd700',
                  borderRadius: '50%',
                  padding: '4px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  boxShadow: '0 2px 8px rgba(0,0,0,0.3)',
                }}
              >
                <Crown size={14} color="#000000" />
              </div>
            </div>

            <div>
              <div style={{ fontSize: '1.15rem', fontWeight: 900, color: 'var(--do-color-text)', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px' }}>
                {userProfile.name}
                <ShieldCheck size={18} color="#10b981" />
              </div>
              <div style={{ fontSize: '0.82rem', color: 'var(--do-color-text-muted)', marginTop: '2px' }}>
                {userProfile.email}
              </div>
            </div>

            {/* Pro VIP Badge */}
            <div
              style={{
                padding: '6px 16px',
                borderRadius: '20px',
                background: 'linear-gradient(135deg, #ffd700 0%, #f59e0b 100%)',
                color: '#000000',
                fontWeight: 900,
                fontSize: '0.82rem',
                letterSpacing: '0.6px',
                boxShadow: '0 4px 14px rgba(245,158,11,0.4)',
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
              }}
            >
              <Sparkles size={14} />
              <span>👑 DAWNOFFICE PRO VIP MEMBER</span>
            </div>
          </div>
        ) : (
          <div
            style={{
              padding: '1.75rem 1.25rem',
              borderRadius: '24px',
              backgroundColor: 'rgba(255,215,0,0.05)',
              border: '2px dashed rgba(255,215,0,0.3)',
              textAlign: 'center',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: '12px',
            }}
          >
            <div
              style={{
                width: '56px',
                height: '56px',
                borderRadius: '50%',
                background: 'linear-gradient(135deg, #ffd700 0%, #f59e0b 100%)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                boxShadow: '0 6px 18px rgba(245,158,11,0.3)',
              }}
            >
              <Crown size={28} color="#000000" />
            </div>
            <div>
              <h4 style={{ margin: '0 0 4px 0', fontSize: '1.05rem', fontWeight: 900, color: 'var(--do-color-text)' }}>
                {isVi ? 'Nâng cấp Google Pro Account' : 'Upgrade to Google Pro Account'}
              </h4>
              <p style={{ margin: 0, fontSize: '0.82rem', color: 'var(--do-color-text-muted)', lineHeight: 1.45 }}>
                {isVi
                  ? 'Đăng nhập bằng tài khoản Google để kích hoạt huy hiệu Pro mạ vàng và bảo mật mã hóa toàn bộ ứng dụng!'
                  : 'Login with Google to activate glowing Pro VIP badge & secure your app!'}
              </p>
            </div>
            <button
              onClick={onOpenGoogleLogin}
              style={{
                marginTop: '6px',
                width: '100%',
                padding: '12px',
                borderRadius: '14px',
                background: 'linear-gradient(135deg, #4285F4 0%, #2563eb 100%)',
                color: '#ffffff',
                border: 'none',
                fontWeight: 800,
                fontSize: '0.92rem',
                cursor: 'pointer',
                boxShadow: '0 6px 18px rgba(37,99,235,0.35)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px',
              }}
            >
              <Sparkles size={16} />
              <span>{isVi ? '🔑 Đăng nhập Google Pro Account' : '🔑 Login Google Pro Account'}</span>
            </button>
          </div>
        )}

        {/* Pro Account Privileges List */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
          <h4 style={{ margin: '0 0 4px 0', fontSize: '0.85rem', fontWeight: 900, color: 'var(--do-color-text-muted)', textTransform: 'uppercase', letterSpacing: '0.6px' }}>
            {isVi ? 'Đặc Quyền Thành Viên Pro' : 'Pro VIP Privileges'}
          </h4>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            <div
              style={{
                padding: '12px 14px',
                borderRadius: '14px',
                backgroundColor: 'var(--do-color-bg)',
                border: '1px solid var(--do-color-border)',
                display: 'flex',
                alignItems: 'center',
                gap: '12px',
              }}
            >
              <div style={{ width: '34px', height: '34px', borderRadius: '10px', backgroundColor: 'rgba(255,215,0,0.12)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Star size={18} color="#f59e0b" />
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: '0.85rem', fontWeight: 800, color: 'var(--do-color-text)' }}>
                  {isVi ? 'Huy hiệu Pro VIP Hoàng Gia' : 'Royal Pro VIP Badge'}
                </div>
                <div style={{ fontSize: '0.74rem', color: 'var(--do-color-text-muted)' }}>
                  {isVi ? 'Hiển thị viền mạ vàng phát sáng ánh kim' : 'Glowing gold gradient avatar ring'}
                </div>
              </div>
              <CheckCircle2 size={16} color="#10b981" />
            </div>

            <div
              style={{
                padding: '12px 14px',
                borderRadius: '14px',
                backgroundColor: 'var(--do-color-bg)',
                border: '1px solid var(--do-color-border)',
                display: 'flex',
                alignItems: 'center',
                gap: '12px',
              }}
            >
              <div style={{ width: '34px', height: '34px', borderRadius: '10px', backgroundColor: 'rgba(16,185,129,0.12)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Lock size={18} color="#10b981" />
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: '0.85rem', fontWeight: 800, color: 'var(--do-color-text)' }}>
                  {isVi ? 'Bảo Mật OAuth 2.0 Xác Thực' : 'OAuth 2.0 Verified Security'}
                </div>
                <div style={{ fontSize: '0.74rem', color: 'var(--do-color-text-muted)' }}>
                  {isVi ? 'Mã hóa kết nối tài khoản Google chuẩn' : 'Google OAuth2 256-bit encryption'}
                </div>
              </div>
              <CheckCircle2 size={16} color="#10b981" />
            </div>

            <div
              style={{
                padding: '12px 14px',
                borderRadius: '14px',
                backgroundColor: 'var(--do-color-bg)',
                border: '1px solid var(--do-color-border)',
                display: 'flex',
                alignItems: 'center',
                gap: '12px',
              }}
            >
              <div style={{ width: '34px', height: '34px', borderRadius: '10px', backgroundColor: 'rgba(37,99,235,0.12)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Zap size={18} color="#2563eb" />
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: '0.85rem', fontWeight: 800, color: 'var(--do-color-text)' }}>
                  {isVi ? 'Hiệu Năng Tối Ưu Tốc Độ' : 'Maximum App Performance'}
                </div>
                <div style={{ fontSize: '0.74rem', color: 'var(--do-color-text-muted)' }}>
                  {isVi ? 'Mở khóa toàn bộ các phân hệ Word, Sheet, Slide' : 'Unlocked all modules for maximum speed'}
                </div>
              </div>
              <CheckCircle2 size={16} color="#10b981" />
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
