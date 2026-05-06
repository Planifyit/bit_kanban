(function () {
    const template = document.createElement('template');
    
    template.innerHTML = `
        <style>
            :host {
                display: block;
                padding: 0;
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
            .field > .hint { font-size: 11px; color: var(--sap-text-subtle); }
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

            .empty-hint {
                font-size: 12px;
                background: #fffbe6; border: 1px solid #f0e2a4; color: #7a5b00;
                padding: 8px 10px; border-radius: var(--radius-sm);
            }
        </style>

        <div class="panel-section">
            <div class="section-head">Datenquelle</div>
            <div class="section-body">
                <div id="ds-empty" class="empty-hint" style="display:none;">
                    Keine Datenbindung. Bitte ein BW-Modell und Felder über die SAC-Modellzuweisung verknüpfen.
                </div>
                <div class="stat-row" id="ds-stats">
                    <div class="stat"><div class="v" id="ds-rows">0</div><div class="k">Datensätze</div></div>
                    <div class="stat"><div class="v" id="ds-dims">0</div><div class="k">Dimensionen</div></div>
                    <div class="stat"><div class="v" id="ds-meas">0</div><div class="k">Kennzahlen</div></div>
                </div>
            </div>
        </div>

        <div class="panel-section">
            <div class="section-head">Dimensionen</div>
            <div class="section-body" id="dim-section"></div>
        </div>

        <div class="panel-section">
            <div class="section-head">Filter</div>
            <div class="section-body">
                <div class="row">
                    <label>Filter-Leiste anzeigen</label>
                    <div class="sac-switch" id="sw-show-filters" data-prop="showFilters"></div>
                </div>
                <div id="filter-toggles"></div>
            </div>
        </div>
    `;

    const ROLES = [
        { key: 'phase',  label: 'Phase (Spalte)',   kind: 'dim',  required: true },
        { key: 'title',  label: 'Card Titel',       kind: 'dim',  required: true },
        { key: 'owner',  label: 'Verantwortlich',   kind: 'dim',  required: false },
        { key: 'ha',     label: 'Hauptabteilung',   kind: 'dim',  required: false },
        { key: 'bu',     label: 'Business Unit',    kind: 'dim',  required: false },
        { key: 'subp',   label: 'Sub-Phase',        kind: 'dim',  required: false },
        { key: 'year',   label: 'Jahr',             kind: 'dim',  required: false },
        { key: 'amount', label: 'Betrag (Kennzahl)', kind: 'meas', required: false }
    ];

    const FILTER_DEFS = [
        { key: 'ha',   label: 'HA' },
        { key: 'bu',   label: 'BU' },
        { key: 'subp', label: 'Phasen' },
        { key: 'year', label: 'Jahr' }
    ];

    function safeParse(v, fb) {
        if (v === null || v === undefined) return fb;
        if (typeof v === 'object') return v;
        try { return JSON.parse(v); } catch (e) { return fb; }
    }

    class KanbanBuilderPanel extends HTMLElement {
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

            this._dataBinding = null;
            this._dimMeta = {};
            this._measMeta = {};
            this._fieldMappings = {};
            this._showFilters = true;
            this._filterConfig = { ha: true, bu: true, subp: true, year: true };

            this._swShowFilters.addEventListener('click', () => {
                this._showFilters = !this._showFilters;
                this._swShowFilters.classList.toggle('on', this._showFilters);
                this._dispatch();
            });

            this._renderDimensions();
            this._renderFilterToggles();
            this._refreshSwitches();
        }

        set dataBinding(db) {
            this._dataBinding = db || null;
            this._extractMeta();
            this._renderDataSourceStats();
            this._renderDimensions();
            this._renderFilterToggles();
        }
        get dataBinding() { return this._dataBinding; }

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
                    this._dispatch();
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
                    this._dispatch();
                });
                row.appendChild(lbl);
                row.appendChild(sw);
                this._filterToggles.appendChild(row);
            });
        }

        _refreshSwitches() {
            this._swShowFilters.classList.toggle('on', !!this._showFilters);
        }

        _dispatch() {
            this.dispatchEvent(new CustomEvent('propertiesChanged', {
                detail: {
                    properties: {
                        fieldMappings: JSON.stringify(this._fieldMappings || {}),
                        showFilters: !!this._showFilters,
                        filterConfig: JSON.stringify(this._filterConfig || {})
                    }
                }
            }));
        }

        set fieldMappings(value) {
            this._fieldMappings = safeParse(value, {});
            this._renderDimensions();
        }
        get fieldMappings() { return JSON.stringify(this._fieldMappings || {}); }

        set showFilters(value) {
            this._showFilters = !!value;
            this._refreshSwitches();
        }
        get showFilters() { return !!this._showFilters; }

        set filterConfig(value) {
            this._filterConfig = safeParse(value, this._filterConfig);
            this._renderFilterToggles();
        }
        get filterConfig() { return JSON.stringify(this._filterConfig || {}); }
    }

    customElements.define('com-planifyit-kanban-builder', KanbanBuilderPanel);
})();
