import { useState, useEffect, useRef, useCallback, useLayoutEffect } from 'react';
import { createPortal } from 'react-dom';
// ── Module-level cache ─────────────────────────────────────────────────────
let _allFontsCache: string[] | null = null;
let _loadPromise: Promise<string[]> | null = null;

const RECOMMENDED_FONTS = [
  // Office / Word defaults
  'Calibri', 'Calibri Light', 'Cambria', 'Times New Roman', 'Arial',
  // Vietnamese common
  'Times New Roman', 'Arial', 'Tahoma', 'Verdana', 'Georgia',
  // Modern / design
  'Segoe UI', 'Helvetica Neue', 'Trebuchet MS', 'Garamond', 'Palatino Linotype',
  'Century Gothic', 'Franklin Gothic Medium', 'Gill Sans MT', 'Rockwell',
  // Monospace / code
  'Consolas', 'Courier New', 'Lucida Console',
].filter((v, i, a) => a.indexOf(v) === i); // dedupe

const WINDOWS_FALLBACK = [
  'Arial', 'Arial Black', 'Arial Narrow', 'Arial Rounded MT Bold',
  'Bahnschrift', 'Book Antiqua', 'Bookman Old Style',
  'Calibri', 'Calibri Light', 'Cambria', 'Cambria Math', 'Candara',
  'Century', 'Century Gothic', 'Comic Sans MS', 'Consolas', 'Constantia',
  'Corbel', 'Courier', 'Courier New', 'Ebrima', 'Franklin Gothic Medium',
  'Gabriola', 'Gadugi', 'Garamond', 'Georgia', 'Gill Sans MT', 'Impact',
  'Ink Free', 'Leelawadee UI', 'Lucida Console', 'Lucida Sans Unicode',
  'Malgun Gothic', 'Microsoft Sans Serif', 'Microsoft YaHei', 'Mongolian Baiti',
  'MS Gothic', 'MV Boli', 'Myanmar Text', 'Nirmala UI', 'Palatino Linotype',
  'Rockwell', 'Segoe Print', 'Segoe Script', 'Segoe UI', 'Segoe UI Symbol',
  'Sitka Banner', 'Sitka Display', 'Sitka Heading', 'Sitka Small',
  'Sitka Subheading', 'Sitka Text', 'Sylfaen', 'Symbol', 'Tahoma',
  'Times New Roman', 'Trebuchet MS', 'Verdana', 'Webdings', 'Wingdings',
  'Yu Gothic', 'Yu Gothic Light', 'Yu Gothic Medium', 'Yu Gothic UI',
];

const RECENTLY_USED_KEY = 'dawn_recent_fonts';
const MAX_RECENT = 8;

function getRecentFonts(): string[] {
  try {
    return JSON.parse(localStorage.getItem(RECENTLY_USED_KEY) || '[]');
  } catch { return []; }
}

function addRecentFont(font: string) {
  const recent = getRecentFonts().filter(f => f !== font);
  recent.unshift(font);
  localStorage.setItem(RECENTLY_USED_KEY, JSON.stringify(recent.slice(0, MAX_RECENT)));
}

async function loadSystemFonts(): Promise<string[]> {
  if (_allFontsCache) return _allFontsCache;
  if (_loadPromise) return _loadPromise;
  _loadPromise = (async () => {
    if (typeof (window as any).queryLocalFonts === 'function') {
      try {
        const fonts: { family: string }[] = await (window as any).queryLocalFonts();
        const families = [...new Set(fonts.map(f => f.family))].sort((a, b) =>
          a.localeCompare(b, 'en', { sensitivity: 'base' })
        );
        _allFontsCache = families;
        return families;
      } catch { /* permission denied */ }
    }
    _allFontsCache = [...new Set(WINDOWS_FALLBACK)].sort((a, b) =>
      a.localeCompare(b, 'en', { sensitivity: 'base' })
    );
    return _allFontsCache;
  })();
  return _loadPromise;
}

// ── FontPicker component ────────────────────────────────────────────────────
interface FontPickerProps {
  value: string;
  onChange: (font: string) => void;
}

interface Section {
  label: string;
  fonts: string[];
}

export default function FontPicker({ value, onChange }: FontPickerProps) {
  const [allFonts, setAllFonts]       = useState<string[]>([]);
  const [recentFonts, setRecentFonts] = useState<string[]>(getRecentFonts);
  const [search, setSearch]           = useState('');
  const [open, setOpen]               = useState(false);
  const [flatList, setFlatList]       = useState<string[]>([]);
  const [activeIdx, setActiveIdx]     = useState(0);
  const [dropdownStyle, setDropdownStyle] = useState<React.CSSProperties>({});
  const containerRef = useRef<HTMLDivElement>(null);
  const inputRef     = useRef<HTMLInputElement>(null);
  const listRef      = useRef<HTMLDivElement>(null);

  useEffect(() => { loadSystemFonts().then(setAllFonts); }, []);

  useLayoutEffect(() => {
    if (open && containerRef.current) {
      const rect = containerRef.current.getBoundingClientRect();
      setDropdownStyle({
        top: rect.bottom + 4,
        left: rect.left,
      });
    }
  }, [open]);

  // Build section list based on search
  const sections: Section[] = (() => {
    if (search.trim()) {
      // In search mode — flat filtered list, no sections
      return [{ label: '', fonts: allFonts.filter(f => f.toLowerCase().includes(search.toLowerCase())) }];
    }
    const recentSet = new Set(recentFonts);
    const recSection = recentFonts.length > 0
      ? [{ label: '🕐 Recently Used', fonts: recentFonts }]
      : [];
    const recFont  = new Set(recentFonts);
    const recOnly  = new Set(RECOMMENDED_FONTS);
    const recFiltered = RECOMMENDED_FONTS.filter(f => !recFont.has(f) && allFonts.includes(f));
    const allFiltered  = allFonts.filter(f => !recentSet.has(f) && !recOnly.has(f));
    const result: Section[] = [...recSection];
    if (recFiltered.length > 0) result.push({ label: '⭐ Recommended', fonts: recFiltered });
    result.push({ label: '🔤 All Fonts', fonts: allFiltered });
    return result;
  })();

  // Flat list for keyboard navigation
  useEffect(() => {
    setFlatList(sections.flatMap(s => s.fonts));
    setActiveIdx(0);
  }, [search, allFonts, recentFonts]);

  // Close on outside click
  useEffect(() => {
    if (!open) return;
    const handler = (e: MouseEvent) => {
      if (!containerRef.current?.contains(e.target as Node)) close();
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [open]);

  // Scroll active item into view
  useEffect(() => {
    if (!open || !listRef.current) return;
    const el = listRef.current.querySelector(`[data-active="true"]`) as HTMLElement | null;
    el?.scrollIntoView({ block: 'nearest' });
  }, [activeIdx, open]);

  const close = () => { setOpen(false); setSearch(''); };

  const select = useCallback((font: string) => {
    addRecentFont(font);
    setRecentFonts(getRecentFonts());
    onChange(font);
    close();
  }, [onChange]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (!open) {
      if (e.key === 'Enter' || e.key === 'ArrowDown' || e.key === ' ') {
        e.preventDefault(); setOpen(true);
      }
      return;
    }
    if (e.key === 'ArrowDown') { e.preventDefault(); setActiveIdx(i => Math.min(i + 1, flatList.length - 1)); }
    else if (e.key === 'ArrowUp') { e.preventDefault(); setActiveIdx(i => Math.max(i - 1, 0)); }
    else if (e.key === 'Enter') { e.preventDefault(); if (flatList[activeIdx]) select(flatList[activeIdx]); }
    else if (e.key === 'Escape') { e.preventDefault(); close(); }
  };

  return (
    <div ref={containerRef} style={{ position: 'relative', display: 'inline-block' }}>
      {/* ── Trigger input ── */}
      <input
        ref={inputRef}
        type="text"
        className="do-select"
        value={open ? search : value}
        placeholder={value}
        onChange={e => { setSearch(e.target.value); setActiveIdx(0); }}
        onFocus={() => { setOpen(true); setSearch(''); }}
        onKeyDown={handleKeyDown}
        title="Font Family — click or type to search"
        style={{
          width: '128px', height: '26px', fontSize: '12px',
          fontFamily: value, cursor: 'text',
          paddingRight: '22px',   // room for chevron
        }}
      />
      {/* Chevron indicator */}
      <span style={{
        position: 'absolute', right: '5px', top: '50%', transform: 'translateY(-50%)',
        fontSize: '9px', color: 'var(--do-color-text-muted)', pointerEvents: 'none',
      }}>{open ? '▲' : '▼'}</span>

      {/* ── Dropdown ── */}
      {open && createPortal(
        <div
          style={{
            position: 'absolute', zIndex: 9999,
            top: dropdownStyle.top,
            left: dropdownStyle.left,
            background: 'var(--do-color-surface)',
            border: '1px solid var(--do-color-border-focus)',
            borderRadius: '10px',
            boxShadow: '0 12px 32px rgba(0,0,0,0.18), 0 3px 8px rgba(0,0,0,0.08)',
            width: '240px',
            overflow: 'hidden',
            animation: 'fontDropIn 0.14s cubic-bezier(0.34,1.56,0.64,1) both',
          }}
        >
          <style>{`
            @keyframes fontDropIn {
              from { opacity:0; transform:translateY(-8px) scale(0.96); }
              to   { opacity:1; transform:translateY(0) scale(1); }
            }
          `}</style>

          {/* Header info */}
          <div style={{
            padding: '6px 10px 4px',
            fontSize: '10px', color: 'var(--do-color-text-muted)',
            borderBottom: '1px solid var(--do-color-border)',
            display: 'flex', justifyContent: 'space-between', alignItems: 'center',
          }}>
            <span>{search ? `${flatList.length} results` : `${allFonts.length} fonts installed`}</span>
            {recentFonts.length > 0 && !search && (
              <button
                onMouseDown={e => { e.preventDefault(); localStorage.removeItem('dawn_recent_fonts'); setRecentFonts([]); }}
                style={{ fontSize: '10px', border: 'none', background: 'none', color: 'var(--do-color-text-muted)', cursor: 'pointer', padding: '0 2px' }}
                title="Clear recent fonts"
              >✕ Clear recent</button>
            )}
          </div>

          {/* Scrollable list */}
          <div ref={listRef} style={{ maxHeight: '340px', overflowY: 'auto', padding: '4px' }}>
            {flatList.length === 0 && (
              <div style={{ padding: '12px', textAlign: 'center', fontSize: '12px', color: 'var(--do-color-text-muted)' }}>
                {allFonts.length === 0 ? 'Loading fonts…' : `No font matches "${search}"`}
              </div>
            )}

            {sections.map((section, si) => (
              <div key={si}>
                {/* Section header */}
                {section.label && (
                  <div style={{
                    padding: '6px 8px 3px',
                    fontSize: '10px',
                    fontWeight: 700,
                    color: 'var(--do-color-text-muted)',
                    letterSpacing: '0.06em',
                    textTransform: 'uppercase',
                    marginTop: si > 0 ? '6px' : 0,
                    borderTop: si > 0 ? '1px solid var(--do-color-border)' : 'none',
                  }}>
                    {section.label}
                  </div>
                )}

                {/* Font items */}
                {section.fonts.map(font => {
                  const flatIdx = flatList.indexOf(font);
                  const isActive = flatIdx === activeIdx;
                  const isCurrent = font === value;
                  return (
                    <div
                      key={`${si}-${font}`}
                      data-active={isActive ? 'true' : undefined}
                      onMouseDown={e => { e.preventDefault(); select(font); }}
                      onMouseEnter={() => setActiveIdx(flatIdx)}
                      style={{
                        padding: '5px 10px',
                        borderRadius: '6px',
                        cursor: 'pointer',
                        fontSize: '15px',
                        fontFamily: font,
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        transition: 'background 0.08s',
                        background: isCurrent
                          ? 'var(--do-color-primary-light)'
                          : isActive
                            ? 'var(--do-color-surface-hover)'
                            : 'transparent',
                        color: isCurrent ? 'var(--do-color-primary)' : 'var(--do-color-text)',
                        fontWeight: isCurrent ? 600 : 400,
                      }}
                    >
                      <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                        {font}
                      </span>
                      {isCurrent && (
                        <span style={{ fontSize: '10px', color: 'var(--do-color-primary)', marginLeft: '6px', flexShrink: 0 }}>✓</span>
                      )}
                    </div>
                  );
                })}
              </div>
            ))}
          </div>
        </div>,
        document.body
      )}
    </div>
  );
}
