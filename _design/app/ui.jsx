// ui.jsx — shared UI primitives for iLoveLurido
// Icons (line, 24px), photo placeholders, pins, chips, buttons, skeletons

// Lucide-ish line icons — stroke 1.8, round caps
function LIcon({ name, size = 20, color = 'currentColor', strokeWidth = 1.8 }) {
  const paths = {
    map:       <><path d="M3 6l6-2 6 2 6-2v14l-6 2-6-2-6 2V6z"/><path d="M9 4v14M15 6v14"/></>,
    search:    <><circle cx="11" cy="11" r="7"/><path d="M21 21l-4.3-4.3"/></>,
    plus:      <><path d="M12 5v14M5 12h14"/></>,
    bell:      <><path d="M6 8a6 6 0 0 1 12 0c0 7 3 7 3 9H3c0-2 3-2 3-9"/><path d="M10 21a2 2 0 0 0 4 0"/></>,
    user:      <><circle cx="12" cy="8" r="4"/><path d="M4 21c0-4 4-6 8-6s8 2 8 6"/></>,
    close:     <><path d="M6 6l12 12M18 6L6 18"/></>,
    chev:      <><path d="M9 6l6 6-6 6"/></>,
    chevL:     <><path d="M15 6l-6 6 6 6"/></>,
    chevD:     <><path d="M6 9l6 6 6-6"/></>,
    star:      <><path d="M12 2l3 7 7 .6-5.4 4.7 1.8 7-6.4-4-6.4 4 1.8-7L2 9.6 9 9z"/></>,
    filter:    <><path d="M4 5h16M7 12h10M10 19h4"/></>,
    pin:       <><path d="M12 2a7 7 0 0 0-7 7c0 5 7 13 7 13s7-8 7-13a7 7 0 0 0-7-7z"/><circle cx="12" cy="9" r="2.5"/></>,
    clock:     <><circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/></>,
    heart:     <><path d="M12 21s-7-4.5-9.5-9a5.5 5.5 0 0 1 9.5-5.5A5.5 5.5 0 0 1 21.5 12c-2.5 4.5-9.5 9-9.5 9z"/></>,
    share:     <><circle cx="6" cy="12" r="2.5"/><circle cx="18" cy="6" r="2.5"/><circle cx="18" cy="18" r="2.5"/><path d="M8 11l8-4M8 13l8 4"/></>,
    camera:    <><path d="M3 8h4l2-3h6l2 3h4v11H3V8z"/><circle cx="12" cy="13" r="4"/></>,
    photo:     <><rect x="3" y="5" width="18" height="14" rx="2"/><circle cx="9" cy="10" r="2"/><path d="M3 17l6-5 4 3 4-3 4 4"/></>,
    phone:     <><path d="M22 17v3a2 2 0 0 1-2 2A18 18 0 0 1 2 4a2 2 0 0 1 2-2h3l2 5-2.5 1.5a14 14 0 0 0 7 7L15 13l5 2z"/></>,
    flag:      <><path d="M4 22V4M4 4h12l-2 4 2 4H4"/></>,
    check:     <><path d="M4 12l5 5L20 6"/></>,
    checkCircle: <><circle cx="12" cy="12" r="9"/><path d="M8 12l3 3 5-6"/></>,
    x:         <><circle cx="12" cy="12" r="9"/><path d="M9 9l6 6M15 9l-6 6"/></>,
    edit:      <><path d="M4 20h4L20 8l-4-4L4 16v4z"/></>,
    settings:  <><circle cx="12" cy="12" r="3"/><path d="M12 2v3M12 19v3M22 12h-3M5 12H2M18.4 5.6l-2.1 2.1M7.7 16.3l-2.1 2.1M18.4 18.4l-2.1-2.1M7.7 7.7L5.6 5.6"/></>,
    location:  <><circle cx="12" cy="12" r="3"/><path d="M12 2v3M12 19v3M22 12h-3M5 12H2"/></>,
    sparkle:   <><path d="M12 3l2 6 6 2-6 2-2 6-2-6-6-2 6-2z"/></>,
    arrowUp:   <><path d="M12 19V5M6 11l6-6 6 6"/></>,
    grip:      <><circle cx="9" cy="6" r="1"/><circle cx="15" cy="6" r="1"/><circle cx="9" cy="12" r="1"/><circle cx="15" cy="12" r="1"/><circle cx="9" cy="18" r="1"/><circle cx="15" cy="18" r="1"/></>,
    eye:       <><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8S1 12 1 12z"/><circle cx="12" cy="12" r="3"/></>,
    trash:     <><path d="M3 6h18M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2M6 6l1 14a2 2 0 0 0 2 2h6a2 2 0 0 0 2-2l1-14"/></>,
    mood:      <><circle cx="12" cy="12" r="9"/><path d="M8 14s1.5 2 4 2 4-2 4-2M9 9v.01M15 9v.01"/></>,
    bookmark:  <><path d="M6 3h12v18l-6-4-6 4V3z"/></>,
    flame:     <><path d="M12 2s4 4 4 8a4 4 0 0 1-8 0c0-1 .5-2 1-3-.5 2 1 3 2 3 0-2-1-3-1-5s1-3 2-3z"/><path d="M8 14c0 4 2 7 4 7s4-3 4-7"/></>,
  };
  const p = paths[name] || paths.pin;
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none"
         stroke={color} strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round">
      {p}
    </svg>
  );
}

// ─────────────────────────────────────────────────────────────
// Photo placeholder — evokes real food photos without hand-drawing
// Uses warm stock-style gradients with faint iconography + label
// ─────────────────────────────────────────────────────────────
function LPhoto({ label = 'panino', kind = 'food', dark = false, w = '100%', h = 160, radius = 14, style = {} }) {
  // Generate a warm, moody gradient based on label hash
  const hash = [...label].reduce((a, c) => a + c.charCodeAt(0), 0);
  const palettes = [
    ['#3a1f12', '#a84d1e', '#f4a865'],   // ember
    ['#2a1810', '#7d3820', '#d67a3a'],   // roasted
    ['#1a1208', '#4a3820', '#c89658'],   // caramel
    ['#2c1812', '#8a3a28', '#e89060'],   // paprika
    ['#1f1410', '#6a2f1c', '#b87850'],   // walnut
    ['#160f0a', '#3a2414', '#a86838'],   // cacao
  ];
  const p = palettes[hash % palettes.length];

  return (
    <div style={{
      width: w, height: h, borderRadius: radius, overflow: 'hidden',
      background: `radial-gradient(ellipse at 30% 40%, ${p[2]} 0%, ${p[1]} 45%, ${p[0]} 100%)`,
      position: 'relative',
      ...style,
    }}>
      {/* Noise/grain overlay */}
      <div style={{
        position: 'absolute', inset: 0,
        background: `repeating-linear-gradient(${hash % 180}deg, rgba(255,255,255,0.03) 0 1px, transparent 1px 3px),
                     repeating-linear-gradient(${(hash * 7) % 180}deg, rgba(0,0,0,0.04) 0 1px, transparent 1px 4px)`,
        mixBlendMode: 'overlay',
      }} />
      {/* Vignette */}
      <div style={{
        position: 'absolute', inset: 0,
        background: 'radial-gradient(ellipse at center, transparent 40%, rgba(0,0,0,0.35) 100%)',
      }} />
      {/* Soft highlight */}
      <div style={{
        position: 'absolute', left: '15%', top: '10%', width: '40%', height: '30%',
        background: 'radial-gradient(ellipse, rgba(255,220,180,0.25), transparent 70%)',
        filter: 'blur(8px)',
      }} />
      {/* Label in corner — monospace hint */}
      <div style={{
        position: 'absolute', left: 8, bottom: 8,
        fontSize: 9, fontFamily: 'ui-monospace, monospace',
        color: 'rgba(255,240,220,0.55)', letterSpacing: 0.3,
        textTransform: 'uppercase',
      }}>{label}</div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
// Pin — multiple style variants
// variant: 'pill' (default), 'glow', 'baracchino', 'minimal'
// ─────────────────────────────────────────────────────────────
function LPin({ variant = 'pill', status = 'open', accent, size = 36, label, mode = 'day' }) {
  const color = status === 'open' ? accent.base
    : status === 'closed' ? (mode === 'night' ? 'rgba(245,234,216,0.3)' : 'rgba(26,21,18,0.35)')
    : status === 'pending' ? '#8b7a5a'
    : accent.base;
  const ring = status === 'open';

  if (variant === 'glow') {
    return (
      <div style={{ position: 'relative', width: size, height: size }}>
        {ring && <div style={{
          position: 'absolute', inset: -8, borderRadius: '50%',
          background: `radial-gradient(circle, ${accent.glow} 0%, transparent 65%)`,
          opacity: 0.7, filter: 'blur(4px)',
        }} />}
        <div style={{
          position: 'absolute', inset: 0, borderRadius: '50%',
          background: color, display: 'flex', alignItems: 'center', justifyContent: 'center',
          boxShadow: `0 2px 8px rgba(0,0,0,0.3), inset 0 -2px 4px rgba(0,0,0,0.2), inset 0 2px 2px ${accent.glow}`,
        }}>
          <span style={{ fontSize: size * 0.5 }}>🥪</span>
        </div>
      </div>
    );
  }

  if (variant === 'baracchino') {
    // Stylized tiny shack shape
    return (
      <svg width={size} height={size * 1.2} viewBox="0 0 40 48" style={{ filter: ring ? `drop-shadow(0 0 8px ${accent.glow})` : 'drop-shadow(0 2px 4px rgba(0,0,0,0.3))' }}>
        <path d="M20 4 L36 16 L36 40 L4 40 L4 16 Z" fill={color} stroke={accent.ink} strokeWidth="1.5"/>
        <rect x="10" y="22" width="20" height="12" fill={accent.ink} opacity="0.35"/>
        <path d="M4 16 L36 16" stroke={accent.ink} strokeWidth="1" opacity="0.4"/>
        <path d="M20 40 L20 48" stroke={color} strokeWidth="3"/>
      </svg>
    );
  }

  if (variant === 'minimal') {
    return (
      <div style={{
        width: size * 0.55, height: size * 0.55, borderRadius: '50%',
        background: color,
        border: `2px solid ${mode === 'night' ? '#120d0a' : '#fff'}`,
        boxShadow: ring ? `0 0 0 3px ${accent.glow}66, 0 2px 4px rgba(0,0,0,0.2)` : '0 1px 3px rgba(0,0,0,0.25)',
      }} />
    );
  }

  // default: 'pill' — teardrop pin with number/flame
  return (
    <div style={{ position: 'relative', filter: ring ? `drop-shadow(0 0 6px ${accent.glow}aa)` : 'none' }}>
      <svg width={size} height={size * 1.3} viewBox="0 0 32 42">
        <path d="M16 2 C7 2 2 8 2 16 C2 26 16 40 16 40 C16 40 30 26 30 16 C30 8 25 2 16 2 Z"
              fill={color} stroke={accent.ink} strokeWidth="1"/>
        <circle cx="16" cy="15" r="6" fill={mode === 'night' ? '#120d0a' : '#fff'} opacity="0.95"/>
      </svg>
      {label && <div style={{
        position: 'absolute', left: '50%', top: '35%', transform: 'translate(-50%, -50%)',
        fontSize: 10, fontWeight: 700, color: accent.ink, fontFamily: 'ui-monospace, monospace',
      }}>{label}</div>}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
// Stars rating
// ─────────────────────────────────────────────────────────────
function LStars({ value = 0, size = 14, color, emptyColor }) {
  return (
    <div style={{ display: 'inline-flex', gap: 1 }}>
      {[1,2,3,4,5].map(i => (
        <svg key={i} width={size} height={size} viewBox="0 0 24 24" fill={value >= i - 0.4 ? color : emptyColor}>
          <path d="M12 2l3 7 7 .6-5.4 4.7 1.8 7-6.4-4-6.4 4 1.8-7L2 9.6 9 9z"/>
        </svg>
      ))}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
// Chip / tag / button primitives
// ─────────────────────────────────────────────────────────────
function LChip({ children, active = false, theme, accent, small = false, onClick, icon }) {
  return (
    <button onClick={onClick} style={{
      display: 'inline-flex', alignItems: 'center', gap: 5,
      padding: small ? '5px 10px' : '7px 13px',
      borderRadius: 999,
      background: active ? accent.base : theme.chip,
      color: active ? accent.ink : theme.text,
      border: `1px solid ${active ? accent.base : theme.border}`,
      fontSize: small ? 11.5 : 13, fontWeight: active ? 600 : 500,
      cursor: 'pointer', fontFamily: 'inherit',
      transition: 'all 0.15s',
      whiteSpace: 'nowrap',
    }}>
      {icon}{children}
    </button>
  );
}

function LButton({ children, variant = 'primary', theme, accent, full = false, icon, onClick, small = false, disabled }) {
  const styles = {
    primary: { bg: accent.base, color: accent.ink, border: accent.base },
    ghost: { bg: 'transparent', color: theme.text, border: theme.borderStrong },
    subtle: { bg: theme.surfaceAlt, color: theme.text, border: theme.border },
    danger: { bg: 'transparent', color: theme.danger, border: theme.border },
  }[variant];
  return (
    <button onClick={onClick} disabled={disabled} style={{
      display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: 8,
      padding: small ? '8px 14px' : '12px 18px',
      borderRadius: 12, width: full ? '100%' : 'auto',
      background: styles.bg, color: styles.color, border: `1px solid ${styles.border}`,
      fontSize: small ? 13 : 15, fontWeight: 600,
      cursor: disabled ? 'not-allowed' : 'pointer', fontFamily: 'inherit',
      opacity: disabled ? 0.5 : 1,
      transition: 'transform 0.08s, opacity 0.15s',
    }}
    onMouseDown={e => !disabled && (e.currentTarget.style.transform = 'scale(0.97)')}
    onMouseUp={e => (e.currentTarget.style.transform = '')}
    onMouseLeave={e => (e.currentTarget.style.transform = '')}
    >
      {icon}{children}
    </button>
  );
}

// ─────────────────────────────────────────────────────────────
// Status badge "Aperto ora" / "Chiuso"
// ─────────────────────────────────────────────────────────────
function LStatusBadge({ status, theme, accent, size = 'md' }) {
  const map = {
    open:    { label: 'Aperto ora',     color: theme.success, dot: true },
    closed:  { label: 'Chiuso',         color: theme.textMuted, dot: false },
    pending: { label: 'In attesa',      color: '#b8944a', dot: false },
    reported:{ label: 'Segnalato chiuso', color: theme.danger, dot: false },
  };
  const s = map[status] || map.closed;
  return (
    <span style={{
      display: 'inline-flex', alignItems: 'center', gap: 5,
      fontSize: size === 'sm' ? 11 : 12, fontWeight: 600,
      color: s.color,
    }}>
      {s.dot && (
        <span style={{
          width: 7, height: 7, borderRadius: '50%', background: s.color,
          boxShadow: `0 0 6px ${s.color}aa`,
        }} />
      )}
      {s.label}
    </span>
  );
}

// ─────────────────────────────────────────────────────────────
// Skeleton shimmer
// ─────────────────────────────────────────────────────────────
function LSkeleton({ w = '100%', h = 16, r = 6, theme }) {
  return (
    <div style={{
      width: w, height: h, borderRadius: r,
      background: `linear-gradient(90deg, ${theme.surfaceAlt} 25%, ${theme.chip} 50%, ${theme.surfaceAlt} 75%)`,
      backgroundSize: '200% 100%',
      animation: 'lshimmer 1.4s infinite',
    }} />
  );
}

// Inject shimmer keyframes + global resets
if (typeof document !== 'undefined' && !document.getElementById('lurido-css')) {
  const s = document.createElement('style');
  s.id = 'lurido-css';
  s.textContent = `
    @keyframes lshimmer { 0% { background-position: 200% 0 } 100% { background-position: -200% 0 } }
    @keyframes lfadein { from { opacity: 0; transform: translateY(4px) } to { opacity: 1; transform: none } }
    @keyframes lslideup { from { transform: translateY(100%) } to { transform: none } }
    @keyframes lpulse { 0%,100% { opacity: 0.6 } 50% { opacity: 1 } }
    .l-fade { animation: lfadein 0.25s ease-out }
    .l-slideup { animation: lslideup 0.3s cubic-bezier(.2,.9,.3,1) }
    .l-pulse { animation: lpulse 2s ease-in-out infinite }
    .l-scroll::-webkit-scrollbar { display: none }
    .l-scroll { scrollbar-width: none }
  `;
  document.head.appendChild(s);
}

Object.assign(window, {
  LIcon, LPhoto, LPin, LStars, LChip, LButton, LStatusBadge, LSkeleton,
});
