import React from 'react';

interface IconProps {
  size?: number;
  className?: string;
  style?: React.CSSProperties;
}

const DawnArtStyles = () => (
  <style>{`
    @keyframes dawn-sun-glow {
      0%, 100% { transform: scale(1); opacity: 0.95; }
      50% { transform: scale(1.08); opacity: 1; filter: drop-shadow(0 0 10px rgba(251,113,133,0.8)); }
    }
    @keyframes dawn-ray-rotate {
      from { transform: rotate(0deg); }
      to { transform: rotate(360deg); }
    }
    .dawn-art-badge {
      transition: transform 0.25s cubic-bezier(0.34, 1.56, 0.64, 1), box-shadow 0.25s ease;
    }
    .dawn-art-badge:hover {
      transform: translateY(-3px) scale(1.08);
    }
  `}</style>
);

// Shared Artistic "Dawn Sunrise" (Mặt Trời Bình Minh) Badge Frame
const DawnArtFrame: React.FC<{
  size: number;
  bgGradient: string;
  glowColor: string;
  symbol: React.ReactNode;
}> = ({ size, bgGradient, glowColor, symbol }) => (
  <div
    className="dawn-art-badge"
    style={{
      width: `${size}px`,
      height: `${size}px`,
      borderRadius: `${Math.max(8, Math.floor(size * 0.28))}px`,
      background: bgGradient,
      display: 'inline-flex',
      alignItems: 'center',
      justifyContent: 'center',
      boxShadow: `0 4px 14px ${glowColor}`,
      position: 'relative',
      overflow: 'hidden',
      flexShrink: 0,
      userSelect: 'none',
    }}
  >
    <svg width={size} height={size} viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
      <defs>
        {/* Rich Dawn Sunrise Gradients */}
        <linearGradient id="dawnSunRisingGrad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#fbbf24" />
          <stop offset="45%" stopColor="#f43f5e" />
          <stop offset="100%" stopColor="#e11d48" />
        </linearGradient>
      </defs>

      {/* Dawn Sunrise Arc (Mặt trời mọc rạng rỡ chân trời) */}
      <circle
        cx="50"
        cy="78"
        r="36"
        fill="url(#dawnSunRisingGrad)"
        style={{ animation: 'dawn-sun-glow 3.5s ease-in-out infinite', transformOrigin: '50px 78px' }}
      />

      {/* Sun Ray Beams */}
      <line x1="50" y1="18" x2="50" y2="28" stroke="#ffffff" strokeWidth="3" strokeLinecap="round" opacity="0.8" />
      <line x1="24" y1="28" x2="31" y2="35" stroke="#ffffff" strokeWidth="3" strokeLinecap="round" opacity="0.8" />
      <line x1="76" y1="28" x2="69" y2="35" stroke="#ffffff" strokeWidth="3" strokeLinecap="round" opacity="0.8" />

      {/* Horizon Baseline */}
      <line x1="10" y1="78" x2="90" y2="78" stroke="#ffffff" strokeWidth="4" strokeLinecap="round" opacity="0.95" />

      {/* Centered High Contrast Vector Emblem Overlay */}
      <g transform="translate(25, 20)">
        {symbol}
      </g>
    </svg>
  </div>
);

// 1. DawnBrainLogo - Official Dawn AI Copilot (Dawn Sunrise + Neural Sparkle)
export const DawnBrainLogo: React.FC<IconProps> = ({ size = 32, style }) => (
  <>
    <DawnArtStyles />
    <div style={{ display: 'inline-flex', ...style }}>
      <DawnArtFrame
        size={size}
        bgGradient="linear-gradient(135deg, #0f172a 0%, #1e1b4b 50%, #4338ca 100%)"
        glowColor="rgba(244,63,94,0.45)"
        symbol={
          <g transform="translate(5, 5)">
            <path
              d="M20 4L22.5 12L30.5 14.5L22.5 17L20 25L17.5 17L9.5 14.5L17.5 12L20 4Z"
              fill="#ffffff"
              fillOpacity="0.95"
              stroke="#ffffff"
              strokeWidth="1.5"
              strokeLinejoin="round"
            />
            <circle cx="20" cy="14.5" r="3.5" fill="#f43f5e" />
          </g>
        }
      />
    </div>
  </>
);

// 2. DawnWordLogo - Official DawnDoc (Dawn Sunrise + Word "W" Document)
export const DawnWordLogo: React.FC<IconProps> = ({ size = 32, style }) => (
  <>
    <DawnArtStyles />
    <div style={{ display: 'inline-flex', ...style }}>
      <DawnArtFrame
        size={size}
        bgGradient="linear-gradient(135deg, #1e3a8a 0%, #2563eb 50%, #60a5fa 100%)"
        glowColor="rgba(37,99,235,0.45)"
        symbol={
          <g transform="translate(5, 8)">
            <path
              d="M4 6L10 26L16 14L22 26L28 6"
              stroke="#ffffff"
              strokeWidth="5.5"
              strokeLinecap="round"
              strokeLinejoin="round"
              fill="none"
            />
          </g>
        }
      />
    </div>
  </>
);

// 3. DawnExcelLogo - Official DawnSheets (Dawn Sunrise + Excel "X" Grid)
export const DawnExcelLogo: React.FC<IconProps> = ({ size = 32, style }) => (
  <>
    <DawnArtStyles />
    <div style={{ display: 'inline-flex', ...style }}>
      <DawnArtFrame
        size={size}
        bgGradient="linear-gradient(135deg, #064e3b 0%, #10b981 50%, #34d399 100%)"
        glowColor="rgba(16,185,129,0.45)"
        symbol={
          <g transform="translate(5, 8)">
            <path
              d="M6 6L26 26M26 6L6 26"
              stroke="#ffffff"
              strokeWidth="6"
              strokeLinecap="round"
            />
          </g>
        }
      />
    </div>
  </>
);

// 4. DawnPowerPointLogo - Official DawnSlides (Dawn Sunrise + PowerPoint "P" Slide)
export const DawnPowerPointLogo: React.FC<IconProps> = ({ size = 32, style }) => (
  <>
    <DawnArtStyles />
    <div style={{ display: 'inline-flex', ...style }}>
      <DawnArtFrame
        size={size}
        bgGradient="linear-gradient(135deg, #7c2d12 0%, #f97316 50%, #fb923c 100%)"
        glowColor="rgba(249,115,22,0.45)"
        symbol={
          <g transform="translate(5, 6)">
            <path
              d="M6 5H18C22.5 5 26 8.5 26 13C26 17.5 22.5 21 18 21H6V5ZM6 21V31"
              stroke="#ffffff"
              strokeWidth="5.5"
              strokeLinecap="round"
              strokeLinejoin="round"
              fill="none"
            />
          </g>
        }
      />
    </div>
  </>
);

// 5. DawnFolderLogo - Official Dawn Files Folder
export const DawnFolderLogo: React.FC<IconProps> = ({ size = 32, style }) => (
  <>
    <DawnArtStyles />
    <div style={{ display: 'inline-flex', ...style }}>
      <DawnArtFrame
        size={size}
        bgGradient="linear-gradient(135deg, #92400e 0%, #f59e0b 50%, #fbbf24 100%)"
        glowColor="rgba(245,158,11,0.45)"
        symbol={
          <g transform="translate(5, 8)">
            <path
              d="M3 6C3 4.5 4.5 3 6 3H13L16 7H27C28.5 7 30 8.5 30 10V25C30 26.5 28.5 28 27 28H6C4.5 28 3 26.5 3 25V6Z"
              fill="#ffffff"
              fillOpacity="0.3"
              stroke="#ffffff"
              strokeWidth="2.5"
              strokeLinejoin="round"
            />
          </g>
        }
      />
    </div>
  </>
);

// 6. DawnHomeLogo - Official Dawn Welcome Hub
export const DawnHomeLogo: React.FC<IconProps> = ({ size = 32, style }) => (
  <>
    <DawnArtStyles />
    <div style={{ display: 'inline-flex', ...style }}>
      <DawnArtFrame
        size={size}
        bgGradient="linear-gradient(135deg, #3b0764 0%, #8b5cf6 50%, #c084fc 100%)"
        glowColor="rgba(139,92,246,0.45)"
        symbol={
          <g transform="translate(5, 6)">
            <path
              d="M4 14L16 4L28 14V27C28 28 27 29 26 29H20V19H12V29H6C5 29 4 28 4 27V14Z"
              fill="#ffffff"
              fillOpacity="0.3"
              stroke="#ffffff"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </g>
        }
      />
    </div>
  </>
);

// 7. DawnSettingsLogo - Official Dawn Settings Rotating Gear
export const DawnSettingsLogo: React.FC<IconProps> = ({ size = 32, style }) => (
  <>
    <DawnArtStyles />
    <div style={{ display: 'inline-flex', ...style }}>
      <DawnArtFrame
        size={size}
        bgGradient="linear-gradient(135deg, #1f2937 0%, #6b7280 50%, #9ca3af 100%)"
        glowColor="rgba(107,114,128,0.45)"
        symbol={
          <g transform="translate(5, 6)">
            <g style={{ animation: 'dawn-ray-rotate 12s linear infinite', transformOrigin: '16px 16px' }}>
              <circle cx="16" cy="16" r="6" stroke="#ffffff" strokeWidth="3" fill="#ffffff" fillOpacity="0.3" />
              <path d="M16 2V6M16 26V30M2 16H6M26 16H30M6 6L9 9M23 23L26 26M6 26L9 23M23 9L26 6" stroke="#ffffff" strokeWidth="3.2" strokeLinecap="round" />
            </g>
          </g>
        }
      />
    </div>
  </>
);
