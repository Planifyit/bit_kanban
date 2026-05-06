// App shell + state
const { useState: useS, useEffect: useE } = React;

function App() {
  const [styling, setStyling] = useS({
    title: 'Kanban Vorhaben Übersicht',
    headerBg: '#2c4762',
    headerFg: '#ffffff',
    palette: { funnel:'#2f6db4', vorbereitung:'#2aa39a', initialisierung:'#f0b323', umsetzung:'#e58a3a', abschluss:'#5b9b46', done:'#8c95a0' },
    density: 'comfortable',
    radius: 4,
    gap: 10,
    cardShadow: true,
    showTotals: true,
    showAvatars: true,
    fontFamily: "'Source Sans 3', sans-serif",
  });
  const [design, setDesign] = useS({
    model: 'SAC_Vorhaben_Plan_2026',
    refresh: 'live',
    measure: 'CHF Investition',
    showFilters: true,
    editMode: false,
    dblClickRename: true,
    writeBack: false,
  });
  const [filters, setFilters] = useS({ HA: 'Alle', BU: 'Alle', Phasen: 'Alle', Jahr: '2026' });
  const [projects, setProjects] = useS(INITIAL_PROJECTS);
  const [activeTab, setActiveTab] = useS('styling'); // 'styling' | 'builder'
  const [panelVisible, setPanelVisible] = useS(true);
  const [selected, setSelected] = useS(true);

  // total in filtered set
  const visibleCount = projects.filter(p => {
    if (filters.HA !== 'Alle' && p.ha !== filters.HA) return false;
    if (filters.BU !== 'Alle' && p.bu !== filters.BU) return false;
    if (filters.Phasen !== 'Alle' && p.subp !== filters.Phasen) return false;
    if (String(p.year) !== String(filters.Jahr)) return false;
    return true;
  }).length;

  return (
    <div className="sac-shell">
      <div className="sac-topbar">
        <span className="sac-logo"><span>SAP</span></span>
        <span className="sac-title">SAP Analytics Cloud <b>· Story Designer</b></span>
        <span className="sep"></span>
        <span style={{ fontSize: 12, opacity: .85 }}>Vorhaben Cockpit 2026</span>
        <span className="grow"></span>
        <button className={`topbar-toggle ${panelVisible ? 'is-active' : ''}`} onClick={() => setPanelVisible(v => !v)} title="Designer ein/aus">
          <Icon name="builder" size={12} />
          Designer
        </button>
        <span className="icon-btn" title="Daten aktualisieren"><Icon name="refresh" /></span>
        <span className="icon-btn" title="Speichern"><Icon name="save" /></span>
        <span className="icon-btn" title="Vorschau"><Icon name="eye" /></span>
        <span className="sep"></span>
        <span className="user-chip" title="Sara Admin">SA</span>
      </div>

      <div className="sac-railbar">
        <div className="rail-btn is-active" data-tip="Story bearbeiten"><Icon name="builder" size={16} /></div>
        <div className="rail-btn" data-tip="Daten"><Icon name="database" size={16} /></div>
        <div className="rail-btn" data-tip="Filter"><Icon name="filter" size={16} /></div>
        <div className="rail-btn" data-tip="Stil"><Icon name="paint" size={16} /></div>
        <div style={{ flex: 1 }} />
        <div className="rail-btn" data-tip="Einstellungen"><Icon name="settings" size={16} /></div>
      </div>

      <div className="sac-main">
        <div className="sac-canvas" onClick={() => setSelected(false)}>
          <div onClick={(e) => { e.stopPropagation(); setSelected(true); }}>
            <KanbanWidget
              styling={styling}
              design={design}
              projects={projects}
              setProjects={setProjects}
              filters={filters}
              setFilters={setFilters}
              selected={selected}
              onSelect={() => setSelected(true)}
            />
          </div>

          <div className="statusbar" style={{ marginTop: 14, borderRadius: 3, border: '1px solid var(--sap-border)' }}>
            <span><b>{visibleCount}</b> von <b>{projects.length}</b> Vorhaben sichtbar</span>
            <span>·</span>
            <span>Modell: <b>{design.model}</b></span>
            <span>·</span>
            <span>{design.refresh === 'live' ? 'Live-Verbindung' : 'Manueller Refresh'}</span>
            <span className="grow"></span>
            <span>{design.editMode ? <span style={{ color: '#0a6ed1' }}>● Bearbeitungsmodus aktiv</span> : 'Anzeigemodus'}</span>
          </div>
        </div>

        {panelVisible && (
          <div className="panel-host">
            <div className="panel-tabs">
              <button className={`panel-tab ${activeTab === 'builder' ? 'is-active' : ''}`} onClick={() => setActiveTab('builder')}>
                <Icon name="builder" size={12} /> &nbsp;Builder
              </button>
              <button className={`panel-tab ${activeTab === 'styling' ? 'is-active' : ''}`} onClick={() => setActiveTab('styling')}>
                <Icon name="paint" size={12} /> &nbsp;Styling
              </button>
              <span style={{ flex: 1 }}></span>
              <button className="panel-tab" style={{ padding: '10px 10px' }} onClick={() => setPanelVisible(false)} title="Panel schließen">
                <Icon name="close" size={11} />
              </button>
            </div>
            {activeTab === 'styling'
              ? <StylingPanel styling={styling} setStyling={setStyling} />
              : <BuilderPanel design={design} setDesign={setDesign} filters={filters} projects={projects} />
            }
          </div>
        )}
      </div>
    </div>
  );
}

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(<App />);
