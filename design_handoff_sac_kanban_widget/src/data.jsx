// Mock data: Vorhaben (initiatives) for the kanban
// 6 phases, multiple HA / BU / Phasen (sub-phase) / Year combos

const PHASES = [
  { id: 'funnel',          label: 'Funnel',          color: '#2f6db4' },
  { id: 'vorbereitung',    label: 'Vorbereitung',    color: '#2aa39a' },
  { id: 'initialisierung', label: 'Initialisierung', color: '#f0b323' },
  { id: 'umsetzung',       label: 'Umsetzung',       color: '#e58a3a' },
  { id: 'abschluss',       label: 'Abschluss',       color: '#5b9b46' },
  { id: 'done',            label: 'Done',            color: '#8c95a0' },
];

// Hauptabteilung (HA), Business Unit (BU), Sub-phase (Phasen filter)
const HAS  = ['Alle', 'IT', 'Finance', 'Operations', 'HR'];
const BUS  = ['Alle', 'Retail', 'Wholesale', 'Logistics', 'Digital'];
const SUBP = ['Alle', 'Plan', 'Genehmigt', 'Aktiv', 'Hold'];
const YEARS = ['2024', '2025', '2026', '2027'];

const OWNERS = [
  { id: 'a', initials: 'AM', name: 'A. Müller',  color: '#2f6db4' },
  { id: 'b', initials: 'SK', name: 'S. Keller',  color: '#2aa39a' },
  { id: 'c', initials: 'RT', name: 'R. Tanner',  color: '#e58a3a' },
  { id: 'd', initials: 'JB', name: 'J. Brunner', color: '#5b9b46' },
  { id: 'e', initials: 'NW', name: 'N. Weber',   color: '#8c4fb8' },
  { id: 'f', initials: 'MF', name: 'M. Frei',    color: '#c95a6e' },
];

const ownerOf = (i) => OWNERS[i % OWNERS.length];

// helper to keep things terse
const mk = (id, name, phase, ha, bu, subp, owner, amount, year = '2026') =>
  ({ id, name, phase, ha, bu, subp, owner, amount, year });

const INITIAL_PROJECTS = [
  // Funnel
  mk('p01', 'Projekt A',  'funnel',          'IT',         'Retail',    'Plan',      'a', 5.2),
  mk('p02', 'Projekt B',  'funnel',          'Finance',    'Wholesale', 'Plan',      'b', 3.4),
  mk('p03', 'Projekt C',  'funnel',          'IT',         'Digital',   'Plan',      'c', 8.0),
  mk('p04', 'Projekt AA', 'funnel',          'Operations', 'Logistics', 'Plan',      'd', 2.1),
  mk('p05', 'Projekt BB', 'funnel',          'IT',         'Retail',    'Plan',      'e', 1.8),
  // Vorbereitung
  mk('p06', 'Projekt D',  'vorbereitung',    'Finance',    'Retail',    'Genehmigt', 'b', 0.6),
  mk('p07', 'Projekt E',  'vorbereitung',    'IT',         'Digital',   'Plan',      'a', 0.5),
  mk('p08', 'Projekt CC', 'vorbereitung',    'HR',         'Wholesale', 'Plan',      'f', 0.4),
  // Initialisierung
  mk('p09', 'Projekt F',  'initialisierung', 'IT',         'Digital',   'Aktiv',     'c', 4.2),
  mk('p10', 'Projekt G',  'initialisierung', 'Operations', 'Logistics', 'Aktiv',     'd', 3.1),
  mk('p11', 'Projekt H',  'initialisierung', 'IT',         'Retail',    'Genehmigt', 'a', 1.9),
  mk('p12', 'Projekt I',  'initialisierung', 'Finance',    'Wholesale', 'Genehmigt', 'b', 1.3),
  // Umsetzung
  mk('p13', 'Projekt J',  'umsetzung',       'IT',         'Digital',   'Aktiv',     'e', 0.9),
  mk('p14', 'Projekt K',  'umsetzung',       'Operations', 'Logistics', 'Aktiv',     'c', 0.4),
  mk('p15', 'Projekt L',  'umsetzung',       'Finance',    'Retail',    'Hold',      'b', 0.2),
  // Abschluss
  mk('p16', 'Projekt M',  'abschluss',       'IT',         'Retail',    'Aktiv',     'a', 1.2),
  mk('p17', 'Projekt N',  'abschluss',       'Finance',    'Wholesale', 'Aktiv',     'b', 0.8),
  mk('p18', 'Projekt O',  'abschluss',       'Operations', 'Logistics', 'Aktiv',     'd', 1.1),
  // Done
  mk('p19', 'Projekt X',  'done',            'IT',         'Digital',   'Aktiv',     'a', 0.7),
  mk('p20', 'Projekt Y',  'done',            'HR',         'Retail',    'Aktiv',     'f', 0.5),
  mk('p21', 'Projekt Z',  'done',            'Finance',    'Wholesale', 'Aktiv',     'b', 0.7),

  // a few in 2025 / 2027 for filter realism
  mk('p22', 'Projekt P',  'funnel',          'IT',         'Retail',    'Plan',      'a', 2.5, '2025'),
  mk('p23', 'Projekt Q',  'umsetzung',       'Operations', 'Digital',   'Aktiv',     'c', 1.4, '2025'),
  mk('p24', 'Projekt R',  'initialisierung', 'Finance',    'Wholesale', 'Aktiv',     'b', 3.0, '2027'),
];

// Default palettes for styling panel
const PHASE_PALETTES = {
  classic: { name: 'Classic',  funnel:'#2f6db4', vorbereitung:'#2aa39a', initialisierung:'#f0b323', umsetzung:'#e58a3a', abschluss:'#5b9b46', done:'#8c95a0' },
  horizon: { name: 'Horizon',  funnel:'#5d6e87', vorbereitung:'#2b7c8f', initialisierung:'#a36d00', umsetzung:'#a35a1a', abschluss:'#3d7a3d', done:'#7a8189' },
  vibrant: { name: 'Vibrant',  funnel:'#1f6feb', vorbereitung:'#06b6a4', initialisierung:'#facc15', umsetzung:'#f97316', abschluss:'#22c55e', done:'#94a3b8' },
  mono:    { name: 'Mono',     funnel:'#1f3b56', vorbereitung:'#324b66', initialisierung:'#475e76', umsetzung:'#5b6f86', abschluss:'#708296', done:'#8595a6' },
};

const HEADER_PRESETS = {
  belize:    { name: 'Belize',    bg: '#2c4762', fg: '#ffffff' },
  midnight:  { name: 'Midnight',  bg: '#1f2d3d', fg: '#ffffff' },
  ocean:     { name: 'Ocean',     bg: '#0a6ed1', fg: '#ffffff' },
  graphite:  { name: 'Graphite',  bg: '#3a3f44', fg: '#ffffff' },
  paper:     { name: 'Paper',     bg: '#f4f5f7', fg: '#32363a' },
};

Object.assign(window, {
  PHASES, HAS, BUS, SUBP, YEARS, OWNERS, ownerOf, INITIAL_PROJECTS,
  PHASE_PALETTES, HEADER_PRESETS,
});
