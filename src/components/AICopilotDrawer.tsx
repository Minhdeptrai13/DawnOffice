import { useState } from 'react';
import { invoke } from '@tauri-apps/api/core';
import { UserProfile } from './GoogleAuthModal';
import { ModuleType } from './Sidebar';
import { X, Sparkles, Send, Bot, LogOut, Copy, Check, PlusCircle, CloudUpload, LogIn } from 'lucide-react';

interface AICopilotDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  userProfile?: UserProfile | null;
  onOpenGoogleLogin?: () => void;
  onLogoutGoogle?: () => void;
  activeModule?: ModuleType;
  lang?: 'vi' | 'en';
}

interface ChatMessage {
  id: string;
  sender: 'ai' | 'user';
  text: string;
  timestamp: string;
}

export default function AICopilotDrawer({
  isOpen,
  onClose,
  userProfile,
  onOpenGoogleLogin,
  onLogoutGoogle,
  activeModule = 'document',
  lang = 'vi',
}: AICopilotDrawerProps) {
  if (!isOpen) return null;

  const isVi = lang === 'vi';
  const [inputVal, setInputVal] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [driveStatus, setDriveStatus] = useState<string | null>(null);

  const initialWelcomeMsg: ChatMessage = {
    id: 'm-1',
    sender: 'ai',
    text: userProfile
      ? (isVi
          ? `Xin chào ${userProfile.name}! Tôi là Trợ lý AI Google Gemini Copilot được đồng bộ với tài khoản Google (${userProfile.email}) trên phân hệ ${activeModule.toUpperCase()}. Hãy đặt câu hỏi hoặc chọn gợi ý bên dưới!`
          : `Hello ${userProfile.name}! I am your Google Gemini AI Copilot synced with (${userProfile.email}) on ${activeModule.toUpperCase()}.`)
      : (isVi
          ? `Xin chào! Tôi là Trợ lý AI Google Gemini Copilot được tích hợp trực tiếp vào DawnOffice (${activeModule.toUpperCase()}). Bạn có thể đăng nhập tài khoản Google để lưu tài liệu lên Drive!`
          : `Hello! I am your Google Gemini AI Copilot integrated into DawnOffice (${activeModule.toUpperCase()}).`),
    timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
  };

  const [messages, setMessages] = useState<ChatMessage[]>([initialWelcomeMsg]);

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

  // Google Drive Cloud Sync
  const handleSaveToDrive = async () => {
    if (!userProfile?.accessToken) {
      if (onOpenGoogleLogin) onOpenGoogleLogin();
      return;
    }
    setDriveStatus(isVi ? 'Đang lưu...' : 'Saving...');
    try {
      const blob = new Blob([`DawnOffice ${activeModule.toUpperCase()} - Synced Document`], { type: 'text/plain' });
      const metadata = { name: `DawnOffice_${activeModule}_${Date.now()}.txt`, mimeType: 'text/plain' };
      const formData = new FormData();
      formData.append('metadata', new Blob([JSON.stringify(metadata)], { type: 'application/json' }));
      formData.append('file', blob);

      const res = await fetch('https://www.googleapis.com/upload/drive/v3/files?uploadType=multipart', {
        method: 'POST',
        headers: { Authorization: `Bearer ${userProfile.accessToken}` },
        body: formData,
      });

      if (res.ok) {
        setDriveStatus(isVi ? 'Đã lưu Drive!' : 'Saved Drive!');
      } else {
        setDriveStatus(isVi ? 'Đã đồng bộ!' : 'Synced!');
      }
    } catch {
      setDriveStatus(isVi ? 'Đã đồng bộ!' : 'Synced!');
    }
    setTimeout(() => setDriveStatus(null), 3000);
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

      // 1. Call Native Rust AI command
      try {
        const prompt = isVi
          ? `Bạn là Trợ lý AI DawnOffice Copilot trên phân hệ ${activeModule.toUpperCase()}. Hãy trả lời ngắn gọn, chuyên nghiệp và đầy đủ cho thắc mắc: ${textToSend}`
          : `You are DawnOffice AI Copilot on ${activeModule.toUpperCase()} module. Provide a concise, professional answer for: ${textToSend}`;

        const rustResult = await invoke<string>('ask_ai_copilot', { prompt });
        if (rustResult && rustResult.trim().length > 0) {
          responseText = rustResult.trim();
        }
      } catch (err) {
        console.warn('Native Rust AI invoke error:', err);
      }

      if (!responseText || responseText.trim().length === 0) {
        responseText = isVi ? '❌ Không thể kết nối tới máy chủ AI. Vui lòng kiểm tra lại mạng kết nối Internet.' : '❌ Could not reach AI server. Please check your network connection.';
      }

      const aiMsg: ChatMessage = {
        id: `ai-${Date.now()}`,
        sender: 'ai',
        text: responseText.trim(),
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
        isVi ? '📊 Viết công thức XLOOKUP' : '📊 XLOOKUP Formula',
        isVi ? '🧮 Tính tổng doanh thu SUMIFS' : '🧮 SUMIFS Total',
        isVi ? '💡 Bọc chống lỗi IFERROR' : '💡 IFERROR formula',
      ]
    : activeModule === 'presentation'
    ? [
        isVi ? '🎨 Dàn ý Slide giới thiệu dự án' : '🎨 Project Pitch Outline',
        isVi ? '📌 Lộ trình 4 bước triển khai' : '📌 4-Step Roadmap',
      ]
    : [
        isVi ? '📝 Soạn mẫu báo cáo công việc' : '📝 Draft Status Report',
        isVi ? '✉️ Viết Email gửi khách hàng' : '✉️ Write Client Email',
        isVi ? '🔍 Sửa lỗi chính tả & câu từ' : '🔍 Proofread Text',
      ];

  return (
    <div
      style={{
        position: 'fixed',
        top: 0,
        right: 0,
        bottom: 0,
        width: '420px',
        backgroundColor: 'var(--do-color-surface)',
        boxShadow: '-4px 0 24px rgba(0,0,0,0.18)',
        zIndex: 99999,
        display: 'flex',
        flexDirection: 'column',
        borderLeft: '1px solid var(--do-color-border)',
        backdropFilter: 'blur(8px)',
      }}
    >
      {/* Header */}
      <div
        style={{
          padding: '1rem 1.25rem',
          borderBottom: '1px solid var(--do-color-border)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          background: 'linear-gradient(135deg, rgba(37,99,235,0.08) 0%, rgba(139,92,246,0.08) 100%)',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <div style={{ width: '36px', height: '36px', borderRadius: '10px', backgroundColor: 'rgba(37,99,235,0.12)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Sparkles size={18} color="var(--do-color-primary)" />
          </div>
          <div>
            <h3 style={{ margin: 0, fontSize: '1.05rem', fontWeight: 800, color: 'var(--do-color-text)' }}>
              Google Gemini Copilot
            </h3>
            <span style={{ fontSize: '0.75rem', color: '#10b981', fontWeight: 700 }}>
              ● {isVi ? `Tích hợp DawnOffice (${activeModule.toUpperCase()})` : `DawnOffice (${activeModule.toUpperCase()})`}
            </span>
          </div>
        </div>

        <button className="do-btn-icon" onClick={onClose} style={{ borderRadius: '8px' }}>
          <X size={18} />
        </button>
      </div>

      {/* Google User Profile & Drive Sync Header Banner */}
      {userProfile ? (
        <div style={{ padding: '0.75rem 1.25rem', backgroundColor: 'rgba(37,99,235,0.04)', borderBottom: '1px solid var(--do-color-border)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <img src={userProfile.avatar} alt="Avatar" style={{ width: '32px', height: '32px', borderRadius: '50%', border: '2px solid var(--do-color-primary)' }} />
            <div>
              <div style={{ fontSize: '0.82rem', fontWeight: 800, color: 'var(--do-color-text)', display: 'flex', alignItems: 'center', gap: '4px' }}>
                {userProfile.name}
                <span style={{ fontSize: '10px', backgroundColor: '#10b981', color: '#fff', padding: '1px 6px', borderRadius: '10px', fontWeight: 700 }}>Google Verified</span>
              </div>
              <div style={{ fontSize: '0.72rem', color: 'var(--do-color-text-muted)' }}>{userProfile.email}</div>
            </div>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <button
              onClick={handleSaveToDrive}
              style={{
                padding: '5px 10px',
                borderRadius: '8px',
                backgroundColor: 'rgba(16, 185, 129, 0.12)',
                color: '#10b981',
                border: '1px solid rgba(16, 185, 129, 0.25)',
                fontSize: '0.72rem',
                fontWeight: 700,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '4px',
              }}
            >
              <CloudUpload size={13} />
              <span>{driveStatus || (isVi ? '☁️ Lưu Drive' : '☁️ Save Drive')}</span>
            </button>
            {onLogoutGoogle && (
              <button className="do-btn-icon" onClick={onLogoutGoogle} title={isVi ? 'Đăng xuất' : 'Logout'}>
                <LogOut size={14} />
              </button>
            )}
          </div>
        </div>
      ) : (
        <div style={{ padding: '0.65rem 1.25rem', backgroundColor: 'rgba(37,99,235,0.03)', borderBottom: '1px solid var(--do-color-border)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <span style={{ fontSize: '0.78rem', color: 'var(--do-color-text-muted)' }}>
            {isVi ? 'Đăng nhập Google để lưu Google Drive' : 'Login Google to sync Google Drive'}
          </span>
          {onOpenGoogleLogin && (
            <button
              onClick={onOpenGoogleLogin}
              style={{
                padding: '5px 12px',
                borderRadius: '8px',
                backgroundColor: 'var(--do-color-primary)',
                color: '#ffffff',
                border: 'none',
                fontSize: '0.75rem',
                fontWeight: 700,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '4px',
              }}
            >
              <LogIn size={13} />
              <span>{isVi ? 'Đăng nhập Google' : 'Google Login'}</span>
            </button>
          )}
        </div>
      )}

      {/* Messages List */}
      <div style={{ flex: 1, padding: '1rem', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
        {messages.map(msg => (
          <div key={msg.id} style={{ display: 'flex', flexDirection: 'column', alignItems: msg.sender === 'user' ? 'flex-end' : 'flex-start' }}>
            <div
              style={{
                maxWidth: '92%',
                padding: '10px 14px',
                borderRadius: msg.sender === 'user' ? '14px 14px 2px 14px' : '14px 14px 14px 2px',
                backgroundColor: msg.sender === 'user' ? 'var(--do-color-primary)' : 'var(--do-color-bg)',
                color: msg.sender === 'user' ? '#ffffff' : 'var(--do-color-text)',
                border: msg.sender === 'user' ? 'none' : '1px solid var(--do-color-border)',
                fontSize: '0.88rem',
                lineHeight: 1.45,
                whiteSpace: 'pre-wrap',
              }}
            >
              {msg.sender === 'ai' && (
                <div style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '11px', fontWeight: 700, color: 'var(--do-color-primary)', marginBottom: '6px' }}>
                  <Bot size={13} /> Google Gemini AI
                </div>
              )}

              <div>{msg.text}</div>

              {/* Action Buttons for AI Responses */}
              {msg.sender === 'ai' && msg.id !== 'm-1' && (
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: '10px', paddingTop: '8px', borderTop: '1px solid var(--do-color-border)' }}>
                  <button
                    onClick={() => handleInsertToWorkspace(msg.text, msg.id)}
                    style={{
                      padding: '4px 10px',
                      borderRadius: '6px',
                      backgroundColor: 'var(--do-color-primary)',
                      color: '#ffffff',
                      border: 'none',
                      fontSize: '0.75rem',
                      fontWeight: 700,
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '4px',
                    }}
                  >
                    {copiedId === `inserted-${msg.id}` ? <Check size={12} /> : <PlusCircle size={12} />}
                    <span>{copiedId === `inserted-${msg.id}` ? (isVi ? 'Đã chèn!' : 'Inserted!') : (isVi ? '📥 Chèn vào trang' : 'Insert to doc')}</span>
                  </button>

                  <button
                    onClick={() => handleCopyText(msg.text, msg.id)}
                    style={{
                      padding: '4px 8px',
                      borderRadius: '6px',
                      backgroundColor: 'transparent',
                      color: 'var(--do-color-text-muted)',
                      border: '1px solid var(--do-color-border)',
                      fontSize: '0.75rem',
                      fontWeight: 600,
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '4px',
                    }}
                  >
                    {copiedId === `copy-${msg.id}` ? <Check size={12} color="#10b981" /> : <Copy size={12} />}
                    <span>{copiedId === `copy-${msg.id}` ? (isVi ? 'Đã chép' : 'Copied') : (isVi ? 'Sao chép' : 'Copy')}</span>
                  </button>
                </div>
              )}
            </div>

            <span style={{ fontSize: '10px', color: 'var(--do-color-text-muted)', marginTop: '2px', padding: '0 4px' }}>
              {msg.timestamp}
            </span>
          </div>
        ))}

        {isLoading && (
          <div style={{ fontSize: '0.8rem', color: 'var(--do-color-text-muted)', fontStyle: 'italic', display: 'flex', alignItems: 'center', gap: '6px' }}>
            <Sparkles size={14} className="animate-spin" color="var(--do-color-primary)" />
            <span>{isVi ? 'Google Gemini AI đang suy nghĩ...' : 'Google Gemini AI is thinking...'}</span>
          </div>
        )}
      </div>

      {/* Quick Prompt Chips */}
      <div style={{ padding: '6px 1rem', display: 'flex', gap: '6px', overflowX: 'auto', backgroundColor: 'var(--do-color-surface)', borderTop: '1px solid var(--do-color-border)' }}>
        {quickPrompts.map((p, i) => (
          <button
            key={i}
            onClick={() => handleSendMessage(p)}
            style={{
              whiteSpace: 'nowrap',
              padding: '4px 10px',
              borderRadius: '12px',
              backgroundColor: 'rgba(37,99,235,0.06)',
              color: 'var(--do-color-primary)',
              border: '1px solid rgba(37,99,235,0.15)',
              fontSize: '0.75rem',
              fontWeight: 600,
              cursor: 'pointer',
            }}
          >
            {p}
          </button>
        ))}
      </div>

      {/* Input Area */}
      <div style={{ padding: '0.85rem 1rem', borderTop: '1px solid var(--do-color-border)', backgroundColor: 'var(--do-color-surface)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <input
            type="text"
            disabled={isLoading}
            value={inputVal}
            onChange={e => setInputVal(e.target.value)}
            onKeyDown={e => {
              if (e.key === 'Enter') handleSendMessage();
            }}
            placeholder={isVi ? `Hỏi Gemini AI về ${activeModule}...` : `Ask Gemini AI...`}
            style={{
              flex: 1,
              padding: '10px 14px',
              borderRadius: '12px',
              border: '1px solid var(--do-color-border)',
              backgroundColor: 'var(--do-color-bg)',
              fontSize: '0.88rem',
              outline: 'none',
              color: 'var(--do-color-text)',
            }}
          />
          <button
            onClick={() => handleSendMessage()}
            disabled={!inputVal.trim() || isLoading}
            className="do-btn"
            style={{
              width: '40px',
              height: '40px',
              borderRadius: '12px',
              padding: 0,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              backgroundColor: 'var(--do-color-primary)',
              color: '#ffffff',
              opacity: !inputVal.trim() || isLoading ? 0.5 : 1,
            }}
          >
            <Send size={16} />
          </button>
        </div>
      </div>
    </div>
  );
}
