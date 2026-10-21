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

            .accent-presets { display: grid; grid-template-columns: repeat(5, 1fr); gap: 6px; }
            .accent-preset { border: 1px solid var(--sap-border); border-radius: var(--radius-sm); cursor: pointer; overflow: hidden; background: #fff; }
            .accent-preset:hover { border-color: var(--sap-blue); }
            .accent-preset.is-selected { border-color: var(--sap-blue); box-shadow: 0 0 0 1px var(--sap-blue); }
            .accent-preset .swatch { height: 22px; }
            .accent-preset .pname { font-size: 10px; color: var(--sap-text-muted); padding: 3px 2px; text-align: center; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }

            .segmented {
                display: inline-flex; border: 1px solid var(--sap-border-strong); border-radius: var(--radius-sm);
                overflow: hidden; background: #fff; align-self: flex-start;
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
            .slider-row input[type=range]:disabled { opacity: .45; }
            .slider-row .v { width: 48px; font-size: 12px; color: var(--sap-text-muted); text-align: right; }

            .info-hint {
                font-size: 11px; color: var(--sap-text-muted); line-height: 1.4;
            }
            .text-grid { display: grid; grid-template-columns: 90px 1fr; gap: 6px 8px; align-items: center; }
            .text-grid label { font-size: 12px; color: var(--sap-text-muted); }
        </style>

        <div class="panel-section">
            <div class="section-head">PDF/UA-Korrektur</div>
            <div class="section-body">
                <div class="info-hint">
                    Macht PDF-Dateien barrierefrei (PDF/UA-1) und prüft sie. Das Widget braucht keine Datenbindung: Die Verarbeitung läuft vollständig im Browser der Nutzer, keine Datei verlässt den Computer.
                </div>
            </div>
        </div>

        <div class="panel-section">
            <div class="section-head">Standard-Einstellungen</div>
            <div class="section-body">
                <div class="info-hint">
                    Gelten für alle Nutzer dieser Story. Nutzer können sie im Widget unter "Einstellungen" anpassen, solange diese sichtbar sind; mit "Standardeinstellungen wiederherstellen" kehren sie zu diesen Werten zurück.
                </div>
                <div id="defaults-section" style="display:flex;flex-direction:column;gap:10px"></div>
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
                    Die Texte können per SAC-Skript via setText("key", "value") überschrieben werden — z.B. für mehrsprachige Dashboards.
                </div>
                <div class="text-grid" id="text-grid"></div>
            </div>
        </div>

        <div class="panel-section">
            <div class="section-head">Darstellung</div>
            <div class="section-body">
                <div class="field">
                    <label>Farbschema</label>
                    <div class="segmented" id="seg-scheme">
                        <button type="button" data-v="light">Hell</button>
                        <button type="button" data-v="dark">Dunkel</button>
                        <button type="button" data-v="auto">Wie System</button>
                    </div>
                </div>
                <div class="field">
                    <label>Akzentfarbe (helles Farbschema)</label>
                    <div class="accent-presets" id="accent-presets"></div>
                    <div class="color-row">
                        <input id="in-accent" type="text" class="sac-input">
                        <input id="in-accent-pick" type="color">
                    </div>
                </div>
                <div class="field">
                    <label>Schriftfamilie</label>
                    <div class="select-wrap">
                        <select id="in-font" class="sac-input"></select>
                    </div>
                </div>
                <div class="field">
                    <label>Maximale Inhaltsbreite</label>
                    <div class="slider-row">
                        <input id="in-width" type="range" min="640" max="1680" step="40">
                        <div class="v" id="in-width-v">1080</div>
                    </div>
                </div>
                <div class="row">
                    <label>Volle Widget-Breite nutzen</label>
                    <div class="sac-switch" id="sw-full-width"></div>
                </div>
            </div>
        </div>
    `;

    const LANGS = [['de-CH', 'Deutsch (Schweiz)'], ['fr-CH', 'Französisch (Schweiz)'], ['it-CH', 'Italienisch (Schweiz)'], ['rm-CH', 'Rätoromanisch'], ['en', 'Englisch'], ['de-DE', 'Deutsch (Deutschland)'], ['de-AT', 'Deutsch (Österreich)'], ['fr-FR', 'Französisch (Frankreich)'], ['it-IT', 'Italienisch (Italien)'], ['auto', 'Automatisch erkennen']];
    const TITLE_MODES = [['keep', 'Vorhandenen Titel behalten, sonst aus dem Inhalt'], ['content', 'Immer aus dem Inhalt (Hauptüberschrift)'], ['filename', 'Aus dem Dateinamen']];
    const EXISTING_MODES = [['auto', 'Automatisch: gute Tags behalten, fehlerhafte neu erstellen'], ['retag', 'Tags immer neu erstellen'], ['keep', 'Vorhandene Tags immer behalten (nur reparieren)']];
    const DEFAULT_FONT = 'system-ui, -apple-system, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif';
    const FONTS = [
        [DEFAULT_FONT, 'System (Standard)'],
        ["'72', '72full', Arial, Helvetica, sans-serif", 'SAP 72'],
        ['"Segoe UI", sans-serif', 'Segoe UI'],
        ['Arial, Helvetica, sans-serif', 'Arial']
    ];
    const ACCENT_PRESETS = [
        { name: 'Petrol', color: '#0b5f8a' },
        { name: 'SAP Blau', color: '#0a6ed1' },
        { name: 'Belize', color: '#2c4762' },
        { name: 'Grün', color: '#1d7a3e' },
        { name: 'Graphit', color: '#3a3f44' }
    ];

    // keep in sync with PROPS in pdfua-widget.src.js
    const PROPS = {
        appTitle: ['string', 'PDF/UA-Korrektur'],
        appTagline: ['string', 'Macht PDF-Dateien automatisch barrierefrei (PDF/UA-1). Alles läuft lokal in Ihrem Browser – keine Datei verlässt Ihren Computer.'],
        logoText: ['string', 'UA'],
        showHeader: ['boolean', true],
        showSettings: ['boolean', true],
        showLibrary: ['boolean', true],
        showFooter: ['boolean', true],
        colorScheme: ['string', 'light'],
        accentColor: ['string', '#0b5f8a'],
        fontFamily: ['string', DEFAULT_FONT],
        contentMaxWidth: ['integer', 1080],
        defaultLang: ['string', 'de-CH'],
        defaultTitleMode: ['string', 'keep'],
        defaultLogoAlt: ['string', 'Logo'],
        defaultImgAlt: ['string', 'Abbildung'],
        defaultChartAlt: ['string', 'Diagramm'],
        defaultSuffix: ['string', '_barrierefrei'],
        defaultExisting: ['string', 'auto'],
        defaultBookmarks: ['boolean', true],
        defaultRunning: ['boolean', true],
        defaultAutostart: ['boolean', false],
        rememberSettings: ['boolean', true]
    };

    const DEFAULT_FIELDS = [
        { key: 'defaultLang',      label: 'Dokumentsprache',               kind: 'select', options: LANGS },
        { key: 'defaultTitleMode', label: 'Dokumenttitel',                 kind: 'select', options: TITLE_MODES },
        { key: 'defaultLogoAlt',   label: 'Alternativtext für Logos',      kind: 'text' },
        { key: 'defaultImgAlt',    label: 'Alternativtext für Bilder',     kind: 'text' },
        { key: 'defaultChartAlt',  label: 'Alternativtext für Diagramme',  kind: 'text' },
        { key: 'defaultSuffix',    label: 'Zusatz im Dateinamen',          kind: 'text' },
        { key: 'defaultExisting',  label: 'Bereits getaggte PDFs',         kind: 'select', options: EXISTING_MODES },
        { key: 'defaultBookmarks', label: 'Lesezeichen aus Überschriften erstellen (wenn keine vorhanden)', kind: 'switch' },
        { key: 'defaultRunning',   label: 'Wiederkehrende Kopf-/Fusszeilen als Artefakt markieren',      kind: 'switch' },
        { key: 'defaultAutostart', label: 'Dateien sofort nach dem Hinzufügen verarbeiten',              kind: 'switch' },
        { key: 'rememberSettings', label: 'Änderungen der Nutzer in ihrem Browser merken',               kind: 'switch' }
    ];

    const VISIBILITY_FIELDS = [
        { key: 'showHeader',   label: 'Kopfzeile (Logo, Titel, Untertitel)' },
        { key: 'showSettings', label: 'Einstellungen (Schritt 1)' },
        { key: 'showLibrary',  label: 'Gespeicherte Alternativtexte' },
        { key: 'showFooter',   label: 'Fusszeile mit Erläuterungen' }
    ];

    const TEXT_FIELDS = [
        { key: 'appTitle',   label: 'Titel' },
        { key: 'appTagline', label: 'Untertitel' },
        { key: 'logoText',   label: 'Logo-Text' }
    ];

    function coerce(key, v) {
        const [type, def] = PROPS[key];
        if (type === 'boolean') return v === true || v === 'true' ? true : v === false || v === 'false' ? false : def;
        if (type === 'integer') { const n = parseInt(v, 10); return isNaN(n) ? def : n; }
        return v === null || v === undefined ? def : String(v);
    }

    class PdfUaStylingPanel extends HTMLElement {
        constructor() {
            super();
            this._shadowRoot = this.attachShadow({ mode: 'open' });
            this._shadowRoot.appendChild(template.content.cloneNode(true));

            this._defaultsSection   = this._shadowRoot.getElementById('defaults-section');
            this._visibilitySection = this._shadowRoot.getElementById('visibility-section');
            this._textGrid          = this._shadowRoot.getElementById('text-grid');
            this._segScheme         = this._shadowRoot.getElementById('seg-scheme');
            this._accentPresetsEl   = this._shadowRoot.getElementById('accent-presets');
            this._inAccent          = this._shadowRoot.getElementById('in-accent');
            this._inAccentP         = this._shadowRoot.getElementById('in-accent-pick');
            this._inFont            = this._shadowRoot.getElementById('in-font');
            this._inWidth           = this._shadowRoot.getElementById('in-width');
            this._inWidthV          = this._shadowRoot.getElementById('in-width-v');
            this._swFullWidth       = this._shadowRoot.getElementById('sw-full-width');

            this._props = {};
            Object.keys(PROPS).forEach(k => { this._props[k] = PROPS[k][1]; });
            this._lastWidth = 1080;

            this._renderDefaults();
            this._renderVisibilityToggles();
            this._renderTextFields();
            this._renderAccentPresets();
            this._wireStylingInputs();
            this._refreshUI();
        }

        onCustomWidgetBeforeUpdate(changedProperties) {}

        onCustomWidgetAfterUpdate(changedProperties) {
            Object.keys(changedProperties || {}).forEach(k => {
                if (k in PROPS) this[k] = changedProperties[k];
            });
        }

        _renderDefaults() {
            this._defaultsSection.innerHTML = '';
            DEFAULT_FIELDS.forEach(f => {
                if (f.kind === 'switch') {
                    this._defaultsSection.appendChild(this._switchRow(f));
                    return;
                }
                const field = document.createElement('div');
                field.className = 'field';
                const lbl = document.createElement('label');
                lbl.textContent = f.label;
                field.appendChild(lbl);
                if (f.kind === 'select') {
                    const wrap = document.createElement('div');
                    wrap.className = 'select-wrap';
                    const sel = document.createElement('select');
                    sel.className = 'sac-input';
                    sel.dataset.key = f.key;
                    f.options.forEach(([v, n]) => {
                        const o = document.createElement('option');
                        o.value = v;
                        o.textContent = n;
                        sel.appendChild(o);
                    });
                    sel.addEventListener('change', () => {
                        this._props[f.key] = sel.value;
                        this._dispatch([f.key]);
                    });
                    wrap.appendChild(sel);
                    field.appendChild(wrap);
                } else {
                    const inp = document.createElement('input');
                    inp.type = 'text';
                    inp.className = 'sac-input';
                    inp.dataset.key = f.key;
                    inp.addEventListener('input', () => {
                        this._props[f.key] = inp.value;
                        this._dispatch([f.key]);
                    });
                    field.appendChild(inp);
                }
                this._defaultsSection.appendChild(field);
            });
        }

        _switchRow(f) {
            const row = document.createElement('div');
            row.className = 'row';
            const lbl = document.createElement('label');
            lbl.textContent = f.label;
            const sw = document.createElement('div');
            sw.className = 'sac-switch';
            sw.dataset.key = f.key;
            sw.addEventListener('click', () => {
                this._props[f.key] = !this._props[f.key];
                sw.classList.toggle('on', !!this._props[f.key]);
                this._dispatch([f.key]);
            });
            row.appendChild(lbl);
            row.appendChild(sw);
            return row;
        }

        _renderVisibilityToggles() {
            this._visibilitySection.innerHTML = '';
            VISIBILITY_FIELDS.forEach(f => this._visibilitySection.appendChild(this._switchRow(f)));
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
                inp.addEventListener('input', () => {
                    this._props[f.key] = inp.value;
                    this._dispatch([f.key]);
                });
                this._textGrid.appendChild(lbl);
                this._textGrid.appendChild(inp);
            });
        }

        _renderAccentPresets() {
            this._accentPresetsEl.innerHTML = '';
            ACCENT_PRESETS.forEach(p => {
                const card = document.createElement('div');
                card.className = 'accent-preset';
                card.dataset.color = p.color;
                card.title = p.color;
                const sw = document.createElement('div');
                sw.className = 'swatch';
                sw.style.background = p.color;
                const nm = document.createElement('div');
                nm.className = 'pname';
                nm.textContent = p.name;
                card.appendChild(sw);
                card.appendChild(nm);
                card.addEventListener('click', () => {
                    this._props.accentColor = p.color;
                    this._refreshAccent();
                    this._dispatch(['accentColor']);
                });
                this._accentPresetsEl.appendChild(card);
            });
        }

        _wireStylingInputs() {
            this._segScheme.querySelectorAll('button').forEach(btn => {
                btn.addEventListener('click', () => {
                    this._props.colorScheme = btn.dataset.v;
                    this._refreshScheme();
                    this._dispatch(['colorScheme']);
                });
            });

            this._inAccentP.addEventListener('input', () => {
                this._inAccent.value = this._inAccentP.value;
                this._props.accentColor = this._inAccentP.value;
                this._refreshAccentSelection();
                this._dispatch(['accentColor']);
            });
            this._inAccent.addEventListener('change', () => {
                if (/^#[0-9a-f]{6}$/i.test(this._inAccent.value)) {
                    this._inAccentP.value = this._inAccent.value;
                    this._props.accentColor = this._inAccent.value;
                    this._refreshAccentSelection();
                    this._dispatch(['accentColor']);
                }
            });

            this._inFont.addEventListener('change', () => {
                this._props.fontFamily = this._inFont.value;
                this._dispatch(['fontFamily']);
            });

            this._inWidth.addEventListener('input', () => {
                this._props.contentMaxWidth = Number(this._inWidth.value);
                this._lastWidth = this._props.contentMaxWidth;
                this._refreshWidth();
                this._dispatch(['contentMaxWidth']);
            });
            this._swFullWidth.addEventListener('click', () => {
                this._props.contentMaxWidth = this._props.contentMaxWidth > 0 ? 0 : (this._lastWidth || 1080);
                this._refreshWidth();
                this._dispatch(['contentMaxWidth']);
            });
        }

        _refreshScheme() {
            this._segScheme.querySelectorAll('button').forEach(b => {
                b.classList.toggle('is-active', b.dataset.v === this._props.colorScheme);
            });
        }

        _refreshAccent() {
            const c = this._props.accentColor || '';
            this._inAccent.value = c;
            this._inAccentP.value = /^#[0-9a-f]{6}$/i.test(c) ? c : '#0b5f8a';
            this._refreshAccentSelection();
        }

        _refreshAccentSelection() {
            this._accentPresetsEl.querySelectorAll('.accent-preset').forEach(card => {
                card.classList.toggle('is-selected', card.dataset.color.toLowerCase() === (this._props.accentColor || '').toLowerCase());
            });
        }

        _refreshFont() {
            const v = this._props.fontFamily || '';
            this._inFont.innerHTML = '';
            const options = FONTS.slice();
            // a font set via script or JSON stays selectable
            if (v && !options.some(o => o[0] === v)) options.push([v, 'Benutzerdefiniert: ' + v]);
            options.forEach(([value, name]) => {
                const o = document.createElement('option');
                o.value = value;
                o.textContent = name;
                this._inFont.appendChild(o);
            });
            this._inFont.value = v || DEFAULT_FONT;
        }

        _refreshWidth() {
            const w = this._props.contentMaxWidth;
            const full = !(w > 0);
            if (!full) this._lastWidth = w;
            this._swFullWidth.classList.toggle('on', full);
            this._inWidth.disabled = full;
            this._inWidth.value = full ? this._lastWidth : w;
            this._inWidthV.textContent = full ? 'voll' : w + ' px';
        }

        _refreshKey(key) {
            this._shadowRoot.querySelectorAll('[data-key="' + key + '"]').forEach(el => {
                if (el.classList.contains('sac-switch')) el.classList.toggle('on', !!this._props[key]);
                else if (el.value !== String(this._props[key])) el.value = this._props[key];
            });
            if (key === 'colorScheme') this._refreshScheme();
            else if (key === 'accentColor') this._refreshAccent();
            else if (key === 'fontFamily') this._refreshFont();
            else if (key === 'contentMaxWidth') this._refreshWidth();
        }

        _refreshUI() {
            Object.keys(PROPS).forEach(k => this._refreshKey(k));
        }

        _dispatch(keys) {
            const props = {};
            keys.forEach(k => { props[k] = this._props[k]; });
            this.dispatchEvent(new CustomEvent('propertiesChanged', {
                detail: { properties: props }
            }));
        }
    }

    // get/set for every widget property
    Object.keys(PROPS).forEach(key => {
        Object.defineProperty(PdfUaStylingPanel.prototype, key, {
            get() { return this._props[key]; },
            set(v) { this._props[key] = coerce(key, v); this._refreshKey(key); },
            configurable: true
        });
    });

    if (!customElements.get('com-bit-pdfua-styling')) customElements.define('com-bit-pdfua-styling', PdfUaStylingPanel);
})();
