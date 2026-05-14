// screens.jsx — remaining screens: search, add, user, mod, notifs, auth

// ─────────────────────────────────────────────────────────────
// Search screen — list + filters, toggle with map
// ─────────────────────────────────────────────────────────────
function LuridoSearch({ theme, accent, mode, luridi, onSelect, cardVariant = 'rich' }) {
  const [query, setQuery] = React.useState('');
  const [view, setView] = React.useState('list'); // list | map
  const [sort, setSort] = React.useState('rating'); // rating | recent | distance
  const [filters, setFilters] = React.useState({ open: false, veg: false, photos: false });

  const filtered = luridi
    .filter((l) => l.status !== 'pending')
    .filter((l) => {
      if (
        query &&
        !l.name.toLowerCase().includes(query.toLowerCase()) &&
        !l.zone.toLowerCase().includes(query.toLowerCase())
      )
        return false;
      if (filters.open && l.status !== 'open') return false;
      if (filters.veg && !l.tags.some((t) => t.includes('veg'))) return false;
      if (filters.photos && l.photos.length === 0) return false;
      return true;
    });

  const sorted = [...filtered].sort((a, b) => {
    if (sort === 'rating') return b.rating - a.rating;
    if (sort === 'recent') return b.addedAt.localeCompare(a.addedAt);
    return 0;
  });

  return (
    <div
      style={{
        position: 'absolute',
        inset: 0,
        background: theme.bg,
        display: 'flex',
        flexDirection: 'column',
      }}
    >
      {/* Search bar */}
      <div style={{ padding: '14px 14px 8px', background: theme.bg }}>
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 10,
            padding: '12px 14px',
            background: theme.surfaceAlt,
            borderRadius: 14,
            border: `1px solid ${theme.border}`,
          }}
        >
          <LIcon name="search" size={18} color={theme.textMuted} />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Cerca Peppino, Navigli, cima di rapa…"
            style={{
              flex: 1,
              background: 'none',
              border: 'none',
              outline: 'none',
              fontSize: 14,
              color: theme.text,
              fontFamily: 'inherit',
            }}
          />
          {query && (
            <button
              onClick={() => setQuery('')}
              style={{
                background: 'none',
                border: 'none',
                padding: 2,
                cursor: 'pointer',
                color: theme.textMuted,
              }}
            >
              <LIcon name="close" size={16} />
            </button>
          )}
        </div>

        {/* Filter chips */}
        <div
          style={{ display: 'flex', gap: 6, marginTop: 10, overflowX: 'auto' }}
          className="l-scroll"
        >
          <LChip
            theme={theme}
            accent={accent}
            small
            active={filters.open}
            onClick={() => setFilters({ ...filters, open: !filters.open })}
          >
            🟢 Aperto ora
          </LChip>
          <LChip
            theme={theme}
            accent={accent}
            small
            active={filters.veg}
            onClick={() => setFilters({ ...filters, veg: !filters.veg })}
          >
            🥬 Veggie
          </LChip>
          <LChip
            theme={theme}
            accent={accent}
            small
            active={filters.photos}
            onClick={() => setFilters({ ...filters, photos: !filters.photos })}
          >
            📸 Con foto
          </LChip>
          <LChip theme={theme} accent={accent} small>
            Valutazione 4+
          </LChip>
          <LChip theme={theme} accent={accent} small>
            Aggiunti di recente
          </LChip>
        </div>

        {/* Sort + view toggle */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            marginTop: 12,
          }}
        >
          <div style={{ fontSize: 13, color: theme.textMuted }}>
            <strong style={{ color: theme.text }}>{sorted.length}</strong> luridi
            <span style={{ margin: '0 6px' }}>·</span>
            <select
              value={sort}
              onChange={(e) => setSort(e.target.value)}
              style={{
                background: 'none',
                border: 'none',
                color: theme.textMuted,
                fontFamily: 'inherit',
                fontSize: 13,
                cursor: 'pointer',
              }}
            >
              <option value="rating">per valutazione</option>
              <option value="recent">più recenti</option>
              <option value="distance">più vicini</option>
            </select>
          </div>
          <div
            style={{
              display: 'flex',
              padding: 3,
              background: theme.surfaceAlt,
              borderRadius: 10,
              border: `1px solid ${theme.border}`,
            }}
          >
            {['list', 'map'].map((v) => (
              <button
                key={v}
                onClick={() => setView(v)}
                style={{
                  padding: '5px 12px',
                  borderRadius: 8,
                  border: 'none',
                  fontFamily: 'inherit',
                  fontSize: 12,
                  fontWeight: 600,
                  cursor: 'pointer',
                  background: view === v ? theme.surface : 'transparent',
                  color: view === v ? theme.text : theme.textMuted,
                }}
              >
                {v === 'list' ? 'Lista' : 'Mappa'}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Results */}
      <div style={{ flex: 1, overflow: 'auto', padding: '8px 14px 100px' }} className="l-scroll">
        {sorted.length === 0 ? (
          <EmptyState
            theme={theme}
            accent={accent}
            icon="🔎"
            title="Nessun lurido qui vicino… ancora 👀"
            body="Prova a togliere qualche filtro, o allarga la zona."
          />
        ) : (
          sorted.map((l) => (
            <LuridoListCard
              key={l.id}
              lurido={l}
              theme={theme}
              accent={accent}
              variant={cardVariant}
              onClick={() => onSelect(l)}
            />
          ))
        )}
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
// List card variants: 'rich' | 'compact' | 'editorial'
// ─────────────────────────────────────────────────────────────
function LuridoListCard({ lurido, theme, accent, variant = 'rich', onClick }) {
  if (variant === 'compact') {
    return (
      <button
        onClick={onClick}
        style={{
          width: '100%',
          display: 'flex',
          gap: 12,
          alignItems: 'center',
          padding: '10px 4px',
          background: 'none',
          border: 'none',
          borderBottom: `1px solid ${theme.border}`,
          cursor: 'pointer',
          fontFamily: 'inherit',
          textAlign: 'left',
        }}
      >
        <LPhoto label={lurido.photos[0] || 'foto'} w={56} h={56} radius={10} />
        <div style={{ flex: 1, minWidth: 0 }}>
          <div
            style={{
              fontSize: 14,
              fontWeight: 700,
              color: theme.text,
              whiteSpace: 'nowrap',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
            }}
          >
            {lurido.name}
          </div>
          <div style={{ fontSize: 12, color: theme.textMuted, marginTop: 2 }}>
            {lurido.zone} · {lurido.rating.toFixed(1)} ⭐ · {lurido.reviewCount}
          </div>
        </div>
        <LStatusBadge status={lurido.status} theme={theme} accent={accent} size="sm" />
      </button>
    );
  }

  if (variant === 'editorial') {
    return (
      <button
        onClick={onClick}
        style={{
          display: 'block',
          width: '100%',
          padding: '16px 0',
          background: 'none',
          border: 'none',
          borderBottom: `1px solid ${theme.border}`,
          cursor: 'pointer',
          fontFamily: 'inherit',
          textAlign: 'left',
        }}
      >
        <div
          style={{
            fontSize: 11,
            color: accent.base,
            fontWeight: 700,
            letterSpacing: 1.5,
            textTransform: 'uppercase',
            marginBottom: 6,
          }}
        >
          {lurido.zone}
        </div>
        <div
          style={{
            fontSize: 20,
            fontWeight: 700,
            color: theme.text,
            fontFamily: 'var(--ldisplay, inherit)',
            lineHeight: 1.15,
            marginBottom: 8,
          }}
        >
          {lurido.name}
        </div>
        <div style={{ fontSize: 13, color: theme.textMuted, lineHeight: 1.5, marginBottom: 10 }}>
          {lurido.description.slice(0, 90)}…
        </div>
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 10,
            fontSize: 12,
            color: theme.textMuted,
          }}
        >
          <LStars value={lurido.rating} color={accent.base} emptyColor={theme.border} size={12} />
          <span>{lurido.rating.toFixed(1)}</span>
          <span>·</span>
          <LStatusBadge status={lurido.status} theme={theme} accent={accent} size="sm" />
        </div>
      </button>
    );
  }

  // rich (default)
  return (
    <button
      onClick={onClick}
      style={{
        width: '100%',
        display: 'flex',
        gap: 12,
        padding: 10,
        marginBottom: 10,
        background: theme.surface,
        border: `1px solid ${theme.border}`,
        borderRadius: 16,
        cursor: 'pointer',
        fontFamily: 'inherit',
        textAlign: 'left',
      }}
    >
      <LPhoto label={lurido.photos[0] || 'foto'} w={96} h={96} radius={12} />
      <div
        style={{
          flex: 1,
          minWidth: 0,
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
        }}
      >
        <div>
          <div
            style={{
              fontSize: 15,
              fontWeight: 700,
              color: theme.text,
              whiteSpace: 'nowrap',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              fontFamily: 'var(--ldisplay, inherit)',
            }}
          >
            {lurido.name}
          </div>
          <div
            style={{
              fontSize: 12,
              color: theme.textMuted,
              marginTop: 2,
              display: 'flex',
              alignItems: 'center',
              gap: 5,
            }}
          >
            <LIcon name="pin" size={11} /> {lurido.zone} · 320m
          </div>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <LStars value={lurido.rating} color={accent.base} emptyColor={theme.border} size={12} />
          <span style={{ fontSize: 12, fontWeight: 600, color: theme.text }}>
            {lurido.rating.toFixed(1)}
          </span>
          <span style={{ fontSize: 11, color: theme.textFaint }}>({lurido.reviewCount})</span>
        </div>
        <LStatusBadge status={lurido.status} theme={theme} accent={accent} size="sm" />
      </div>
    </button>
  );
}

// ─────────────────────────────────────────────────────────────
// Add new lurido — 4-step flow
// ─────────────────────────────────────────────────────────────
function LuridoAdd({ theme, accent, mode, onClose, onSubmit, pinVariant }) {
  const [step, setStep] = React.useState(0);
  const [data, setData] = React.useState({
    name: '',
    zone: '',
    address: '',
    description: '',
    hours: { open: '22:00', close: '04:00' },
    photos: [],
    x: 0.5,
    y: 0.5,
  });
  const steps = ['Posizione', 'Info', 'Orari', 'Foto'];

  const canNext = (s) => {
    if (s === 0) return true;
    if (s === 1) return data.name.length >= 3 && data.zone.length >= 2;
    if (s === 2) return true;
    return true;
  };

  return (
    <div
      style={{
        position: 'absolute',
        inset: 0,
        background: theme.bg,
        display: 'flex',
        flexDirection: 'column',
      }}
    >
      {/* Header */}
      <div
        style={{
          padding: '16px 18px',
          borderBottom: `1px solid ${theme.border}`,
          display: 'flex',
          alignItems: 'center',
          gap: 12,
        }}
      >
        <button
          onClick={onClose}
          style={{
            background: 'none',
            border: 'none',
            padding: 4,
            cursor: 'pointer',
            color: theme.text,
          }}
        >
          <LIcon name="close" size={22} />
        </button>
        <div style={{ flex: 1 }}>
          <div
            style={{
              fontSize: 10,
              color: theme.textMuted,
              textTransform: 'uppercase',
              letterSpacing: 1,
            }}
          >
            Passo {step + 1} di {steps.length}
          </div>
          <div
            style={{
              fontSize: 16,
              fontWeight: 700,
              color: theme.text,
              fontFamily: 'var(--ldisplay, inherit)',
            }}
          >
            {steps[step]}
          </div>
        </div>
      </div>

      {/* Progress */}
      <div style={{ padding: '0 18px', background: theme.bg }}>
        <div style={{ height: 3, background: theme.border, borderRadius: 2, overflow: 'hidden' }}>
          <div
            style={{
              width: `${((step + 1) / steps.length) * 100}%`,
              height: '100%',
              background: accent.base,
              transition: 'width 0.3s',
            }}
          />
        </div>
      </div>

      {/* Step content */}
      <div style={{ flex: 1, overflow: 'auto', padding: 18 }} className="l-scroll">
        {step === 0 && (
          <AddStepLocation
            data={data}
            setData={setData}
            theme={theme}
            accent={accent}
            mode={mode}
            pinVariant={pinVariant}
          />
        )}
        {step === 1 && <AddStepInfo data={data} setData={setData} theme={theme} accent={accent} />}
        {step === 2 && <AddStepHours data={data} setData={setData} theme={theme} accent={accent} />}
        {step === 3 && (
          <AddStepPhotos data={data} setData={setData} theme={theme} accent={accent} />
        )}
      </div>

      {/* Footer */}
      <div
        style={{
          padding: '12px 18px 24px',
          borderTop: `1px solid ${theme.border}`,
          display: 'flex',
          gap: 10,
        }}
      >
        {step > 0 && (
          <LButton theme={theme} accent={accent} variant="subtle" onClick={() => setStep(step - 1)}>
            Indietro
          </LButton>
        )}
        {step < steps.length - 1 ? (
          <LButton
            theme={theme}
            accent={accent}
            variant="primary"
            full
            disabled={!canNext(step)}
            onClick={() => setStep(step + 1)}
          >
            Continua
          </LButton>
        ) : (
          <LButton
            theme={theme}
            accent={accent}
            variant="primary"
            full
            onClick={() => onSubmit(data)}
          >
            Proponi alla community
          </LButton>
        )}
      </div>
    </div>
  );
}

function AddStepLocation({ data, setData, theme, accent, mode, pinVariant }) {
  return (
    <div>
      <p style={{ margin: '0 0 14px', fontSize: 14, color: theme.textMuted, lineHeight: 1.5 }}>
        Tocca la mappa per mettere il pin. Precisione zero problemi — potrai modificare dopo.
      </p>
      <div
        style={{
          position: 'relative',
          height: 320,
          borderRadius: 16,
          overflow: 'hidden',
          border: `1px solid ${theme.border}`,
        }}
      >
        <LuridoMap
          theme={theme}
          accent={accent}
          mode={mode}
          pinVariant={pinVariant}
          mapStyle="warm"
          luridi={[]}
          onSelectLurido={() => {}}
          selectedId={null}
        />
        <div
          style={{
            position: 'absolute',
            left: `${data.x * 100}%`,
            top: `${data.y * 100}%`,
            transform: 'translate(-50%, -100%)',
            pointerEvents: 'none',
          }}
        >
          <LPin variant={pinVariant} status="pending" accent={accent} size={42} mode={mode} />
        </div>
        <div
          style={{
            position: 'absolute',
            left: 0,
            right: 0,
            bottom: 0,
            padding: 10,
            fontSize: 11,
            textAlign: 'center',
            color: 'white',
            background: 'linear-gradient(transparent, rgba(0,0,0,0.5))',
          }}
        >
          Tocca per spostare · trascina per regolare
        </div>
      </div>
      <div style={{ marginTop: 14 }}>
        <label
          style={{
            fontSize: 12,
            color: theme.textMuted,
            textTransform: 'uppercase',
            letterSpacing: 0.5,
          }}
        >
          O inserisci indirizzo
        </label>
        <input
          value={data.address}
          onChange={(e) => setData({ ...data, address: e.target.value })}
          placeholder="es. Ripa di Porta Ticinese 28"
          style={inputStyle(theme)}
        />
      </div>
    </div>
  );
}

function AddStepInfo({ data, setData, theme, accent }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
      <Field
        theme={theme}
        label="Nome del lurido"
        hint="Come lo chiamano? Nome proprio o descrizione"
      >
        <input
          value={data.name}
          onChange={(e) => setData({ ...data, name: e.target.value })}
          placeholder="es. Da Peppino il Lurido"
          style={inputStyle(theme)}
        />
      </Field>
      <Field theme={theme} label="Zona / Quartiere">
        <input
          value={data.zone}
          onChange={(e) => setData({ ...data, zone: e.target.value })}
          placeholder="es. Navigli, Isola, Porta Romana"
          style={inputStyle(theme)}
        />
      </Field>
      <Field
        theme={theme}
        label="Descrizione"
        hint="Racconta che posto è — atmosfera, specialità, dettagli"
      >
        <textarea
          value={data.description}
          onChange={(e) => setData({ ...data, description: e.target.value })}
          rows={4}
          placeholder="Il baracchino dietro la chiesa. Apre tardi, chiude tardissimo. Salsa piccante fatta in casa…"
          style={{ ...inputStyle(theme), resize: 'none' }}
        />
      </Field>
    </div>
  );
}

function AddStepHours({ data, setData, theme, accent }) {
  return (
    <div>
      <p style={{ margin: '0 0 14px', fontSize: 14, color: theme.textMuted, lineHeight: 1.5 }}>
        A che ora apre e chiude di solito? Se varia, metti pure un range largo.
      </p>
      <div style={{ display: 'flex', gap: 12 }}>
        <Field theme={theme} label="Apre" style={{ flex: 1 }}>
          <input
            type="time"
            value={data.hours.open}
            onChange={(e) => setData({ ...data, hours: { ...data.hours, open: e.target.value } })}
            style={inputStyle(theme)}
          />
        </Field>
        <Field theme={theme} label="Chiude" style={{ flex: 1 }}>
          <input
            type="time"
            value={data.hours.close}
            onChange={(e) => setData({ ...data, hours: { ...data.hours, close: e.target.value } })}
            style={inputStyle(theme)}
          />
        </Field>
      </div>
      <div
        style={{
          marginTop: 16,
          padding: 14,
          background: theme.chip,
          borderRadius: 12,
          fontSize: 13,
          color: theme.textMuted,
          lineHeight: 1.5,
        }}
      >
        💡 <strong style={{ color: theme.text }}>Trucco milanese:</strong> se non sai gli orari
        esatti, metti da 22:00 a 04:00. Nove volte su dieci ci azzecchi.
      </div>
    </div>
  );
}

function AddStepPhotos({ data, setData, theme, accent }) {
  const addFake = () =>
    setData({ ...data, photos: [...data.photos, `foto_${data.photos.length + 1}`] });
  return (
    <div>
      <p style={{ margin: '0 0 14px', fontSize: 14, color: theme.textMuted, lineHeight: 1.5 }}>
        Almeno una foto aiuta tantissimo. Il bancone, il menù scritto a mano, il panino da dentro.
      </p>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 8 }}>
        {data.photos.map((p, i) => (
          <LPhoto key={i} label={p} h={100} radius={10} />
        ))}
        <button
          onClick={addFake}
          style={{
            height: 100,
            borderRadius: 10,
            border: `1.5px dashed ${theme.border}`,
            background: 'transparent',
            color: theme.textMuted,
            cursor: 'pointer',
            fontFamily: 'inherit',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 6,
          }}
        >
          <LIcon name="camera" size={22} />
          <span style={{ fontSize: 11 }}>Aggiungi</span>
        </button>
      </div>
      <div
        style={{
          marginTop: 16,
          padding: 14,
          background: theme.surfaceAlt,
          borderRadius: 12,
          border: `1px solid ${theme.border}`,
          fontSize: 13,
          color: theme.textMuted,
        }}
      >
        La tua proposta verrà verificata dai moderatori. Di solito in 24h.
      </div>
    </div>
  );
}

function Field({ theme, label, hint, children, style = {} }) {
  return (
    <div style={style}>
      <label
        style={{
          display: 'block',
          fontSize: 12,
          color: theme.textMuted,
          textTransform: 'uppercase',
          letterSpacing: 0.5,
          marginBottom: 6,
          fontWeight: 600,
        }}
      >
        {label}
      </label>
      {children}
      {hint && <div style={{ marginTop: 4, fontSize: 12, color: theme.textFaint }}>{hint}</div>}
    </div>
  );
}
function inputStyle(theme) {
  return {
    width: '100%',
    padding: '12px 14px',
    borderRadius: 12,
    background: theme.surface,
    border: `1px solid ${theme.border}`,
    fontSize: 14,
    color: theme.text,
    fontFamily: 'inherit',
    outline: 'none',
    boxSizing: 'border-box',
  };
}

// ─────────────────────────────────────────────────────────────
// User profile
// ─────────────────────────────────────────────────────────────
function LuridoUserProfile({ user, theme, accent, mode, onBack, onSettings }) {
  const [tab, setTab] = React.useState('recensioni');
  return (
    <div
      style={{ position: 'absolute', inset: 0, background: theme.bg, overflow: 'auto' }}
      className="l-scroll"
    >
      {/* Header */}
      <div style={{ padding: '14px 14px 0', display: 'flex', justifyContent: 'space-between' }}>
        <button
          onClick={onBack}
          style={{
            width: 38,
            height: 38,
            borderRadius: 12,
            background: theme.surfaceAlt,
            border: `1px solid ${theme.border}`,
            color: theme.text,
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <LIcon name="chevL" size={20} />
        </button>
        <button
          onClick={onSettings}
          style={{
            width: 38,
            height: 38,
            borderRadius: 12,
            background: theme.surfaceAlt,
            border: `1px solid ${theme.border}`,
            color: theme.text,
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <LIcon name="settings" size={20} />
        </button>
      </div>

      {/* Avatar + name */}
      <div style={{ padding: '16px 18px 0', textAlign: 'center' }}>
        <div
          style={{
            width: 88,
            height: 88,
            borderRadius: '50%',
            margin: '0 auto',
            background: `linear-gradient(135deg, ${accent.base}, ${accent.glow})`,
            color: accent.ink,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontWeight: 700,
            fontSize: 36,
            fontFamily: 'var(--ldisplay, inherit)',
            boxShadow: `0 8px 24px ${accent.base}44`,
          }}
        >
          {user.avatar}
        </div>
        <h2
          style={{
            margin: '12px 0 2px',
            fontSize: 20,
            fontWeight: 700,
            color: theme.text,
            fontFamily: 'var(--ldisplay, inherit)',
          }}
        >
          {user.displayName}
        </h2>
        <div style={{ fontSize: 13, color: theme.textMuted }}>@{user.username}</div>
        <p
          style={{
            margin: '10px auto 0',
            fontSize: 13,
            color: theme.textMuted,
            maxWidth: 280,
            lineHeight: 1.5,
          }}
        >
          {user.bio}
        </p>
      </div>

      {/* Level card */}
      <div
        style={{
          margin: '18px 14px 0',
          padding: 16,
          borderRadius: 16,
          background: `linear-gradient(135deg, ${theme.surfaceAlt}, ${theme.surface})`,
          border: `1px solid ${theme.border}`,
        }}
      >
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            marginBottom: 10,
          }}
        >
          <div>
            <div
              style={{
                fontSize: 11,
                color: accent.base,
                fontWeight: 700,
                letterSpacing: 1,
                textTransform: 'uppercase',
              }}
            >
              Livello {user.level}
            </div>
            <div
              style={{
                fontSize: 18,
                fontWeight: 700,
                color: theme.text,
                fontFamily: 'var(--ldisplay, inherit)',
              }}
            >
              {user.levelName}
            </div>
          </div>
          <div style={{ fontSize: 32 }}>🥪</div>
        </div>
        <div style={{ fontSize: 12, color: theme.textMuted, marginBottom: 6 }}>
          {user.xp} / {user.xpNext} XP al livello{' '}
          <strong style={{ color: theme.text }}>{user.nextLevel}</strong>
        </div>
        <div style={{ height: 6, background: theme.chip, borderRadius: 3, overflow: 'hidden' }}>
          <div
            style={{
              width: `${(user.xp / user.xpNext) * 100}%`,
              height: '100%',
              background: accent.base,
            }}
          />
        </div>
      </div>

      {/* Stats grid */}
      <div
        style={{ padding: '14px', display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 8 }}
      >
        {[
          { label: 'Recensioni', value: user.stats.reviews },
          { label: 'Aggiunti', value: user.stats.added },
          { label: 'Salvati', value: user.stats.saved },
          { label: 'Upvote', value: user.stats.upvotes },
        ].map((s) => (
          <div
            key={s.label}
            style={{
              padding: '12px 4px',
              borderRadius: 12,
              background: theme.surface,
              border: `1px solid ${theme.border}`,
              textAlign: 'center',
            }}
          >
            <div
              style={{
                fontSize: 18,
                fontWeight: 700,
                color: theme.text,
                fontFamily: 'ui-monospace, monospace',
              }}
            >
              {s.value}
            </div>
            <div
              style={{
                fontSize: 10,
                color: theme.textMuted,
                textTransform: 'uppercase',
                letterSpacing: 0.5,
                marginTop: 2,
              }}
            >
              {s.label}
            </div>
          </div>
        ))}
      </div>

      {/* Badges */}
      <div style={{ padding: '0 18px' }}>
        <h3
          style={{
            margin: '10px 0',
            fontSize: 13,
            fontWeight: 700,
            color: theme.textMuted,
            textTransform: 'uppercase',
            letterSpacing: 1,
          }}
        >
          Badge
        </h3>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 10 }}>
          {user.badges.map((b) => (
            <div
              key={b.id}
              style={{
                padding: 12,
                borderRadius: 12,
                textAlign: 'center',
                background: b.earned ? theme.surface : 'transparent',
                border: `1px solid ${b.earned ? theme.border : theme.border}`,
                opacity: b.earned ? 1 : 0.4,
              }}
            >
              <div style={{ fontSize: 28, filter: b.earned ? '' : 'grayscale(1)' }}>{b.icon}</div>
              <div style={{ fontSize: 11, fontWeight: 700, color: theme.text, marginTop: 4 }}>
                {b.name}
              </div>
              <div style={{ fontSize: 10, color: theme.textMuted, marginTop: 1, lineHeight: 1.3 }}>
                {b.desc}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Activity tabs */}
      <div
        style={{
          padding: '20px 18px 0',
          borderBottom: `1px solid ${theme.border}`,
          display: 'flex',
          gap: 24,
        }}
      >
        {['recensioni', 'aggiunti', 'salvati'].map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            style={{
              background: 'none',
              border: 'none',
              padding: '8px 0',
              fontFamily: 'inherit',
              fontSize: 13,
              fontWeight: 600,
              textTransform: 'capitalize',
              cursor: 'pointer',
              color: tab === t ? theme.text : theme.textMuted,
              borderBottom: `2px solid ${tab === t ? accent.base : 'transparent'}`,
              marginBottom: -1,
            }}
          >
            {t}
          </button>
        ))}
      </div>
      <div
        style={{
          padding: '14px 18px 100px',
          color: theme.textMuted,
          fontSize: 13,
          textAlign: 'center',
        }}
      >
        {tab === 'recensioni' && 'Le tue recensioni appariranno qui. Scrivine una!'}
        {tab === 'aggiunti' && '4 luridi proposti · 3 approvati · 1 in attesa'}
        {tab === 'salvati' && `${user.stats.saved} luridi salvati per quando torni in zona`}
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
// Moderation queue
// ─────────────────────────────────────────────────────────────
function LuridoMod({ theme, accent, mode, luridi, onApprove, onReject, onBack }) {
  const pending = luridi.filter((l) => l.status === 'pending');
  const [rejectingId, setRejectingId] = React.useState(null);
  const [reason, setReason] = React.useState('');

  return (
    <div
      style={{ position: 'absolute', inset: 0, background: theme.bg, overflow: 'auto' }}
      className="l-scroll"
    >
      {/* Header */}
      <div
        style={{
          padding: '14px 18px',
          display: 'flex',
          alignItems: 'center',
          gap: 12,
          borderBottom: `1px solid ${theme.border}`,
        }}
      >
        <button
          onClick={onBack}
          style={{
            width: 38,
            height: 38,
            borderRadius: 12,
            background: theme.surfaceAlt,
            border: `1px solid ${theme.border}`,
            color: theme.text,
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <LIcon name="chevL" size={20} />
        </button>
        <div style={{ flex: 1 }}>
          <div
            style={{
              fontSize: 11,
              color: accent.base,
              fontWeight: 700,
              letterSpacing: 1,
              textTransform: 'uppercase',
            }}
          >
            Moderazione
          </div>
          <h2
            style={{
              margin: 0,
              fontSize: 18,
              fontWeight: 700,
              color: theme.text,
              fontFamily: 'var(--ldisplay, inherit)',
            }}
          >
            Coda di approvazione
          </h2>
        </div>
      </div>

      {/* Stats */}
      <div
        style={{
          padding: '14px 18px',
          display: 'grid',
          gridTemplateColumns: 'repeat(3, 1fr)',
          gap: 8,
        }}
      >
        <ModStat theme={theme} label="In attesa" value={pending.length} accent={accent.base} />
        <ModStat
          theme={theme}
          label="Luridi"
          value={luridi.filter((l) => l.status !== 'pending').length}
        />
        <ModStat theme={theme} label="Approvati oggi" value="3" />
      </div>

      {/* Queue */}
      <div style={{ padding: '0 14px 100px' }}>
        {pending.length === 0 ? (
          <EmptyState
            theme={theme}
            accent={accent}
            icon="✅"
            title="Coda vuota, gran lavoro"
            body="Nessun lurido da verificare in questo momento. Prenditi un caffè."
          />
        ) : (
          pending.map((l) => (
            <div
              key={l.id}
              style={{
                padding: 14,
                marginBottom: 10,
                borderRadius: 16,
                background: theme.surface,
                border: `1px solid ${theme.border}`,
              }}
            >
              <div style={{ display: 'flex', gap: 12 }}>
                <LPhoto label={l.photos[0] || 'proposto'} w={80} h={80} radius={10} />
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: 15, fontWeight: 700, color: theme.text }}>{l.name}</div>
                  <div style={{ fontSize: 12, color: theme.textMuted, marginTop: 2 }}>
                    {l.zone} · {l.address}
                  </div>
                  <div style={{ fontSize: 11, color: theme.textFaint, marginTop: 4 }}>
                    @{l.addedBy} · {l.addedAt}
                  </div>
                </div>
              </div>
              <p
                style={{ margin: '10px 0', fontSize: 13, color: theme.textMuted, lineHeight: 1.5 }}
              >
                {l.description}
              </p>

              {rejectingId === l.id ? (
                <div style={{ marginTop: 8 }}>
                  <textarea
                    value={reason}
                    onChange={(e) => setReason(e.target.value)}
                    rows={2}
                    placeholder="Motivazione del rifiuto (obbligatorio)"
                    style={{ ...inputStyle(theme), resize: 'none' }}
                  />
                  <div style={{ display: 'flex', gap: 8, marginTop: 8 }}>
                    <LButton
                      theme={theme}
                      accent={accent}
                      variant="subtle"
                      small
                      full
                      onClick={() => {
                        setRejectingId(null);
                        setReason('');
                      }}
                    >
                      Annulla
                    </LButton>
                    <LButton
                      theme={theme}
                      accent={accent}
                      variant="danger"
                      small
                      full
                      disabled={reason.length < 4}
                      onClick={() => {
                        onReject(l.id, reason);
                        setRejectingId(null);
                        setReason('');
                      }}
                    >
                      Rifiuta
                    </LButton>
                  </div>
                </div>
              ) : (
                <div style={{ display: 'flex', gap: 6, marginTop: 4 }}>
                  <LButton
                    theme={theme}
                    accent={accent}
                    variant="subtle"
                    small
                    icon={<LIcon name="edit" size={14} />}
                  >
                    Modifiche
                  </LButton>
                  <LButton
                    theme={theme}
                    accent={accent}
                    variant="subtle"
                    small
                    icon={<LIcon name="x" size={14} />}
                    onClick={() => setRejectingId(l.id)}
                  >
                    Rifiuta
                  </LButton>
                  <LButton
                    theme={theme}
                    accent={accent}
                    variant="primary"
                    small
                    full
                    icon={<LIcon name="check" size={14} color={accent.ink} />}
                    onClick={() => onApprove(l.id)}
                  >
                    Approva
                  </LButton>
                </div>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
}
function ModStat({ theme, label, value, accent }) {
  return (
    <div
      style={{
        padding: '10px 12px',
        borderRadius: 12,
        background: theme.surface,
        border: `1px solid ${theme.border}`,
      }}
    >
      <div
        style={{
          fontSize: 22,
          fontWeight: 700,
          color: accent || theme.text,
          fontFamily: 'ui-monospace, monospace',
        }}
      >
        {value}
      </div>
      <div
        style={{
          fontSize: 10,
          color: theme.textMuted,
          textTransform: 'uppercase',
          letterSpacing: 0.5,
        }}
      >
        {label}
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
// Notifications
// ─────────────────────────────────────────────────────────────
function LuridoNotifs({ theme, accent, mode, notifs, onBack, onMarkRead }) {
  return (
    <div
      style={{ position: 'absolute', inset: 0, background: theme.bg, overflow: 'auto' }}
      className="l-scroll"
    >
      <div
        style={{
          padding: '14px 18px',
          display: 'flex',
          alignItems: 'center',
          gap: 12,
          borderBottom: `1px solid ${theme.border}`,
        }}
      >
        <button
          onClick={onBack}
          style={{
            width: 38,
            height: 38,
            borderRadius: 12,
            background: theme.surfaceAlt,
            border: `1px solid ${theme.border}`,
            color: theme.text,
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <LIcon name="chevL" size={20} />
        </button>
        <h2
          style={{
            margin: 0,
            fontSize: 20,
            fontWeight: 700,
            color: theme.text,
            fontFamily: 'var(--ldisplay, inherit)',
          }}
        >
          Notifiche
        </h2>
        <button
          onClick={onMarkRead}
          style={{
            marginLeft: 'auto',
            background: 'none',
            border: 'none',
            color: accent.base,
            fontFamily: 'inherit',
            fontSize: 13,
            fontWeight: 600,
            cursor: 'pointer',
          }}
        >
          Segna lette
        </button>
      </div>

      {notifs.length === 0 ? (
        <EmptyState
          theme={theme}
          accent={accent}
          icon="🌙"
          title="Tutto tranquillo, per ora"
          body="Quando qualcosa succede nei tuoi luridi, lo saprai qui."
        />
      ) : (
        <div style={{ padding: '8px 14px 100px' }}>
          {notifs.map((n) => (
            <div
              key={n.id}
              style={{
                display: 'flex',
                gap: 12,
                padding: 14,
                marginBottom: 6,
                borderRadius: 14,
                background: n.read ? 'transparent' : theme.surface,
                border: `1px solid ${n.read ? 'transparent' : theme.border}`,
                position: 'relative',
              }}
            >
              {!n.read && (
                <div
                  style={{
                    position: 'absolute',
                    left: 4,
                    top: '50%',
                    transform: 'translateY(-50%)',
                    width: 6,
                    height: 6,
                    borderRadius: '50%',
                    background: accent.base,
                  }}
                />
              )}
              <div
                style={{
                  width: 40,
                  height: 40,
                  borderRadius: 12,
                  flexShrink: 0,
                  background: n.read ? theme.chip : accent.glow + '33',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: 20,
                }}
              >
                {n.icon}
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div
                  style={{
                    fontSize: 14,
                    fontWeight: n.read ? 500 : 700,
                    color: theme.text,
                    lineHeight: 1.3,
                  }}
                >
                  {n.title}
                </div>
                <div
                  style={{ fontSize: 13, color: theme.textMuted, marginTop: 2, lineHeight: 1.4 }}
                >
                  {n.body}
                </div>
                <div style={{ fontSize: 11, color: theme.textFaint, marginTop: 4 }}>{n.time}</div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
// Auth / Onboarding
// ─────────────────────────────────────────────────────────────
function LuridoAuth({ theme, accent, mode, onAuth }) {
  const [mode2, setMode2] = React.useState('intro'); // intro | signup | login
  if (mode2 === 'intro') {
    return (
      <div
        style={{
          position: 'absolute',
          inset: 0,
          background: theme.bg,
          display: 'flex',
          flexDirection: 'column',
        }}
      >
        {/* Hero — night city vibe */}
        <div
          style={{
            flex: 1,
            position: 'relative',
            background: `radial-gradient(ellipse at 50% 80%, ${accent.glow}44 0%, transparent 50%), linear-gradient(180deg, ${mode === 'night' ? '#0a0806' : '#1a1210'} 0%, ${accent.ink} 100%)`,
            overflow: 'hidden',
          }}
        >
          {/* Faux windows */}
          <svg
            width="100%"
            height="100%"
            viewBox="0 0 400 500"
            preserveAspectRatio="xMidYMid slice"
            style={{ position: 'absolute', inset: 0, opacity: 0.35 }}
          >
            {[...Array(40)].map((_, i) => (
              <rect
                key={i}
                x={(i * 37) % 400}
                y={60 + ((i * 29) % 320)}
                width="14"
                height="16"
                fill={Math.random() > 0.5 ? accent.glow : '#f5c06a'}
                opacity={0.2 + (i % 4) * 0.15}
              />
            ))}
          </svg>
          {/* Baracchino glow */}
          <div
            style={{
              position: 'absolute',
              left: '50%',
              bottom: '25%',
              transform: 'translate(-50%, 50%)',
              width: 200,
              height: 120,
              background: `radial-gradient(ellipse, ${accent.base}, ${accent.glow}00 70%)`,
              filter: 'blur(20px)',
            }}
          />
          {/* Logo mark */}
          <div
            style={{
              position: 'absolute',
              left: '50%',
              top: '35%',
              transform: 'translate(-50%, -50%)',
              textAlign: 'center',
            }}
          >
            <div
              style={{
                width: 88,
                height: 88,
                margin: '0 auto',
                borderRadius: 22,
                background: accent.base,
                color: accent.ink,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: 44,
                boxShadow: `0 0 60px ${accent.glow}`,
              }}
            >
              🥪
            </div>
            <h1
              style={{
                margin: '18px 0 0',
                fontSize: 34,
                fontWeight: 700,
                color: '#f5ead8',
                fontFamily: 'var(--ldisplay, inherit)',
                letterSpacing: -1,
              }}
            >
              iLoveLurido
            </h1>
            <p
              style={{
                margin: '6px 0 0',
                fontSize: 14,
                color: 'rgba(245,234,216,0.6)',
                fontFamily: 'ui-monospace, monospace',
                letterSpacing: 1,
                textTransform: 'uppercase',
              }}
            >
              baracchini di milano · dopo le 22
            </p>
          </div>
        </div>
        {/* Auth buttons */}
        <div
          style={{
            padding: 20,
            display: 'flex',
            flexDirection: 'column',
            gap: 10,
            background: theme.bg,
          }}
        >
          <LButton theme={theme} accent={accent} variant="primary" full onClick={() => onAuth()}>
            Entra con email
          </LButton>
          <LButton
            theme={theme}
            accent={accent}
            variant="ghost"
            full
            icon={<span style={{ fontSize: 16 }}>🍎</span>}
          >
            Continua con Apple
          </LButton>
          <LButton
            theme={theme}
            accent={accent}
            variant="ghost"
            full
            icon={<span style={{ fontSize: 16 }}>G</span>}
          >
            Continua con Google
          </LButton>
          <button
            onClick={() => setMode2('login')}
            style={{
              background: 'none',
              border: 'none',
              color: theme.textMuted,
              fontSize: 13,
              fontFamily: 'inherit',
              padding: 8,
              cursor: 'pointer',
              textAlign: 'center',
            }}
          >
            Ho già un account · <span style={{ color: accent.base, fontWeight: 600 }}>Accedi</span>
          </button>
        </div>
      </div>
    );
  }
  return null;
}

Object.assign(window, {
  LuridoSearch,
  LuridoListCard,
  LuridoAdd,
  LuridoUserProfile,
  LuridoMod,
  LuridoNotifs,
  LuridoAuth,
});
