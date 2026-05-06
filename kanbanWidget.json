(function () {
    const tmpl = document.createElement('template');
    tmpl.innerHTML = `
        <style>
            :host {
                display: block;
                width: 100%;
                height: 100%;
                font-family: var(--w-font, 'Source Sans 3', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif);
                font-size: 14px;
                color: #32363a;

                --sap-bg: #edf1f5;
                --sap-canvas: #f5f6fa;
                --sap-border: #d5dae0;
                --sap-border-strong: #b3b9c2;
                --sap-text: #32363a;
                --sap-text-muted: #6a6d70;
                --sap-text-subtle: #89919a;
                --sap-blue: #0a6ed1;
                --sap-blue-hover: #085caf;
                --sap-input-bg: #ffffff;
                --sap-input-hover: #ebf5fe;
                --sap-shadow-1: 0 0 0 1px rgba(0,0,0,0.04), 0 1px 2px rgba(0,0,0,0.06);
                --sap-shadow-2: 0 0 0 1px rgba(0,0,0,0.05), 0 6px 18px -4px rgba(31,42,55,0.18);
                --sap-shadow-card: 0 1px 0 rgba(0,0,0,0.04), 0 1px 2px rgba(0,0,0,0.08);

                --w-radius: 4px;
                --w-gap: 10px;
                --w-header-bg: #2c4762;
                --w-header-fg: #ffffff;
                --w-card-shadow: var(--sap-shadow-card);
            }
            * { box-sizing: border-box; }

            .widget {
                background: #ffffff;
                border-radius: var(--w-radius);
                box-shadow: var(--sap-shadow-1);
                border: 1px solid var(--sap-border);
                overflow: hidden;
                display: flex;
                flex-direction: column;
                width: 100%;
                height: 100%;
            }

            .widget-header {
                background: var(--w-header-bg);
                color: var(--w-header-fg);
                padding: 10px 16px;
                display: flex; align-items: center; gap: 10px;
                font-size: 14px; font-weight: 500;
                letter-spacing: .15px;
                flex-shrink: 0;
            }
            .widget-header .sap-mark {
                background: #0a6ed1; color: #fff; font-weight: 700; font-size: 11px;
                padding: 3px 7px; transform: skewX(-12deg); border-radius: 1px;
            }
            .widget-header .sap-mark > span { display: inline-block; transform: skewX(12deg); }
            .widget-header .title-sep { opacity: .6; }
            .widget-header .title-text { font-weight: 600; }
            .widget-header .pill {
                margin-left: auto; font-size: 11px; opacity: .85;
                border: 1px solid rgba(255,255,255,0.3);
                padding: 2px 8px; border-radius: 99px;
                display: inline-flex; align-items: center; gap: 6px;
            }
            .widget-header .pill .dot {
                width: 6px; height: 6px; border-radius: 50%; background: #69d491;
            }

            .filter-bar {
                display: flex; align-items: center; gap: 10px;
                padding: 10px 14px;
                background: #fff;
                border-bottom: 1px solid var(--sap-border);
                flex-wrap: wrap;
                flex-shrink: 0;
            }
            .filter-bar.is-hidden { display: none; }

            .sac-select {
                position: relative;
                min-width: 150px;
            }
            .sac-select > select {
                width: 100%;
                background: var(--sap-input-bg);
                border: 1px solid var(--sap-border-strong);
                border-bottom: 1px solid #6a6d70;
                border-radius: 3px;
                padding: 4px 26px 4px 9px;
                height: 28px;
                font-size: 13px;
                color: var(--sap-text);
                appearance: none;
                -webkit-appearance: none;
                cursor: pointer;
                font-family: inherit;
            }
            .sac-select > select:hover { background: var(--sap-input-hover); border-color: var(--sap-blue); }
            .sac-select > select:focus { outline: none; border-color: var(--sap-blue); box-shadow: 0 0 0 1px var(--sap-blue) inset; }
            .sac-select::after {
                content: '';
                position: absolute; right: 9px; top: 50%;
                width: 0; height: 0;
                border-left: 4px solid transparent;
                border-right: 4px solid transparent;
                border-top: 5px solid var(--sap-text-muted);
                transform: translateY(-50%);
                pointer-events: none;
            }
            .sac-select .label-text {
                position: absolute;
                left: 9px; top: -8px;
                font-size: 10px;
                color: var(--sap-text-muted);
                background: #fff;
                padding: 0 4px;
                pointer-events: none;
                font-weight: 500;
            }

            .kanban-wrap {
                flex: 1;
                min-height: 0;
                overflow: auto;
                background: #fff;
            }
            .kanban {
                padding: 12px 14px 16px;
                display: grid;
                gap: var(--w-gap);
                grid-template-columns: repeat(var(--w-cols, 6), minmax(0, 1fr));
                background: #fff;
                min-height: 100%;
            }
            .col {
                background: #f6f8fa;
                border-radius: var(--w-radius);
                overflow: hidden;
                display: flex; flex-direction: column;
                min-height: 360px;
                border: 1px solid var(--sap-border);
            }
            .col-head {
                color: #fff;
                font-weight: 600;
                font-size: 13px;
                text-align: center;
                padding: 9px 10px;
                letter-spacing: .3px;
                background: var(--col-color, #2f6db4);
            }
            .col-summary {
                background: var(--col-summary-bg, rgba(47,109,180,0.18));
                color: var(--col-summary-fg, #1a3a5e);
                padding: 7px 10px;
                font-size: 12px;
                display: flex; align-items: baseline; gap: 6px;
                border-bottom: 1px solid var(--sap-border);
            }
            .col-summary .count { font-size: 16px; font-weight: 700; line-height: 1; }
            .col-summary .label { font-weight: 500; opacity: .95; }
            .col-summary .amount { margin-left: auto; font-size: 11px; opacity: .9; letter-spacing: .2px; }
            .widget.hide-totals .col-summary .amount { display: none; }

            .col-body {
                padding: 8px;
                display: flex; flex-direction: column; gap: 6px;
                flex: 1; min-height: 0;
            }

            .card {
                background: #fff;
                border: 1px solid var(--sap-border);
                border-radius: var(--w-radius);
                padding: 7px 9px;
                display: flex; align-items: center; gap: 8px;
                font-size: 13px;
                box-shadow: var(--w-card-shadow);
                cursor: pointer;
                transition: transform .12s, box-shadow .12s, border-color .12s;
                user-select: none;
            }
            .card:hover { border-color: #aab2bb; box-shadow: 0 1px 0 rgba(0,0,0,.04), 0 2px 6px rgba(0,0,0,.1); }
            .card.is-selected { border-color: var(--sap-blue); box-shadow: 0 0 0 1px var(--sap-blue), 0 2px 6px rgba(10,110,209,.18); }
            .card .avatar {
                width: 18px; height: 18px; border-radius: 50%;
                background: var(--avatar-bg, #2f6db4);
                color: #fff;
                font-size: 10px; font-weight: 600;
                display: inline-flex; align-items: center; justify-content: center;
                flex-shrink: 0;
            }
            .widget.hide-avatars .card .avatar { display: none; }
            .card .name { flex: 1; min-width: 0; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; font-weight: 500; }
            .card .amt { color: var(--sap-text-muted); font-size: 11px; flex-shrink: 0; }

            .widget.density-compact .card { padding: 4px 8px; font-size: 12px; }
            .widget.density-compact .card .avatar { width: 16px; height: 16px; font-size: 9px; }
            .widget.density-compact .col-head { padding: 7px 10px; font-size: 12px; }
            .widget.density-compact .col-summary { padding: 5px 9px; }
            .widget.density-compact .col-summary .count { font-size: 14px; }

            .widget.no-shadow .card { box-shadow: none; }

            .empty {
                padding: 30px 14px; text-align: center;
                color: var(--sap-text-muted); font-size: 13px;
            }
        </style>

        <div class="widget" id="widget">
            <div class="widget-header">
                <div class="sap-mark"><span>SAP</span></div>
                <span>SAP Analytics Cloud</span>
                <span class="title-sep">—</span>
                <span class="title-text" id="title-text">Vorhaben Übersicht</span>
                <span class="pill"><span class="dot"></span>Live</span>
            </div>
            <div class="filter-bar" id="filter-bar"></div>
            <div class="kanban-wrap">
                <div class="kanban" id="kanban"></div>
            </div>
        </div>
    `;

    const DEFAULT_PHASE_COLORS = ['#2f6db4', '#2aa39a', '#f0b323', '#e58a3a', '#5b9b46', '#8c95a0'];
    const AVATAR_PALETTE = ['#2f6db4', '#2aa39a', '#e58a3a', '#5b9b46', '#8c4fb8', '#c95a6e'];

    const FILTER_DEFS = [
        { key: 'ha',   label: 'HA' },
        { key: 'bu',   label: 'BU' },
        { key: 'subp', label: 'Phasen' },
        { key: 'year', label: 'Jahr' }
    ];

    function safeParse(value, fallback) {
        if (value === null || value === undefined) return fallback;
        if (typeof value === 'object') return value;
        try { return JSON.parse(value); } catch (e) { return fallback; }
    }

    function hexToRgba(hex, alpha) {
        if (!hex || typeof hex !== 'string') return `rgba(47,109,180,${alpha})`;
        const m = hex.replace('#', '').match(/^([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i);
        if (!m) return `rgba(47,109,180,${alpha})`;
        return `rgba(${parseInt(m[1], 16)},${parseInt(m[2], 16)},${parseInt(m[3], 16)},${alpha})`;
    }

    function darken(hex, factor) {
        const m = (hex || '').replace('#', '').match(/^([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i);
        if (!m) return '#1a3a5e';
        const r = Math.max(0, Math.round(parseInt(m[1], 16) * factor));
        const g = Math.max(0, Math.round(parseInt(m[2], 16) * factor));
        const b = Math.max(0, Math.round(parseInt(m[3], 16) * factor));
        return `#${[r, g, b].map(v => v.toString(16).padStart(2, '0')).join('')}`;
    }

    function initialsFromName(name) {
        if (!name) return '?';
        const parts = String(name).trim().split(/\s+/).filter(Boolean);
        if (parts.length === 0) return '?';
        if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
        return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
    }

    function avatarColor(key) {
        if (!key) return AVATAR_PALETTE[0];
        let h = 0;
        for (let i = 0; i < key.length; i++) h = (h * 31 + key.charCodeAt(i)) >>> 0;
        return AVATAR_PALETTE[h % AVATAR_PALETTE.length];
    }

    function formatAmount(n) {
        if (n === '' || n === null || n === undefined || isNaN(n)) return '';
        const num = Number(n);
        const abs = Math.abs(num);
        if (abs >= 1000000) return `CHF ${(num / 1000000).toFixed(1)}M`;
        if (abs >= 1000)    return `CHF ${(num / 1000).toFixed(1)}K`;
        return `CHF ${num.toFixed(1)}`;
    }

    class PlanifyITKanban extends HTMLElement {
        constructor() {
            super();
            this._shadowRoot = this.attachShadow({ mode: 'open' });
            this._shadowRoot.appendChild(tmpl.content.cloneNode(true));

            this._widgetEl    = this._shadowRoot.getElementById('widget');
            this._titleEl     = this._shadowRoot.getElementById('title-text');
            this._filterBar   = this._shadowRoot.getElementById('filter-bar');
            this._kanbanEl    = this._shadowRoot.getElementById('kanban');

            this._rows = [];
            this._dimMeta = {};
            this._measMeta = {};
            this._phaseValues = [];

            this._props = {
                fieldMappings: {},
                showFilters: true,
                filterConfig: { ha: true, bu: true, subp: true, year: true },
                widgetTitle: 'Vorhaben Übersicht',
                headerBg: '#2c4762',
                headerFg: '#ffffff',
                fontFamily: "Source Sans 3, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
                phasePalette: {},
                density: 'comfortable',
                cornerRadius: 4,
                columnGap: 10,
                cardShadow: true,
                showTotals: true,
                showAvatars: true,
                selectedCardId: ''
            };

            this._activeFilters = { ha: 'Alle', bu: 'Alle', subp: 'Alle', year: 'Alle' };
            this._initialized = false;
        }

        connectedCallback() {
            if (!this._initialized) {
                this._initialized = true;
                this._applyAllStyles();
                this._renderAll();
                if (this.kanbanDataBinding) {
                    this._updateDataBinding(this.kanbanDataBinding);
                }
            }
        }

        onCustomWidgetBeforeUpdate(changedProperties) {}

        onCustomWidgetAfterUpdate(changedProperties) {
            let dataChanged = false;
            let stylesChanged = false;
            let layoutChanged = false;

            if ('kanbanDataBinding' in changedProperties) {
                const db = changedProperties.kanbanDataBinding;
                if (db && db.state === 'success') {
                    this._updateDataBinding(db);
                    dataChanged = true;
                }
            }

            if ('fieldMappings' in changedProperties) {
                this._props.fieldMappings = safeParse(changedProperties.fieldMappings, {});
                dataChanged = true;
            }
            if ('filterConfig' in changedProperties) {
                this._props.filterConfig = safeParse(changedProperties.filterConfig, this._props.filterConfig);
                layoutChanged = true;
            }
            if ('phasePalette' in changedProperties) {
                this._props.phasePalette = safeParse(changedProperties.phasePalette, {});
                stylesChanged = true;
            }

            const scalarKeys = [
                'showFilters', 'widgetTitle', 'headerBg', 'headerFg', 'fontFamily',
                'density', 'cornerRadius', 'columnGap', 'cardShadow', 'showTotals',
                'showAvatars', 'selectedCardId'
            ];
            for (const k of scalarKeys) {
                if (k in changedProperties) {
                    this._props[k] = changedProperties[k];
                    if (k === 'selectedCardId') layoutChanged = true;
                    else stylesChanged = true;
                }
            }

            if (stylesChanged) this._applyAllStyles();
            if (dataChanged || layoutChanged || stylesChanged) this._renderAll();
        }

        _applyAllStyles() {
            const p = this._props;
            this.style.setProperty('--w-header-bg', p.headerBg);
            this.style.setProperty('--w-header-fg', p.headerFg);
            this.style.setProperty('--w-radius', `${p.cornerRadius}px`);
            this.style.setProperty('--w-gap', `${p.columnGap}px`);
            this.style.setProperty('--w-font', p.fontFamily);

            this._widgetEl.classList.toggle('density-compact', p.density === 'compact');
            this._widgetEl.classList.toggle('hide-totals', !p.showTotals);
            this._widgetEl.classList.toggle('hide-avatars', !p.showAvatars);
            this._widgetEl.classList.toggle('no-shadow', !p.cardShadow);
        }

        _updateDataBinding(dataBinding) {
            if (!dataBinding || dataBinding.state !== 'success' || !Array.isArray(dataBinding.data)) {
                this._rows = [];
                this._dimMeta = {};
                this._measMeta = {};
                return;
            }

            const dimMeta = {};
            const dims = dataBinding.metadata && dataBinding.metadata.dimensions;
            if (dims && typeof dims === 'object' && !Array.isArray(dims)) {
                Object.keys(dims).forEach(k => {
                    const m = dims[k];
                    dimMeta[k] = { key: k, label: (m && (m.description || m.label || m.id)) || k };
                });
            }

            const measMeta = {};
            const measures = dataBinding.metadata && dataBinding.metadata.mainStructureMembers;
            if (measures && typeof measures === 'object' && !Array.isArray(measures)) {
                Object.keys(measures).forEach(k => {
                    const m = measures[k];
                    measMeta[k] = { key: k, label: (m && (m.label || m.id)) || k };
                });
            }

            const rows = dataBinding.data.map(raw => {
                const row = {};
                Object.keys(dimMeta).forEach(k => {
                    const cell = raw[k];
                    if (!cell) row[k] = '';
                    else if (cell.label !== undefined) row[k] = cell.label;
                    else if (cell.formattedValue !== undefined) row[k] = cell.formattedValue;
                    else if (cell.formatted !== undefined) row[k] = cell.formatted;
                    else if (cell.raw !== undefined) row[k] = cell.raw;
                    else row[k] = '';
                });
                Object.keys(measMeta).forEach(k => {
                    const cell = raw[k];
                    if (!cell) row[k] = { value: 0, formatted: '' };
                    else {
                        const v = cell.raw !== undefined ? cell.raw : (cell.value !== undefined ? cell.value : 0);
                        const f = cell.formattedValue || cell.formatted || (v !== undefined ? String(v) : '');
                        row[k] = { value: Number(v) || 0, formatted: f };
                    }
                });
                return row;
            });

            this._dimMeta = dimMeta;
            this._measMeta = measMeta;
            this._rows = rows;
        }

        _getMappedDim(role) {
            const key = this._props.fieldMappings[role];
            if (key && this._dimMeta[key]) return key;
            return null;
        }

        _getMappedMeasure(role) {
            const key = this._props.fieldMappings[role];
            if (key && this._measMeta[key]) return key;
            return null;
        }

        _uniqueValues(dimKey) {
            const seen = new Set();
            const order = [];
            for (const r of this._rows) {
                const v = r[dimKey];
                if (v === undefined || v === null || v === '') continue;
                const s = String(v);
                if (!seen.has(s)) { seen.add(s); order.push(s); }
            }
            return order;
        }

        _filteredRows() {
            const fm = this._props.fieldMappings;
            const af = this._activeFilters;
            return this._rows.filter(r => {
                for (const def of FILTER_DEFS) {
                    const sel = af[def.key];
                    if (!sel || sel === 'Alle') continue;
                    const dimKey = fm[def.key];
                    if (!dimKey || !this._dimMeta[dimKey]) continue;
                    if (String(r[dimKey]) !== sel) return false;
                }
                return true;
            });
        }

        _renderAll() {
            this._titleEl.textContent = this._props.widgetTitle || '';
            this._renderFilterBar();
            this._renderKanban();
        }

        _renderFilterBar() {
            this._filterBar.innerHTML = '';
            if (!this._props.showFilters) {
                this._filterBar.classList.add('is-hidden');
                return;
            }

            const cfg = this._props.filterConfig || {};
            const fm = this._props.fieldMappings || {};
            let any = false;

            for (const def of FILTER_DEFS) {
                if (!cfg[def.key]) continue;
                const dimKey = fm[def.key];
                if (!dimKey || !this._dimMeta[dimKey]) continue;

                any = true;
                const wrap = document.createElement('div');
                wrap.className = 'sac-select';

                const labelText = document.createElement('span');
                labelText.className = 'label-text';
                labelText.textContent = def.label;
                wrap.appendChild(labelText);

                const select = document.createElement('select');
                const optAll = document.createElement('option');
                optAll.value = 'Alle';
                optAll.textContent = 'Alle';
                select.appendChild(optAll);

                for (const v of this._uniqueValues(dimKey)) {
                    const opt = document.createElement('option');
                    opt.value = v;
                    opt.textContent = v;
                    select.appendChild(opt);
                }

                select.value = this._activeFilters[def.key] || 'Alle';
                select.addEventListener('change', (e) => {
                    this._activeFilters[def.key] = e.target.value;
                    this._renderKanban();
                });
                wrap.appendChild(select);
                this._filterBar.appendChild(wrap);
            }

            this._filterBar.classList.toggle('is-hidden', !any);
        }

        _renderKanban() {
            this._kanbanEl.innerHTML = '';

            const fm = this._props.fieldMappings || {};
            const phaseKey = this._getMappedDim('phase');
            const titleKey = this._getMappedDim('title');
            const ownerKey = this._getMappedDim('owner');
            const amountKey = this._getMappedMeasure('amount');

            if (!phaseKey || !titleKey) {
                const empty = document.createElement('div');
                empty.className = 'empty';
                if (!this._rows.length) {
                    empty.textContent = 'Keine Daten verfügbar. Bitte ein BW-Modell binden.';
                } else {
                    empty.textContent = 'Bitte im Builder die Felder "Phase" und "Card Title" zuweisen.';
                }
                this._kanbanEl.appendChild(empty);
                this._kanbanEl.style.setProperty('--w-cols', 1);
                return;
            }

            const rows = this._filteredRows();
            const phaseValues = this._uniqueValues(phaseKey);
            this._phaseValues = phaseValues;

            const byPhase = new Map();
            phaseValues.forEach(p => byPhase.set(p, []));
            for (const r of rows) {
                const v = String(r[phaseKey]);
                if (!byPhase.has(v)) { byPhase.set(v, []); phaseValues.push(v); }
                byPhase.get(v).push(r);
            }

            this._kanbanEl.style.setProperty('--w-cols', phaseValues.length || 1);

            phaseValues.forEach((phaseValue, idx) => {
                const colCards = byPhase.get(phaseValue) || [];
                const phaseColor = (this._props.phasePalette && this._props.phasePalette[phaseValue])
                    || DEFAULT_PHASE_COLORS[idx % DEFAULT_PHASE_COLORS.length];

                const col = document.createElement('div');
                col.className = 'col';
                col.style.setProperty('--col-color', phaseColor);
                col.style.setProperty('--col-summary-bg', hexToRgba(phaseColor, 0.18));
                col.style.setProperty('--col-summary-fg', darken(phaseColor, 0.55));

                const head = document.createElement('div');
                head.className = 'col-head';
                head.textContent = phaseValue;
                col.appendChild(head);

                const summary = document.createElement('div');
                summary.className = 'col-summary';
                const count = document.createElement('span');
                count.className = 'count';
                count.textContent = colCards.length;
                const lbl = document.createElement('span');
                lbl.className = 'label';
                lbl.textContent = 'Vorhaben';
                summary.appendChild(count);
                summary.appendChild(lbl);

                if (amountKey) {
                    const total = colCards.reduce((s, r) => s + ((r[amountKey] && r[amountKey].value) || 0), 0);
                    const amt = document.createElement('span');
                    amt.className = 'amount';
                    amt.textContent = formatAmount(total);
                    summary.appendChild(amt);
                }
                col.appendChild(summary);

                const body = document.createElement('div');
                body.className = 'col-body';

                colCards.forEach((r, cardIdx) => {
                    const card = document.createElement('div');
                    card.className = 'card';
                    const cardId = `${phaseValue}::${r[titleKey] || ''}::${cardIdx}`;
                    card.dataset.cardId = cardId;
                    if (this._props.selectedCardId === cardId) card.classList.add('is-selected');

                    const av = document.createElement('div');
                    av.className = 'avatar';
                    if (ownerKey) {
                        const ownerVal = r[ownerKey] || '';
                        av.style.setProperty('--avatar-bg', avatarColor(String(ownerVal)));
                        av.textContent = initialsFromName(ownerVal);
                        av.title = String(ownerVal);
                    } else {
                        av.style.setProperty('--avatar-bg', avatarColor(String(r[titleKey] || '')));
                        av.textContent = initialsFromName(r[titleKey]);
                    }
                    card.appendChild(av);

                    const name = document.createElement('div');
                    name.className = 'name';
                    name.textContent = r[titleKey] || '';
                    name.title = r[titleKey] || '';
                    card.appendChild(name);

                    if (amountKey && r[amountKey]) {
                        const amt = document.createElement('div');
                        amt.className = 'amt';
                        amt.textContent = r[amountKey].formatted || formatAmount(r[amountKey].value);
                        card.appendChild(amt);
                    }

                    card.addEventListener('click', () => {
                        this._props.selectedCardId = cardId;
                        this._shadowRoot.querySelectorAll('.card.is-selected').forEach(el => el.classList.remove('is-selected'));
                        card.classList.add('is-selected');
                        this.dispatchEvent(new CustomEvent('propertiesChanged', {
                            detail: { properties: { selectedCardId: cardId } }
                        }));
                        this.dispatchEvent(new Event('onCardSelected'));
                    });

                    body.appendChild(card);
                });

                col.appendChild(body);
                this._kanbanEl.appendChild(col);
            });
        }

        get selectedCardId() { return this._props.selectedCardId || ''; }
        set selectedCardId(v) { this._props.selectedCardId = v || ''; }

        get fieldMappings() { return JSON.stringify(this._props.fieldMappings || {}); }
        set fieldMappings(v) { this._props.fieldMappings = safeParse(v, {}); }
    }

    customElements.define('planifyit-kanban-widget', PlanifyITKanban);
})();
