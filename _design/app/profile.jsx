// profile.jsx — Lurido detail screen (photos, hours, dishes, reviews)

function LuridoProfile({ lurido, theme, accent, mode, headerVariant = 'photo', onBack, reviews, onAddReview, onVoteDish, dishVotes, onReport, onSave, isSaved }) {
  const [tab, setTab] = React.useState('overview'); // overview | reviews | dishes
  const [showReviewModal, setShowReviewModal] = React.useState(false);
  const [showReportModal, setShowReportModal] = React.useState(false);

  if (!lurido) return null;
  const luridoReviews = reviews.filter(r => r.luridoId === lurido.id);

  return (
    <div style={{
      position: 'absolute', inset: 0, background: theme.bg, overflow: 'auto',
      display: 'flex', flexDirection: 'column',
    }} className="l-scroll l-fade">
      {/* Header */}
      <LuridoProfileHeader lurido={lurido} theme={theme} accent={accent} mode={mode}
                          variant={headerVariant} onBack={onBack} onSave={onSave} isSaved={isSaved}/>

      {/* Sticky info band */}
      <div style={{ padding: '16px 18px 0', background: theme.bg }}>
        <h1 style={{
          margin: 0, fontSize: 26, fontWeight: 700, color: theme.text,
          fontFamily: 'var(--ldisplay, inherit)', letterSpacing: -0.5,
        }}>{lurido.name}</h1>

        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 8, flexWrap: 'wrap' }}>
          <LStatusBadge status={lurido.status} theme={theme} accent={accent}/>
          <span style={{ color: theme.textFaint, fontSize: 13 }}>·</span>
          <span style={{ fontSize: 13, color: theme.textMuted }}>
            {lurido.status === 'open' ? `chiude alle ${lurido.hours.close}` : `apre alle ${lurido.hours.open}`}
          </span>
          <span style={{ color: theme.textFaint, fontSize: 13 }}>·</span>
          <span style={{ fontSize: 13, color: theme.textMuted }}>{lurido.zone}</span>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginTop: 12 }}>
          <LStars value={lurido.rating} color={accent.base} emptyColor={theme.border} size={16}/>
          <span style={{ fontSize: 15, fontWeight: 700, color: theme.text }}>{lurido.rating.toFixed(1)}</span>
          <span style={{ fontSize: 13, color: theme.textMuted }}>· {lurido.reviewCount} recensioni</span>
        </div>

        {/* Action row */}
        <div style={{ display: 'flex', gap: 8, marginTop: 16 }}>
          <LButton theme={theme} accent={accent} variant="primary" icon={<LIcon name="edit" size={16} color={accent.ink}/>}
                   onClick={() => setShowReviewModal(true)} small>
            Recensisci
          </LButton>
          <LButton theme={theme} accent={accent} variant="subtle" icon={<LIcon name={isSaved ? 'bookmark' : 'bookmark'} size={16}/>}
                   onClick={onSave} small>
            {isSaved ? 'Salvato' : 'Salva'}
          </LButton>
          <LButton theme={theme} accent={accent} variant="subtle" icon={<LIcon name="share" size={16}/>}
                   onClick={() => {}} small>
            Invia
          </LButton>
          <LButton theme={theme} accent={accent} variant="subtle" icon={<LIcon name="flag" size={16}/>}
                   onClick={() => setShowReportModal(true)} small>
          </LButton>
        </div>

        {/* Tabs */}
        <div style={{
          display: 'flex', gap: 24, marginTop: 20,
          borderBottom: `1px solid ${theme.border}`,
        }}>
          {[
            { id: 'overview', label: 'Panoramica' },
            { id: 'dishes', label: `Piatti (${lurido.dishes.length})` },
            { id: 'reviews', label: `Recensioni (${luridoReviews.length})` },
          ].map(t => (
            <button key={t.id} onClick={() => setTab(t.id)} style={{
              background: 'none', border: 'none', padding: '10px 0',
              fontSize: 14, fontWeight: 600, fontFamily: 'inherit',
              color: tab === t.id ? theme.text : theme.textMuted,
              borderBottom: `2px solid ${tab === t.id ? accent.base : 'transparent'}`,
              marginBottom: -1, cursor: 'pointer',
            }}>{t.label}</button>
          ))}
        </div>
      </div>

      {/* Tab content */}
      <div style={{ padding: '16px 18px 100px' }}>
        {tab === 'overview' && <OverviewTab lurido={lurido} theme={theme} accent={accent}/>}
        {tab === 'dishes' && <DishesTab lurido={lurido} theme={theme} accent={accent} onVote={onVoteDish} dishVotes={dishVotes}/>}
        {tab === 'reviews' && <ReviewsTab reviews={luridoReviews} theme={theme} accent={accent}/>}
      </div>

      {showReviewModal && (
        <ReviewModal theme={theme} accent={accent} lurido={lurido}
                     onClose={() => setShowReviewModal(false)}
                     onSubmit={(r) => { onAddReview(r); setShowReviewModal(false); }}/>
      )}
      {showReportModal && (
        <ReportSheet theme={theme} accent={accent}
                     onClose={() => setShowReportModal(false)}
                     onReport={(reason) => { onReport(reason); setShowReportModal(false); }}/>
      )}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
// Profile header — 3 variants via Tweaks
// ─────────────────────────────────────────────────────────────
function LuridoProfileHeader({ lurido, theme, accent, mode, variant, onBack, onSave, isSaved }) {
  const navButtons = (
    <>
      <button onClick={onBack} style={{
        width: 38, height: 38, borderRadius: 12,
        background: mode === 'night' ? 'rgba(18,13,10,0.7)' : 'rgba(255,255,255,0.85)',
        backdropFilter: 'blur(12px)', WebkitBackdropFilter: 'blur(12px)',
        border: `1px solid ${theme.border}`, color: theme.text, cursor: 'pointer',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
      }}><LIcon name="chevL" size={20}/></button>
      <button onClick={onSave} style={{
        marginLeft: 'auto',
        width: 38, height: 38, borderRadius: 12,
        background: isSaved ? accent.base : (mode === 'night' ? 'rgba(18,13,10,0.7)' : 'rgba(255,255,255,0.85)'),
        backdropFilter: 'blur(12px)', WebkitBackdropFilter: 'blur(12px)',
        border: `1px solid ${isSaved ? accent.base : theme.border}`, color: isSaved ? accent.ink : theme.text, cursor: 'pointer',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
      }}><LIcon name="heart" size={20}/></button>
    </>
  );

  if (variant === 'minimal') {
    // Minimal: small photo strip, no hero
    return (
      <>
        <div style={{
          position: 'sticky', top: 0, zIndex: 5, padding: 12, display: 'flex', gap: 8,
          background: theme.bg,
        }}>{navButtons}</div>
        <div style={{ padding: '0 18px', display: 'flex', gap: 8, overflowX: 'auto' }} className="l-scroll">
          {lurido.photos.slice(0, 4).map((p, i) => (
            <LPhoto key={i} label={p} w={140} h={100} radius={10}/>
          ))}
        </div>
      </>
    );
  }

  if (variant === 'gallery') {
    // Gallery grid: main photo + 4 squares
    return (
      <>
        <div style={{ position: 'relative', padding: '10px 12px 0', display: 'flex', gap: 8, zIndex: 3 }}>{navButtons}</div>
        <div style={{ padding: '8px 14px 0', display: 'grid', gap: 6, gridTemplateColumns: '2fr 1fr 1fr', gridTemplateRows: '100px 100px' }}>
          <LPhoto label={lurido.photos[0] || 'foto_1'} h="100%" radius={14} style={{ gridRow: '1 / 3' }}/>
          <LPhoto label={lurido.photos[1] || 'foto_2'} h="100%" radius={14}/>
          <LPhoto label={lurido.photos[2] || 'foto_3'} h="100%" radius={14}/>
          <LPhoto label={lurido.photos[3] || 'foto_4'} h="100%" radius={14}/>
          <div style={{
            height: '100%', borderRadius: 14, background: theme.surfaceAlt,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            color: theme.textMuted, fontSize: 13, fontWeight: 600, cursor: 'pointer',
          }}>+{Math.max(0, (lurido.photos.length || 0) - 4)}</div>
        </div>
      </>
    );
  }

  // default: 'photo' — full bleed hero w/ gradient
  return (
    <div style={{ position: 'relative', height: 260 }}>
      <LPhoto label={lurido.photos[0] || 'hero'} h={260} radius={0}/>
      <div style={{
        position: 'absolute', inset: 0,
        background: `linear-gradient(180deg, ${mode === 'night' ? 'rgba(18,13,10,0.3)' : 'rgba(0,0,0,0.3)'} 0%, transparent 30%, ${theme.bg} 100%)`,
      }}/>
      <div style={{ position: 'absolute', top: 14, left: 12, right: 12, display: 'flex', gap: 8 }}>{navButtons}</div>
      {/* Photo counter */}
      <div style={{
        position: 'absolute', bottom: 16, right: 14,
        padding: '4px 10px', borderRadius: 20,
        background: 'rgba(0,0,0,0.5)', backdropFilter: 'blur(8px)', WebkitBackdropFilter: 'blur(8px)',
        color: 'white', fontSize: 12, fontFamily: 'ui-monospace, monospace',
      }}>1 / {lurido.photos.length || 1}</div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
// Overview tab
// ─────────────────────────────────────────────────────────────
function OverviewTab({ lurido, theme, accent }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
      {/* Description */}
      <p style={{
        margin: 0, fontSize: 15, lineHeight: 1.55, color: theme.text,
        textWrap: 'pretty',
      }}>{lurido.description}</p>

      {/* Tags */}
      <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
        {lurido.tags.map(t => (
          <span key={t} style={{
            fontSize: 12, padding: '5px 10px', borderRadius: 8,
            background: theme.chip, color: theme.textMuted,
            fontFamily: 'ui-monospace, monospace', textTransform: 'lowercase',
          }}>#{t.replace(/\s/g,'')}</span>
        ))}
      </div>

      {/* Info rows */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 2, border: `1px solid ${theme.border}`, borderRadius: 14, overflow: 'hidden', background: theme.surface }}>
        <InfoRow theme={theme} icon="pin" label="Indirizzo" value={lurido.address}/>
        <InfoRow theme={theme} icon="clock" label="Orari" value={`${lurido.hours.open} – ${lurido.hours.close}`}/>
        {lurido.phone && <InfoRow theme={theme} icon="phone" label="Telefono" value={lurido.phone}/>}
        <InfoRow theme={theme} icon="user" label="Aggiunto da" value={`@${lurido.addedBy}`} last/>
      </div>

      {/* Top dishes preview */}
      {lurido.dishes.length > 0 && (
        <div>
          <h3 style={{ margin: '0 0 10px', fontSize: 13, fontWeight: 700, color: theme.textMuted, textTransform: 'uppercase', letterSpacing: 1 }}>Piatti top</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {lurido.dishes.slice(0, 2).map(d => (
              <div key={d.id} style={{
                padding: 12, borderRadius: 12, background: theme.surface,
                border: `1px solid ${theme.border}`,
                display: 'flex', gap: 12, alignItems: 'center',
              }}>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 14, fontWeight: 700, color: theme.text }}>{d.name}</div>
                  <div style={{ fontSize: 12, color: theme.textMuted, marginTop: 2 }}>{d.desc}</div>
                </div>
                <div style={{
                  display: 'flex', alignItems: 'center', gap: 4,
                  padding: '6px 10px', borderRadius: 8, background: theme.chip,
                  color: accent.base, fontWeight: 700, fontSize: 13,
                  fontFamily: 'ui-monospace, monospace',
                }}>
                  <LIcon name="arrowUp" size={12}/>{d.votes}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

function InfoRow({ theme, icon, label, value, last }) {
  return (
    <div style={{
      display: 'flex', alignItems: 'center', gap: 12, padding: '12px 14px',
      borderBottom: last ? 'none' : `1px solid ${theme.border}`,
    }}>
      <div style={{ color: theme.textMuted }}><LIcon name={icon} size={18}/></div>
      <div style={{ flex: 1 }}>
        <div style={{ fontSize: 11, color: theme.textFaint, textTransform: 'uppercase', letterSpacing: 0.5 }}>{label}</div>
        <div style={{ fontSize: 14, color: theme.text, marginTop: 1 }}>{value}</div>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
// Dishes tab — upvote-able
// ─────────────────────────────────────────────────────────────
function DishesTab({ lurido, theme, accent, onVote, dishVotes }) {
  if (lurido.dishes.length === 0) {
    return <EmptyState theme={theme} accent={accent} icon="🥪"
                       title="Ancora nessun piatto segnalato"
                       body="Aggiungi il primo piatto tipico — aiuta chi viene dopo di te."/>;
  }
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
      {lurido.dishes.map(d => {
        const voted = dishVotes?.[d.id];
        const votes = d.votes + (voted ? 1 : 0);
        return (
          <div key={d.id} style={{
            padding: 14, borderRadius: 14, background: theme.surface,
            border: `1px solid ${theme.border}`,
            display: 'flex', gap: 12, alignItems: 'flex-start',
          }}>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontSize: 15, fontWeight: 700, color: theme.text }}>{d.name}</div>
              <div style={{ fontSize: 13, color: theme.textMuted, marginTop: 4, lineHeight: 1.4 }}>{d.desc}</div>
            </div>
            <button onClick={() => onVote(d.id)} style={{
              display: 'flex', flexDirection: 'column', alignItems: 'center',
              padding: '8px 12px', borderRadius: 12,
              background: voted ? accent.base : theme.chip,
              color: voted ? accent.ink : theme.text,
              border: 'none', cursor: 'pointer', fontFamily: 'inherit',
              transition: 'all 0.15s',
              minWidth: 48,
            }}>
              <LIcon name="arrowUp" size={16} strokeWidth={2.2}/>
              <span style={{ fontSize: 13, fontWeight: 700, fontFamily: 'ui-monospace, monospace', marginTop: 2 }}>{votes}</span>
            </button>
          </div>
        );
      })}
      <button style={{
        marginTop: 4, padding: 14, borderRadius: 14,
        background: 'transparent', border: `1.5px dashed ${theme.border}`,
        color: theme.textMuted, fontFamily: 'inherit', fontSize: 13, cursor: 'pointer',
      }}>+ Aggiungi un piatto</button>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
// Reviews tab
// ─────────────────────────────────────────────────────────────
function ReviewsTab({ reviews, theme, accent }) {
  if (reviews.length === 0) {
    return <EmptyState theme={theme} accent={accent} icon="💬"
                       title="Ancora nessuna recensione"
                       body="Sii il primo. Racconta com'era il panino, l'atmosfera, la fila."/>;
  }
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      {reviews.map(r => (
        <div key={r.id} style={{ padding: 14, borderRadius: 14, background: theme.surface, border: `1px solid ${theme.border}` }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <div style={{
              width: 36, height: 36, borderRadius: '50%',
              background: theme.chip, color: theme.text,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontWeight: 700, fontSize: 14,
            }}>{r.avatar}</div>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: 14, fontWeight: 600, color: theme.text }}>@{r.user}</div>
              <div style={{ fontSize: 12, color: theme.textFaint }}>{r.date}</div>
            </div>
            <LStars value={r.stars} color={accent.base} emptyColor={theme.border} size={14}/>
          </div>
          <p style={{ margin: '10px 0 0', fontSize: 14, lineHeight: 1.5, color: theme.text }}>{r.text}</p>
          {r.photo && <LPhoto label="foto_utente" h={120} radius={10} style={{ marginTop: 10 }}/>}
          <div style={{ display: 'flex', gap: 16, marginTop: 10, paddingTop: 8, borderTop: `1px solid ${theme.border}` }}>
            <button style={{
              background: 'none', border: 'none', padding: 0, cursor: 'pointer',
              color: theme.textMuted, fontSize: 12, fontFamily: 'inherit', display: 'flex', alignItems: 'center', gap: 4,
            }}><LIcon name="heart" size={14}/> {r.helpful} utili</button>
            <button style={{
              background: 'none', border: 'none', padding: 0, cursor: 'pointer',
              color: theme.textMuted, fontSize: 12, fontFamily: 'inherit',
            }}>Rispondi</button>
          </div>
        </div>
      ))}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
// Empty state — with personality
// ─────────────────────────────────────────────────────────────
function EmptyState({ theme, accent, icon, title, body, variant = 'default' }) {
  if (variant === 'sketch') {
    return (
      <div style={{ textAlign: 'center', padding: '40px 24px' }}>
        <div style={{
          width: 120, height: 120, margin: '0 auto',
          border: `2.5px dashed ${theme.border}`, borderRadius: 20,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: 56,
        }}>{icon}</div>
        <h3 style={{ margin: '18px 0 6px', fontSize: 16, color: theme.text, fontWeight: 700 }}>{title}</h3>
        <p style={{ margin: 0, fontSize: 14, color: theme.textMuted, lineHeight: 1.5 }}>{body}</p>
      </div>
    );
  }
  return (
    <div style={{ textAlign: 'center', padding: '32px 24px' }}>
      <div style={{ fontSize: 44, opacity: 0.75 }}>{icon}</div>
      <h3 style={{ margin: '10px 0 4px', fontSize: 15, color: theme.text, fontWeight: 700 }}>{title}</h3>
      <p style={{ margin: 0, fontSize: 13, color: theme.textMuted, lineHeight: 1.5, maxWidth: 280, marginLeft: 'auto', marginRight: 'auto' }}>{body}</p>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
// Review modal (slide-up sheet)
// ─────────────────────────────────────────────────────────────
function ReviewModal({ theme, accent, lurido, onClose, onSubmit }) {
  const [stars, setStars] = React.useState(0);
  const [text, setText] = React.useState('');
  const [withPhoto, setWithPhoto] = React.useState(false);
  return (
    <div style={{
      position: 'absolute', inset: 0, zIndex: 30,
      background: 'rgba(0,0,0,0.45)', backdropFilter: 'blur(4px)',
      display: 'flex', alignItems: 'flex-end',
    }} onClick={onClose}>
      <div onClick={e => e.stopPropagation()} className="l-slideup" style={{
        width: '100%', background: theme.surface, borderTopLeftRadius: 24, borderTopRightRadius: 24,
        padding: 20, display: 'flex', flexDirection: 'column', gap: 14, maxHeight: '85%',
      }}>
        <div style={{ width: 40, height: 4, background: theme.border, borderRadius: 2, alignSelf: 'center' }}/>
        <h3 style={{ margin: 0, fontSize: 18, fontWeight: 700, color: theme.text, fontFamily: 'var(--ldisplay, inherit)' }}>
          Com'era il panino da {lurido.name}?
        </h3>
        <div style={{ display: 'flex', justifyContent: 'center', gap: 8 }}>
          {[1,2,3,4,5].map(i => (
            <button key={i} onClick={() => setStars(i)} style={{ background: 'none', border: 'none', padding: 4, cursor: 'pointer' }}>
              <svg width="36" height="36" viewBox="0 0 24 24" fill={stars >= i ? accent.base : theme.chip}>
                <path d="M12 2l3 7 7 .6-5.4 4.7 1.8 7-6.4-4-6.4 4 1.8-7L2 9.6 9 9z"/>
              </svg>
            </button>
          ))}
        </div>
        <textarea value={text} onChange={e => setText(e.target.value)} rows={5}
                  placeholder="Racconta com'era… 'Il panino dopo le 3 ha un altro sapore…'"
                  style={{
                    background: theme.surfaceAlt, border: `1px solid ${theme.border}`,
                    borderRadius: 12, padding: 12, fontSize: 14, color: theme.text,
                    fontFamily: 'inherit', resize: 'none', outline: 'none',
                  }}/>
        <button onClick={() => setWithPhoto(!withPhoto)} style={{
          padding: 12, borderRadius: 12, background: withPhoto ? theme.chip : 'transparent',
          border: `1.5px dashed ${theme.border}`, color: theme.textMuted, fontFamily: 'inherit', fontSize: 13,
          cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
        }}>
          <LIcon name="camera" size={16}/>
          {withPhoto ? 'Foto aggiunta' : 'Aggiungi foto (opzionale)'}
        </button>
        <div style={{ display: 'flex', gap: 8 }}>
          <LButton theme={theme} accent={accent} variant="subtle" full onClick={onClose}>Annulla</LButton>
          <LButton theme={theme} accent={accent} variant="primary" full
                   disabled={stars === 0 || text.length < 5}
                   onClick={() => onSubmit({ luridoId: lurido.id, stars, text, photo: withPhoto })}>
            Pubblica
          </LButton>
        </div>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
// Report sheet
// ─────────────────────────────────────────────────────────────
function ReportSheet({ theme, accent, onClose, onReport }) {
  const reasons = [
    { id: 'closed', label: 'È chiuso adesso', emoji: '🔒' },
    { id: 'moved', label: 'Si è spostato', emoji: '📦' },
    { id: 'fake', label: 'Non esiste / è finto', emoji: '👻' },
    { id: 'photo', label: 'Foto inappropriate', emoji: '📸' },
  ];
  return (
    <div style={{
      position: 'absolute', inset: 0, zIndex: 30,
      background: 'rgba(0,0,0,0.45)', display: 'flex', alignItems: 'flex-end',
    }} onClick={onClose}>
      <div onClick={e => e.stopPropagation()} className="l-slideup" style={{
        width: '100%', background: theme.surface, borderTopLeftRadius: 24, borderTopRightRadius: 24,
        padding: 20, display: 'flex', flexDirection: 'column', gap: 10,
      }}>
        <div style={{ width: 40, height: 4, background: theme.border, borderRadius: 2, alignSelf: 'center', marginBottom: 8 }}/>
        <h3 style={{ margin: '0 0 4px', fontSize: 16, fontWeight: 700, color: theme.text }}>Segnala un problema</h3>
        {reasons.map(r => (
          <button key={r.id} onClick={() => onReport(r.id)} style={{
            display: 'flex', alignItems: 'center', gap: 12, padding: 14, borderRadius: 12,
            background: theme.surfaceAlt, border: `1px solid ${theme.border}`,
            color: theme.text, fontFamily: 'inherit', fontSize: 14, cursor: 'pointer', textAlign: 'left',
          }}>
            <span style={{ fontSize: 22 }}>{r.emoji}</span>
            <span>{r.label}</span>
          </button>
        ))}
      </div>
    </div>
  );
}

Object.assign(window, { LuridoProfile, EmptyState });
