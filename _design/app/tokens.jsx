// tokens.jsx — design tokens, sample data, in-memory store
// Warm off-white day palette; deep cacao night palette.
// Accent ambrato (amber) that recalls the glow of a baracchino light at 2am.

const LURIDO_TOKENS = {
  // Day palette
  day: {
    bg: '#faf6f0',        // warm off-white
    surface: '#ffffff',
    surfaceAlt: '#f3ede3',
    border: 'rgba(60,40,20,0.08)',
    borderStrong: 'rgba(60,40,20,0.16)',
    text: '#1a1512',
    textMuted: 'rgba(26,21,18,0.6)',
    textFaint: 'rgba(26,21,18,0.4)',
    chip: '#ede4d3',
    success: '#4a7c3a',
    danger: '#b94a3a',
    mapBg: '#f0e8d8',      // warm parchment map
    mapRoad: '#ffffff',
    mapRoadStroke: 'rgba(60,40,20,0.08)',
    mapGreen: '#d4e0b8',
    mapWater: '#b8d4d8',
  },
  // Night palette — cacao + ember
  night: {
    bg: '#120d0a',
    surface: '#1c1613',
    surfaceAlt: '#251d19',
    border: 'rgba(255,220,180,0.08)',
    borderStrong: 'rgba(255,220,180,0.16)',
    text: '#f5ead8',
    textMuted: 'rgba(245,234,216,0.6)',
    textFaint: 'rgba(245,234,216,0.35)',
    chip: '#2a211b',
    success: '#8dbf7a',
    danger: '#e88878',
    mapBg: '#0f0a08',
    mapRoad: '#1e1612',
    mapRoadStroke: 'rgba(255,220,180,0.06)',
    mapGreen: '#1a1e14',
    mapWater: '#0c1418',
  },
  // Accents — choose via tweaks
  accents: {
    ambra:   { base: '#f59e42', glow: '#ffc278', ink: '#2a1a08' },
    ocra:    { base: '#e8a33d', glow: '#f5c06a', ink: '#2a1e08' },
    corallo: { base: '#ff6b35', glow: '#ff9570', ink: '#2a1008' },
    limone:  { base: '#fbbf24', glow: '#fde182', ink: '#2a2008' },
    brace:   { base: '#d97706', glow: '#f39537', ink: '#2a1608' },
  },
  // Typography pairings
  fonts: {
    grotesk: {
      display: "'Space Grotesk', 'Inter', system-ui, sans-serif",
      body: "'Inter', system-ui, sans-serif",
      mono: "'JetBrains Mono', ui-monospace, monospace",
    },
    serif: {
      display: "'Fraktion Mono Fallback', 'Playfair Display', 'Times New Roman', serif",
      body: "'Inter', system-ui, sans-serif",
      mono: "'JetBrains Mono', ui-monospace, monospace",
    },
    editorial: {
      display: "'DM Serif Display', 'Times New Roman', serif",
      body: "'DM Sans', system-ui, sans-serif",
      mono: "'JetBrains Mono', ui-monospace, monospace",
    },
  },
  // Radii
  r: { xs: 6, sm: 10, md: 14, lg: 20, xl: 28, pill: 9999 },
  // Shadows
  shadow: {
    day: {
      sm: '0 1px 2px rgba(60,40,20,0.06), 0 2px 8px rgba(60,40,20,0.04)',
      md: '0 2px 4px rgba(60,40,20,0.08), 0 8px 24px rgba(60,40,20,0.08)',
      lg: '0 8px 16px rgba(60,40,20,0.1), 0 20px 48px rgba(60,40,20,0.12)',
    },
    night: {
      sm: '0 1px 2px rgba(0,0,0,0.4), 0 2px 8px rgba(0,0,0,0.3)',
      md: '0 4px 12px rgba(0,0,0,0.5), 0 12px 32px rgba(0,0,0,0.4)',
      lg: '0 8px 24px rgba(0,0,0,0.6), 0 24px 60px rgba(0,0,0,0.5)',
    },
  },
};

// ─────────────────────────────────────────────────────────────
// Sample luridi data — real Milan neighborhoods, invented names
// ─────────────────────────────────────────────────────────────
const SAMPLE_LURIDI = [
  {
    id: 'l1',
    name: 'Da Peppino il Lurido',
    zone: 'Navigli',
    address: 'Ripa di Porta Ticinese 28',
    phone: '+39 02 555 1234',
    // Fake map coords normalized 0-1
    x: 0.32, y: 0.72,
    status: 'open',   // open | closed | pending | reported
    hours: { open: '22:00', close: '04:30' },
    tags: ['storico', 'late night', 'contante'],
    rating: 4.7,
    reviewCount: 238,
    description: 'Il baracchino più vecchio dei Navigli. Peppino fa panini dal 1987. La salsa rosa è leggendaria, il panino Lurido Speciale è un\'istituzione.',
    photos: ['paninone', 'bancone', 'salse', 'luci'],
    dishes: [
      { id: 'd1', name: 'Lurido Speciale', votes: 147, desc: 'Salamella, uovo, salsa rosa, patatine DENTRO' },
      { id: 'd2', name: 'Panino del Navigante', votes: 92, desc: 'Tonno, cipolla, maionese, peperoncino' },
      { id: 'd3', name: 'Wurstel Alto Milanese', votes: 64, desc: 'Wurstel, crauti, senape di Digione' },
    ],
    addedBy: 'marco_nav',
    addedAt: '2024-03-12',
  },
  {
    id: 'l2',
    name: 'Baracchino del Tonio',
    zone: 'Isola',
    address: 'Piazza Minniti',
    x: 0.58, y: 0.28,
    status: 'open',
    hours: { open: '23:00', close: '05:00' },
    tags: ['piccante', 'vegetariano OK'],
    rating: 4.4,
    reviewCount: 156,
    description: 'Dietro la stazione. Tonio è pugliese doc, fa il panino con la cima di rapa che manco a Bari.',
    photos: ['insegna', 'panino_rapa', 'folla'],
    dishes: [
      { id: 'd4', name: 'Cima di Rapa & Salsiccia', votes: 112, desc: 'Classico pugliese in trasferta' },
      { id: 'd5', name: 'Lurido Diavolo', votes: 78, desc: 'Nduja, provola, cipolla rossa' },
    ],
    addedBy: 'giulia_isola',
    addedAt: '2024-06-21',
  },
  {
    id: 'l3',
    name: 'Il Furgone Fluorescente',
    zone: 'Porta Romana',
    address: 'Viale Beatrice d\'Este',
    x: 0.48, y: 0.62,
    status: 'closed',
    hours: { open: '22:30', close: '03:00' },
    tags: ['food truck', 'si sposta'],
    rating: 4.1,
    reviewCount: 89,
    description: 'Un furgone giallo fosforescente che appare dopo mezzanotte. Fuma tanto, parla poco, panini enormi.',
    photos: ['furgone', 'griglia'],
    dishes: [
      { id: 'd6', name: 'Megalurido', votes: 54, desc: 'Tre hamburger, bacon, cheddar, uovo' },
    ],
    addedBy: 'anon_PR',
    addedAt: '2024-09-03',
  },
  {
    id: 'l4',
    name: 'Chiosco del Nonno',
    zone: 'Porta Venezia',
    address: 'Via Lecco / Corso Buenos Aires',
    x: 0.66, y: 0.44,
    status: 'open',
    hours: { open: '19:00', close: '02:00' },
    tags: ['veggie', 'orari umani'],
    rating: 4.9,
    reviewCount: 412,
    description: 'Il nonno ci sta dal 1972. Apre presto, chiude ad orari umani. Il figlio vuole chiudere, il nonno resiste.',
    photos: ['nonno', 'chiosco', 'panino_veg'],
    dishes: [
      { id: 'd7', name: 'Veggie Milanese', votes: 201, desc: 'Melanzane grigliate, stracchino, rucola' },
      { id: 'd8', name: 'Toast del Nonno', votes: 134, desc: 'Pane casereccio, prosciutto cotto, fontina' },
    ],
    addedBy: 'laura_pv',
    addedAt: '2023-11-08',
  },
  {
    id: 'l5',
    name: 'Lurido dei Poeti',
    zone: 'Brera',
    address: 'Via Fiori Chiari',
    x: 0.44, y: 0.4,
    status: 'open',
    hours: { open: '21:00', close: '03:30' },
    tags: ['instagrammabile', 'caro'],
    rating: 3.8,
    reviewCount: 67,
    description: 'Baracchino "di design". I panini costano il doppio ma è sempre pieno.',
    photos: ['insegna_neon'],
    dishes: [
      { id: 'd9', name: 'Panino del Poeta', votes: 28, desc: 'Bresaola, rucola, grana, sciroppo d\'acero' },
    ],
    addedBy: 'influencer_mi',
    addedAt: '2025-01-15',
  },
  {
    id: 'l6',
    name: 'Da Caterina',
    zone: 'Bovisa',
    address: 'Via Candiani',
    x: 0.38, y: 0.18,
    status: 'pending',
    hours: { open: '22:00', close: '04:00' },
    tags: ['da verificare'],
    rating: 0,
    reviewCount: 0,
    description: 'Segnalato da un utente ieri sera. Da verificare orari e posizione esatta.',
    photos: ['foto_utente_1'],
    dishes: [],
    addedBy: 'nuovo_utente',
    addedAt: '2026-04-22',
  },
];

const SAMPLE_REVIEWS = [
  { id: 'r1', luridoId: 'l1', user: 'marco_nav', avatar: 'M', stars: 5, text: 'Il mio posto del cuore dal 2019. Peppino è un mito, il panino dopo le 3 è meglio che la pizza.', date: '2 giorni fa', photo: true, helpful: 34 },
  { id: 'r2', luridoId: 'l1', user: 'sofia.m', avatar: 'S', stars: 5, text: 'Ci sono andata dopo Tunnel. Mi ha salvato la serata. La salsa rosa è seria.', date: '1 settimana fa', photo: false, helpful: 12 },
  { id: 'r3', luridoId: 'l1', user: 'tommaso_b', avatar: 'T', stars: 4, text: 'Ottimo ma si sono fatti un po\' furbetti con i prezzi. 8€ per un panino è al limite.', date: '2 settimane fa', photo: false, helpful: 8 },
  { id: 'r4', luridoId: 'l4', user: 'laura_pv', avatar: 'L', stars: 5, text: 'Il nonno mi ha riconosciuta dopo 3 anni. Questo NON è un baracchino, è casa.', date: '3 giorni fa', photo: true, helpful: 67 },
  { id: 'r5', luridoId: 'l2', user: 'dario.rmn', avatar: 'D', stars: 4, text: 'Il panino cima di rapa vale il viaggio. Tonio fa il caffè sospeso.', date: '5 giorni fa', photo: false, helpful: 19 },
];

const SAMPLE_NOTIFICATIONS = [
  { id: 'n1', type: 'approved', title: 'Il tuo lurido è stato approvato!', body: '"Baracchino del Tonio" è ora visibile sulla mappa. Grazie per il contributo 🔥', time: 'ora', read: false, icon: '✓' },
  { id: 'n2', type: 'nearby', title: 'Nuovo lurido vicino a te', body: '"Lurido dei Poeti" è stato aggiunto a Brera, 400m da te', time: '2h fa', read: false, icon: '📍' },
  { id: 'n3', type: 'reply', title: 'Marco ha risposto alla tua recensione', body: '"Hai perfettamente ragione sulla salsa rosa..."', time: 'ieri', read: true, icon: '💬' },
  { id: 'n4', type: 'badge', title: 'Nuovo badge sbloccato: Lurido Expert', body: 'Hai raggiunto 25 recensioni. Sei ufficialmente uno di noi.', time: '3g fa', read: true, icon: '🏆' },
  { id: 'n5', type: 'nearby', title: 'Un lurido che hai salvato è aperto ora', body: '"Da Peppino il Lurido" — aperto fino alle 04:30', time: '3g fa', read: true, icon: '🌙' },
];

const SAMPLE_USER = {
  username: 'giulia_isola',
  displayName: 'Giulia Bernasconi',
  avatar: 'G',
  bio: 'Notturna di professione. Dal 2023 a caccia del lurido perfetto.',
  level: 4,
  levelName: 'Lurido Expert',
  nextLevel: 'Re del Lurido',
  xp: 420,
  xpNext: 600,
  stats: { reviews: 27, added: 4, saved: 18, upvotes: 156 },
  badges: [
    { id: 'b1', name: 'Primo Panino', desc: 'Prima recensione', earned: true, icon: '🥪' },
    { id: 'b2', name: 'Navigante', desc: '10 luridi recensiti', earned: true, icon: '⚓' },
    { id: 'b3', name: 'Contributore', desc: '3 luridi approvati', earned: true, icon: '✨' },
    { id: 'b4', name: 'Re del Lurido', desc: '50 recensioni', earned: false, icon: '👑' },
    { id: 'b5', name: 'Nottambulo', desc: '10 check-in dopo le 3', earned: true, icon: '🌙' },
    { id: 'b6', name: 'Esploratore', desc: '5 zone diverse', earned: false, icon: '🧭' },
  ],
};

Object.assign(window, {
  LURIDO_TOKENS, SAMPLE_LURIDI, SAMPLE_REVIEWS, SAMPLE_NOTIFICATIONS, SAMPLE_USER,
});
