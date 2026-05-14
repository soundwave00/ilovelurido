// main.jsx — iLoveLurido app composer
// Binds all screens together in iOS + Android frames inside a DesignCanvas

const { useState, useMemo, useEffect } = React;

// ─────────────────────────────────────────────────────────────
// App — the full working prototype bound to in-memory state
// ─────────────────────────────────────────────────────────────
function LuridoApp({ theme, accent, mode, pinVariant, mapStyle, navVariant, cardVariant, headerVariant, platform = 'ios', isModerator = false, initialTab = 'map', initialLuridoId = null, showAuth = false, safeTop = 0, safeBottom = 0 }) {
  const [tab, setTab] = useState(initialTab);
  const [luridi, setLuridi] = useState(SAMPLE_LURIDI);
  const [reviews, setReviews] = useState(SAMPLE_REVIEWS);
  const [notifs, setNotifs] = useState(SAMPLE_NOTIFICATIONS);
  const [selectedId, setSelectedId] = useState(null);
  const [openLurido, setOpenLurido] = useState(initialLuridoId);
  const [savedIds, setSavedIds] = useState(new Set(['l4']));
  const [dishVotes, setDishVotes] = useState({});
  const [filters, setFilters] = useState({});
  const [showAddModal, setShowAddModal] = useState(false);
  const [auth, setAuth] = useState(!showAuth);

  const selectedLurido = useMemo(() => luridi.find(l => l.id === selectedId), [luridi, selectedId]);
  const openLuridoObj = useMemo(() => luridi.find(l => l.id === openLurido), [luridi, openLurido]);

  // Auth intro (auth screen fills full device incl. notch area)
  if (!auth) {
    return <div style={{position:'absolute',inset:0,paddingTop:safeTop,paddingBottom:safeBottom,background:theme.bg}}><div style={{position:'relative',width:'100%',height:'100%'}}><LuridoAuth theme={theme} accent={accent} mode={mode} onAuth={() => setAuth(true)}/></div></div>;
  }

  // Profile detail overlay
  if (openLuridoObj) {
    return (
      <div style={{position:'absolute',inset:0,paddingTop:safeTop,paddingBottom:safeBottom}}><div style={{position:'relative',width:'100%',height:'100%'}}>
      <LuridoProfile lurido={openLuridoObj} theme={theme} accent={accent} mode={mode}
                     headerVariant={headerVariant}
                     onBack={() => setOpenLurido(null)}
                     reviews={reviews}
                     onAddReview={(r) => setReviews([{ ...r, id: 'r' + Date.now(), user: 'giulia_isola', avatar: 'G', date: 'adesso', helpful: 0 }, ...reviews])}
                     onVoteDish={(dishId) => setDishVotes({ ...dishVotes, [dishId]: !dishVotes[dishId] })}
                     dishVotes={dishVotes}
                     onReport={() => {}}
                     onSave={() => {
                       const s = new Set(savedIds);
                       s.has(openLurido) ? s.delete(openLurido) : s.add(openLurido);
                       setSavedIds(s);
                     }}
                     isSaved={savedIds.has(openLurido)}/>
      </div></div>
    );
  }

  // Add flow
  if (showAddModal) {
    return (
      <div style={{position:'absolute',inset:0,paddingTop:safeTop,paddingBottom:safeBottom}}><div style={{position:'relative',width:'100%',height:'100%'}}>
      <LuridoAdd theme={theme} accent={accent} mode={mode} pinVariant={pinVariant}
                 onClose={() => { setShowAddModal(false); setTab('map'); }}
                 onSubmit={(data) => {
                   const nl = { ...data, id: 'l' + Date.now(), status: 'pending', rating: 0, reviewCount: 0, tags: ['nuovo'], dishes: [], addedBy: 'giulia_isola', addedAt: '2026-04-23' };
                   setLuridi([...luridi, nl]);
                   setNotifs([{ id: 'n' + Date.now(), type: 'approved', title: 'Proposta inviata!', body: `"${data.name}" è in revisione. Ti avvisiamo appena viene approvato.`, time: 'ora', read: false, icon: '⏳' }, ...notifs]);
                   setShowAddModal(false);
                   setTab('map');
                 }}/>
      </div></div>
    );
  }

  return (
    <div style={{ position: 'absolute', inset: 0, background: theme.bg, overflow: 'hidden', paddingTop: safeTop, paddingBottom: safeBottom, boxSizing: 'border-box' }}>
     <div style={{ position: 'relative', width: '100%', height: '100%' }}>
      {tab === 'map' && (
        <>
          <LuridoMap theme={theme} accent={accent} mode={mode} pinVariant={pinVariant}
                     mapStyle={mapStyle} luridi={luridi} onSelectLurido={(l) => setSelectedId(l.id)} selectedId={selectedId}/>
          <LuridoTopBar theme={theme} accent={accent} mode={mode}
                        onOpenSearch={() => setTab('search')}
                        onOpenProfile={() => setTab('profile')}/>
          <LuridoFilterStrip theme={theme} accent={accent} mode={mode} filters={filters} setFilters={setFilters}/>
          {selectedLurido && (
            <LuridoPreviewCard lurido={selectedLurido} theme={theme} accent={accent} mode={mode}
                               onClose={() => setSelectedId(null)}
                               onOpen={() => { setOpenLurido(selectedId); setSelectedId(null); }}/>
          )}
        </>
      )}
      {tab === 'search' && (
        <LuridoSearch theme={theme} accent={accent} mode={mode} luridi={luridi}
                      cardVariant={cardVariant}
                      onSelect={(l) => setOpenLurido(l.id)}/>
      )}
      {tab === 'notifs' && (
        <LuridoNotifs theme={theme} accent={accent} mode={mode} notifs={notifs}
                      onBack={() => setTab('map')}
                      onMarkRead={() => setNotifs(notifs.map(n => ({ ...n, read: true })))}/>
      )}
      {tab === 'profile' && (
        <LuridoUserProfile user={SAMPLE_USER} theme={theme} accent={accent} mode={mode}
                           onBack={() => setTab('map')} onSettings={() => {}}/>
      )}
      {tab === 'mod' && (
        <LuridoMod theme={theme} accent={accent} mode={mode} luridi={luridi}
                   onBack={() => setTab('map')}
                   onApprove={(id) => setLuridi(luridi.map(l => l.id === id ? { ...l, status: 'open' } : l))}
                   onReject={(id) => setLuridi(luridi.filter(l => l.id !== id))}/>
      )}

      {/* Bottom nav — hidden on add */}
      {tab !== 'add' && (
        <LuridoTabBar theme={theme} accent={accent} mode={mode} tab={tab} isModerator={isModerator} navVariant={navVariant}
                      setTab={(t) => {
                        if (t === 'add') setShowAddModal(true);
                        else setTab(t);
                      }}/>
      )}
     </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
// Phone frame wrapper — picks iOS or Android
// ─────────────────────────────────────────────────────────────
function PhoneFrame({ platform, dark, children, w = 340, h = 720 }) {
  if (platform === 'android') {
    return (
      <AndroidDevice width={w} height={h} dark={dark}>
        <div style={{ position: 'relative', height: '100%', width: '100%', overflow: 'hidden' }}>{children}</div>
      </AndroidDevice>
    );
  }
  return (
    <IOSDevice width={w} height={h} dark={dark}>
      <div style={{ position: 'relative', height: '100%', width: '100%', overflow: 'hidden' }}>{children}</div>
    </IOSDevice>
  );
}

// ─────────────────────────────────────────────────────────────
// Tweakable wrapped app — reads tweaks, composes theme
// ─────────────────────────────────────────────────────────────
function TweakedApp({ tweaks, platform, isModerator, initialTab, initialLuridoId, showAuth, ...rest }) {
  const safeTop = platform === 'ios' ? 54 : 40;
  const safeBottom = platform === 'ios' ? 32 : 24;
  const theme = tweaks.mode === 'night' ? LURIDO_TOKENS.night : LURIDO_TOKENS.day;
  const accent = LURIDO_TOKENS.accents[tweaks.accent] || LURIDO_TOKENS.accents.ambra;
  const fonts = LURIDO_TOKENS.fonts[tweaks.fontPair] || LURIDO_TOKENS.fonts.grotesk;
  return (
    <div style={{
      '--ldisplay': fonts.display,
      '--lbody': fonts.body,
      fontFamily: fonts.body,
      color: theme.text,
      position: 'relative', width: '100%', height: '100%',
    }}>
      <LuridoApp theme={theme} accent={accent} mode={tweaks.mode}
                 pinVariant={tweaks.pinVariant} mapStyle={tweaks.mapStyle}
                 navVariant={tweaks.navVariant} cardVariant={tweaks.cardVariant}
                 headerVariant={tweaks.headerVariant}
                 platform={platform} isModerator={isModerator}
                 initialTab={initialTab} initialLuridoId={initialLuridoId} showAuth={showAuth}
                 safeTop={safeTop} safeBottom={safeBottom}/>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
// Tweaks panel — floating bottom-right
// ─────────────────────────────────────────────────────────────
function TweaksPanel({ tweaks, setTweaks, show }) {
  const [open, setOpen] = useState(true);
  if (!show) return null;

  const swatch = (k, v) => ({
    width: 32, height: 32, borderRadius: 8, cursor: 'pointer',
    border: tweaks[k] === v ? '3px solid #fff' : '2px solid rgba(255,255,255,0.3)',
    boxShadow: tweaks[k] === v ? '0 0 0 2px rgba(0,0,0,0.8), 0 0 0 4px #fff' : '0 2px 4px rgba(0,0,0,0.4)',
    transition: 'all 0.15s',
  });

  return (
    <div style={{
      position: 'fixed', right: 20, bottom: 20, zIndex: 99999,
      width: 280, maxHeight: '85vh', overflow: 'auto',
      background: '#1c1613', color: '#f5ead8',
      border: '1px solid rgba(255,220,180,0.2)', borderRadius: 16,
      boxShadow: '0 20px 60px rgba(0,0,0,0.5)',
      fontFamily: 'Inter, system-ui, sans-serif',
    }} className="l-scroll">
      <div style={{
        padding: '12px 16px', display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        borderBottom: '1px solid rgba(255,220,180,0.1)', cursor: 'pointer',
      }} onClick={() => setOpen(!open)}>
        <strong style={{ fontSize: 13, letterSpacing: 1, textTransform: 'uppercase', color: '#f59e42' }}>Tweaks</strong>
        <span style={{ fontSize: 11, color: 'rgba(245,234,216,0.6)' }}>{open ? '—' : '+'}</span>
      </div>
      {open && (
        <div style={{ padding: 16, display: 'flex', flexDirection: 'column', gap: 16 }}>

          <TSection label="Modalità">
            <div style={{ display: 'flex', gap: 4, padding: 3, background: 'rgba(255,255,255,0.05)', borderRadius: 10 }}>
              {['day', 'night'].map(m => (
                <button key={m} onClick={() => setTweaks({ ...tweaks, mode: m })} style={{
                  flex: 1, padding: '6px 10px', borderRadius: 7, border: 'none',
                  fontSize: 12, fontWeight: 600, fontFamily: 'inherit', cursor: 'pointer',
                  background: tweaks.mode === m ? '#f59e42' : 'transparent',
                  color: tweaks.mode === m ? '#2a1a08' : '#f5ead8',
                }}>{m === 'day' ? '☀️ Giorno' : '🌙 Notte'}</button>
              ))}
            </div>
          </TSection>

          <TSection label="Accent">
            <div style={{ display: 'flex', gap: 8 }}>
              {Object.entries(LURIDO_TOKENS.accents).map(([k, v]) => (
                <button key={k} onClick={() => setTweaks({ ...tweaks, accent: k })}
                        title={k} style={{ ...swatch('accent', k), background: v.base, border: tweaks.accent === k ? '3px solid #fff' : '2px solid rgba(255,255,255,0.15)' }}/>
              ))}
            </div>
          </TSection>

          <TSection label="Stile pin">
            <div style={{ display: 'flex', gap: 4, padding: 3, background: 'rgba(255,255,255,0.05)', borderRadius: 10 }}>
              {['pill', 'glow', 'baracchino', 'minimal'].map(v => (
                <button key={v} onClick={() => setTweaks({ ...tweaks, pinVariant: v })} style={{
                  flex: 1, padding: '6px 4px', borderRadius: 7, border: 'none',
                  fontSize: 11, fontWeight: 600, fontFamily: 'inherit', cursor: 'pointer', textTransform: 'capitalize',
                  background: tweaks.pinVariant === v ? '#f59e42' : 'transparent',
                  color: tweaks.pinVariant === v ? '#2a1a08' : '#f5ead8',
                }}>{v}</button>
              ))}
            </div>
          </TSection>

          <TSection label="Mappa">
            <div style={{ display: 'flex', gap: 4, padding: 3, background: 'rgba(255,255,255,0.05)', borderRadius: 10 }}>
              {['warm', 'mono', 'vintage'].map(v => (
                <button key={v} onClick={() => setTweaks({ ...tweaks, mapStyle: v })} style={{
                  flex: 1, padding: '6px 8px', borderRadius: 7, border: 'none',
                  fontSize: 11, fontWeight: 600, fontFamily: 'inherit', cursor: 'pointer', textTransform: 'capitalize',
                  background: tweaks.mapStyle === v ? '#f59e42' : 'transparent',
                  color: tweaks.mapStyle === v ? '#2a1a08' : '#f5ead8',
                }}>{v}</button>
              ))}
            </div>
          </TSection>

          <TSection label="Tipografia">
            <div style={{ display: 'flex', gap: 4, padding: 3, background: 'rgba(255,255,255,0.05)', borderRadius: 10 }}>
              {[
                ['grotesk', 'Grotesk'], ['serif', 'Serif'], ['editorial', 'Editorial'],
              ].map(([v, label]) => (
                <button key={v} onClick={() => setTweaks({ ...tweaks, fontPair: v })} style={{
                  flex: 1, padding: '6px 8px', borderRadius: 7, border: 'none',
                  fontSize: 11, fontWeight: 600, fontFamily: 'inherit', cursor: 'pointer',
                  background: tweaks.fontPair === v ? '#f59e42' : 'transparent',
                  color: tweaks.fontPair === v ? '#2a1a08' : '#f5ead8',
                }}>{label}</button>
              ))}
            </div>
          </TSection>

          <TSection label="Nav">
            <div style={{ display: 'flex', gap: 4, padding: 3, background: 'rgba(255,255,255,0.05)', borderRadius: 10 }}>
              {['bar', 'floating'].map(v => (
                <button key={v} onClick={() => setTweaks({ ...tweaks, navVariant: v })} style={{
                  flex: 1, padding: '6px 8px', borderRadius: 7, border: 'none',
                  fontSize: 11, fontWeight: 600, fontFamily: 'inherit', cursor: 'pointer', textTransform: 'capitalize',
                  background: tweaks.navVariant === v ? '#f59e42' : 'transparent',
                  color: tweaks.navVariant === v ? '#2a1a08' : '#f5ead8',
                }}>{v}</button>
              ))}
            </div>
          </TSection>

          <TSection label="Card lista">
            <div style={{ display: 'flex', gap: 4, padding: 3, background: 'rgba(255,255,255,0.05)', borderRadius: 10 }}>
              {['rich', 'compact', 'editorial'].map(v => (
                <button key={v} onClick={() => setTweaks({ ...tweaks, cardVariant: v })} style={{
                  flex: 1, padding: '6px 8px', borderRadius: 7, border: 'none',
                  fontSize: 11, fontWeight: 600, fontFamily: 'inherit', cursor: 'pointer', textTransform: 'capitalize',
                  background: tweaks.cardVariant === v ? '#f59e42' : 'transparent',
                  color: tweaks.cardVariant === v ? '#2a1a08' : '#f5ead8',
                }}>{v}</button>
              ))}
            </div>
          </TSection>

          <TSection label="Header profilo">
            <div style={{ display: 'flex', gap: 4, padding: 3, background: 'rgba(255,255,255,0.05)', borderRadius: 10 }}>
              {['photo', 'gallery', 'minimal'].map(v => (
                <button key={v} onClick={() => setTweaks({ ...tweaks, headerVariant: v })} style={{
                  flex: 1, padding: '6px 8px', borderRadius: 7, border: 'none',
                  fontSize: 11, fontWeight: 600, fontFamily: 'inherit', cursor: 'pointer', textTransform: 'capitalize',
                  background: tweaks.headerVariant === v ? '#f59e42' : 'transparent',
                  color: tweaks.headerVariant === v ? '#2a1a08' : '#f5ead8',
                }}>{v}</button>
              ))}
            </div>
          </TSection>

        </div>
      )}
    </div>
  );
}
function TSection({ label, children }) {
  return (
    <div>
      <div style={{ fontSize: 10, letterSpacing: 1, textTransform: 'uppercase', color: 'rgba(245,234,216,0.5)', marginBottom: 6 }}>{label}</div>
      {children}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
// Root composer — DesignCanvas with all artboards
// ─────────────────────────────────────────────────────────────
function LuridoRoot() {
  const DEFAULTS = /*EDITMODE-BEGIN*/{
    "mode": "night",
    "accent": "ambra",
    "pinVariant": "pill",
    "mapStyle": "warm",
    "fontPair": "grotesk",
    "navVariant": "bar",
    "cardVariant": "rich",
    "headerVariant": "photo"
  }/*EDITMODE-END*/;

  const [tweaks, setTweaksRaw] = useState(DEFAULTS);
  const [editMode, setEditMode] = useState(false);

  const setTweaks = (t) => {
    setTweaksRaw(t);
    window.parent?.postMessage({ type: '__edit_mode_set_keys', edits: t }, '*');
  };

  useEffect(() => {
    const onMsg = (e) => {
      if (e.data?.type === '__activate_edit_mode') setEditMode(true);
      if (e.data?.type === '__deactivate_edit_mode') setEditMode(false);
    };
    window.addEventListener('message', onMsg);
    window.parent?.postMessage({ type: '__edit_mode_available' }, '*');
    return () => window.removeEventListener('message', onMsg);
  }, []);

  // Phone dimensions — snug so canvas isn't massive
  const W = 340, H = 720;

  return (
    <>
      <DesignCanvas>
        {/* Hero row — iOS + Android side by side at current tweak state */}
        <DCSection id="hero" title="iLoveLurido · Hero" subtitle="Stato attuale secondo i Tweaks">
          <DCArtboard id="ios-map" label="iOS · Mappa" width={W} height={H}>
            <PhoneFrame platform="ios" dark={tweaks.mode === 'night'} w={W} h={H}>
              <TweakedApp tweaks={tweaks} platform="ios" initialTab="map"/>
            </PhoneFrame>
          </DCArtboard>
          <DCArtboard id="android-map" label="Android · Mappa" width={W} height={H}>
            <PhoneFrame platform="android" dark={tweaks.mode === 'night'} w={W} h={H}>
              <TweakedApp tweaks={tweaks} platform="android" initialTab="map"/>
            </PhoneFrame>
          </DCArtboard>
          <DCArtboard id="ios-profile" label="iOS · Profilo lurido" width={W} height={H}>
            <PhoneFrame platform="ios" dark={tweaks.mode === 'night'} w={W} h={H}>
              <TweakedApp tweaks={tweaks} platform="ios" initialLuridoId="l1"/>
            </PhoneFrame>
          </DCArtboard>
        </DCSection>

        {/* Flow section — end-to-end journey */}
        <DCSection id="flow" title="Flusso principale" subtitle="Apertura · scoperta · profilo · recensione">
          <DCArtboard id="onb" label="01 · Intro" width={W} height={H}>
            <PhoneFrame platform="ios" dark={tweaks.mode === 'night'} w={W} h={H}>
              <TweakedApp tweaks={tweaks} platform="ios" showAuth={true}/>
            </PhoneFrame>
          </DCArtboard>
          <DCArtboard id="search" label="02 · Cerca / Lista" width={W} height={H}>
            <PhoneFrame platform="ios" dark={tweaks.mode === 'night'} w={W} h={H}>
              <TweakedApp tweaks={tweaks} platform="ios" initialTab="search"/>
            </PhoneFrame>
          </DCArtboard>
          <DCArtboard id="detail" label="03 · Profilo lurido" width={W} height={H}>
            <PhoneFrame platform="ios" dark={tweaks.mode === 'night'} w={W} h={H}>
              <TweakedApp tweaks={tweaks} platform="ios" initialLuridoId="l4"/>
            </PhoneFrame>
          </DCArtboard>
          <DCArtboard id="notifs" label="04 · Notifiche" width={W} height={H}>
            <PhoneFrame platform="ios" dark={tweaks.mode === 'night'} w={W} h={H}>
              <TweakedApp tweaks={tweaks} platform="ios" initialTab="notifs"/>
            </PhoneFrame>
          </DCArtboard>
          <DCArtboard id="user" label="05 · Profilo utente" width={W} height={H}>
            <PhoneFrame platform="ios" dark={tweaks.mode === 'night'} w={W} h={H}>
              <TweakedApp tweaks={tweaks} platform="ios" initialTab="profile"/>
            </PhoneFrame>
          </DCArtboard>
        </DCSection>

        {/* Contribution + moderation */}
        <DCSection id="contrib" title="Contribuisci & Modera" subtitle="Proposta utente + coda moderatori">
          <DCArtboard id="add" label="Aggiungi lurido · passo 1" width={W} height={H}>
            <PhoneFrame platform="ios" dark={tweaks.mode === 'night'} w={W} h={H}>
              <LuridoAddWrapper tweaks={tweaks}/>
            </PhoneFrame>
          </DCArtboard>
          <DCArtboard id="mod" label="Moderazione (solo mod)" width={W} height={H}>
            <PhoneFrame platform="ios" dark={tweaks.mode === 'night'} w={W} h={H}>
              <TweakedApp tweaks={tweaks} platform="ios" isModerator={true} initialTab="mod"/>
            </PhoneFrame>
          </DCArtboard>
        </DCSection>

        {/* Variations — pin styles */}
        <DCSection id="pins" title="Varianti · Pin mappa" subtitle="Quattro approcci — scegli quello che preferisci">
          {['pill', 'glow', 'baracchino', 'minimal'].map(v => (
            <DCArtboard key={v} id={`pin-${v}`} label={`Pin · ${v}`} width={W} height={H}>
              <PhoneFrame platform="ios" dark={tweaks.mode === 'night'} w={W} h={H}>
                <TweakedApp tweaks={{ ...tweaks, pinVariant: v }} platform="ios" initialTab="map"/>
              </PhoneFrame>
            </DCArtboard>
          ))}
        </DCSection>

        {/* Variations — nav */}
        <DCSection id="navs" title="Varianti · Navigazione" subtitle="Tab bar classica vs. isola fluttuante">
          {['bar', 'floating'].map(v => (
            <DCArtboard key={v} id={`nav-${v}`} label={`Nav · ${v}`} width={W} height={H}>
              <PhoneFrame platform="ios" dark={tweaks.mode === 'night'} w={W} h={H}>
                <TweakedApp tweaks={{ ...tweaks, navVariant: v }} platform="ios" initialTab="map"/>
              </PhoneFrame>
            </DCArtboard>
          ))}
        </DCSection>

        {/* Variations — list card */}
        <DCSection id="cards" title="Varianti · Card nella lista" subtitle="Ricca · compatta · editoriale">
          {['rich', 'compact', 'editorial'].map(v => (
            <DCArtboard key={v} id={`card-${v}`} label={`Card · ${v}`} width={W} height={H}>
              <PhoneFrame platform="ios" dark={tweaks.mode === 'night'} w={W} h={H}>
                <TweakedApp tweaks={{ ...tweaks, cardVariant: v }} platform="ios" initialTab="search"/>
              </PhoneFrame>
            </DCArtboard>
          ))}
        </DCSection>

        {/* Variations — profile header */}
        <DCSection id="headers" title="Varianti · Header profilo lurido" subtitle="Foto full bleed · gallery grid · minimal">
          {['photo', 'gallery', 'minimal'].map(v => (
            <DCArtboard key={v} id={`hdr-${v}`} label={`Header · ${v}`} width={W} height={H}>
              <PhoneFrame platform="ios" dark={tweaks.mode === 'night'} w={W} h={H}>
                <TweakedApp tweaks={{ ...tweaks, headerVariant: v }} platform="ios" initialLuridoId="l1"/>
              </PhoneFrame>
            </DCArtboard>
          ))}
        </DCSection>

        {/* Variations — typography */}
        <DCSection id="type" title="Varianti · Accoppiata tipografica" subtitle="Grotesk geometrica · serif classica · editorial">
          {['grotesk', 'serif', 'editorial'].map(v => (
            <DCArtboard key={v} id={`type-${v}`} label={`Font · ${v}`} width={W} height={H}>
              <PhoneFrame platform="ios" dark={tweaks.mode === 'night'} w={W} h={H}>
                <TweakedApp tweaks={{ ...tweaks, fontPair: v }} platform="ios" initialLuridoId="l4"/>
              </PhoneFrame>
            </DCArtboard>
          ))}
        </DCSection>

        {/* Variations — day/night */}
        <DCSection id="modes" title="Varianti · Giorno & Notte" subtitle="Il lurido lavora di notte — ma c'è chi apre presto">
          {['day', 'night'].map(v => (
            <DCArtboard key={v} id={`mode-${v}`} label={v === 'day' ? '☀️ Giorno' : '🌙 Notte'} width={W} height={H}>
              <PhoneFrame platform="ios" dark={v === 'night'} w={W} h={H}>
                <TweakedApp tweaks={{ ...tweaks, mode: v }} platform="ios" initialTab="map"/>
              </PhoneFrame>
            </DCArtboard>
          ))}
        </DCSection>

        {/* Empty states */}
        <DCSection id="empty" title="Empty states · con personalità" subtitle="Il tono milanese si vede nei dettagli">
          <DCArtboard id="empty-search" label="Nessun risultato" width={W} height={H}>
            <PhoneFrame platform="ios" dark={tweaks.mode === 'night'} w={W} h={H}>
              <TweakedApp tweaks={tweaks} platform="ios" initialTab="search"/>
              <EmptyStateDemo theme={tweaks.mode === 'night' ? LURIDO_TOKENS.night : LURIDO_TOKENS.day}
                              accent={LURIDO_TOKENS.accents[tweaks.accent]}/>
            </PhoneFrame>
          </DCArtboard>
        </DCSection>

      </DesignCanvas>

      <TweaksPanel tweaks={tweaks} setTweaks={setTweaks} show={editMode}/>
    </>
  );
}

// Wrapper that immediately opens the add flow
function LuridoAddWrapper({ tweaks }) {
  const theme = tweaks.mode === 'night' ? LURIDO_TOKENS.night : LURIDO_TOKENS.day;
  const accent = LURIDO_TOKENS.accents[tweaks.accent];
  const fonts = LURIDO_TOKENS.fonts[tweaks.fontPair];
  return (
    <div style={{ '--ldisplay': fonts.display, fontFamily: fonts.body, position: 'absolute', inset: 0, paddingTop: 54, paddingBottom: 32, boxSizing: 'border-box', background: theme.bg }}>
      <div style={{ position: 'relative', width: '100%', height: '100%' }}>
        <LuridoAdd theme={theme} accent={accent} mode={tweaks.mode} pinVariant={tweaks.pinVariant}
                   onClose={() => {}} onSubmit={() => {}}/>
      </div>
    </div>
  );
}

// A tiny demo overlay of the empty state for the empty-state artboard
function EmptyStateDemo() { return null; }

// Mount
const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(<LuridoRoot/>);
