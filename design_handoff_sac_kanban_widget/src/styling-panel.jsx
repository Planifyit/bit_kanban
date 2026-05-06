// Styling Panel — visual appearance of the widget
function StylingPanel({ styling, setStyling }) {
  const set = (k, v) => setStyling(s => ({ ...s, [k]: v }));

  return (
    <div className="panel-body">
      <div className="panel-section">
        <div className="section-head"><Icon name="info" size={12} /> Allgemein</div>
        <div className="section-body">
          <div className="field">
            <label>Widget Titel</label>
            <input className="sac-input" value={styling.title} onChange={e => set('title', e.target.value)} />
          </div>
          <div className="field">
            <label>Schriftfamilie</label>
            <select className="sac-input" value={styling.fontFamily} onChange={e => set('fontFamily', e.target.value)}>
              <option value="'Source Sans 3', sans-serif">Source Sans (72-like)</option>
              <option value="'Segoe UI', sans-serif">Segoe UI</option>
              <option value="system-ui, sans-serif">System</option>
              <option value="'JetBrains Mono', monospace">JetBrains Mono</option>
            </select>
          </div>
        </div>
      </div>

      <div className="panel-section">
        <div className="section-head"><Icon name="paint" size={12} /> Header</div>
        <div className="section-body">
          <div className="field">
            <label>Voreinstellung</label>
            <div className="palette-row">
              {Object.entries(HEADER_PRESETS).map(([k, p]) => {
                const isSel = styling.headerBg === p.bg && styling.headerFg === p.fg;
                return (
                  <div key={k} className={`palette-card ${isSel ? 'is-selected' : ''}`} onClick={() => { set('headerBg', p.bg); set('headerFg', p.fg); }}>
                    <div className="palette-strip"><div style={{ background: p.bg }} /></div>
                    <div className="pname">{p.name}</div>
                  </div>
                );
              })}
            </div>
          </div>
          <div className="row">
            <label>Hintergrund</label>
            <div className="phase-row">
              <div className="color-swatch" style={{ background: styling.headerBg }}>
                <input type="color" value={styling.headerBg} onChange={e => set('headerBg', e.target.value)} />
              </div>
            </div>
          </div>
          <div className="row">
            <label>Textfarbe</label>
            <div className="phase-row">
              <div className="color-swatch" style={{ background: styling.headerFg }}>
                <input type="color" value={styling.headerFg} onChange={e => set('headerFg', e.target.value)} />
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="panel-section">
        <div className="section-head"><Icon name="layers" size={12} /> Phasen Farbpalette</div>
        <div className="section-body">
          <div className="field">
            <div className="palette-row">
              {Object.entries(PHASE_PALETTES).map(([k, pal]) => {
                const isSel = JSON.stringify(styling.palette) === JSON.stringify({ ...pal, name: undefined, ...stripName(pal) });
                const matches = Object.keys(pal).filter(x => x !== 'name').every(ph => styling.palette[ph] === pal[ph]);
                return (
                  <div key={k} className={`palette-card ${matches ? 'is-selected' : ''}`} onClick={() => set('palette', stripName(pal))}>
                    <div className="palette-strip">
                      <div style={{ background: pal.funnel }} />
                      <div style={{ background: pal.vorbereitung }} />
                      <div style={{ background: pal.initialisierung }} />
                      <div style={{ background: pal.umsetzung }} />
                      <div style={{ background: pal.abschluss }} />
                      <div style={{ background: pal.done }} />
                    </div>
                    <div className="pname">{pal.name}</div>
                  </div>
                );
              })}
            </div>
          </div>
          <div className="field">
            <label>Einzelne Phase anpassen</label>
            {PHASES.map(ph => (
              <div className="phase-row" key={ph.id} style={{ marginTop: 4 }}>
                <span className="phase-name">{ph.label}</span>
                <div className="color-swatch" style={{ background: styling.palette[ph.id] }}>
                  <input type="color" value={styling.palette[ph.id]} onChange={e => set('palette', { ...styling.palette, [ph.id]: e.target.value })} />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="panel-section">
        <div className="section-head"><Icon name="settings" size={12} /> Layout</div>
        <div className="section-body">
          <div className="field">
            <label>Dichte</label>
            <div className="segmented">
              <button className={styling.density === 'compact' ? 'is-active' : ''} onClick={() => set('density', 'compact')}>Kompakt</button>
              <button className={styling.density === 'comfortable' ? 'is-active' : ''} onClick={() => set('density', 'comfortable')}>Komfortabel</button>
            </div>
          </div>
          <div className="field">
            <label>Eckenradius</label>
            <div className="slider-row">
              <input type="range" min="0" max="14" step="1" value={styling.radius} onChange={e => set('radius', +e.target.value)} />
              <span className="v">{styling.radius}px</span>
            </div>
          </div>
          <div className="field">
            <label>Spaltenabstand</label>
            <div className="slider-row">
              <input type="range" min="4" max="24" step="1" value={styling.gap} onChange={e => set('gap', +e.target.value)} />
              <span className="v">{styling.gap}px</span>
            </div>
          </div>
          <div className="row">
            <label>Karten-Schatten</label>
            <div className={`sac-switch ${styling.cardShadow ? 'on' : ''}`} onClick={() => set('cardShadow', !styling.cardShadow)} />
          </div>
        </div>
      </div>

      <div className="panel-section">
        <div className="section-head"><Icon name="eye" size={12} /> Anzeige</div>
        <div className="section-body">
          <div className="row">
            <label>CHF Summen anzeigen</label>
            <div className={`sac-switch ${styling.showTotals ? 'on' : ''}`} onClick={() => set('showTotals', !styling.showTotals)} />
          </div>
          <div className="row">
            <label>Verantwortlichen-Avatare</label>
            <div className={`sac-switch ${styling.showAvatars ? 'on' : ''}`} onClick={() => set('showAvatars', !styling.showAvatars)} />
          </div>
        </div>
      </div>
    </div>
  );
}

function stripName(p) {
  const { name, ...rest } = p; return rest;
}

window.StylingPanel = StylingPanel;
