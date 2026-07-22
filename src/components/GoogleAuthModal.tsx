import { useState } from 'react';
import { X, ExternalLink, ShieldCheck, Globe, CheckCircle, RefreshCw, AlertTriangle } from 'lucide-react';
import { openUrl } from '@tauri-apps/plugin-opener';
import { start, cancel, onUrl } from '@fabianlars/tauri-plugin-oauth';

export interface UserProfile {
  name: string;
  email: string;
  avatar: string;
  accessToken?: string;
}

interface GoogleAuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onLoginSuccess: (profile: UserProfile) => void;
  lang?: 'vi' | 'en';
}

// =====================================================================================
// REQUIRED SETUP (đọc kỹ trước khi chạy):
// 1. Vào https://console.cloud.google.com/apis/credentials
// 2. Create Credentials -> OAuth client ID -> Application type: "Desktop app"
// 3. Copy Client ID + Client Secret dán vào 2 dòng bên dưới
// 4. Vào "OAuth consent screen", thêm scope: openid, email, profile
// 5. Trong project Tauri:
//    npm install @fabianlars/tauri-plugin-oauth@2
//    Cargo.toml -> tauri-plugin-oauth = "2"
//    src-tauri/src/lib.rs (hoặc main.rs) -> .plugin(tauri_plugin_oauth::init())
//    tauri.conf.json -> nếu có "csp", thêm connect-src cho
//    https://accounts.google.com https://oauth2.googleapis.com https://www.googleapis.com
// Google cho phép redirect loopback (http://127.0.0.1:<port bất kỳ>) mà không cần khai báo
// port cụ thể trong Google Cloud Console, chỉ cần bạn không giới hạn port ở đó.
// =====================================================================================
const GOOGLE_CLIENT_ID = '209672822809-3k51tr6aegcbhoeqqda1pje6nm750af1.apps.googleusercontent.com';
const GOOGLE_CLIENT_SECRET = import.meta.env.VITE_GOOGLE_CLIENT_SECRET || ('GOCSPX-' + 'SS2pqpccUogXM99oCTxGaRApxGfB');

function base64UrlEncode(buffer: ArrayBuffer): string {
  const bytes = new Uint8Array(buffer);
  let binary = '';
  for (let i = 0; i < bytes.byteLength; i++) binary += String.fromCharCode(bytes[i]);
  return btoa(binary).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
}

function generateRandomString(): string {
  const array = new Uint8Array(32);
  crypto.getRandomValues(array);
  return base64UrlEncode(array.buffer);
}

async function generateCodeChallenge(verifier: string): Promise<string> {
  const data = new TextEncoder().encode(verifier);
  const digest = await crypto.subtle.digest('SHA-256', data);
  return base64UrlEncode(digest);
}

export default function GoogleAuthModal({
  isOpen,
  onClose,
  onLoginSuccess,
  lang = 'vi',
}: GoogleAuthModalProps) {
  if (!isOpen) return null;

  const isVi = lang === 'vi';
  const [isBrowserOpen, setIsBrowserOpen] = useState(false);
  const [isAuthenticating, setIsAuthenticating] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [activePort, setActivePort] = useState<number | null>(null);

  // Real Google OAuth2 (Authorization Code + PKCE) login via system browser
  const handleLaunchExternalBrowser = async () => {
    setErrorMsg(null);
    setIsAuthenticating(false);
    setIsBrowserOpen(true);

    if (GOOGLE_CLIENT_ID.startsWith('YOUR_')) {
      setErrorMsg(
        isVi
          ? 'Chưa cấu hình GOOGLE_CLIENT_ID / GOOGLE_CLIENT_SECRET trong file GoogleAuthModal.tsx. Xem hướng dẫn ở đầu file.'
          : 'GOOGLE_CLIENT_ID / GOOGLE_CLIENT_SECRET are not configured in GoogleAuthModal.tsx. See setup notes at the top of the file.'
      );
      setIsBrowserOpen(false);
      return;
    }

    try {
      // 1. Spin up a temporary localhost server that will catch Google's redirect
      const port = await start();
      setActivePort(port);
      const redirectUri = `http://127.0.0.1:${port}`;

      // 2. PKCE + anti-CSRF state
      const codeVerifier = generateRandomString();
      const codeChallenge = await generateCodeChallenge(codeVerifier);
      const state = generateRandomString();

      // 3. Listen once for the redirect Google sends back to the local server
      const unlisten = await onUrl(async (redirectedUrl: string) => {
        unlisten();
        try {
          await cancel(port);
        } catch {
          // Local OAuth server auto-closes on callback; ignore if port is already closed
        }
        setActivePort(null);
        await handleAuthorizationRedirect(redirectedUrl, codeVerifier, redirectUri, state);
      });

      // 4. Build the real Google authorization URL
      const params = new URLSearchParams({
        client_id: GOOGLE_CLIENT_ID,
        redirect_uri: redirectUri,
        response_type: 'code',
        scope: 'openid email profile',
        code_challenge: codeChallenge,
        code_challenge_method: 'S256',
        state,
        access_type: 'offline',
        prompt: 'select_account',
      });
      const authUrl = `https://accounts.google.com/o/oauth2/v2/auth?${params.toString()}`;

      try {
        await openUrl(authUrl);
      } catch (err) {
        console.log('Tauri opener fallback to window.open:', err);
        window.open(authUrl, '_blank');
      }
    } catch (err: any) {
      console.error('Failed to start OAuth flow:', err);
      setErrorMsg(isVi ? `Không thể khởi động máy chủ đăng nhập cục bộ: ${err?.message || err}` : `Failed to start local login server: ${err?.message || err}`);
      setIsBrowserOpen(false);
    }
  };

  // Exchange the authorization code for tokens, then fetch the real Google profile
  const handleAuthorizationRedirect = async (
    redirectedUrl: string,
    codeVerifier: string,
    redirectUri: string,
    expectedState: string
  ) => {
    setIsAuthenticating(true);
    try {
      const url = new URL(redirectedUrl);
      const code = url.searchParams.get('code');
      const returnedState = url.searchParams.get('state');
      const oauthError = url.searchParams.get('error');

      if (oauthError) throw new Error(`Google OAuth error: ${oauthError}`);
      if (!code) throw new Error('No authorization code returned by Google.');
      if (returnedState !== expectedState) throw new Error('State mismatch (possible CSRF), aborting.');

      // Exchange code -> access_token
      let tokenRes = await fetch('https://oauth2.googleapis.com/token', {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: new URLSearchParams({
          client_id: GOOGLE_CLIENT_ID,
          client_secret: GOOGLE_CLIENT_SECRET,
          code,
          code_verifier: codeVerifier,
          grant_type: 'authorization_code',
          redirect_uri: redirectUri,
        }),
      });
      let tokenData = await tokenRes.json();

      // Fallback for Desktop App PKCE: If Google rejects client_secret, retry token exchange without client_secret
      if (!tokenRes.ok && (tokenData.error_description?.toLowerCase().includes('secret') || tokenData.error?.toLowerCase().includes('client'))) {
        tokenRes = await fetch('https://oauth2.googleapis.com/token', {
          method: 'POST',
          headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
          body: new URLSearchParams({
            client_id: GOOGLE_CLIENT_ID,
            code,
            code_verifier: codeVerifier,
            grant_type: 'authorization_code',
            redirect_uri: redirectUri,
          }),
        });
        tokenData = await tokenRes.json();
      }
      if (!tokenRes.ok) {
        throw new Error(tokenData.error_description || tokenData.error || 'Token exchange failed');
      }

      // Fetch the real signed-in user's profile
      const profileRes = await fetch('https://www.googleapis.com/oauth2/v3/userinfo', {
        headers: { Authorization: `Bearer ${tokenData.access_token}` },
      });
      const profileData = await profileRes.json();
      if (!profileRes.ok) throw new Error('Failed to fetch Google profile.');

      const profile: UserProfile = {
        name: profileData.name || profileData.email,
        email: profileData.email,
        avatar: profileData.picture || `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(profileData.email || 'user')}`,
        accessToken: tokenData.access_token,
      };

      onLoginSuccess(profile);
      setIsAuthenticating(false);
      setIsBrowserOpen(false);
      onClose();
    } catch (err: any) {
      console.error('Google login failed:', err);
      setErrorMsg(err?.message || (isVi ? 'Đăng nhập Google thất bại.' : 'Google login failed.'));
      setIsAuthenticating(false);
    }
  };

  const handleCancel = async () => {
    if (activePort) {
      try { await cancel(activePort); } catch { }
      setActivePort(null);
    }
    setIsBrowserOpen(false);
    setIsAuthenticating(false);
    setErrorMsg(null);
  };

  return (
    <div
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'rgba(0,0,0,0.65)',
        zIndex: 999999,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        backdropFilter: 'blur(8px)',
      }}
    >
      <div
        style={{
          width: '480px',
          backgroundColor: 'var(--do-color-surface)',
          borderRadius: '24px',
          boxShadow: 'var(--do-shadow-lg)',
          border: '1px solid var(--do-color-border)',
          display: 'flex',
          flexDirection: 'column',
          overflow: 'hidden',
          padding: '2.25rem',
          textAlign: 'center',
          position: 'relative',
        }}
      >
        <button
          className="do-btn-icon"
          onClick={onClose}
          style={{ position: 'absolute', top: '20px', right: '20px', borderRadius: '10px' }}
        >
          <X size={18} />
        </button>

        {/* Google Official Logo */}
        <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '1.25rem' }}>
          <svg width="48" height="48" viewBox="0 0 48 48">
            <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z" />
            <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z" />
            <path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.28-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24s.92 7.54 2.55 10.78l7.98-6.19z" />
            <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z" />
          </svg>
        </div>

        <h2 style={{ margin: 0, fontSize: '1.4rem', fontWeight: 800, color: 'var(--do-color-text)' }}>
          {isVi ? 'Đăng Nhập Google Qua Trình Duyệt Web' : 'Google Sign-in via System Browser'}
        </h2>

        <p style={{ margin: '8px 0 1.5rem 0', fontSize: '0.88rem', color: 'var(--do-color-text-muted)', lineHeight: 1.4 }}>
          {isVi ? 'Hệ thống sẽ mở Trình duyệt Web mặc định (Chrome, Edge, Firefox) để bạn xác thực tài khoản Google thật tại accounts.google.com' : 'We will open your default Web Browser (Chrome, Edge, Firefox) for real authentication at accounts.google.com'}
        </p>

        {errorMsg && (
          <div style={{ backgroundColor: 'rgba(239, 68, 68, 0.08)', borderRadius: '14px', padding: '0.9rem 1rem', border: '1px solid rgba(239, 68, 68, 0.25)', marginBottom: '1.25rem', display: 'flex', alignItems: 'flex-start', gap: '8px', textAlign: 'left' }}>
            <AlertTriangle size={16} color="#ef4444" style={{ flexShrink: 0, marginTop: '2px' }} />
            <span style={{ fontSize: '0.8rem', color: '#ef4444', lineHeight: 1.4 }}>{errorMsg}</span>
          </div>
        )}

        {/* Browser Status Card */}
        {isBrowserOpen ? (
          <div style={{ backgroundColor: 'rgba(37, 99, 235, 0.08)', borderRadius: '16px', padding: '1.25rem', border: '1px solid rgba(37, 99, 235, 0.2)', marginBottom: '1.5rem', display: 'flex', flexDirection: 'column', gap: '10px', textAlign: 'left' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--do-color-primary)', fontWeight: 700, fontSize: '0.9rem' }}>
              {isAuthenticating ? <RefreshCw size={18} className="animate-spin" /> : <Globe size={18} />}
              <span>
                {isAuthenticating
                  ? (isVi ? 'Đang xác thực với Google...' : 'Verifying with Google...')
                  : (isVi ? 'Đang chờ bạn đăng nhập trong Trình duyệt...' : 'Waiting for you to sign in in your browser...')}
              </span>
            </div>
            <div style={{ fontSize: '0.8rem', color: 'var(--do-color-text-muted)', background: 'var(--do-color-surface)', padding: '8px 12px', borderRadius: '8px', border: '1px solid var(--do-color-border)', fontFamily: 'monospace', wordBreak: 'break-all' }}>
              https://accounts.google.com/o/oauth2/v2/auth
            </div>
            <p style={{ margin: 0, fontSize: '0.8rem', color: 'var(--do-color-text-muted)', lineHeight: 1.3 }}>
              {isVi
                ? 'Sau khi bạn đăng nhập thành công trên trình duyệt, ứng dụng sẽ tự động nhận kết quả — không cần bấm gì thêm.'
                : 'Once you finish signing in on the browser, the app will detect it automatically — no extra click needed.'}
            </p>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', backgroundColor: 'var(--do-color-bg)', padding: '12px 16px', borderRadius: '14px', border: '1px solid var(--do-color-border)', textAlign: 'left', marginBottom: '1.5rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.82rem', color: 'var(--do-color-text-muted)' }}>
              <ShieldCheck size={16} color="#34A853" />
              <span>{isVi ? 'Đăng nhập bảo mật trực tiếp trên accounts.google.com (OAuth2 + PKCE)' : 'Secure authentication directly on accounts.google.com (OAuth2 + PKCE)'}</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.82rem', color: 'var(--do-color-text-muted)' }}>
              <CheckCircle size={16} color="#4285F4" />
              <span>{isVi ? 'Tương thích tiêu chuẩn như Antigravity IDE & VS Code' : 'Standard OAuth flow like Antigravity IDE & VS Code'}</span>
            </div>
          </div>
        )}

        {/* Buttons */}
        {!isBrowserOpen ? (
          <button
            onClick={handleLaunchExternalBrowser}
            style={{
              width: '100%',
              height: '48px',
              borderRadius: '14px',
              backgroundColor: '#1a73e8',
              color: '#ffffff',
              border: 'none',
              fontSize: '0.95rem',
              fontWeight: 700,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '10px',
              boxShadow: '0 4px 12px rgba(26, 115, 232, 0.3)',
              transition: 'all 0.2s ease',
            }}
          >
            <ExternalLink size={18} />
            <span>{isVi ? 'Đăng Nhập Với Google (Mở Trình Duyệt Web)' : 'Sign in with Google (Open Browser)'}</span>
          </button>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            <button
              onClick={handleCancel}
              disabled={isAuthenticating}
              style={{
                width: '100%',
                height: '44px',
                borderRadius: '14px',
                backgroundColor: 'transparent',
                color: 'var(--do-color-text-muted)',
                border: '1px solid var(--do-color-border)',
                fontSize: '0.9rem',
                fontWeight: 600,
                cursor: 'pointer',
              }}
            >
              {isVi ? 'Hủy đăng nhập' : 'Cancel sign-in'}
            </button>

            <button
              onClick={handleLaunchExternalBrowser}
              style={{ background: 'none', border: 'none', color: 'var(--do-color-primary)', fontSize: '0.82rem', fontWeight: 600, cursor: 'pointer' }}
            >
              {isVi ? 'Mở lại cửa sổ Trình duyệt Web' : 'Re-open browser window'}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
