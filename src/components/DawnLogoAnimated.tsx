import { useEffect, useRef } from 'react';

interface DawnLogoAnimatedProps {
  /** Size in px of the SVG square */
  size?: number;
  /** Show wordmark "Dawnoffice" text next to icon */
  showWordmark?: boolean;
  /** Auto-replay animation on hover */
  replayOnHover?: boolean;
  className?: string;
  style?: React.CSSProperties;
}

/**
 * Animated DawnOffice logo — sun rise + buildings grow + horizon draw.
 * Matches the animation spec from the HTML brand identity mockup.
 */
export default function DawnLogoAnimated({
  size = 40,
  showWordmark = false,
  replayOnHover = false,
  className,
  style,
}: DawnLogoAnimatedProps) {
  const wrapRef = useRef<HTMLDivElement>(null);

  const replay = () => {
    const el = wrapRef.current;
    if (!el) return;
    // Remove animation class, force reflow, re-add
    el.classList.add('dawn-logo-no-anim');
    void el.offsetWidth;
    el.classList.remove('dawn-logo-no-anim');
  };

  useEffect(() => {
    const el = wrapRef.current;
    if (!el || !replayOnHover) return;
    el.addEventListener('mouseenter', replay);
    return () => el.removeEventListener('mouseenter', replay);
  }, [replayOnHover]);

  return (
    <div
      ref={wrapRef}
      className={`dawn-logo-root${className ? ' ' + className : ''}`}
      style={{ display: 'inline-flex', alignItems: 'center', gap: 6, ...style }}
    >
      {/* SVG Icon */}
      <svg
        viewBox="0 0 100 100"
        width={size}
        height={size}
        style={{ flexShrink: 0, overflow: 'visible' }}
        aria-label="DawnOffice logo"
        role="img"
      >
        <defs>
          <linearGradient id="dlSunGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#ff7a45" />
            <stop offset="50%" stopColor="#f43f5e" />
            <stop offset="100%" stopColor="#e11d48" />
          </linearGradient>
          <clipPath id="dlHorizonClip">
            <rect x="0" y="0" width="100" height="74" />
          </clipPath>
        </defs>

        {/* Sun + Buildings clipped above horizon */}
        <g clipPath="url(#dlHorizonClip)">
          <circle
            cx="50" cy="68" r="29"
            fill="url(#dlSunGrad)"
            className="dl-anim-sun"
          />
          <rect x="25" y="44" width="13" height="30" rx="2" fill="#334155" className="dl-anim-building dl-building-1" />
          <rect x="43" y="26" width="14" height="48" rx="2" fill="#0f172a" className="dl-anim-building dl-building-2" />
          <rect x="62" y="50" width="13" height="24" rx="2" fill="#475569" className="dl-anim-building dl-building-3" />
        </g>

        {/* Horizon line */}
        <line
          x1="12" y1="74" x2="88" y2="74"
          stroke="#0f172a" strokeWidth="4.5" strokeLinecap="round"
          className="dl-anim-horizon"
        />
      </svg>

      {/* Optional wordmark */}
      {showWordmark && (
        <span
          className="dl-anim-wordmark"
          style={{
            fontSize: 13,
            fontWeight: 700,
            lineHeight: 1,
            letterSpacing: '-0.02em',
            userSelect: 'none',
            whiteSpace: 'nowrap',
          }}
        >
          <span
            style={{
              background: 'linear-gradient(135deg, #f97316, #e11d48)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              backgroundClip: 'text',
            }}
          >
            Dawn
          </span>
          <span style={{ color: 'var(--do-color-text-muted)', fontWeight: 400 }}>
            office
          </span>
        </span>
      )}
    </div>
  );
}
