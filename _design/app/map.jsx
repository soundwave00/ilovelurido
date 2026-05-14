// map.jsx — Map home screen
// Fake map illustration (warm parchment day / cacao night) + pins + preview card

function LuridoMap({ theme, accent, mode, pinVariant, mapStyle, luridi, onSelectLurido, selectedId, phoneW = 402, phoneH = 780 }) {
  // Fake "Milan" map — we draw stylized blocks & roads procedurally with SVG.
  // Not a real map; just an evocative backdrop.

  const mapStyles = {
    warm:    { bg: theme.mapBg, road: theme.mapRoad, green: theme.mapGreen, water: theme.mapWater, roadStroke: theme.mapRoadStroke },
    mono:    { bg: mode === 'night' ? '#181614' : '#e8e4de', road: mode === 'night' ? '#22201d' : '#f5f3ee', green: mode === 'night' ? '#1f1d1a' : '#d8d4cd', water: mode === 'night' ? '#14181c' : '#c8ccd0', roadStroke: 'rgba(128,128,128,0.08)' },
    vintage: { bg: '#f0e5c8', road: '#fff8e8', green: '#d8dcac', water: '#b8c8c0', roadStroke: 'rgba(120,90,40,0.12)' },
  };
  const ms = mapStyles[mapStyle] || mapStyles.warm;

  return (
    <div style={{
      position: 'absolute', inset: 0, background: ms.bg, overflow: 'hidden',
    }}>
      {/* SVG map backdrop */}
      <svg width="100%" height="100%" viewBox="0 0 400 800" preserveAspectRatio="xMidYMid slice"
           style={{ position: 'absolute', inset: 0 }}>
        <defs>
          <pattern id="mapgrain" width="3" height="3" patternUnits="userSpaceOnUse">
            <rect width="3" height="3" fill={ms.bg}/>
            <circle cx="1.5" cy="1.5" r="0.4" fill={mode === 'night' ? 'rgba(255,200,140,0.03)' : 'rgba(60,40,20,0.04)'}/>
          </pattern>
        </defs>
        <rect width="400" height="800" fill="url(#mapgrain)"/>

        {/* Parks / green patches */}
        <path d="M20,100 Q80,80 140,120 T240,110 L250,180 Q180,200 100,180 T20,200 Z" fill={ms.green} opacity="0.85"/>
        <circle cx="320" cy="300" r="70" fill={ms.green} opacity="0.75"/>
        <path d="M40,500 Q100,480 180,510 L190,590 Q120,600 40,590 Z" fill={ms.green} opacity="0.8"/>
        <circle cx="80" cy="680" r="50" fill={ms.green} opacity="0.6"/>

        {/* Water — Navigli */}
        <path d="M-10,630 Q60,620 130,640 T280,650 T410,640 L410,680 Q280,690 130,680 T-10,670 Z" fill={ms.water} opacity="0.9"/>
        <path d="M100,640 L80,800" stroke={ms.water} strokeWidth="18" fill="none" opacity="0.9"/>

        {/* Major roads */}
        <g stroke={ms.road} strokeWidth="12" fill="none">
          <path d="M-10,220 Q150,230 260,210 T410,220"/>
          <path d="M-10,400 L410,420"/>
          <path d="M200,-10 L210,820"/>
          <path d="M-10,560 Q200,555 410,570"/>
          <path d="M50,-10 Q80,200 120,400 T180,820"/>
          <path d="M340,-10 Q320,300 350,600 T330,820"/>
        </g>
        {/* Road outlines (subtle) */}
        <g stroke={ms.roadStroke} strokeWidth="13" fill="none">
          <path d="M-10,220 Q150,230 260,210 T410,220"/>
          <path d="M-10,400 L410,420"/>
          <path d="M200,-10 L210,820"/>
          <path d="M-10,560 Q200,555 410,570"/>
        </g>
        {/* Minor streets */}
        <g stroke={ms.road} strokeWidth="4" fill="none" opacity="0.7">
          <path d="M-10,140 L410,150"/>
          <path d="M-10,300 L410,310"/>
          <path d="M-10,480 L410,490"/>
          <path d="M-10,720 L410,730"/>
          <path d="M100,-10 L105,820"/>
          <path d="M280,-10 L275,820"/>
        </g>
        {/* City blocks (very faint) */}
        <g fill={mode === 'night' ? 'rgba(255,210,160,0.03)' : 'rgba(60,40,20,0.04)'}>
          <rect x="30" y="260" width="40" height="30"/>
          <rect x="130" y="250" width="50" height="40"/>
          <rect x="240" y="260" width="40" height="30"/>
          <rect x="50" y="440" width="60" height="30"/>
          <rect x="250" y="450" width="40" height="30"/>
          <rect x="140" y="330" width="45" height="50"/>
        </g>

        {/* Zone labels — lightly italic */}
        <g fill={mode === 'night' ? 'rgba(245,234,216,0.22)' : 'rgba(60,40,20,0.28)'}
           fontFamily="Space Grotesk, Inter, sans-serif" fontWeight="500" fontSize="11" letterSpacing="1.5">
          <text x="70" y="120" fontStyle="italic">ISOLA</text>
          <text x="150" y="330" fontStyle="italic">BRERA</text>
          <text x="240" y="360" fontStyle="italic">PORTA VENEZIA</text>
          <text x="160" y="510" fontStyle="italic">P. ROMANA</text>
          <text x="100" y="680" fontStyle="italic">NAVIGLI</text>
          <text x="30" y="160" fontStyle="italic">BOVISA</text>
        </g>
      </svg>

      {/* Night glow overlay — soft vignette from top */}
      {mode === 'night' && (
        <div style={{
          position: 'absolute', inset: 0, pointerEvents: 'none',
          background: 'radial-gradient(ellipse at 50% 30%, transparent 30%, rgba(0,0,0,0.45) 90%)',
        }} />
      )}

      {/* User location blip */}
      <div style={{
        position: 'absolute', left: '50%', top: '58%', transform: 'translate(-50%, -50%)',
        width: 16, height: 16, pointerEvents: 'none',
      }}>
        <div className="l-pulse" style={{
          position: 'absolute', inset: -10, borderRadius: '50%',
          background: `radial-gradient(circle, ${accent.base}55, transparent 70%)`,
        }}/>
        <div style={{
          width: '100%', height: '100%', borderRadius: '50%',
          background: '#3b82f6', border: `3px solid ${mode === 'night' ? '#120d0a' : '#fff'}`,
          boxShadow: '0 2px 6px rgba(0,0,0,0.4)',
        }}/>
      </div>

      {/* Pins */}
      {luridi.filter(l => l.status !== 'pending').map(l => {
        const isSel = selectedId === l.id;
        return (
          <button key={l.id} onClick={() => onSelectLurido(l)} style={{
            position: 'absolute',
            left: `${l.x * 100}%`, top: `${l.y * 100}%`,
            transform: `translate(-50%, -100%) ${isSel ? 'scale(1.25)' : 'scale(1)'}`,
            background: 'none', border: 'none', cursor: 'pointer', padding: 4,
            zIndex: isSel ? 3 : 2,
            transition: 'transform 0.2s cubic-bezier(.2,1.5,.3,1)',
          }}>
            <LPin variant={pinVariant} status={l.status} accent={accent} mode={mode} size={isSel ? 40 : 34}/>
          </button>
        );
      })}

      {/* Cluster example — a grouped pin with count */}
      <div style={{
        position: 'absolute', left: '22%', top: '38%', transform: 'translate(-50%,-50%)',
        pointerEvents: 'none', zIndex: 1,
      }}>
        <div style={{
          width: 42, height: 42, borderRadius: '50%',
          background: accent.base, color: accent.ink,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontWeight: 800, fontSize: 15, fontFamily: 'ui-monospace, monospace',
          boxShadow: `0 0 0 6px ${accent.glow}44, 0 4px 12px rgba(0,0,0,0.3)`,
        }}>4</div>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
// Floating top bar (search + avatar) — glass-y
// ─────────────────────────────────────────────────────────────
function LuridoTopBar({ theme, accent, mode, onOpenSearch, onOpenProfile }) {
  return (
    <div style={{
      position: 'absolute', top: 12, left: 14, right: 14, zIndex: 10,
      display: 'flex', gap: 10, alignItems: 'center',
    }}>
      <button onClick={onOpenSearch} style={{
        flex: 1, display: 'flex', alignItems: 'center', gap: 10,
        padding: '11px 14px', borderRadius: 14,
        background: mode === 'night' ? 'rgba(28,22,19,0.85)' : 'rgba(255,255,255,0.92)',
        backdropFilter: 'blur(18px) saturate(160%)',
        WebkitBackdropFilter: 'blur(18px) saturate(160%)',
        border: `1px solid ${theme.border}`,
        boxShadow: '0 4px 16px rgba(0,0,0,0.08)',
        color: theme.textMuted,
        fontSize: 14, fontFamily: 'inherit', textAlign: 'left',
        cursor: 'pointer',
      }}>
        <LIcon name="search" size={18} color={theme.textMuted}/>
        <span>Cerca un lurido, una zona…</span>
      </button>
      <button onClick={onOpenProfile} style={{
        width: 42, height: 42, borderRadius: 14,
        background: accent.base, color: accent.ink,
        border: 'none', cursor: 'pointer',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        fontWeight: 700, fontSize: 15, fontFamily: 'inherit',
        boxShadow: `0 4px 12px ${accent.base}44`,
      }}>G</button>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
// Floating filter strip under top bar
// ─────────────────────────────────────────────────────────────
function LuridoFilterStrip({ theme, accent, mode, filters, setFilters }) {
  const chips = [
    { id: 'open', label: 'Aperto ora', icon: '🟢' },
    { id: 'rating', label: '4+ ⭐' },
    { id: 'veg', label: 'Veggie' },
    { id: 'nearby', label: 'Vicino' },
    { id: 'new', label: 'Nuovi' },
  ];
  return (
    <div style={{
      position: 'absolute', top: 64, left: 0, right: 0, zIndex: 9,
      padding: '8px 14px', display: 'flex', gap: 8,
      overflowX: 'auto',
    }} className="l-scroll">
      {chips.map(c => (
        <LChip key={c.id} active={filters[c.id]} theme={theme} accent={accent} small
               onClick={() => setFilters({ ...filters, [c.id]: !filters[c.id] })}>
          {c.label}
        </LChip>
      ))}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
// Preview card (slides up from bottom when pin selected)
// ─────────────────────────────────────────────────────────────
function LuridoPreviewCard({ lurido, theme, accent, mode, onClose, onOpen }) {
  if (!lurido) return null;
  return (
    <div className="l-slideup" style={{
      position: 'absolute', left: 12, right: 12, bottom: 84, zIndex: 12,
      background: theme.surface, borderRadius: 20,
      border: `1px solid ${theme.border}`,
      boxShadow: mode === 'night' ? '0 -4px 24px rgba(0,0,0,0.6)' : '0 -4px 24px rgba(60,40,20,0.15)',
      overflow: 'hidden',
    }}>
      <div style={{ display: 'flex', gap: 12, padding: 12 }}>
        <LPhoto label={lurido.photos[0] || 'foto'} w={88} h={88} radius={14}/>
        <div style={{ flex: 1, minWidth: 0, paddingTop: 2 }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 8 }}>
            <h3 style={{
              margin: 0, fontSize: 16, fontWeight: 700, color: theme.text,
              fontFamily: 'var(--ldisplay, inherit)',
              whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis',
            }}>{lurido.name}</h3>
            <button onClick={onClose} style={{
              background: 'none', border: 'none', padding: 2, cursor: 'pointer', color: theme.textMuted,
            }}><LIcon name="close" size={18}/></button>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginTop: 2, color: theme.textMuted, fontSize: 12 }}>
            <LIcon name="pin" size={12}/>
            <span>{lurido.zone}</span>
            <span style={{ opacity: 0.4 }}>·</span>
            <span>320m</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 6 }}>
            <LStars value={lurido.rating} color={accent.base} emptyColor={theme.border} size={12}/>
            <span style={{ fontSize: 12, fontWeight: 600, color: theme.text }}>{lurido.rating.toFixed(1)}</span>
            <span style={{ fontSize: 12, color: theme.textFaint }}>({lurido.reviewCount})</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: 8 }}>
            <LStatusBadge status={lurido.status} theme={theme} accent={accent}/>
            <button onClick={onOpen} style={{
              padding: '6px 12px', borderRadius: 10, border: 'none',
              background: accent.base, color: accent.ink,
              fontWeight: 600, fontSize: 12, fontFamily: 'inherit', cursor: 'pointer',
            }}>Vedi
              <LIcon name="chev" size={12} color={accent.ink}/>
            </button>
          </div>
        </div>
      </div>
      {/* Tag row */}
      <div style={{ display: 'flex', gap: 6, padding: '0 12px 12px', flexWrap: 'wrap' }}>
        {lurido.tags.slice(0, 4).map(t => (
          <span key={t} style={{
            fontSize: 11, padding: '3px 8px', borderRadius: 6,
            background: theme.chip, color: theme.textMuted,
            fontFamily: 'ui-monospace, monospace', textTransform: 'lowercase',
          }}>#{t.replace(/\s/g,'')}</span>
        ))}
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
// Bottom tab bar
// ─────────────────────────────────────────────────────────────
function LuridoTabBar({ theme, accent, mode, tab, setTab, isModerator, navVariant = 'bar' }) {
  const tabs = [
    { id: 'map', label: 'Mappa', icon: 'map' },
    { id: 'search', label: 'Cerca', icon: 'search' },
    { id: 'add', label: 'Aggiungi', icon: 'plus', fab: true },
    { id: 'notifs', label: 'Notifiche', icon: 'bell', dot: true },
    { id: 'profile', label: 'Profilo', icon: 'user' },
  ];
  if (isModerator) tabs.push({ id: 'mod', label: 'Mod', icon: 'sparkle' });

  if (navVariant === 'floating') {
    // Floating island nav (variation option)
    return (
      <div style={{
        position: 'absolute', left: 20, right: 20, bottom: 20, zIndex: 20,
        display: 'flex', gap: 2, padding: 6,
        background: mode === 'night' ? 'rgba(28,22,19,0.92)' : 'rgba(255,255,255,0.96)',
        backdropFilter: 'blur(20px) saturate(180%)',
        WebkitBackdropFilter: 'blur(20px) saturate(180%)',
        borderRadius: 28,
        border: `1px solid ${theme.border}`,
        boxShadow: '0 12px 32px rgba(0,0,0,0.2)',
        justifyContent: 'space-around',
      }}>
        {tabs.map(t => {
          const active = tab === t.id;
          return (
            <button key={t.id} onClick={() => setTab(t.id)} style={{
              flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2,
              padding: '8px 0', borderRadius: 22,
              background: active ? accent.base : 'transparent',
              color: active ? accent.ink : theme.textMuted,
              border: 'none', cursor: 'pointer', fontFamily: 'inherit',
              transition: 'background 0.15s',
            }}>
              <LIcon name={t.icon} size={20}/>
              <span style={{ fontSize: 10, fontWeight: 600 }}>{t.label}</span>
            </button>
          );
        })}
      </div>
    );
  }

  // Default tab bar
  return (
    <div style={{
      position: 'absolute', left: 0, right: 0, bottom: 0, zIndex: 20,
      background: mode === 'night' ? 'rgba(18,13,10,0.95)' : 'rgba(250,246,240,0.96)',
      backdropFilter: 'blur(20px) saturate(180%)',
      WebkitBackdropFilter: 'blur(20px) saturate(180%)',
      borderTop: `1px solid ${theme.border}`,
      display: 'flex', padding: '8px 6px 18px',
    }}>
      {tabs.map(t => {
        const active = tab === t.id;
        if (t.fab) {
          return (
            <button key={t.id} onClick={() => setTab(t.id)} style={{
              flex: 1, display: 'flex', justifyContent: 'center', background: 'none', border: 'none', padding: 0, cursor: 'pointer',
            }}>
              <span style={{
                width: 48, height: 48, borderRadius: 16,
                background: accent.base, color: accent.ink,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                boxShadow: `0 4px 14px ${accent.base}66`,
                transform: 'translateY(-8px)',
              }}>
                <LIcon name="plus" size={26} strokeWidth={2.2}/>
              </span>
            </button>
          );
        }
        return (
          <button key={t.id} onClick={() => setTab(t.id)} style={{
            flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 3,
            padding: '6px 0', background: 'none', border: 'none', cursor: 'pointer', fontFamily: 'inherit',
            color: active ? accent.base : theme.textMuted,
            position: 'relative',
          }}>
            <LIcon name={t.icon} size={22} strokeWidth={active ? 2.2 : 1.8}/>
            <span style={{ fontSize: 10, fontWeight: active ? 700 : 500 }}>{t.label}</span>
            {t.dot && <span style={{
              position: 'absolute', top: 2, right: '30%',
              width: 7, height: 7, borderRadius: '50%', background: accent.base,
            }}/>}
          </button>
        );
      })}
    </div>
  );
}

Object.assign(window, { LuridoMap, LuridoTopBar, LuridoFilterStrip, LuridoPreviewCard, LuridoTabBar });
