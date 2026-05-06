// Builder / Design Panel — data binding + behavior toggles
function BuilderPanel({ design, setDesign, filters, projects }) {
  const set = (k, v) => setDesign(d => ({ ...d, [k]: v }));

  const total = projects.length;
  const totalAmount = projects.reduce((a, p) => a + p.amount, 0);

  return (
    <div className="panel-body">
      <div className="panel-section">
        <div className="section-head"><Icon name="database" size={12} /> Datenquelle</div>
        <div className="section-body">
          <div className="field">
            <label>Modell</label>
            <select className="sac-input" value={design.model} onChange={e => set('model', e.target.value)}>
              <option>SAC_Vorhaben_Plan_2026</option>
              <option>SAC_Vorhaben_Plan_2025</option>
              <option>SAC_Investitionen_Master</option>
            </select>
          </div>
          <div className="field">
            <label>Aktualisierung</label>
            <div className="segmented">
              <button className={design.refresh === 'manual' ? 'is-active' : ''} onClick={() => set('refresh', 'manual')}>Manuell</button>
              <button className={design.refresh === 'live' ? 'is-active' : ''} onClick={() => set('refresh', 'live')}>Live</button>
            </div>
          </div>
          <div style={{ fontSize: 11, color: 'var(--sap-text-subtle)', display: 'flex', gap: 12 }}>
            <span><b style={{ color: 'var(--sap-text)' }}>{total}</b> Datensätze</span>
            <span>CHF <b style={{ color: 'var(--sap-text)' }}>{totalAmount.toFixed(1)} M</b></span>
          </div>
        </div>
      </div>

      <div className="panel-section">
        <div className="section-head"><Icon name="layers" size={12} /> Dimensionen</div>
        <div className="section-body" style={{ gap: 6 }}>
          {[
            { icon: 'layers', nm: 'Phase',           val: 'PHASE_KEY' },
            { icon: 'user',   nm: 'Verantwortlich',  val: 'OWNER_ID' },
            { icon: 'database', nm: 'Hauptabteilung', val: 'HA' },
            { icon: 'database', nm: 'Business Unit', val: 'BU' },
            { icon: 'database', nm: 'Sub-Phase',     val: 'SUB_PHASE' },
            { icon: 'database', nm: 'Jahr',          val: 'YEAR' },
          ].map(d => (
            <div className="dim-card" key={d.nm}>
              <Icon name={d.icon} size={13} className="icon" />
              <span className="nm">{d.nm}</span>
              <span className="val">{d.val}</span>
            </div>
          ))}
          <div className="field" style={{ marginTop: 6 }}>
            <label>Kennzahl</label>
            <select className="sac-input" value={design.measure} onChange={e => set('measure', e.target.value)}>
              <option>CHF Investition</option>
              <option>CHF Forecast</option>
              <option>EUR Investition</option>
              <option>Anzahl FTE</option>
            </select>
          </div>
        </div>
      </div>

      <div className="panel-section">
        <div className="section-head"><Icon name="filter" size={12} /> Filter</div>
        <div className="section-body">
          <div className="row">
            <label>Filter-Leiste anzeigen</label>
            <div className={`sac-switch ${design.showFilters ? 'on' : ''}`} onClick={() => set('showFilters', !design.showFilters)} />
          </div>
          <div style={{ fontSize: 11, color: 'var(--sap-text-subtle)' }}>
            Aktiv: HA <b>{filters.HA}</b> · BU <b>{filters.BU}</b> · Phasen <b>{filters.Phasen}</b> · Jahr <b>{filters.Jahr}</b>
          </div>
        </div>
      </div>

      <div className="panel-section">
        <div className="section-head"><Icon name="builder" size={12} /> Interaktion</div>
        <div className="section-body">
          <div className="row">
            <label>
              Bearbeitungsmodus aktivieren
              <div className="hint" style={{ fontSize: 11, color: 'var(--sap-text-subtle)', marginTop: 2 }}>
                Drag &amp; Drop, Umbenennen, Hinzufügen, Löschen
              </div>
            </label>
            <div className={`sac-switch ${design.editMode ? 'on' : ''}`} onClick={() => set('editMode', !design.editMode)} />
          </div>
          <div className="row">
            <label>Doppelklick zum Umbenennen</label>
            <div className={`sac-switch ${design.dblClickRename ? 'on' : ''}`} onClick={() => set('dblClickRename', !design.dblClickRename)} />
          </div>
          <div className="row">
            <label>Schreibzugriff in Modell</label>
            <div className={`sac-switch ${design.writeBack ? 'on' : ''}`} onClick={() => set('writeBack', !design.writeBack)} />
          </div>
          {design.writeBack && (
            <div style={{ background: '#fffbe6', border: '1px solid #f0e2a4', borderRadius: 3, padding: '6px 9px', fontSize: 11, color: '#7a5b00' }}>
              <Icon name="info" size={11} /> &nbsp;Änderungen werden in das SAC Modell zurück­geschrieben.
            </div>
          )}
        </div>
      </div>

      <div className="panel-section">
        <div className="section-head"><Icon name="play" size={12} /> Skript-Aktionen</div>
        <div className="section-body" style={{ gap: 6 }}>
          {[
            { fn: 'onSelect(member)',  desc: 'wenn ein Vorhaben angeklickt wird' },
            { fn: 'onPhaseChange()',   desc: 'nach Drag & Drop in eine andere Phase' },
            { fn: 'onFilterChange()',  desc: 'wenn HA/BU/Phasen/Jahr verändert wird' },
            { fn: 'refreshData()',     desc: 'manueller Daten-Refresh' },
          ].map(a => (
            <div className="dim-card" key={a.fn} style={{ alignItems: 'flex-start', flexDirection: 'column', gap: 2 }}>
              <div style={{ display: 'flex', gap: 8, alignItems: 'center', width: '100%' }}>
                <Icon name="play" size={11} className="icon" />
                <span className="nm" style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 11.5 }}>{a.fn}</span>
              </div>
              <span className="val" style={{ fontSize: 11, marginLeft: 21 }}>{a.desc}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

window.BuilderPanel = BuilderPanel;
