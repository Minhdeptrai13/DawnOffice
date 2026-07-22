import { TransitionType, AnimationType } from '../../types/slides';

interface EffectPreviewBoxProps {
  type: 'transition' | 'animation';
  effectId: TransitionType | AnimationType;
  isSelected?: boolean;
}

export default function EffectPreviewBox({ type, effectId, isSelected = false }: EffectPreviewBoxProps) {
  // Common Box Styles
  const boxStyle: React.CSSProperties = {
    width: '48px',
    height: '34px',
    borderRadius: '8px',
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    border: `1.5px solid ${isSelected ? 'var(--do-color-primary)' : 'var(--do-color-border)'}`,
    position: 'relative',
    overflow: 'hidden',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: '4px',
    boxShadow: isSelected ? '0 2px 8px rgba(37, 99, 235, 0.3)' : 'none',
  };

  return (
    <>
      <style>{`
        @keyframes previewFade {
          0%, 100% { opacity: 0.2; transform: scale(0.9); }
          50% { opacity: 1; transform: scale(1); }
        }
        @keyframes previewPush {
          0% { transform: translateY(100%); }
          50%, 100% { transform: translateY(0); }
        }
        @keyframes previewWipe {
          0% { clip-path: inset(0 100% 0 0); }
          50%, 100% { clip-path: inset(0 0 0 0); }
        }
        @keyframes previewSplit {
          0% { clip-path: inset(50% 0 50% 0); }
          50%, 100% { clip-path: inset(0 0 0 0); }
        }
        @keyframes previewZoom {
          0% { transform: scale(0); opacity: 0; }
          50%, 100% { transform: scale(1); opacity: 1; }
        }
        @keyframes previewFlip {
          0% { transform: rotateY(0deg); }
          50% { transform: rotateY(180deg); }
          100% { transform: rotateY(360deg); }
        }
        @keyframes previewDissolve {
          0%, 100% { opacity: 0.3; filter: blur(3px); }
          50% { opacity: 1; filter: blur(0); }
        }
        @keyframes previewMorph {
          0%, 100% { borderRadius: 50%; transform: scale(0.6) rotate(0deg); background: #3b82f6; }
          50% { borderRadius: 2px; transform: scale(1) rotate(180deg); background: #ec4899; }
        }
        @keyframes previewFadeIn {
          0%, 100% { opacity: 0; }
          50% { opacity: 1; }
        }
        @keyframes previewFlyIn {
          0% { transform: translateY(20px); opacity: 0; }
          50%, 100% { transform: translateY(0); opacity: 1; }
        }
        @keyframes previewZoomIn {
          0% { transform: scale(0.2); opacity: 0; }
          50%, 100% { transform: scale(1); opacity: 1; }
        }
        @keyframes previewBounceIn {
          0% { transform: translateY(-15px); }
          40% { transform: translateY(0); }
          60% { transform: translateY(-6px); }
          80%, 100% { transform: translateY(0); }
        }
        @keyframes previewPulse {
          0%, 100% { transform: scale(1); }
          50% { transform: scale(1.25); }
        }
        @keyframes previewSpin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
        @keyframes previewColorFlash {
          0%, 100% { background: #3b82f6; }
          33% { background: #10b981; }
          66% { background: #f59e0b; }
        }
        @keyframes previewFlyOut {
          0%, 30% { transform: translateY(0); opacity: 1; }
          100% { transform: translateY(-25px); opacity: 0; }
        }
      `}</style>

      {type === 'transition' ? (
        effectId === 'fade' ? (
          <div style={boxStyle}>
            <div style={{ width: '80%', height: '70%', borderRadius: '4px', background: 'linear-gradient(135deg, #3b82f6, #60a5fa)', animation: 'previewFade 1.6s infinite ease-in-out' }} />
          </div>
        ) : effectId === 'push' ? (
          <div style={boxStyle}>
            <div style={{ width: '80%', height: '70%', borderRadius: '4px', background: 'linear-gradient(135deg, #10b981, #34d399)', animation: 'previewPush 1.6s infinite ease-in-out' }} />
          </div>
        ) : effectId === 'wipe' ? (
          <div style={boxStyle}>
            <div style={{ width: '80%', height: '70%', borderRadius: '4px', background: 'linear-gradient(135deg, #ec4899, #f472b6)', animation: 'previewWipe 1.6s infinite ease-in-out' }} />
          </div>
        ) : effectId === 'split' ? (
          <div style={boxStyle}>
            <div style={{ width: '80%', height: '70%', borderRadius: '4px', background: 'linear-gradient(135deg, #f59e0b, #fbbf24)', animation: 'previewSplit 1.6s infinite ease-in-out' }} />
          </div>
        ) : effectId === 'zoom' ? (
          <div style={boxStyle}>
            <div style={{ width: '80%', height: '70%', borderRadius: '4px', background: 'linear-gradient(135deg, #8b5cf6, #a78bfa)', animation: 'previewZoom 1.6s infinite ease-in-out' }} />
          </div>
        ) : effectId === 'flip' ? (
          <div style={{ ...boxStyle, perspective: '200px' }}>
            <div style={{ width: '80%', height: '70%', borderRadius: '4px', background: 'linear-gradient(135deg, #06b6d4, #22d3ee)', animation: 'previewFlip 1.8s infinite ease-in-out' }} />
          </div>
        ) : effectId === 'dissolve' ? (
          <div style={boxStyle}>
            <div style={{ width: '80%', height: '70%', borderRadius: '4px', background: 'radial-gradient(circle, #f43f5e 0%, #fb7185 100%)', animation: 'previewDissolve 1.6s infinite ease-in-out' }} />
          </div>
        ) : effectId === 'morph' ? (
          <div style={boxStyle}>
            <div style={{ width: '20px', height: '20px', background: '#6366f1', animation: 'previewMorph 1.8s infinite ease-in-out' }} />
          </div>
        ) : (
          <div style={boxStyle}>
            <span style={{ fontSize: '10px', color: 'var(--do-color-text-muted)' }}>Off</span>
          </div>
        )
      ) : effectId === 'fade-in' ? (
        <div style={boxStyle}>
          <div style={{ width: '18px', height: '18px', borderRadius: '50%', background: '#3b82f6', animation: 'previewFadeIn 1.5s infinite ease-in-out' }} />
        </div>
      ) : effectId === 'fly-in' ? (
        <div style={boxStyle}>
          <div style={{ width: '16px', height: '16px', borderRadius: '4px', background: '#10b981', animation: 'previewFlyIn 1.5s infinite ease-out' }} />
        </div>
      ) : effectId === 'zoom-in' ? (
        <div style={boxStyle}>
          <div style={{ width: '18px', height: '18px', borderRadius: '4px', background: '#8b5cf6', animation: 'previewZoomIn 1.5s infinite cubic-bezier(0.34, 1.56, 0.64, 1)' }} />
        </div>
      ) : effectId === 'bounce-in' ? (
        <div style={boxStyle}>
          <div style={{ width: '16px', height: '16px', borderRadius: '50%', background: '#f59e0b', animation: 'previewBounceIn 1.5s infinite ease-in-out' }} />
        </div>
      ) : effectId === 'pulse' ? (
        <div style={boxStyle}>
          <div style={{ width: '18px', height: '18px', borderRadius: '50%', background: '#ec4899', animation: 'previewPulse 1.2s infinite ease-in-out' }} />
        </div>
      ) : effectId === 'spin' ? (
        <div style={boxStyle}>
          <div style={{ width: '16px', height: '16px', borderRadius: '3px', background: '#06b6d4', animation: 'previewSpin 1.4s infinite linear' }} />
        </div>
      ) : effectId === 'color-flash' ? (
        <div style={boxStyle}>
          <div style={{ width: '18px', height: '18px', borderRadius: '4px', animation: 'previewColorFlash 1.4s infinite ease-in-out' }} />
        </div>
      ) : effectId === 'fly-out' ? (
        <div style={boxStyle}>
          <div style={{ width: '16px', height: '16px', borderRadius: '4px', background: '#ef4444', animation: 'previewFlyOut 1.5s infinite ease-in' }} />
        </div>
      ) : (
        <div style={boxStyle}>
          <span style={{ fontSize: '10px', color: 'var(--do-color-text-muted)' }}>Off</span>
        </div>
      )}
    </>
  );
}
