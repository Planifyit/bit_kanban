(function () {
    const template = document.createElement('template');
    template.innerHTML = `
        <style>
            :host {
                display: block;
                font-family: 'Source Sans 3', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
                font-size: 13px;
                color: #32363a;
                --sap-border: #d5dae0;
                --sap-border-strong: #b3b9c2;
                --sap-text: #32363a;
                --sap-text-muted: #6a6d70;
                --sap-text-subtle: #89919a;
                --sap-blue: #0a6ed1;
                --sap-input-hover: #ebf5fe;
                --sap-panel-bg-2: #f7f8fa;
                --radius-sm: 3px;
            }
            * { box-sizing: border-box; }
            .panel-section { border-bottom: 1px solid var(--sap-border); }
            .section-head {
                padding: 9px 14px;
                font-size: 11px; letter-spacing: .8px; text-transform: uppercase;
                color: var(--sap-text-muted); font-weight: 600;
                background: var(--sap-panel-bg-2);
            }
            .section-body { padding: 12px 14px; display: flex; flex-direction: column; gap: 10px; }
            .field { display: flex; flex-direction: column; gap: 4px; }
            .field > label { font-size: 12px; color: var(--sap-text-muted); font-weight: 500; }
            .row { display: flex; align-items: center; gap: 10px; }
            .row > label { flex: 1; font-size: 13px; color: var(--sap-text); }

            .sac-input, select.sac-input {
                border: 1px solid var(--sap-border-strong);
                border-bottom-color: var(--sap-text-muted);
                border-radius: var(--radius-sm);
                background: #fff;
                height: 28px; padding: 4px 8px;
                font-size: 13px; color: var(--sap-text);
                outline: none;
                width: 100%;
                font-family: inherit;
            }
            .sac-input:focus, .sac-input:hover { border-color: var(--sap-blue); }
            select.sac-input { padding-right: 22px; appearance: none; -webkit-appearance: none; }
            .select-wrap { position: relative; flex: 1; }
            .select-wrap::after {
                content: ''; position: absolute; right: 9px; top: 50%;
                width: 0; height: 0;
                border-left: 4px solid transparent; border-right: 4px solid transparent;
                border-top: 5px solid var(--sap-text-muted);
                transform: translateY(-50%); pointer-events: none;
            }

            .color-row { display: flex; align-items: center; gap: 6px; }
            .color-row input[type="text"] { flex: 1; }
            .color-row input[type="color"] { width: 32px; height: 28px; padding: 0; border: 1px solid var(--sap-border-strong); border-radius: var(--radius-sm); cursor: pointer; background: #fff; }

            .sac-switch {
                position: relative; width: 38px; height: 20px;
                background: #c2c5ca; border-radius: 99px; cursor: pointer; transition: background .15s;
                flex-shrink: 0;
            }
            .sac-switch::after {
                content: ''; position: absolute; top: 2px; left: 2px;
                width: 16px; height: 16px; background: #fff; border-radius: 50%;
                transition: transform .15s; box-shadow: 0 1px 2px rgba(0,0,0,0.25);
            }
            .sac-switch.on { background: var(--sap-blue); }
            .sac-switch.on::after { transform: translateX(18px); }

            .stat-row {
                display: flex; gap: 14px;
                padding: 8px 10px;
                background: var(--sap-panel-bg-2);
                border: 1px solid var(--sap-border);
                border-radius: var(--radius-sm);
            }
            .stat-row .stat { flex: 1; }
            .stat .v { font-size: 16px; font-weight: 700; color: var(--sap-text); line-height: 1.1; }
            .stat .k { font-size: 11px; color: var(--sap-text-muted); }

            .role-row { display: grid; grid-template-columns: 110px 1fr; align-items: center; gap: 8px; }
            .role-row > label { font-size: 12px; color: var(--sap-text); }
            .role-row .req { color: #c95a6e; margin-left: 2px; }

            .palette-row { display: grid; grid-template-columns: 1fr 1fr; gap: 8px; }
            .palette-card {
                border: 1px solid var(--sap-border);
                border-radius: var(--radius-sm);
                padding: 7px; cursor: pointer; background: #fff;
            }
            .palette-card:hover { border-color: var(--sap-blue); }
            .palette-card.is-selected { border-color: var(--sap-blue); box-shadow: 0 0 0 1px var(--sap-blue); }
            .palette-strip { display: flex; gap: 2px; height: 14px; border-radius: 2px; overflow: hidden; }
            .palette-strip > div { flex: 1; }
            .palette-card .pname { font-size: 11px; color: var(--sap-text-muted); margin-top: 5px; text-align: center; }

            .header-presets { display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 6px; }
            .header-preset { border: 1px solid var(--sap-border); border-radius: var(--radius-sm); cursor: pointer; overflow: hidden; }
            .header-preset:hover { border-color: var(--sap-blue); }
            .header-preset.is-selected { border-color: var(--sap-blue); box-shadow: 0 0 0 1px var(--sap-blue); }
            .header-preset .swatch { height: 26px; }
            .header-preset .pname { font-size: 11px; color: var(--sap-text-muted); padding: 4px 6px; text-align: center; }

            .segmented {
                display: inline-flex; border: 1px solid var(--sap-border-strong); border-radius: var(--radius-sm);
                overflow: hidden; background: #fff;
            }
            .segmented button {
                background: transparent; border: none; padding: 6px 10px; font-size: 12px; cursor: pointer;
                color: var(--sap-text-muted); font-weight: 500;
                border-right: 1px solid var(--sap-border);
                font-family: inherit;
            }
            .segmented button:last-child { border-right: none; }
            .segmented button.is-active { background: var(--sap-blue); color: #fff; }
            .segmented button:hover:not(.is-active) { background: var(--sap-input-hover); color: var(--sap-blue); }

            .slider-row { display: flex; align-items: center; gap: 10px; }
            .slider-row input[type=range] { flex: 1; accent-color: var(--sap-blue); }
            .slider-row .v { width: 38px; font-size: 12px; color: var(--sap-text-muted); text-align: right; }

            .phase-row { display: flex; align-items: center; gap: 8px; }
            .phase-row .phase-name { flex: 1; font-size: 12px; color: var(--sap-text); }
            .phase-row .color-swatch {
                width: 22px; height: 22px; border-radius: 4px; border: 1px solid var(--sap-border-strong);
                cursor: pointer; position: relative; overflow: hidden;
            }
            .phase-row .color-swatch input { position: absolute; inset: 0; opacity: 0; cursor: pointer; }

            .empty-hint {
                font-size: 12px; color: #7a5b00;
                background: #fffbe6; border: 1px solid #f0e2a4;
                padding: 8px 10px; border-radius: var(--radius-sm);
            }
            .info-hint {
                font-size: 11px; color: var(--sap-text-muted); line-height: 1.4;
            }

            .text-grid { display: grid; grid-template-columns: 130px 1fr; gap: 6px 8px; align-items: center; }
            .text-grid label { font-size: 12px; color: var(--sap-text-muted); }

            .exclude-entry {
                display: flex; align-items: center; gap: 6px; margin-bottom: 6px;
            }
            .exclude-entry .role-select { width: 110px; }
            .exclude-entry .value-input { flex: 1; }
            .exclude-entry .remove-btn {
                background: #ffebee; border: 1px solid #f4c1c5; border-radius: var(--radius-sm);
                padding: 2px 8px; cursor: pointer; font-size: 13px;
            }
            .add-btn {
                background: #f0f0f0; border: 1px solid var(--sap-border-strong);
                border-radius: var(--radius-sm); padding: 4px 10px; cursor: pointer;
                font-size: 12px; font-family: inherit; align-self: flex-start;
            }
            .add-btn:hover { border-color: var(--sap-blue); color: var(--sap-blue); }
        </style>

        <div class="panel-section">
            <div class="section-head">Datenquelle</div>
            <div class="section-body">
                <div id="ds-empty" class="empty-hint" style="display:none;">
                    Keine Datenbindung. Bitte zuerst im Builder-Panel oben das BW-Modell auswählen und Dimensionen/Kennzahlen zuweisen.
                </div>
                <div class="stat-row" id="ds-stats">
                    <div class="stat"><div class="v" id="ds-rows">0</div><div class="k">Datensätze</div></div>
                    <div class="stat"><div class="v" id="ds-dims">0</div><div class="k">Dimensionen</div></div>
                    <div class="stat"><div class="v" id="ds-meas">0</div><div class="k">Kennzahlen</div></div>
                </div>
                <div class="info-hint">
                    Modell und Feeds werden im Standard-Builder von SAC zugewiesen. Hier ordnest du jedem zugewiesenen Feld eine Rolle im Kanban zu.
                </div>
            </div>
        </div>

        <div class="panel-section">
            <div class="section-head">Felder · Rollen</div>
            <div class="section-body" id="dim-section"></div>
        </div>

        <div class="panel-section">
            <div class="section-head">Werte ausschließen</div>
            <div class="section-body">
                <div class="info-hint">
                    Schließe bestimmte Werte einer Dimension aus (z.B. "Summe" aus der Phase- oder Card-Title-Spalte). Diese Zeilen werden weder als Karten noch in den Filter-Dropdowns angezeigt.
                </div>
                <div id="exclude-list"></div>
                <button type="button" class="add-btn" id="add-exclude">+ Ausschluss hinzufügen</button>
            </div>
        </div>

        <div class="panel-section">
            <div class="section-head">Sichtbarkeit</div>
            <div class="section-body" id="visibility-section"></div>
        </div>

        <div class="panel-section">
            <div class="section-head">Texte</div>
            <div class="section-body">
                <div class="info-hint">
                    Alle Texte sind variabel und können per SAC-Skript via setText("key", "value") überschrieben werden — z.B. für mehrsprachige Dashboards.
                </div>
                <div class="text-grid" id="text-grid"></div>
            </div>
        </div>

        <div class="panel-section">
            <div class="section-head">Filter</div>
            <div class="section-body">
                <div class="row">
                    <label>Filter-Leiste anzeigen</label>
                    <div class="sac-switch" id="sw-show-filters"></div>
                </div>
                <div id="filter-toggles"></div>
            </div>
        </div>

        <div class="panel-section">
            <div class="section-head">Allgemein</div>
            <div class="section-body">
                <div class="field">
                    <label>Schriftfamilie</label>
                    <div class="select-wrap">
                        <select id="in-font" class="sac-input">
                            <option value="Source Sans 3, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif">Source Sans 3</option>
                            <option value="Segoe UI, sans-serif">Segoe UI</option>
                            <option value="-apple-system, BlinkMacSystemFont, system-ui, sans-serif">System</option>
                            <option value="'JetBrains Mono', monospace">JetBrains Mono</option>
                        </select>
                    </div>
                </div>
            </div>
        </div>

        <div class="panel-section">
            <div class="section-head">Header</div>
            <div class="section-body">
                <div class="field">
                    <label>Vorgabe</label>
                    <div class="header-presets" id="header-presets"></div>
                </div>
                <div class="field">
                    <label>Hintergrund</label>
                    <div class="color-row">
                        <input id="in-header-bg" type="text" class="sac-input">
                        <input id="in-header-bg-pick" type="color">
                    </div>
                </div>
                <div class="field">
                    <label>Textfarbe</label>
                    <div class="color-row">
                        <input id="in-header-fg" type="text" class="sac-input">
                        <input id="in-header-fg-pick" type="color">
                    </div>
                </div>
            </div>
        </div>

        <div class="panel-section">
            <div class="section-head">Phasen Farbpalette</div>
            <div class="section-body">
                <div class="field">
                    <label>Vorgabe-Palette</label>
                    <div class="palette-row" id="palette-presets"></div>
                </div>
                <div class="field">
                    <label>Pro Phase</label>
                    <div id="phase-rows">
                        <div class="empty-hint" id="phase-empty">Keine Phasen erkannt. Bitte oben eine Phase-Dimension zuweisen.</div>
                    </div>
                </div>
            </div>
        </div>

        <div class="panel-section">
            <div class="section-head">Layout</div>
            <div class="section-body">
                <div class="field">
                    <label>Dichte</label>
                    <div class="segmented" id="seg-density">
                        <button type="button" data-v="compact">Kompakt</button>
                        <button type="button" data-v="comfortable">Komfortabel</button>
                    </div>
                </div>
                <div class="field">
                    <label>Eckenradius</label>
                    <div class="slider-row">
                        <input id="in-radius" type="range" min="0" max="14" step="1">
                        <div class="v" id="in-radius-v">4</div>
                    </div>
                </div>
                <div class="field">
                    <label>Spaltenabstand</label>
                    <div class="slider-row">
                        <input id="in-gap" type="range" min="4" max="24" step="1">
                        <div class="v" id="in-gap-v">10</div>
                    </div>
                </div>
                <div class="row">
                    <label>Karten-Schatten</label>
                    <div class="sac-switch" id="sw-shadow"></div>
                </div>
            </div>
        </div>
    `;

    const HEADER_PRESETS = [
        { id: 'belize',   name: 'Belize',   bg: '#2c4762', fg: '#ffffff' },
        { id: 'midnight', name: 'Midnight', bg: '#1f2d3d', fg: '#ffffff' },
        { id: 'ocean',    name: 'Ocean',    bg: '#0a6ed1', fg: '#ffffff' },
        { id: 'graphite', name: 'Graphite', bg: '#3a3f44', fg: '#ffffff' },
        { id: 'paper',    name: 'Paper',    bg: '#f4f5f7', fg: '#32363a' }
    ];

    const PHASE_PALETTES = [
        { id: 'classic', name: 'Classic', colors: ['#2f6db4', '#2aa39a', '#f0b323', '#e58a3a', '#5b9b46', '#8c95a0'] },
        { id: 'horizon', name: 'Horizon', colors: ['#5d6e87', '#2b7c8f', '#a36d00', '#a35a1a', '#3d7a3d', '#7a8189'] },
        { id: 'vibrant', name: 'Vibrant', colors: ['#1f6feb', '#06b6a4', '#facc15', '#f97316', '#22c55e', '#94a3b8'] },
        { id: 'mono',    name: 'Mono',    colors: ['#1f3b56', '#324b66', '#475e76', '#5b6f86', '#708296', '#8595a6'] }
    ];

    const ROLES = [
        { key: 'phase',  label: 'Phase (Spalte)',    kind: 'dim',  required: true },
        { key: 'title',  label: 'Card Titel',        kind: 'dim',  required: true },
        { key: 'owner',  label: 'Verantwortlich',    kind: 'dim',  required: false },
        { key: 'ha',     label: 'Hauptabteilung',    kind: 'dim',  required: false },
        { key: 'bu',     label: 'Business Unit',     kind: 'dim',  required: false },
        { key: 'subp',   label: 'Sub-Phase',         kind: 'dim',  required: false },
        { key: 'year',   label: 'Jahr',              kind: 'dim',  required: false },
        { key: 'amount', label: 'Betrag (Kennzahl)', kind: 'meas', required: false }
    ];

    const FILTER_DEFS = [
        { key: 'ha',   label: 'HA' },
        { key: 'bu',   label: 'BU' },
        { key: 'subp', label: 'Phasen' },
        { key: 'year', label: 'Jahr' }
    ];

    const TEXT_FIELDS = [
        { key: 'widgetTitle',     label: 'Widget-Titel' },
        { key: 'textSapLabel',    label: 'SAP-Logo Text' },
        { key: 'textSubtitle',    label: 'Untertitel' },
        { key: 'textSeparator',   label: 'Trennzeichen' },
        { key: 'textLivePill',    label: 'Live-Pill Text' },
        { key: 'textColumnUnit',  label: 'Spalten-Einheit' },
        { key: 'textFilterAll',   label: 'Filter "Alle"' },
        { key: 'textNoData',      label: 'Text: keine Daten' },
        { key: 'textNoMapping',   label: 'Text: kein Mapping' },
        { key: 'filterLabelHa',   label: 'Filter-Label HA' },
        { key: 'filterLabelBu',   label: 'Filter-Label BU' },
        { key: 'filterLabelSubp', label: 'Filter-Label Sub-Phase' },
        { key: 'filterLabelYear', label: 'Filter-Label Jahr' }
    ];

    const VISIBILITY_FIELDS = [
        { key: 'showHeader',         label: 'Kopfzeile' },
        { key: 'showSapMark',        label: 'SAP-Logo' },
        { key: 'showSubtitle',       label: 'Untertitel (SAP Analytics Cloud)' },
        { key: 'showSeparator',      label: 'Trennzeichen' },
        { key: 'showTitle',          label: 'Widget-Titel' },
        { key: 'showLivePill',       label: 'Live-Pill' },
        { key: 'showColumnHeader',   label: 'Spaltenkopf (Phasenname)' },
        { key: 'showColumnSummary',  label: 'Spalten-Zusammenfassung' },
        { key: 'showColumnUnit',     label: 'Einheits-Label (Vorhaben)' },
        { key: 'showCardAmount',     label: 'Karten-Betrag' },
        { key: 'showTotals',         label: 'CHF Summen' },
        { key: 'showAvatars',        label: 'Verantwortlichen-Avatare' }
    ];

    function safeParse(v, fb) {
        if (v === null || v === undefined) return fb;
        if (typeof v === 'object') return v;
        try { return JSON.parse(v); } catch (e) { return fb; }
    }

    class KanbanStylingPanel extends HTMLElement {
        constructor() {
            super();
            this._shadowRoot = this.attachShadow({ mode: 'open' });
            this._shadowRoot.appendChild(template.content.cloneNode(true));

            this._dsEmpty = this._shadowRoot.getElementById('ds-empty');
            this._dsStats = this._shadowRoot.getElementById('ds-stats');
            this._dsRows  = this._shadowRoot.getElementById('ds-rows');
            this._dsDims  = this._shadowRoot.getElementById('ds-dims');
            this._dsMeas  = this._shadowRoot.getElementById('ds-meas');
            this._dimSection = this._shadowRoot.getElementById('dim-section');
            this._filterToggles = this._shadowRoot.getElementById('filter-toggles');
            this._swShowFilters = this._shadowRoot.getElementById('sw-show-filters');
            this._textGrid = this._shadowRoot.getElementById('text-grid');
            this._visibilitySection = this._shadowRoot.getElementById('visibility-section');
            this._excludeList = this._shadowRoot.getElementById('exclude-list');
            this._addExcludeBtn = this._shadowRoot.getElementById('add-exclude');

            this._inFont       = this._shadowRoot.getElementById('in-font');
            this._headerPresetsEl = this._shadowRoot.getElementById('header-presets');
            this._inHeaderBg   = this._shadowRoot.getElementById('in-header-bg');
            this._inHeaderBgP  = this._shadowRoot.getElementById('in-header-bg-pick');
            this._inHeaderFg   = this._shadowRoot.getElementById('in-header-fg');
            this._inHeaderFgP  = this._shadowRoot.getElementById('in-header-fg-pick');
            this._palettePresetsEl = this._shadowRoot.getElementById('palette-presets');
            this._phaseRowsEl  = this._shadowRoot.getElementById('phase-rows');
            this._phaseEmpty   = this._shadowRoot.getElementById('phase-empty');
            this._segDensity   = this._shadowRoot.getElementById('seg-density');
            this._inRadius     = this._shadowRoot.getElementById('in-radius');
            this._inRadiusV    = this._shadowRoot.getElementById('in-radius-v');
            this._inGap        = this._shadowRoot.getElementById('in-gap');
            this._inGapV       = this._shadowRoot.getElementById('in-gap-v');
            this._swShadow     = this._shadowRoot.getElementById('sw-shadow');

            this._props = {
                widgetTitle: 'Vorhaben Übersicht',
                fontFamily: "Source Sans 3, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
                headerBg: '#2c4762',
                headerFg: '#ffffff',
                phasePalette: {},
                density: 'comfortable',
                cornerRadius: 4,
                columnGap: 10,
                cardShadow: true,
                showTotals: true,
                showAvatars: true,
                textSapLabel: 'SAP',
                textSubtitle: 'SAP Analytics Cloud',
                textSeparator: '—',
                textLivePill: 'Live',
                textColumnUnit: 'Vorhaben',
                textFilterAll: 'Alle',
                textNoData: 'Keine Daten verfügbar. Bitte ein BW-Modell binden.',
                textNoMapping: 'Bitte im Builder die Felder "Phase" und "Card Title" zuweisen.',
                filterLabelHa: 'HA',
                filterLabelBu: 'BU',
                filterLabelSubp: 'Phasen',
                filterLabelYear: 'Jahr',
                showHeader: true,
                showSapMark: true,
                showSubtitle: true,
                showSeparator: true,
                showTitle: true,
                showLivePill: true,
                showColumnHeader: true,
                showColumnSummary: true,
                showColumnUnit: true,
                showCardAmount: true
            };
            this._dataBinding = null;
            this._dimMeta = {};
            this._measMeta = {};
            this._fieldMappings = {};
            this._showFilters = true;
            this._filterConfig = { ha: true, bu: true, subp: true, year: true };
            this._phaseValues = [];
            this._valueExclusions = {};

            this._wireBuilderInputs();
            this._wireStylingInputs();
            this._renderTextFields();
            this._renderVisibilityToggles();
            this._renderDimensions();
            this._renderFilterToggles();
            this._renderHeaderPresets();
            this._renderPalettePresets();
            this._renderPhaseRows();
            this._renderExclusions();
            this._refreshUI();

            this._addExcludeBtn.addEventListener('click', () => {
                this._addExclusionRow('', '');
            });
        }

        set kanbanDataBinding(db) {
            this._dataBinding = db || null;
            this._extractMeta();
            this._renderDataSourceStats();
            this._renderDimensions();
            this._renderFilterToggles();
            this._recomputePhaseValues();
            this._renderPhaseRows();
        }
        get kanbanDataBinding() { return this._dataBinding; }

        _extractMeta() {
            const dimMeta = {};
            const measMeta = {};
            const db = this._dataBinding;
            if (db && db.metadata) {
                const dims = db.metadata.dimensions;
                if (dims && typeof dims === 'object' && !Array.isArray(dims)) {
                    Object.keys(dims).forEach(k => {
                        const m = dims[k];
                        dimMeta[k] = { key: k, label: (m && (m.description || m.label || m.id)) || k };
                    });
                }
                const meas = db.metadata.mainStructureMembers;
                if (meas && typeof meas === 'object' && !Array.isArray(meas)) {
                    Object.keys(meas).forEach(k => {
                        const m = meas[k];
                        measMeta[k] = { key: k, label: (m && (m.label || m.id)) || k };
                    });
                }
            }
            this._dimMeta = dimMeta;
            this._measMeta = measMeta;
        }

        _renderDataSourceStats() {
            const hasMeta = Object.keys(this._dimMeta).length + Object.keys(this._measMeta).length > 0;
            const rowCount = (this._dataBinding && Array.isArray(this._dataBinding.data)) ? this._dataBinding.data.length : 0;
            this._dsEmpty.style.display = hasMeta ? 'none' : '';
            this._dsStats.style.display = hasMeta ? '' : 'none';
            this._dsRows.textContent = rowCount;
            this._dsDims.textContent = Object.keys(this._dimMeta).length;
            this._dsMeas.textContent = Object.keys(this._measMeta).length;
        }

        _wireBuilderInputs() {
            this._swShowFilters.addEventListener('click', () => {
                this._showFilters = !this._showFilters;
                this._swShowFilters.classList.toggle('on', this._showFilters);
                this._dispatch(['showFilters']);
            });
        }

        _renderTextFields() {
            this._textGrid.innerHTML = '';
            TEXT_FIELDS.forEach(f => {
                const lbl = document.createElement('label');
                lbl.textContent = f.label;
                const inp = document.createElement('input');
                inp.type = 'text';
                inp.className = 'sac-input';
                inp.dataset.key = f.key;
                inp.value = this._props[f.key] || '';
                inp.addEventListener('input', () => {
                    this._props[f.key] = inp.value;
                    this._dispatch([f.key]);
                });
                this._textGrid.appendChild(lbl);
                this._textGrid.appendChild(inp);
            });
        }

        _renderVisibilityToggles() {
            this._visibilitySection.innerHTML = '';
            VISIBILITY_FIELDS.forEach(f => {
                const row = document.createElement('div');
                row.className = 'row';
                const lbl = document.createElement('label');
                lbl.textContent = f.label;
                const sw = document.createElement('div');
                sw.className = 'sac-switch';
                if (this._props[f.key]) sw.classList.add('on');
                sw.dataset.key = f.key;
                sw.addEventListener('click', () => {
                    this._props[f.key] = !this._props[f.key];
                    sw.classList.toggle('on', !!this._props[f.key]);
                    this._dispatch([f.key]);
                });
                row.appendChild(lbl);
                row.appendChild(sw);
                this._visibilitySection.appendChild(row);
            });
        }

        _renderExclusions() {
            this._excludeList.innerHTML = '';
            const ex = this._valueExclusions || {};
            let any = false;
            Object.keys(ex).forEach(role => {
                (ex[role] || []).forEach(val => {
                    this._addExclusionRow(role, val, true);
                    any = true;
                });
            });
            if (!any) this._addExclusionRow('', '', true);
        }

        _addExclusionRow(role, value, skipDispatch) {
            const entry = document.createElement('div');
            entry.className = 'exclude-entry';

            const wrap = document.createElement('div');
            wrap.className = 'select-wrap role-select';
            const sel = document.createElement('select');
            sel.className = 'sac-input';
            const optEmpty = document.createElement('option');
            optEmpty.value = '';
            optEmpty.textContent = '— Rolle —';
            sel.appendChild(optEmpty);
            ROLES.filter(r => r.kind === 'dim').forEach(r => {
                const o = document.createElement('option');
                o.value = r.key;
                o.textContent = r.label;
                if (r.key === role) o.selected = true;
                sel.appendChild(o);
            });
            wrap.appendChild(sel);

            const inp = document.createElement('input');
            inp.type = 'text';
            inp.className = 'sac-input value-input';
            inp.placeholder = 'Wert ausschließen (z.B. Summe)';
            inp.value = value || '';

            const rm = document.createElement('button');
            rm.type = 'button';
            rm.className = 'remove-btn';
            rm.textContent = '✕';
            rm.addEventListener('click', () => {
                entry.remove();
                this._collectExclusionsAndDispatch();
            });

            sel.addEventListener('change', () => this._collectExclusionsAndDispatch());
            inp.addEventListener('change', () => this._collectExclusionsAndDispatch());

            entry.appendChild(wrap);
            entry.appendChild(inp);
            entry.appendChild(rm);
            this._excludeList.appendChild(entry);
        }

        _collectExclusionsAndDispatch() {
            const out = {};
            this._excludeList.querySelectorAll('.exclude-entry').forEach(entry => {
                const role = entry.querySelector('select').value;
                const val = entry.querySelector('.value-input').value;
                if (!role || !val) return;
                if (!out[role]) out[role] = [];
                if (out[role].indexOf(val) === -1) out[role].push(val);
            });
            this._valueExclusions = out;
            this._dispatch(['valueExclusions']);
        }

        _renderDimensions() {
            this._dimSection.innerHTML = '';

            ROLES.forEach(role => {
                const rowEl = document.createElement('div');
                rowEl.className = 'role-row';

                const lbl = document.createElement('label');
                lbl.textContent = role.label;
                if (role.required) {
                    const req = document.createElement('span');
                    req.className = 'req';
                    req.textContent = '*';
                    lbl.appendChild(req);
                }
                rowEl.appendChild(lbl);

                const wrap = document.createElement('div');
                wrap.className = 'select-wrap';
                const sel = document.createElement('select');
                sel.className = 'sac-input';
                sel.dataset.role = role.key;

                const optNone = document.createElement('option');
                optNone.value = '';
                optNone.textContent = role.required ? '— bitte wählen —' : '— keine —';
                sel.appendChild(optNone);

                const meta = role.kind === 'dim' ? this._dimMeta : this._measMeta;
                Object.values(meta).forEach(m => {
                    const opt = document.createElement('option');
                    opt.value = m.key;
                    opt.textContent = `${m.label}  (${m.key})`;
                    sel.appendChild(opt);
                });

                const current = this._fieldMappings[role.key] || '';
                if (current && meta[current]) sel.value = current;

                sel.addEventListener('change', (e) => {
                    const v = e.target.value;
                    if (v) this._fieldMappings[role.key] = v;
                    else delete this._fieldMappings[role.key];
                    if (role.key === 'phase') {
                        this._recomputePhaseValues();
                        this._renderPhaseRows();
                    }
                    this._dispatch(['fieldMappings']);
                });

                wrap.appendChild(sel);
                rowEl.appendChild(wrap);
                this._dimSection.appendChild(rowEl);
            });
        }

        _renderFilterToggles() {
            this._filterToggles.innerHTML = '';
            FILTER_DEFS.forEach(def => {
                const row = document.createElement('div');
                row.className = 'row';
                const lbl = document.createElement('label');
                lbl.textContent = `Filter "${def.label}" anzeigen`;
                const sw = document.createElement('div');
                sw.className = 'sac-switch';
                if (this._filterConfig[def.key]) sw.classList.add('on');
                sw.addEventListener('click', () => {
                    this._filterConfig[def.key] = !this._filterConfig[def.key];
                    sw.classList.toggle('on', this._filterConfig[def.key]);
                    this._dispatch(['filterConfig']);
                });
                row.appendChild(lbl);
                row.appendChild(sw);
                this._filterToggles.appendChild(row);
            });
        }

        _wireStylingInputs() {
            this._inFont.addEventListener('change', () => { this._props.fontFamily = this._inFont.value; this._dispatch(['fontFamily']); });

            const syncColor = (txt, pick, key) => {
                pick.addEventListener('input', () => { txt.value = pick.value; this._props[key] = pick.value; this._dispatch([key]); });
                txt.addEventListener('change', () => {
                    if (/^#[0-9a-f]{6}$/i.test(txt.value)) { pick.value = txt.value; this._props[key] = txt.value; this._dispatch([key]); }
                });
            };
            syncColor(this._inHeaderBg, this._inHeaderBgP, 'headerBg');
            syncColor(this._inHeaderFg, this._inHeaderFgP, 'headerFg');

            this._segDensity.querySelectorAll('button').forEach(btn => {
                btn.addEventListener('click', () => {
                    this._props.density = btn.dataset.v;
                    this._refreshDensity();
                    this._dispatch(['density']);
                });
            });

            this._inRadius.addEventListener('input', () => {
                this._props.cornerRadius = Number(this._inRadius.value);
                this._inRadiusV.textContent = this._props.cornerRadius;
                this._dispatch(['cornerRadius']);
            });
            this._inGap.addEventListener('input', () => {
                this._props.columnGap = Number(this._inGap.value);
                this._inGapV.textContent = this._props.columnGap;
                this._dispatch(['columnGap']);
            });

            this._swShadow.addEventListener('click', () => {
                this._props.cardShadow = !this._props.cardShadow;
                this._swShadow.classList.toggle('on', !!this._props.cardShadow);
                this._dispatch(['cardShadow']);
            });
        }

        _renderHeaderPresets() {
            this._headerPresetsEl.innerHTML = '';
            HEADER_PRESETS.forEach(p => {
                const card = document.createElement('div');
                card.className = 'header-preset';
                card.dataset.id = p.id;
                const sw = document.createElement('div');
                sw.className = 'swatch';
                sw.style.background = p.bg;
                const nm = document.createElement('div');
                nm.className = 'pname';
                nm.textContent = p.name;
                card.appendChild(sw);
                card.appendChild(nm);
                card.addEventListener('click', () => {
                    this._props.headerBg = p.bg;
                    this._props.headerFg = p.fg;
                    this._refreshHeaderInputs();
                    this._refreshHeaderPresetSelection();
                    this._dispatch(['headerBg', 'headerFg']);
                });
                this._headerPresetsEl.appendChild(card);
            });
        }

        _refreshHeaderPresetSelection() {
            this._headerPresetsEl.querySelectorAll('.header-preset').forEach(card => {
                const p = HEADER_PRESETS.find(x => x.id === card.dataset.id);
                card.classList.toggle('is-selected',
                    p && p.bg.toLowerCase() === (this._props.headerBg || '').toLowerCase() &&
                    p.fg.toLowerCase() === (this._props.headerFg || '').toLowerCase());
            });
        }

        _renderPalettePresets() {
            this._palettePresetsEl.innerHTML = '';
            PHASE_PALETTES.forEach(p => {
                const card = document.createElement('div');
                card.className = 'palette-card';
                card.dataset.id = p.id;
                const strip = document.createElement('div');
                strip.className = 'palette-strip';
                p.colors.forEach(c => {
                    const seg = document.createElement('div');
                    seg.style.background = c;
                    strip.appendChild(seg);
                });
                const nm = document.createElement('div');
                nm.className = 'pname';
                nm.textContent = p.name;
                card.appendChild(strip);
                card.appendChild(nm);
                card.addEventListener('click', () => {
                    const map = {};
                    const targets = (this._phaseValues && this._phaseValues.length) ? this._phaseValues : [];
                    if (targets.length === 0) {
                        p.colors.forEach((c, i) => { map[`__phase_${i}`] = c; });
                    } else {
                        targets.forEach((pv, i) => { map[pv] = p.colors[i % p.colors.length]; });
                    }
                    this._props.phasePalette = map;
                    this._renderPhaseRows();
                    this._dispatch(['phasePalette']);
                });
                this._palettePresetsEl.appendChild(card);
            });
        }

        _recomputePhaseValues() {
            this._phaseValues = [];
            if (!this._dataBinding || !Array.isArray(this._dataBinding.data)) return;
            const phaseKey = this._fieldMappings.phase;
            if (!phaseKey) return;
            const seen = new Set();
            for (const r of this._dataBinding.data) {
                const cell = r[phaseKey];
                if (!cell) continue;
                const v = (cell.label !== undefined ? cell.label
                        : cell.formattedValue !== undefined ? cell.formattedValue
                        : cell.formatted !== undefined ? cell.formatted
                        : cell.raw !== undefined ? cell.raw : '');
                if (v === '' || v === undefined || v === null) continue;
                const s = String(v);
                if (!seen.has(s)) { seen.add(s); this._phaseValues.push(s); }
            }
        }

        _renderPhaseRows() {
            const rows = this._phaseRowsEl.querySelectorAll('.phase-row');
            rows.forEach(r => r.remove());

            if (!this._phaseValues || !this._phaseValues.length) {
                this._phaseEmpty.style.display = '';
                return;
            }
            this._phaseEmpty.style.display = 'none';

            const palette = this._props.phasePalette || {};
            this._phaseValues.forEach((pv, idx) => {
                const row = document.createElement('div');
                row.className = 'phase-row';
                const name = document.createElement('div');
                name.className = 'phase-name';
                name.textContent = pv;
                const swatch = document.createElement('div');
                swatch.className = 'color-swatch';
                const color = palette[pv] || PHASE_PALETTES[0].colors[idx % 6];
                swatch.style.background = color;
                const input = document.createElement('input');
                input.type = 'color';
                input.value = color;
                input.addEventListener('input', () => {
                    swatch.style.background = input.value;
                    this._props.phasePalette = Object.assign({}, this._props.phasePalette || {}, { [pv]: input.value });
                    this._dispatch(['phasePalette']);
                });
                swatch.appendChild(input);
                row.appendChild(name);
                row.appendChild(swatch);
                this._phaseRowsEl.appendChild(row);
            });
        }

        _refreshHeaderInputs() {
            this._inHeaderBg.value = this._props.headerBg || '';
            this._inHeaderBgP.value = /^#[0-9a-f]{6}$/i.test(this._props.headerBg || '') ? this._props.headerBg : '#2c4762';
            this._inHeaderFg.value = this._props.headerFg || '';
            this._inHeaderFgP.value = /^#[0-9a-f]{6}$/i.test(this._props.headerFg || '') ? this._props.headerFg : '#ffffff';
        }

        _refreshDensity() {
            this._segDensity.querySelectorAll('button').forEach(b => {
                b.classList.toggle('is-active', b.dataset.v === this._props.density);
            });
        }

        _refreshTextInputs() {
            this._textGrid.querySelectorAll('input[data-key]').forEach(inp => {
                const k = inp.dataset.key;
                inp.value = this._props[k] || '';
            });
        }

        _refreshVisibilityToggles() {
            this._visibilitySection.querySelectorAll('.sac-switch[data-key]').forEach(sw => {
                sw.classList.toggle('on', !!this._props[sw.dataset.key]);
            });
        }

        _refreshUI() {
            const fontOptions = Array.from(this._inFont.options).map(o => o.value);
            this._inFont.value = fontOptions.includes(this._props.fontFamily) ? this._props.fontFamily : fontOptions[0];
            this._refreshHeaderInputs();
            this._refreshHeaderPresetSelection();
            this._refreshDensity();
            this._inRadius.value = this._props.cornerRadius;
            this._inRadiusV.textContent = this._props.cornerRadius;
            this._inGap.value = this._props.columnGap;
            this._inGapV.textContent = this._props.columnGap;
            this._swShadow.classList.toggle('on', !!this._props.cardShadow);
            this._swShowFilters.classList.toggle('on', !!this._showFilters);
            this._refreshTextInputs();
            this._refreshVisibilityToggles();
        }

        _dispatch(keys) {
            const props = {};
            keys.forEach(k => {
                if (k === 'phasePalette')        props.phasePalette    = JSON.stringify(this._props.phasePalette || {});
                else if (k === 'fieldMappings')  props.fieldMappings   = JSON.stringify(this._fieldMappings || {});
                else if (k === 'filterConfig')   props.filterConfig    = JSON.stringify(this._filterConfig  || {});
                else if (k === 'showFilters')    props.showFilters     = !!this._showFilters;
                else if (k === 'valueExclusions') props.valueExclusions = JSON.stringify(this._valueExclusions || {});
                else props[k] = this._props[k];
            });
            this.dispatchEvent(new CustomEvent('propertiesChanged', {
                detail: { properties: props }
            }));
        }

        set widgetTitle(v) { this._props.widgetTitle = v || ''; this._refreshTextInputs(); }
        get widgetTitle() { return this._props.widgetTitle || ''; }

        set fontFamily(v) { this._props.fontFamily = v || ''; this._refreshUI(); }
        get fontFamily() { return this._props.fontFamily || ''; }

        set headerBg(v) { this._props.headerBg = v || ''; this._refreshHeaderInputs(); this._refreshHeaderPresetSelection(); }
        get headerBg() { return this._props.headerBg || ''; }

        set headerFg(v) { this._props.headerFg = v || ''; this._refreshHeaderInputs(); this._refreshHeaderPresetSelection(); }
        get headerFg() { return this._props.headerFg || ''; }

        set phasePalette(v) { this._props.phasePalette = safeParse(v, {}); this._renderPhaseRows(); }
        get phasePalette() { return JSON.stringify(this._props.phasePalette || {}); }

        set density(v) { this._props.density = v || 'comfortable'; this._refreshDensity(); }
        get density() { return this._props.density; }

        set cornerRadius(v) { this._props.cornerRadius = Number(v) || 0; this._inRadius.value = this._props.cornerRadius; this._inRadiusV.textContent = this._props.cornerRadius; }
        get cornerRadius() { return this._props.cornerRadius; }

        set columnGap(v) { this._props.columnGap = Number(v) || 0; this._inGap.value = this._props.columnGap; this._inGapV.textContent = this._props.columnGap; }
        get columnGap() { return this._props.columnGap; }

        set cardShadow(v) { this._props.cardShadow = !!v; this._swShadow.classList.toggle('on', !!v); }
        get cardShadow() { return !!this._props.cardShadow; }

        set showTotals(v) { this._props.showTotals = !!v; this._refreshVisibilityToggles(); }
        get showTotals() { return !!this._props.showTotals; }

        set showAvatars(v) { this._props.showAvatars = !!v; this._refreshVisibilityToggles(); }
        get showAvatars() { return !!this._props.showAvatars; }

        set fieldMappings(v) {
            this._fieldMappings = safeParse(v, {});
            this._renderDimensions();
            this._recomputePhaseValues();
            this._renderPhaseRows();
        }
        get fieldMappings() { return JSON.stringify(this._fieldMappings || {}); }

        set showFilters(v) { this._showFilters = !!v; this._swShowFilters.classList.toggle('on', !!v); }
        get showFilters() { return !!this._showFilters; }

        set filterConfig(v) { this._filterConfig = safeParse(v, this._filterConfig); this._renderFilterToggles(); }
        get filterConfig() { return JSON.stringify(this._filterConfig || {}); }

        set valueExclusions(v) { this._valueExclusions = safeParse(v, {}); this._renderExclusions(); }
        get valueExclusions() { return JSON.stringify(this._valueExclusions || {}); }
    }

    TEXT_FIELDS.forEach(f => {
        if (f.key === 'widgetTitle') return;
        Object.defineProperty(KanbanStylingPanel.prototype, f.key, {
            get() { return this._props[f.key] || ''; },
            set(v) { this._props[f.key] = v == null ? '' : String(v); this._refreshTextInputs(); },
            configurable: true
        });
    });
    VISIBILITY_FIELDS.forEach(f => {
        if (['showTotals', 'showAvatars'].indexOf(f.key) !== -1) return;
        Object.defineProperty(KanbanStylingPanel.prototype, f.key, {
            get() { return !!this._props[f.key]; },
            set(v) { this._props[f.key] = !!v; this._refreshVisibilityToggles(); },
            configurable: true
        });
    });

    customElements.define('com-planifyit-kanban-styling', KanbanStylingPanel);
})();
