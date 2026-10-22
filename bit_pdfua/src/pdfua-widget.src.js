/* BIT PDF/UA-Korrektur – SAP Analytics Cloud custom widget (main web component).
 * Interface in three steps (Hochladen · Prüfen · Herunterladen) around the engine of the stand-alone
 * program PDF-UA-Korrektur.html. build.py inserts the engine (pdf-lib, fonts and the remediation/check
 * modules) as the function PDFUA_ENGINE below, the interface texts (de/fr/it) and the stylesheet. The
 * engine runs in a Web Worker; if the tenant's Content Security Policy blocks blob: workers it runs on
 * the main thread instead. No eval, no inline <script>, no global variables. */
(function () {
    /* @@PDFUA_ENGINE@@ */

    (function () {
        'use strict';

/* @@PDFUA_I18N@@ */

        const LANG_CODES = ['de-CH', 'fr-CH', 'it-CH', 'rm-CH', 'en', 'de-DE', 'de-AT', 'fr-FR', 'it-IT', 'auto'];
        const UI_LANGS = ['de', 'fr', 'it'];
        const DEFAULT_FONT = 'system-ui, -apple-system, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif';

        // widget properties: name -> [type, default]; keep in sync with pdfuaWidget.json
        const PROPS = {
            appTitle: ['string', I18N.de.appTitle],
            appTagline: ['string', I18N.de.appTagline],
            logoText: ['string', 'UA'],
            uiLanguage: ['string', 'de'],
            showLanguageSwitch: ['boolean', true],
            showHeader: ['boolean', true],
            showSettings: ['boolean', true],
            showLibrary: ['boolean', true],
            showFooter: ['boolean', true],
            colorScheme: ['string', 'light'],
            accentColor: ['string', '#0b5f8a'],
            fontFamily: ['string', DEFAULT_FONT],
            contentMaxWidth: ['integer', 960],
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
        const TEXT_KEYS = ['appTitle', 'appTagline', 'logoText'];
        const VISIBILITY_KEYS = ['showHeader', 'showSettings', 'showLibrary', 'showFooter', 'showLanguageSwitch'];
        const LOOK_KEYS = ['colorScheme', 'accentColor', 'fontFamily', 'contentMaxWidth'];
        // setting key (as in the stand-alone program) -> widget property with its story default
        const SETTING_PROPS = { lang: 'defaultLang', title: 'defaultTitleMode', logoAlt: 'defaultLogoAlt', imgAlt: 'defaultImgAlt', chartAlt: 'defaultChartAlt', suffix: 'defaultSuffix', existing: 'defaultExisting', bookmarks: 'defaultBookmarks', running: 'defaultRunning', autostart: 'defaultAutostart' };

        function coerce(key, v) {
            const [type, def] = PROPS[key];
            if (type === 'boolean') return v === true || v === 'true' ? true : v === false || v === 'false' ? false : def;
            if (type === 'integer') { const n = parseInt(v, 10); return isNaN(n) ? def : n; }
            return v === null || v === undefined ? def : String(v);
        }

        const svg = (body) => '<svg class="i" viewBox="0 0 24 24" aria-hidden="true" focusable="false">' + body + '</svg>';
        const ICON = {
            upload: svg('<path d="M12 15V4M7 9l5-5 5 5"/><path d="M4 15v4a1 1 0 0 0 1 1h14a1 1 0 0 0 1-1v-4"/>'),
            sliders: svg('<path d="M4 6h9M17 6h3M4 12h3M11 12h9M4 18h11M19 18h1"/><circle cx="15" cy="6" r="2"/><circle cx="9" cy="12" r="2"/><circle cx="17" cy="18" r="2"/>'),
            check: svg('<path d="M5 12.5l4.5 4.5L19 7.5"/>'),
            file: svg('<path d="M14 3H7a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V8z"/><path d="M14 3v5h5"/>'),
            download: svg('<path d="M12 4v11M7 10.5l5 5 5-5"/><path d="M4 19.5h16"/>'),
            close: svg('<path d="M6 6l12 12M18 6L6 18"/>'),
            alert: svg('<circle cx="12" cy="12" r="9"/><path d="M12 7.5v5.5M12 16.4v.1"/>')
        };

        const stepButton = (n) => '<li><button type="button" class="step-btn" data-step="' + n + '"><span class="num">' + n + '</span><span class="lbl" data-i18n="step' + n + '"></span> <span class="sr-only done-sr" data-i18n="stepDoneSr"></span></button></li>';

        const tmpl = document.createElement('template');
        tmpl.innerHTML = `
<style>
/* @@PDFUA_CSS@@ */
</style>
<section class="pdfua scheme-light" id="root" lang="de">
  <header class="topbar" id="topbar">
    <div class="brand" id="brand"><span class="logo" id="logo" aria-hidden="true">UA</span><span class="name" id="appName"></span></div>
    <nav class="stepper" id="stepper" data-i18n-aria="stepsNav"><ol>${stepButton(1)}${stepButton(2)}${stepButton(3)}</ol></nav>
    <div class="tools">
      <div class="seg" role="group" id="langSwitch" data-i18n-aria="uiLangGroup">
        <button type="button" data-lang="de" lang="de" aria-label="Deutsch">DE</button><button type="button" data-lang="fr" lang="fr" aria-label="Français">FR</button><button type="button" data-lang="it" lang="it" aria-label="Italiano">IT</button>
      </div>
      <button type="button" class="btn sm" id="openSettings" aria-haspopup="dialog" aria-controls="drawer" aria-expanded="false">${ICON.sliders}<span class="settings-lbl" data-i18n="settings"></span></button>
    </div>
  </header>

  <div class="main" id="main">
    <div class="wrap">
      <section class="step" id="step1" aria-labelledby="s1h">
        <div class="step-head"><h2 id="s1h" tabindex="-1" data-i18n="s1Title"></h2><p id="tagline"></p></div>
        <div class="drop" id="drop">
          <span class="up">${ICON.upload}</span>
          <p class="drop-title" data-i18n="dropTitle"></p>
          <div class="row"><button class="btn primary" id="pick" type="button" data-i18n="pickFiles"></button><button class="btn" id="pickDir" type="button" data-i18n="pickFolder"></button></div>
          <p class="note" data-i18n="dropHint"></p>
          <input type="file" id="file" accept=".pdf,application/pdf" multiple hidden>
          <input type="file" id="dir" webkitdirectory multiple hidden>
        </div>
        <div class="list-head"><h3 id="filesHeading"></h3><button class="btn ghost sm" id="clearAll" type="button" data-i18n="clearList"></button></div>
        <ul class="files" id="fileList" aria-labelledby="filesHeading"></ul>
        <p class="empty" id="empty" data-i18n="noFiles"></p>
        <div class="actionbar">
          <button type="button" class="summary-btn" id="summaryBtn" aria-haspopup="dialog" aria-controls="drawer">${ICON.sliders}<span class="txt" id="summaryTxt"></span><span class="chg" data-i18n="summaryChange"></span></button>
          <button type="button" class="btn primary lg" id="correct" disabled></button>
        </div>
      </section>

      <section class="step" id="step2" aria-labelledby="s2h" hidden>
        <div class="step-head"><h2 id="s2h" tabindex="-1"></h2><p id="s2note"></p></div>
        <ul class="prog" id="progList"></ul>
        <div id="review" hidden>
          <p class="note" data-i18n="reviewHelp"></p>
          <div class="review-bar"><span class="count" id="reviewCount"></span><button class="btn" id="acceptAll" type="button" data-i18n="acceptAll"></button></div>
          <ul class="figs" id="figList"></ul>
          <label class="c show-all" id="showAllWrap"><input type="checkbox" id="showAll"><span id="showAllLbl"></span></label>
          <div class="continue"><button class="btn primary lg" id="continue" type="button"></button></div>
        </div>
        <datalist id="libTexts"></datalist>
      </section>

      <section class="step" id="step3" aria-labelledby="s3h" hidden>
        <div class="step-head"><h2 id="s3h" tabindex="-1" data-i18n="s3Title"></h2><p id="s3summary"></p></div>
        <div class="results-bar">
          <button class="btn primary" id="zipAll" type="button">${ICON.download}<span data-i18n="downloadAll"></span></button>
          <button class="btn" id="csvAll" type="button" data-i18n="csv"></button>
          <button class="btn" id="rerunAll" type="button" data-i18n="rerunAll"></button>
          <button class="btn ghost" id="addMore" type="button" data-i18n="addMore"></button>
        </div>
        <ul class="results" id="resultList"></ul>
      </section>
    </div>
  </div>

  <div class="scrim" id="scrim"></div>
  <aside class="drawer" id="drawer" role="dialog" aria-modal="true" aria-labelledby="drawerTitle">
    <div class="drawer-head"><h2 id="drawerTitle" data-i18n="drawerTitle"></h2><button class="btn ghost sm" id="closeSettings" type="button">${ICON.close}<span data-i18n="close"></span></button></div>
    <div class="drawer-body">
      <p class="note" id="drawerNote"></p>
      <section class="group" aria-labelledby="g1"><h3 id="g1" data-i18n="grpDocument"></h3>
        <label class="f"><span data-i18n="optLang"></span><select id="optLang"></select></label>
        <label class="f"><span data-i18n="optTitle"></span><select id="optTitle"></select></label>
      </section>
      <section class="group" aria-labelledby="g2"><h3 id="g2" data-i18n="grpAlt"></h3>
        <label class="f"><span data-i18n="optLogoAlt"></span><input type="text" id="optLogoAlt"></label>
        <label class="f"><span data-i18n="optImgAlt"></span><input type="text" id="optImgAlt"></label>
        <label class="f"><span data-i18n="optChartAlt"></span><input type="text" id="optChartAlt"></label>
      </section>
      <section class="group" aria-labelledby="g3"><h3 id="g3" data-i18n="grpProcessing"></h3>
        <label class="f"><span data-i18n="optSuffix"></span><input type="text" id="optSuffix"></label>
        <label class="f"><span data-i18n="optExisting"></span><select id="optExisting"></select></label>
        <label class="c"><input type="checkbox" id="optBookmarks"><span data-i18n="optBookmarks"></span></label>
        <label class="c"><input type="checkbox" id="optRunning"><span data-i18n="optRunning"></span></label>
        <label class="c"><input type="checkbox" id="optAutostart"><span data-i18n="optAutostart"></span></label>
      </section>
      <section class="group" id="libGroup" aria-labelledby="g4"><h3 id="g4"><span data-i18n="grpLibrary"></span> <span id="libCount"></span></h3><div id="lib"></div></section>
      <section class="group" id="aboutGroup" aria-labelledby="g5"><h3 id="g5" data-i18n="grpAbout"></h3>
        <p><strong data-i18n="aboutAutoLabel"></strong> <span data-i18n="aboutAuto"></span></p>
        <p><strong data-i18n="aboutPersonLabel"></strong> <span data-i18n="aboutPerson"></span></p>
      </section>
    </div>
    <div class="drawer-foot"><button class="btn" id="resetSettings" type="button" data-i18n="resetSettings"></button><button class="btn primary" id="drawerDone" type="button" data-i18n="done"></button></div>
  </aside>
  <div class="sr-only" aria-live="polite" id="live"></div>
</section>
`;

        // ------------------------------------------------------------------ engine (shared by all instances)
        let engineUrl = null; let inlineScope = null; let blobImagesBlocked = false;
        // main-thread jobs of all widget instances run one after the other, like jobs in a worker
        let inlineQueue = Promise.resolve();
        function engineWorkerUrl() {
            if (!engineUrl) engineUrl = URL.createObjectURL(new Blob(['(' + PDFUA_ENGINE.toString() + ')(self);'], { type: 'text/javascript' }));
            return engineUrl;
        }
        function inlineEngine() {
            if (!inlineScope) { const scope = {}; PDFUA_ENGINE(scope); inlineScope = scope; }
            return inlineScope.PDFUA;
        }

        function hexToRgb(hex) {
            let h = String(hex || '').trim().replace('#', '');
            if (/^[a-f\d]{3}$/i.test(h)) h = h.replace(/./g, '$&$&');
            const m = h.match(/^([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i);
            return m ? [parseInt(m[1], 16), parseInt(m[2], 16), parseInt(m[3], 16)] : null;
        }
        function luminance(rgb) {
            const c = rgb.map((v) => { v /= 255; return v <= 0.03928 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4); });
            return 0.2126 * c[0] + 0.7152 * c[1] + 0.0722 * c[2];
        }
        function bytesToBase64(u8) {
            let s = '';
            for (let i = 0; i < u8.length; i += 0x8000) s += String.fromCharCode.apply(null, u8.subarray(i, i + 0x8000));
            return btoa(s);
        }
        function isEditable(el) {
            return !!el && (el.tagName === 'INPUT' || el.tagName === 'TEXTAREA' || el.tagName === 'SELECT' || el.isContentEditable);
        }
        function hasFiles(e) {
            const t = e.dataTransfer && e.dataTransfer.types;
            return !!t && Array.prototype.indexOf.call(t, 'Files') !== -1;
        }
        // bits that differ between two 64-bit average hashes ('p:<16 hex>-WxH')
        function hashDistance(a, b) {
            const x = /^p:([0-9a-f]{16})/.exec(a || ''); const y = /^p:([0-9a-f]{16})/.exec(b || '');
            if (!x || !y) return 64;
            let d = 0;
            for (let i = 0; i < 16; i++) { let v = parseInt(x[1][i], 16) ^ parseInt(y[1][i], 16); while (v) { d += v & 1; v >>= 1; } }
            return d;
        }

        /** One widget instance: the user interface in its shadow root, bound to the engine. */
        function createApp(host, shadow) {
            const $ = (id) => shadow.getElementById(id);
            const P = () => host._props;
            const esc = (s) => String(s == null ? '' : s).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
            const store = {
                get(k, d) { try { const v = localStorage.getItem(k); return v ? JSON.parse(v) : d; } catch (e) { return d; } },
                set(k, v) { try { localStorage.setItem(k, JSON.stringify(v)); } catch (e) { /* storage unavailable */ } },
            };

            // ------------------------------------------------------------------ interface language
            const LANG_KEY = 'pdfua-ui-lang-v1';
            let lang = 'de';
            const tx = (key) => (I18N[lang] && I18N[lang][key] !== undefined ? I18N[lang][key] : I18N.de[key]);
            const t = (key, ...args) => { const v = tx(key); return typeof v === 'function' ? v(...args) : v; };
            // engine messages are German: mark them for screen readers when the interface is not
            const de = (s) => (lang === 'de' ? esc(s) : '<span lang="de">' + esc(s) + '</span>');
            const langName = (v) => tx('langs')[v] || v;
            function rememberLang() { return P().rememberSettings && P().showLanguageSwitch; }
            function initialLang() {
                const stored = rememberLang() ? store.get(LANG_KEY, null) : null;
                if (UI_LANGS.indexOf(stored) !== -1) return stored;
                return UI_LANGS.indexOf(P().uiLanguage) !== -1 ? P().uiLanguage : 'de';
            }
            // texts left at the program's (German) default follow the interface language
            const propText = (key) => (P()[key] === PROPS[key][1] ? t(key) : P()[key]);

            // ------------------------------------------------------------------ settings
            // Defaults come from the widget properties (story design). Changes made in the widget are kept
            // as overrides of those defaults and, if allowed, remembered in this browser.
            const OVERRIDES_KEY = 'pdfua-sac-settings-v1'; const LIB_KEY = 'pdfua-alt-library-v1';
            const fields = { optLang: 'lang', optTitle: 'title', optLogoAlt: 'logoAlt', optImgAlt: 'imgAlt', optChartAlt: 'chartAlt', optSuffix: 'suffix', optBookmarks: 'bookmarks', optRunning: 'running', optExisting: 'existing', optAutostart: 'autostart' };
            let DEFAULTS = {}; let overrides = {};
            function fieldOf(k) { return Object.keys(fields).find((id) => fields[id] === k); }
            function fillSelects() {
                const fill = (id, entries) => {
                    const el = $(id); const v = el.value;
                    el.innerHTML = entries.map(([value, label]) => '<option value="' + esc(value) + '">' + esc(label) + '</option>').join('');
                    if (v) el.value = v;
                };
                fill('optLang', LANG_CODES.map((c) => [c, langName(c)]));
                fill('optTitle', ['keep', 'content', 'filename'].map((m) => [m, tx('titleModes')[m]]));
                fill('optExisting', ['auto', 'retag', 'keep'].map((m) => [m, tx('existingModes')[m]]));
            }
            function validValue(k, v) {
                const el = $(fieldOf(k));
                if (el.type === 'checkbox') return typeof v === 'boolean';
                if (el.tagName === 'SELECT') return Array.from(el.options).some((o) => o.value === v);
                return typeof v === 'string';
            }
            function captureDefaults() {
                DEFAULTS = {};
                for (const k of Object.values(fields)) {
                    const v = P()[SETTING_PROPS[k]];
                    // invalid story values fall back to the program's own defaults
                    DEFAULTS[k] = validValue(k, v) ? v : PROPS[SETTING_PROPS[k]][1];
                }
            }
            function applySettings(s) {
                for (const [id, k] of Object.entries(fields)) {
                    if (s[k] === undefined || !validValue(k, s[k])) continue;
                    const el = $(id); if (el.type === 'checkbox') el.checked = !!s[k]; else el.value = s[k];
                }
            }
            function persistent() { return P().rememberSettings && P().showSettings; }
            function loadSettings() {
                overrides = {};
                if (!persistent()) return;
                const s = store.get(OVERRIDES_KEY, {});
                for (const k of Object.values(fields)) if (s && s[k] !== undefined && validValue(k, s[k])) overrides[k] = s[k];
            }
            function saveSettings() { if (persistent()) store.set(OVERRIDES_KEY, overrides); }
            function recordSetting(k, v) {
                if (v === DEFAULTS[k]) delete overrides[k]; else overrides[k] = v;
                saveSettings();
            }
            function settings() {
                const s = {};
                for (const [id, k] of Object.entries(fields)) { const el = $(id); s[k] = el.type === 'checkbox' ? el.checked : el.value; }
                return s;
            }
            Object.keys(fields).forEach((id) => $(id).addEventListener('change', () => { recordSetting(fields[id], settings()[fields[id]]); settingsChanged(); }));
            function settingsChanged() {
                renderSummary(); renderFiles();
            }
            function resetSettings() {
                overrides = {}; saveSettings(); applySettings(DEFAULTS); settingsChanged(); announce(t('annReset'));
            }

            let library = store.get(LIB_KEY, {});
            function saveLibrary() { store.set(LIB_KEY, library); renderLibrary(); }

            // ------------------------------------------------------------------ engine (worker with fallback)
            let worker = null; let inline = false; let started = false; let destroyed = false; const pending = new Map();
            function onMessage(m) { const p = pending.get(m.id); if (p) p(m); }
            function startEngine() {
                started = true;
                try {
                    worker = new Worker(engineWorkerUrl());
                    worker.onmessage = (ev) => onMessage(ev.data);
                    worker.onerror = (e) => { console.warn('Worker-Fehler, wechsle in den Hauptthread', e); fallback(); };
                } catch (e) {
                    // typically the Content Security Policy does not allow blob: workers
                    console.warn('Web Worker nicht verfügbar, Verarbeitung im Hauptthread', e);
                    inline = true; worker = null;
                }
            }
            function fallback() {
                if (inline) return;
                inline = true;
                if (worker) { try { worker.terminate(); } catch (e) { /* already gone */ } }
                worker = null;
                // re-dispatch running jobs
                pending.forEach((_, id) => { const f = files.find((x) => x.id === id); if (f && f.status === 'running') { f.status = 'queued'; } });
                pending.clear(); running = false; pump();
            }
            function runJob(id, bytes, opts, onMsg) {
                if (!started) startEngine();
                pending.set(id, onMsg);
                const msg = { id, bytes: bytes.slice(0), opts };
                if (worker) worker.postMessage(msg);
                else {
                    inlineQueue = inlineQueue.then(() => new Promise((resolve) => {
                        setTimeout(() => {
                            if (destroyed) { resolve(); return; }
                            let engine = null;
                            try { engine = inlineEngine(); } catch (e) { onMessage({ id, type: 'error', message: t('engineStartError', (e && e.message) || String(e)) }); resolve(); return; }
                            engine.handleJob(msg, (m) => { onMessage(m); if (m.type !== 'progress') resolve(); });
                        }, 0);
                    }));
                }
            }

            // ------------------------------------------------------------------ files and processing
            const files = []; let nextId = 1; let running = false; let processedSinceIdle = false; let lastDone = null;
            let step = 1; let runId = 0; let reviewRun = false;
            const busy = () => files.some((f) => f.status === 'running' || f.status === 'queued');
            const doneFiles = () => files.filter((f) => f.status === 'done');
            const hasResults = () => files.some((f) => f.status === 'done' || f.status === 'error');
            function outName(name) {
                const s = settings().suffix || '';
                return name.replace(/\.pdf$/i, '') + s + '.pdf';
            }
            async function addFiles(list) {
                const arr = Array.from(list).filter((f) => /\.pdf$/i.test(f.name) || f.type === 'application/pdf');
                if (!arr.length) { announce(t('annNoPdf')); return; }
                const auto = settings().autostart;
                for (const f of arr) {
                    const buf = await f.arrayBuffer();
                    files.push({ id: nextId++, name: f.name, size: f.size, bytes: buf, status: auto ? 'queued' : 'ready', overrides: {}, altOverrides: {}, open: false, ovOpen: false });
                }
                renderFiles(); updateStepper(); announce(t('annAdded', arr.length)); host._fire('onFilesAdded');
                if (auto) startRun();
                else if (step !== 1) goStep(1);
            }
            function buildOpts(f) {
                const s = settings();
                const altTexts = {};
                for (const [k, v] of Object.entries(library)) altTexts[k] = { alt: v.alt, decorative: !!v.decorative, source: 'library' };
                for (const [k, v] of Object.entries(f.altOverrides)) altTexts[k] = { alt: v.alt, decorative: !!v.decorative, source: 'library' };
                const logoAlt = (f.overrides.logoAlt || s.logoAlt || 'Logo').trim();
                const o = {
                    fileName: f.name, lang: f.overrides.lang || s.lang || 'de-CH', regionCH: true, bookmarks: s.bookmarks, runningAsArtifact: s.running,
                    logoAlt, logoAltCustom: logoAlt !== 'Logo', defaultAlt: s.imgAlt || 'Abbildung', chartAlt: s.chartAlt || 'Diagramm', altTexts, checkBefore: true, existingTags: s.existing || 'auto',
                };
                if (f.overrides.title) o.title = f.overrides.title;
                else if (s.title === 'content') o.titleStrategy = 'content';
                else if (s.title === 'filename') o.title = f.name.replace(/\.pdf$/i, '').replace(/[_]+/g, ' ').trim();
                return o;
            }
            /** "Korrigieren": all files that are ready */
            function correct() {
                files.forEach((f) => { if (f.status === 'ready') f.status = 'queued'; });
                startRun();
            }
            function queue(f) { f.status = 'queued'; f.result = null; f.open = false; }
            function startRun() {
                const queued = files.filter((f) => f.status === 'queued');
                if (!queued.length) return;
                runId++;
                queued.forEach((f) => { f.run = runId; f.stage = null; f.frac = 0; });
                goStep(2);
                announce(t('annStart', queued.length));
                pump();
            }
            function pump() {
                if (running) return;
                const f = files.find((x) => x.status === 'queued');
                if (!f) {
                    renderFiles(); updateStepper();
                    if (processedSinceIdle) { processedSinceIdle = false; runFinished(); }
                    return;
                }
                running = true; f.status = 'running'; f.stage = 'Start'; f.frac = 0.02; f.run = f.run || runId; renderProgress();
                runJob(f.id, f.bytes, buildOpts(f), (m) => {
                    if (m.type === 'progress') { f.stage = m.stage; f.frac = m.frac; updateProgressRow(f); return; }
                    pending.delete(f.id);
                    if (m.type === 'done') {
                        f.result = { bytes: m.bytes, report: m.report };
                        f.status = m.bytes ? 'done' : 'error';
                        if (!m.bytes) f.error = (m.report.errors[0] && m.report.errors[0].msg) || t('unknownError');
                        const c = m.report.checks;
                        announce(m.bytes ? (c && c.passed ? t('annFileOk', f.name) : t('annFileOpen', f.name)) : t('annFileError', f.name));
                    } else { f.status = 'error'; f.error = m.message; announce(t('annFileError', f.name)); }
                    running = false; updateProgressRow(f);
                    processedSinceIdle = true; lastDone = f; host._fire('onFileProcessed');
                    pump();
                });
            }
            /** after a run: review the alternative texts if any need a person, otherwise go straight to the downloads */
            function runFinished() {
                host._fire('onQueueFinished');
                const fromReview = reviewRun; reviewRun = false;
                const n = pendingReview().length;
                renderResults();
                if (step !== 2) return; // the user is working elsewhere; the stepper shows what is ready
                if (n && !fromReview) { renderStep2(); announce(t('annReview', n)); }
                else { goStep(3); announce(t('annDone', doneFiles().length)); }
            }

            // ------------------------------------------------------------------ alternative texts to review
            const reviewState = new Map(); // image key -> { alt, decorative, accepted }
            const thumbs = new Map();      // image key -> drawn preview (canvas or img), for the library thumbnail
            let showAll = false;
            const needsReview = (fg) => !fg.decorative && (fg.source === 'default' || fg.source === 'logo' || fg.source === 'formula');
            const figKey = (f, fg) => fg.hash || (f.id + ':p' + fg.page + ':' + fg.bbox.join(','));
            /** figures of all processed files, one entry per image (the same logo in five files is one entry) */
            function figureGroups() {
                const map = new Map();
                files.forEach((f) => {
                    if (f.status !== 'done') return;
                    (f.result.report.figures || []).forEach((fg) => {
                        const k = figKey(f, fg);
                        if (!map.has(k)) map.set(k, Object.assign({ key: k, occ: [], needs: false }, fg));
                        const g = map.get(k);
                        let o = g.occ.find((x) => x.file === f);
                        if (!o) { o = { file: f, pages: [], fig: fg }; g.occ.push(o); }
                        if (o.pages.indexOf(fg.page + 1) === -1) o.pages.push(fg.page + 1);
                        if (needsReview(fg)) g.needs = true;
                        if (!g.thumb && fg.thumb) g.thumb = fg.thumb;
                        if (!g.jpeg && fg.jpeg) g.jpeg = fg.jpeg;
                    });
                });
                return Array.from(map.values());
            }
            function stateOf(g) {
                if (!reviewState.has(g.key)) {
                    const lib = library[g.key] || (g.phash ? library[g.phash] : null);
                    reviewState.set(g.key, { alt: lib && lib.alt !== undefined ? lib.alt : (g.alt || ''), decorative: lib ? !!lib.decorative : !!g.decorative, accepted: false });
                }
                return reviewState.get(g.key);
            }
            const pendingReview = () => figureGroups().filter((g) => g.needs && !stateOf(g).accepted);
            /** automatically set texts of a file that nobody has accepted yet */
            const altTodo = (f) => (f.result.report.figures || []).filter((fg) => needsReview(fg) && !(reviewState.get(figKey(f, fg)) || {}).accepted).length;
            /** saved texts of similar images (same picture in another size or quality) */
            function suggestionsFor(g, current) {
                const out = [];
                if (!g.phash) return out;
                Object.keys(library).forEach((k) => {
                    const e = library[k];
                    if (k.indexOf('p:') !== 0 || k === g.phash || e.decorative || !e.alt) return;
                    if (hashDistance(k, g.phash) <= 10 && e.alt !== current && out.indexOf(e.alt) === -1) out.push(e.alt);
                });
                return out.slice(0, 3);
            }
            function libraryTexts() {
                const seen = new Set();
                return Object.keys(library).filter((k) => !library[k].alias && !library[k].decorative && library[k].alt)
                    .sort((a, b) => String(library[b].saved || '').localeCompare(String(library[a].saved || '')))
                    .map((k) => library[k].alt).filter((s) => !seen.has(s) && seen.add(s)).slice(0, 60);
            }
            function smallThumb(key) {
                try {
                    const src = thumbs.get(key); if (!src) return null;
                    const w = src.width || src.naturalWidth; const h = src.height || src.naturalHeight; if (!w || !h) return null;
                    const s = Math.min(1, 64 / Math.max(w, h)); const c = document.createElement('canvas');
                    c.width = Math.max(1, Math.round(w * s)); c.height = Math.max(1, Math.round(h * s));
                    c.getContext('2d').drawImage(src, 0, 0, c.width, c.height);
                    return c.toDataURL('image/jpeg', 0.75);
                } catch (e) { return null; }
            }
            /** save accepted texts in the library and re-create the files whose PDF does not contain them yet;
             *  a file is also re-created when an accepted text is still marked as automatic in its test report */
            function applyReview() {
                const changed = new Set();
                figureGroups().forEach((g) => {
                    const st = reviewState.get(g.key);
                    if (!st || !st.accepted) return;
                    const prev = library[g.key];
                    const entry = { alt: st.alt, decorative: st.decorative, thumb: (prev && prev.thumb) || smallThumb(g.key), saved: new Date().toISOString().slice(0, 10) };
                    library[g.key] = entry;
                    if (g.phash) library[g.phash] = Object.assign({}, entry, { thumb: null, alias: g.key });
                    g.occ.forEach((o) => { if (needsReview(o.fig) || (o.fig.alt || '') !== st.alt || !!o.fig.decorative !== st.decorative) changed.add(o.file); });
                });
                saveLibrary();
                const redo = files.filter((f) => changed.has(f) && f.status === 'done');
                if (!redo.length) { goStep(3); return; }
                redo.forEach(queue);
                reviewRun = true;
                startRun();
            }

            // ------------------------------------------------------------------ rendering helpers
            function announce(msg) { $('live').textContent = msg; }
            function fmtSize(n) { return n > 1048576 ? (n / 1048576).toFixed(1) + ' MB' : Math.max(1, Math.round(n / 1024)) + ' KB'; }
            function checkSummary(c) { if (!c) return null; const ok = c.items.filter((i) => i.ok).length; return { ok, total: c.items.length, passed: c.passed }; }
            function stageText(s) { return tx('stages')[s] || s || ''; }
            /** status of a processed file: PDF/UA erfüllt, Hinweise (with reasons) or Fehler */
            function verdict(f) {
                if (f.status === 'error') return { cls: 'err', label: t('stError'), hints: [f.error || t('unknownError')] };
                const r = f.result.report; const cs = checkSummary(r.checks); const hints = []; const todo = altTodo(f);
                if (r.errors.some((e) => e.code === 'no-text')) hints.push(t('hintOcr'));
                else if (r.errors.length) hints.push(t('hintLimited'));
                if (cs && !cs.passed) hints.push(t('hintRules', cs.total - cs.ok));
                if (todo) hints.push(t('hintAlt', todo));
                return hints.length ? { cls: 'warn', label: t('stHints'), hints } : { cls: 'ok', label: t('stOk'), hints };
            }
            function badge(f) {
                if (f.status === 'ready') return '';
                if (f.status === 'done' || f.status === 'error') { const v = verdict(f); return '<span class="badge ' + v.cls + '">' + (v.cls === 'ok' ? ICON.check : ICON.alert) + esc(v.label) + '</span>'; }
                return '<span class="badge">' + esc(tx('status')[f.status]) + '</span>';
            }
            /** re-render a list without losing the keyboard focus inside it */
            function keepFocus(container, render) {
                const a = shadow.activeElement; let sel = null; let pos = null;
                if (a && container.contains(a)) {
                    const item = a.closest('[data-id],[data-key]');
                    const attr = ['data-ov', 'data-act', 'data-alt', 'data-dec', 'data-filter'].find((x) => a.hasAttribute(x));
                    if (item && attr) {
                        sel = (item.dataset.id ? '[data-id="' + item.dataset.id + '"]' : '[data-key="' + cssEsc(item.dataset.key) + '"]') + ' [' + attr + (a.getAttribute(attr) ? '="' + a.getAttribute(attr) + '"' : '') + ']';
                        if (typeof a.selectionStart === 'number') pos = [a.selectionStart, a.selectionEnd];
                    }
                }
                render();
                if (sel) {
                    const el = container.querySelector(sel);
                    if (el) { el.focus(); if (pos && el.setSelectionRange) try { el.setSelectionRange(pos[0], pos[1]); } catch (e) { /* not a text field */ } }
                }
            }
            function cssEsc(s) { return (window.CSS && CSS.escape) ? CSS.escape(s) : s.replace(/["\\]/g, '\\$&'); }

            // ------------------------------------------------------------------ step 1: Hochladen
            /** per-file title / language / logo text; before the run (info = null) or to re-create a processed file */
            function overrideForm(f, info) {
                const s = settings(); const ov = f.overrides; const pre = !info;
                const titleVal = pre ? (ov.title || '') : (ov.title || info.title || '');
                const lab = (txt, field) => '<label class="f">' + esc(txt) + field + '</label>';
                return '<div class="' + (pre ? 'ov-form' : 'adjust') + '">' +
                    (pre ? '<p class="note">' + esc(t('ovNote')) + '</p>' : '') +
                    lab(t('ovTitle'), '<input type="text" data-ov="title" value="' + esc(titleVal) + '" placeholder="' + esc(tx('titlePh')[s.title] || '') + '">') +
                    lab(t('ovLang'), '<select data-ov="lang"><option value=""' + (!ov.lang ? ' selected' : '') + '>' + esc(t('ovLangDefault', langName(s.lang))) + '</option>' +
                        LANG_CODES.map((c) => '<option value="' + c + '"' + (ov.lang === c ? ' selected' : '') + '>' + esc(langName(c)) + '</option>').join('') + '</select>') +
                    lab(t('ovLogo'), '<input type="text" data-ov="logoAlt" value="' + esc(ov.logoAlt || '') + '" placeholder="' + esc(s.logoAlt || 'Logo') + '">') +
                    (pre ? '' : '<button class="btn" data-act="rerun" type="button">' + esc(t('rerunFile')) + '</button>') +
                    '</div>';
            }
            function readOverrides(f, root) {
                const q = (k) => root.querySelector('[data-ov="' + k + '"]');
                if (!q('title')) return;
                const tt = q('title').value.trim(); const l = q('lang').value; const lg = q('logoAlt').value.trim();
                const computed = f.result && f.result.report.info.title;
                const o = {};
                if (tt && tt !== computed) o.title = tt; else if (tt && f.overrides.title) o.title = f.overrides.title;
                if (l) o.lang = l;
                if (lg) o.logoAlt = lg;
                f.overrides = o;
            }
            function renderFiles() {
                const list = $('fileList');
                $('filesHeading').textContent = t('filesHeading', files.length);
                $('empty').hidden = files.length > 0;
                $('clearAll').hidden = !files.length;
                $('clearAll').disabled = busy();
                keepFocus(list, () => {
                    list.innerHTML = files.map((f) => {
                        const r = f.result && f.result.report;
                        const meta = (r && r.info.pages ? t('pages', r.info.pages) + ' · ' : '') + fmtSize(f.size);
                        const canEdit = f.status === 'ready';
                        return '<li class="file" data-id="' + f.id + '"><div class="file-row"><span class="file-ic">' + ICON.file + '</span>' +
                            '<div class="file-info"><div class="file-name">' + esc(f.name) + '</div><div class="file-meta">' + esc(meta) + '</div></div>' + badge(f) +
                            (canEdit ? '<button type="button" class="btn ghost sm" data-act="ov" aria-expanded="' + (f.ovOpen ? 'true' : 'false') + '" aria-label="' + esc(t('customizeFor', f.name)) + '">' + esc(t('customize')) + '</button>' : '') +
                            '<button type="button" class="btn ghost sm" data-act="remove"' + (f.status === 'running' ? ' disabled' : '') + ' aria-label="' + esc(t('removeFor', f.name)) + '" title="' + esc(t('remove')) + '">' + ICON.close + '</button>' +
                            '</div>' + (canEdit && f.ovOpen ? overrideForm(f, null) : '') + '</li>';
                    }).join('');
                });
                updateCorrect();
            }
            function updateCorrect() {
                const ready = files.filter((f) => f.status === 'ready').length;
                $('correct').disabled = ready === 0;
                $('correct').textContent = ready > 1 ? t('correctN', ready) : t('correct');
            }
            function renderSummary() {
                const s = settings();
                const parts = [langName(s.lang), tx('sumTitle')[s.title], tx('sumExisting')[s.existing], s.bookmarks ? t('sumBookmarks') : '', s.running ? t('sumRunning') : '', s.suffix ? t('sumSuffix', s.suffix) : '', s.autostart ? t('sumAutostart') : ''];
                $('summaryTxt').textContent = t('summaryLabel') + ': ' + parts.filter(Boolean).join(' · ');
            }
            function removeFile(f) {
                const i = files.indexOf(f);
                if (i < 0 || f.status === 'running') return;
                files.splice(i, 1); renderFiles(); renderResults(); updateStepper();
            }
            function clearAll() {
                files.slice().forEach((f) => { if (f.status !== 'running') files.splice(files.indexOf(f), 1); });
                renderFiles(); renderResults(); updateStepper();
            }

            // ------------------------------------------------------------------ step 2: Prüfen
            function renderProgress() {
                const runFiles = files.filter((f) => f.run === runId);
                $('progList').innerHTML = runFiles.map((f) => '<li data-id="' + f.id + '"><div><div class="file-name">' + esc(f.name) + '</div><div class="stage" data-stage></div></div>' +
                    '<div class="bar" role="progressbar" aria-label="' + esc(t('progressFor', f.name)) + '" aria-valuemin="0" aria-valuemax="100" aria-valuenow="0"><i></i></div></li>').join('');
                runFiles.forEach(updateProgressRow);
            }
            function updateProgressRow(f) {
                const li = $('progList').querySelector('li[data-id="' + f.id + '"]');
                if (!li) { if (step === 2) renderProgress(); return; }
                const end = f.status === 'done' || f.status === 'error';
                const pct = end ? 100 : f.status === 'queued' ? 0 : Math.round((f.frac || 0) * 100);
                li.className = f.status === 'done' ? 'ok' : f.status === 'error' ? 'err' : '';
                const bar = li.querySelector('.bar'); bar.setAttribute('aria-valuenow', pct); bar.firstChild.style.width = pct + '%';
                li.querySelector('[data-stage]').textContent = f.status === 'queued' ? t('waiting') : f.status === 'done' ? verdict(f).label : f.status === 'error' ? t('stError') + ': ' + (f.error || '') : stageText(f.stage);
            }
            function renderStep2() {
                const isBusy = busy();
                $('progList').hidden = !isBusy;
                $('review').hidden = isBusy;
                if (isBusy) {
                    $('s2h').textContent = t('s2TitleRun');
                    $('s2note').textContent = reviewRun ? t('applying') : t('s2RunNote');
                    renderProgress();
                    return;
                }
                const groups = figureGroups();
                const items = groups.filter((g) => showAll || g.needs).sort((a, b) => (b.needs ? 1 : 0) - (a.needs ? 1 : 0));
                const needed = groups.filter((g) => g.needs);
                const pend = needed.filter((g) => !stateOf(g).accepted);
                $('s2h').textContent = t('s2TitleReview');
                $('s2note').textContent = pend.length ? t('reviewIntro', pend.length) : t('reviewNone');
                $('libTexts').innerHTML = libraryTexts().map((s) => '<option value="' + esc(s) + '">').join('');
                thumbs.clear();
                $('figList').innerHTML = items.map((g, i) => figItem(g, i, items.length)).join('');
                items.forEach((g) => drawThumb(g));
                const others = groups.length - needed.length;
                $('showAllWrap').hidden = !others;
                $('showAll').checked = showAll;
                $('showAllLbl').textContent = t('showAllFigures', others);
                updateReviewBar();
            }
            function figItem(g, i, n) {
                const st = stateOf(g);
                const lib = library[g.key] || (g.phash ? library[g.phash] : null);
                const src = lib ? tx('source').library : (tx('source')[g.source] || g.source);
                const where = g.occ.map((o) => esc(o.file.name) + ' · ' + esc(t('pagesShort', o.pages))).join('; ');
                const sugg = suggestionsFor(g, st.alt);
                const id = 'alt-' + i;
                return '<li class="fig' + (st.accepted ? ' accepted' : '') + '" data-key="' + esc(g.key) + '">' +
                    '<div class="thumb" data-thumb>' + esc(tx('figKind')[g.formula ? 'formula' : g.vector ? 'vector' : 'image']) + '</div>' +
                    '<div><div class="fig-meta"><span class="src">' + esc(src) + '</span><span>' + where + '</span></div>' +
                    '<label class="sr-only" for="' + id + '">' + esc(t('altLabel', i + 1, n)) + '</label>' +
                    '<input type="text" id="' + id + '" data-alt list="libTexts" autocomplete="off" value="' + esc(st.alt) + '" aria-describedby="' + id + '-e">' +
                    (sugg.length ? '<div class="chips"><span>' + esc(t('suggestions')) + '</span>' + sugg.map((s) => '<button type="button" class="chip" data-sugg="' + esc(s) + '" aria-label="' + esc(t('useSuggestion', s)) + '">' + esc(s) + '</button>').join('') + '</div>' : '') +
                    '<div class="fig-err" id="' + id + '-e" hidden>' + esc(t('needText')) + '</div>' +
                    '<div class="fig-actions">' + (g.formula ? '<span></span>' : '<label class="c"><input type="checkbox" data-dec' + (st.decorative ? ' checked' : '') + '> ' + esc(t('decorative')) + '</label>') +
                    '<span><button type="button" class="btn sm" data-act="accept" aria-label="' + esc(t('acceptFor', i + 1)) + '"' + (st.accepted ? ' hidden' : '') + '>' + esc(t('accept')) + '</button>' +
                    '<span class="badge ok" data-accepted' + (st.accepted ? '' : ' hidden') + '>' + ICON.check + esc(t('accepted')) + '</span></span></div></div></li>';
            }
            function drawThumb(g) {
                const li = $('figList').querySelector('li[data-key="' + cssEsc(g.key) + '"]');
                const box = li && li.querySelector('[data-thumb]'); if (!box) return;
                const lib = library[g.key];
                if (g.thumb) {
                    const c = document.createElement('canvas'); c.width = g.thumb.w; c.height = g.thumb.h;
                    c.getContext('2d').putImageData(new ImageData(new Uint8ClampedArray(g.thumb.rgba), g.thumb.w, g.thumb.h), 0, 0);
                    c.setAttribute('aria-hidden', 'true');
                    box.textContent = ''; box.appendChild(c); thumbs.set(g.key, c);
                } else if (g.jpeg) {
                    const img = document.createElement('img'); img.alt = '';
                    const dataUrl = () => 'data:image/jpeg;base64,' + bytesToBase64(new Uint8Array(g.jpeg));
                    if (blobImagesBlocked) img.src = dataUrl();
                    else {
                        const url = URL.createObjectURL(new Blob([g.jpeg], { type: 'image/jpeg' }));
                        // if the Content Security Policy does not allow blob: images, use a data: URL
                        img.onerror = () => { img.onerror = null; blobImagesBlocked = true; URL.revokeObjectURL(url); img.src = dataUrl(); };
                        img.src = url;
                    }
                    box.textContent = ''; box.appendChild(img); thumbs.set(g.key, img);
                } else if (lib && lib.thumb) {
                    const img = document.createElement('img'); img.alt = ''; img.src = lib.thumb; box.textContent = ''; box.appendChild(img);
                }
            }
            function updateReviewBar() {
                const lis = Array.from($('figList').children);
                const needed = figureGroups().filter((g) => g.needs);
                const acc = needed.filter((g) => stateOf(g).accepted).length;
                $('reviewCount').textContent = needed.length ? t('reviewCount', acc, needed.length) : '';
                $('acceptAll').hidden = !lis.some((li) => !li.classList.contains('accepted'));
                const anyTouched = Array.from(reviewState.values()).some((s) => s.accepted || s.edited);
                $('continue').textContent = anyTouched ? t('continueApply') : t('continueOnly');
            }
            function groupOf(li) { return figureGroups().find((g) => g.key === li.dataset.key); }
            function setAccepted(li, on) {
                li.classList.toggle('accepted', on);
                li.querySelector('[data-act="accept"]').hidden = on;
                li.querySelector('[data-accepted]').hidden = !on;
            }
            function acceptItem(li) {
                const g = groupOf(li); if (!g) return false;
                const st = stateOf(g); const input = li.querySelector('[data-alt]'); const dec = li.querySelector('[data-dec]');
                st.alt = input.value.trim(); st.decorative = !!(dec && dec.checked);
                const err = li.querySelector('.fig-err');
                if (!st.decorative && !st.alt) { err.hidden = false; input.setAttribute('aria-invalid', 'true'); input.focus(); return false; }
                err.hidden = true; input.removeAttribute('aria-invalid');
                st.accepted = true; setAccepted(li, true); updateReviewBar();
                return true;
            }
            function focusNextFrom(li) {
                const lis = Array.from($('figList').children);
                const next = lis.slice(lis.indexOf(li) + 1).concat(lis.slice(0, lis.indexOf(li))).find((x) => !x.classList.contains('accepted'));
                if (next) next.querySelector('[data-alt]').focus(); else $('continue').focus();
            }
            function acceptAll() {
                for (const li of Array.from($('figList').children)) {
                    if (!li.classList.contains('accepted') && !acceptItem(li)) return;
                }
                applyReview();
            }
            /** "Weiter": texts the user edited count as accepted; untouched suggestions stay unreviewed */
            function continueReview() {
                for (const li of Array.from($('figList').children)) {
                    const g = groupOf(li); const st = g && reviewState.get(g.key);
                    if (st && st.edited && !st.accepted && !acceptItem(li)) return;
                }
                applyReview();
            }

            // ------------------------------------------------------------------ step 3: Herunterladen
            function renderResults() {
                const list = $('resultList');
                const res = files.filter((f) => (f.status === 'done' || f.status === 'error') && f.result !== null);
                const v = res.map(verdict);
                const n = (cls) => v.filter((x) => x.cls === cls).length;
                $('s3summary').textContent = res.length ? t('s3Summary', res.length, n('ok'), n('warn'), n('err')) : '';
                $('zipAll').disabled = !doneFiles().length; $('csvAll').disabled = !res.length; $('rerunAll').disabled = !res.length || busy();
                keepFocus(list, () => { list.innerHTML = res.map((f, i) => resultCard(f, v[i])).join(''); });
            }
            function resultCard(f, v) {
                const r = f.result && f.result.report;
                const meta = (r && r.info.pages ? t('pages', r.info.pages) + ' · ' : '') + fmtSize(f.size) + (f.status === 'done' ? ' → ' + fmtSize(f.result.bytes.byteLength) : '');
                const hints = f.status === 'error' ? de(v.hints.join(' · ')) : esc(v.hints.join(' · '));
                return '<li class="panel" data-id="' + f.id + '"><div class="result-main">' +
                    '<span class="badge ' + v.cls + '">' + (v.cls === 'ok' ? ICON.check : ICON.alert) + esc(v.label) + '</span>' +
                    '<div class="result-info"><div class="file-name">' + esc(f.name) + '</div><div class="file-meta">' + esc(meta) + '</div>' +
                    (v.hints.length ? '<div class="result-hints">' + hints + '</div>' : '') + '</div>' +
                    (f.status === 'done' ? '<button type="button" class="btn primary sm" data-act="dl" aria-label="' + esc(t('downloadFor', outName(f.name))) + '">' + ICON.download + esc(t('download')) + '</button>' : '') +
                    (r ? '<button type="button" class="btn sm" data-act="toggle" aria-expanded="' + (f.open ? 'true' : 'false') + '" aria-controls="det-' + f.id + '">' + esc(f.open ? t('hideDetails') : t('showDetails')) + '</button>'
                        : '<button type="button" class="btn ghost sm" data-act="remove" aria-label="' + esc(t('removeFor', f.name)) + '" title="' + esc(t('remove')) + '">' + ICON.close + '</button>') +
                    '</div>' + (r && f.open ? detailsHTML(f, r) : '') + '</li>';
            }
            function structSummary(r) {
                const c = r.counts || {}; const s = tx('struct'); const parts = [];
                if (r.info.structElements) parts.push(s.tags(r.info.structElements));
                if (c.tables) parts.push(s.tables(c.tables));
                if (c.lists) parts.push(s.lists(c.lists));
                const nf = (r.figures || []).filter((x) => !x.formula).length;
                if (nf) parts.push(s.figures(nf));
                if (c.formulas) parts.push(s.formulas(c.formulas));
                if (c.notes) parts.push(s.notes(c.notes));
                return esc(parts.join(' · ') || '–');
            }
            function detailsHTML(f, r) {
                const cs = checkSummary(r.checks); const before = r.before ? checkSummary(r.before) : null; const info = r.info || {};
                const box = (k, v) => '<div><b>' + esc(k) + '</b>' + v + '</div>';
                const list = (title, arr) => (arr.length ? '<div><h4>' + esc(title) + '</h4><ul>' + arr.map((x) => '<li>' + de(x.msg) + '</li>').join('') + '</ul></div>' : '');
                let h = '<div class="details" id="det-' + f.id + '">';
                if (lang !== 'de') h += '<p class="note">' + esc(t('engineGerman')) + '</p>';
                if (r.errors.length) h += '<div class="callout">' + r.errors.map((e) => de(e.msg)).join('<br>') + '</div>';
                h += '<div class="kv">' + box(t('boxTitle'), esc(info.title || '–')) + box(t('boxLang'), esc(info.lang || '–')) +
                    box(t('boxCheck'), cs ? esc(t('beforeAfter', before ? before.ok : null, cs.ok, cs.total)) : '–') + box(t('boxStruct'), structSummary(r)) + '</div>';
                h += list(t('fixesTitle'), r.fixes) + list(t('warningsTitle'), r.warnings);
                const figs = (r.figures || []);
                if (figs.length) {
                    h += '<div><h4>' + esc(t('figuresTitle', figs.length)) + '</h4><ul class="figlist">' +
                        figs.map((fg) => '<li>' + esc(t('pageShort', fg.page + 1)) + ': ' + (fg.decorative ? '<i>' + esc(t('decorativeShort')) + '</i>' : esc(fg.alt)) + '</li>').join('') +
                        '</ul><p><button type="button" class="btn sm" data-act="edit-alts">' + esc(t('editInReview')) + '</button></p></div>';
                }
                if (r.outline && r.outline.length) {
                    const names = tx('outlineTypes');
                    h += '<details class="x"><summary><span class="chev" aria-hidden="true">▸</span> ' + esc(t('outlineTitle', r.outline.length, r.outline.length >= 400)) + '</summary><ol class="outline">' +
                        r.outline.map((o) => '<li><span class="tag tag-' + esc(o.type) + '">' + esc(names[o.type] || o.type) + '</span> ' + esc(o.text) + ' <span class="note">' + esc(t('pageShort', o.page)) + '</span></li>').join('') + '</ol></details>';
                }
                if (r.checks) {
                    const items = r.checks.items.slice().sort((a, b) => (a.ok === b.ok ? 0 : a.ok ? 1 : -1));
                    const failed = items.filter((i) => !i.ok).length;
                    h += '<details class="x"><summary><span class="chev" aria-hidden="true">▸</span> ' + esc(t('logTitle', cs.ok, cs.total)) + '</summary>' +
                        '<div class="log-tools"><label class="c"><input type="checkbox" data-filter' + (f.onlyFailed ? ' checked' : '') + '> ' + esc(t('onlyFailed')) + '</label></div>' +
                        '<table class="checks' + (f.onlyFailed ? ' only-failed' : '') + '"><thead><tr><th scope="col">' + esc(t('colRule')) + '</th><th scope="col">' + esc(t('colReq')) + '</th><th scope="col">' + esc(t('colResult')) + '</th></tr></thead><tbody>' +
                        items.map((i) => '<tr class="' + (i.ok ? 'ok' : 'fail') + '"><td class="id">' + esc(i.id) + '</td><td>' + de(i.title) + (i.details && i.details.length ? '<div class="note">' + de(i.details.join('; ')) + '</div>' : '') + '</td><td class="' + (i.ok ? 'st-ok">' + esc(t('ruleOk')) : 'st-err">' + esc(t('ruleFail'))) + '</td></tr>').join('') +
                        '</tbody></table><p class="note" data-allok' + (f.onlyFailed && !failed ? '' : ' hidden') + '>' + esc(t('allRulesOk')) + '</p></details>';
                }
                h += '<div><h4>' + esc(t('adjustTitle')) + '</h4>' + overrideForm(f, info) + '</div>';
                h += '<div class="detail-actions"><button type="button" class="btn" data-act="report">' + esc(t('report')) + '</button>' +
                    '<button type="button" class="btn ghost" data-act="remove">' + esc(t('remove')) + '</button></div>';
                return h + '</div>';
            }
            function reportHTML(f) {
                const r = f.result.report; const cs = checkSummary(r.checks); const b = r.before ? checkSummary(r.before) : null; const R = tx('rep');
                const li = (arr) => arr.map((x) => '<li>' + de(x.msg) + '</li>').join('');
                const rows = (r.checks ? r.checks.items : []).map((i) => '<tr><td>' + esc(i.id) + '</td><td>' + de(i.title) + (i.details && i.details.length ? '<br><small>' + de(i.details.join('; ')) + '</small>' : '') + '</td><td>' + (i.ok ? esc(R.ok) : '<b>' + esc(R.fail) + '</b>') + '</td></tr>').join('');
                const groups = new Map();
                (r.figures || []).forEach((fg) => {
                    const k = figKey(f, fg);
                    if (!groups.has(k)) groups.set(k, Object.assign({ pages: [] }, fg));
                    if (groups.get(k).pages.indexOf(fg.page + 1) === -1) groups.get(k).pages.push(fg.page + 1);
                });
                const figs = Array.from(groups.values()).map((g) => '<tr><td>' + g.pages.join(', ') + '</td><td>' + (g.decorative ? '<i>' + esc(R.decorative) + '</i>' : esc(g.alt)) + '</td></tr>').join('');
                return '<!doctype html><html lang="' + lang + '"><head><meta charset="utf-8"><title>' + esc(R.title(f.name)) + '</title><style>body{font:14px/1.5 system-ui,sans-serif;max-width:900px;margin:24px auto;padding:0 16px;color:#1b1f24}table{border-collapse:collapse;width:100%}td,th{border-bottom:1px solid #ddd;padding:4px 6px;text-align:left;vertical-align:top}h1{font-size:20px}h2{font-size:16px;margin-top:22px}</style></head><body>' +
                    '<h1>' + esc(R.h1) + '</h1><p><b>' + esc(R.file) + ':</b> ' + esc(f.name) + ' → ' + esc(outName(f.name)) + '<br><b>' + esc(R.created) + ':</b> ' + esc(new Date().toLocaleString(t('locale'))) + '<br><b>' + esc(R.docTitle) + ':</b> ' + esc(r.info.title) + '<br><b>' + esc(R.lang) + ':</b> ' + esc(r.info.lang) + '<br><b>' + esc(R.pages) + ':</b> ' + esc(r.info.pages) + '</p>' +
                    '<p>' + R.auto(b ? b.ok + '/' + b.total : '', cs ? cs.ok + '/' + cs.total : '–') + '</p>' +
                    (r.errors.length ? '<h2>' + esc(R.errors) + '</h2><ul>' + li(r.errors) + '</ul>' : '') +
                    '<h2>' + esc(R.fixes) + '</h2><ul>' + li(r.fixes) + '</ul>' + (r.warnings.length ? '<h2>' + esc(R.warnings) + '</h2><ul>' + li(r.warnings) + '</ul>' : '') +
                    (figs ? '<h2>' + esc(R.alts) + '</h2><table><tr><th>' + esc(R.altPages) + '</th><th>' + esc(R.altText) + '</th></tr>' + figs + '</table>' : '') +
                    '<h2>' + esc(R.log) + '</h2><table><tr><th>' + esc(R.rule) + '</th><th>' + esc(R.req) + '</th><th>' + esc(R.result) + '</th></tr>' + rows + '</table>' +
                    '<p><small>' + esc(R.foot) + '</small></p></body></html>';
            }

            // ------------------------------------------------------------------ downloads, ZIP and CSV
            function download(blob, name) {
                const a = document.createElement('a'); a.href = URL.createObjectURL(blob); a.download = name;
                // keep the click inside the widget so no SAC handler can intercept the link
                a.addEventListener('click', (e) => e.stopPropagation());
                $('root').appendChild(a); a.click(); setTimeout(() => { URL.revokeObjectURL(a.href); a.remove(); }, 4000);
            }
            const CRC = (() => { const tb = new Uint32Array(256); for (let n = 0; n < 256; n++) { let c = n; for (let k = 0; k < 8; k++) c = c & 1 ? 0xEDB88320 ^ (c >>> 1) : c >>> 1; tb[n] = c >>> 0; } return tb; })();
            function crc32(u8) { let c = 0xFFFFFFFF; for (let i = 0; i < u8.length; i++) c = CRC[(c ^ u8[i]) & 255] ^ (c >>> 8); return (c ^ 0xFFFFFFFF) >>> 0; }
            function zip(entries) {
                const enc = new TextEncoder(); const parts = []; const central = []; let off = 0;
                const d = new Date(); const dt = ((d.getFullYear() - 1980) << 25) | ((d.getMonth() + 1) << 21) | (d.getDate() << 16) | (d.getHours() << 11) | (d.getMinutes() << 5) | (d.getSeconds() >> 1);
                const used = new Set();
                for (const e of entries) {
                    let name = e.name; let k = 2; while (used.has(name)) name = e.name.replace(/(\.pdf)?$/i, ' (' + (k++) + ')$1'); used.add(name);
                    const nb = enc.encode(name); const data = new Uint8Array(e.data); const crc = crc32(data);
                    const h = new DataView(new ArrayBuffer(30));
                    h.setUint32(0, 0x04034b50, true); h.setUint16(4, 20, true); h.setUint16(6, 0x0800, true); h.setUint16(8, 0, true);
                    h.setUint32(10, dt, true); h.setUint32(14, crc, true); h.setUint32(18, data.length, true); h.setUint32(22, data.length, true);
                    h.setUint16(26, nb.length, true); h.setUint16(28, 0, true);
                    parts.push(new Uint8Array(h.buffer), nb, data);
                    const c = new DataView(new ArrayBuffer(46));
                    c.setUint32(0, 0x02014b50, true); c.setUint16(4, 20, true); c.setUint16(6, 20, true); c.setUint16(8, 0x0800, true); c.setUint16(10, 0, true);
                    c.setUint32(12, dt, true); c.setUint32(16, crc, true); c.setUint32(20, data.length, true); c.setUint32(24, data.length, true);
                    c.setUint16(28, nb.length, true); c.setUint32(42, off, true);
                    central.push(new Uint8Array(c.buffer), nb);
                    off += 30 + nb.length + data.length;
                }
                const cdSize = central.reduce((n, p) => n + p.length, 0);
                const end = new DataView(new ArrayBuffer(22));
                end.setUint32(0, 0x06054b50, true); end.setUint16(8, entries.length, true); end.setUint16(10, entries.length, true);
                end.setUint32(12, cdSize, true); end.setUint32(16, off, true);
                return new Blob(parts.concat(central, [new Uint8Array(end.buffer)]), { type: 'application/zip' });
            }
            function downloadAll() {
                const done = doneFiles();
                if (!done.length) return;
                download(zip(done.map((f) => ({ name: outName(f.name), data: f.result.bytes }))), t('zipName'));
            }
            function summaryRows() {
                return files.map((f) => {
                    const r = f.result && f.result.report; const cs = r && checkSummary(r.checks); const b = r && r.before ? checkSummary(r.before) : null;
                    return { f, r, cs, b, altTodo: r ? altTodo(f) : '' };
                });
            }
            function downloadCsv() {
                const q = (v) => '"' + String(v == null ? '' : v).replace(/"/g, '""') + '"';
                const st = tx('csvStatus'); const ck = tx('csvCheck');
                const lines = [tx('csvHead').map(q).join(';')];
                summaryRows().forEach(({ f, r, cs, b, altTodo: todo }) => {
                    lines.push([f.name, f.status === 'done' ? outName(f.name) : '', f.status === 'done' ? st.done : f.status === 'error' ? st.error : st.open, r ? r.info.pages : '', b ? b.ok + '/' + b.total : '', cs ? cs.ok + '/' + cs.total : '', cs ? (cs.passed ? ck.passed : ck.open) : '', r ? r.info.title : '', r ? r.info.lang : '', todo,
                        r ? r.errors.concat(r.warnings).map((x) => x.msg).join(' | ') : (f.error || '')].map(q).join(';'));
                });
                download(new Blob(['﻿' + lines.join('\r\n')], { type: 'text/csv;charset=utf-8' }), t('csvName'));
            }
            function rerunAll() {
                if (busy()) return;
                const res = files.filter((f) => f.status === 'done' || f.status === 'error');
                if (!res.length) return;
                res.forEach(queue);
                startRun();
            }

            // ------------------------------------------------------------------ steps
            function canGo(n) {
                if (n === 1) return true;
                if (n === 2) return busy() || hasResults();
                return hasResults() && !busy();
            }
            function isDone(n) {
                if (n === 1) return busy() || hasResults();
                if (n === 2) return hasResults() && !busy() && !pendingReview().length;
                return false;
            }
            function updateStepper() {
                shadow.querySelectorAll('.step-btn').forEach((b) => {
                    const n = Number(b.dataset.step); const cur = n === step; const done = !cur && isDone(n);
                    b.disabled = !cur && !canGo(n);
                    if (cur) b.setAttribute('aria-current', 'step'); else b.removeAttribute('aria-current');
                    b.classList.toggle('done', done);
                    b.querySelector('.num').innerHTML = done ? ICON.check : String(n);
                    b.querySelector('.done-sr').hidden = !done;
                });
            }
            function goStep(n, userAction) {
                if (n !== step && !canGo(n)) return false;
                const prev = step; step = n;
                const a = shadow.activeElement;
                const focusInMain = !!a && $('main').contains(a);
                [1, 2, 3].forEach((i) => { $('step' + i).hidden = i !== n; });
                if (n === 1) { renderFiles(); renderSummary(); } else if (n === 2) renderStep2(); else renderResults();
                updateStepper();
                $('main').scrollTop = 0;
                // keep keyboard and screen-reader users oriented: the heading of the new step gets the focus
                if (userAction || focusInMain) $('s' + n + 'h').focus();
                else if (prev !== n) announce(t('annStep', n, t('step' + n)));
                if (prev !== n) host._fire('onStepChanged');
                return true;
            }

            // ------------------------------------------------------------------ settings drawer
            let drawerOpener = null;
            function openDrawer(opener) {
                if (!P().showSettings) return;
                drawerOpener = opener;
                renderLibrary();
                $('drawer').classList.add('open'); $('scrim').classList.add('open');
                $('openSettings').setAttribute('aria-expanded', 'true');
                $('topbar').inert = true; $('main').inert = true;
                $('closeSettings').focus();
            }
            function closeDrawer() {
                if (!$('drawer').classList.contains('open')) return;
                $('drawer').classList.remove('open'); $('scrim').classList.remove('open');
                $('openSettings').setAttribute('aria-expanded', 'false');
                $('topbar').inert = false; $('main').inert = false;
                const o = drawerOpener; drawerOpener = null;
                if (o && !o.hidden) o.focus();
            }
            function renderLibrary() {
                const keys = Object.keys(library).filter((k) => !library[k].alias);
                $('libCount').textContent = keys.length ? t('libCount', keys.length) : '';
                const box = $('lib');
                if (!keys.length) { box.innerHTML = '<p class="note">' + esc(t('libEmpty')) + '</p>'; return; }
                box.innerHTML = '<ul class="lib">' + keys.map((k) => {
                    const v = library[k]; const label = v.decorative ? t('decorativeShort') : v.alt;
                    return '<li>' + (v.thumb ? '<img src="' + esc(v.thumb) + '" alt="">' : '<span class="ph">' + esc(k.indexOf('vec:') === 0 ? t('libGraphic') : t('libImage')) + '</span>') +
                        '<span class="txt">' + (v.decorative ? '<i>' + esc(label) + '</i>' : esc(label)) + '</span>' +
                        '<button class="btn ghost sm" type="button" data-del="' + esc(k) + '" aria-label="' + esc(t('libDeleteFor', label)) + '">' + esc(t('libDelete')) + '</button></li>';
                }).join('') + '</ul><button class="btn sm" type="button" data-del-all>' + esc(t('libDeleteAll')) + '</button>';
            }
            function deleteFromLibrary(k) {
                delete library[k];
                Object.keys(library).forEach((x) => { if (library[x].alias === k) delete library[x]; });
                saveLibrary();
            }
            function confirmClear() { return window.confirm ? window.confirm(t('libConfirm')) : true; }

            // ------------------------------------------------------------------ language, texts, look
            function setLang(l, byUser) {
                if (UI_LANGS.indexOf(l) === -1) return false;
                lang = l;
                if (byUser && rememberLang()) store.set(LANG_KEY, l);
                applyLanguage();
                announce(t('annLang'));
                return true;
            }
            function applyLanguage() {
                $('root').setAttribute('lang', lang);
                shadow.querySelectorAll('[data-i18n]').forEach((el) => { el.textContent = t(el.dataset.i18n); });
                shadow.querySelectorAll('[data-i18n-aria]').forEach((el) => { el.setAttribute('aria-label', t(el.dataset.i18nAria)); });
                shadow.querySelectorAll('#langSwitch [data-lang]').forEach((b) => { b.setAttribute('aria-pressed', b.dataset.lang === lang ? 'true' : 'false'); });
                fillSelects();
                applyTexts();
                $('drawerNote').textContent = P().rememberSettings ? t('drawerNote') : t('drawerNoteSession');
                renderSummary(); renderFiles(); renderResults(); renderLibrary(); updateStepper();
                if (step === 2) renderStep2();
            }
            function applyTexts() {
                const title = propText('appTitle');
                $('appName').textContent = title;
                $('root').setAttribute('aria-label', title);
                $('tagline').textContent = propText('appTagline');
                $('logo').textContent = P().logoText;
            }
            function applyVisibility() {
                const p = P();
                $('brand').hidden = !p.showHeader;
                $('langSwitch').hidden = !p.showLanguageSwitch;
                $('openSettings').hidden = !p.showSettings;
                $('summaryBtn').hidden = !p.showSettings;
                $('libGroup').hidden = !p.showLibrary;
                $('aboutGroup').hidden = !p.showFooter;
                if (!p.showSettings) closeDrawer();
            }
            function applyLook() {
                const p = P(); const root = $('root');
                const scheme = ['light', 'dark', 'auto'].indexOf(p.colorScheme) !== -1 ? p.colorScheme : 'light';
                root.classList.remove('scheme-light', 'scheme-dark', 'scheme-auto');
                root.classList.add('scheme-' + scheme);
                let rgb = hexToRgb(p.accentColor);
                if (rgb) {
                    // darken a light accent until accent text, white text on it and its tints keep AA contrast
                    for (let i = 0; i < 40 && 1.05 / (luminance(rgb) + 0.05) < 5.5; i++) rgb = rgb.map((c) => Math.round(c * 0.92));
                    const soft = rgb.map((c) => Math.round(c * 0.1 + 255 * 0.9));
                    root.style.setProperty('--user-accent', '#' + rgb.map((c) => c.toString(16).padStart(2, '0')).join(''));
                    root.style.setProperty('--user-accent-soft', 'rgb(' + soft.join(',') + ')');
                    root.style.setProperty('--user-accent-ink', '#ffffff');
                } else {
                    ['--user-accent', '--user-accent-soft', '--user-accent-ink'].forEach((v) => root.style.removeProperty(v));
                }
                if (p.fontFamily && p.fontFamily.trim()) root.style.setProperty('--user-font', p.fontFamily); else root.style.removeProperty('--user-font');
                root.style.setProperty('--content-max', p.contentMaxWidth > 0 ? p.contentMaxWidth + 'px' : 'none');
            }
            function applyDefaults(reloadOverrides) {
                captureDefaults();
                if (reloadOverrides) loadSettings();
                $('drawerNote').textContent = P().rememberSettings ? t('drawerNote') : t('drawerNoteSession');
                applySettings(Object.assign({}, DEFAULTS, overrides));
                settingsChanged();
            }
            function applyProps(keys) {
                const has = (list) => !keys || keys.some((k) => list.indexOf(k) !== -1);
                const langKeys = ['uiLanguage', 'showLanguageSwitch', 'rememberSettings'];
                if (has(langKeys)) lang = initialLang();
                if (has(langKeys) || has(TEXT_KEYS)) applyLanguage();
                if (has(VISIBILITY_KEYS)) applyVisibility();
                if (has(LOOK_KEYS)) applyLook();
                const reload = has(['rememberSettings', 'showSettings']);
                if (reload || has(Object.values(SETTING_PROPS))) applyDefaults(reload);
            }

            // ------------------------------------------------------------------ wiring
            const rootEl = $('root');
            const fileOf = (li) => li && files.find((x) => x.id === Number(li.dataset.id));
            $('pick').addEventListener('click', () => $('file').click());
            $('pickDir').addEventListener('click', () => $('dir').click());
            $('file').addEventListener('change', (e) => { addFiles(e.target.files); e.target.value = ''; });
            $('dir').addEventListener('change', (e) => { addFiles(e.target.files); e.target.value = ''; });
            const drop = $('drop');
            ['dragenter', 'dragover'].forEach((tp) => drop.addEventListener(tp, (e) => { if (!hasFiles(e)) return; e.preventDefault(); drop.classList.add('over'); }));
            ['dragleave', 'drop'].forEach((tp) => drop.addEventListener(tp, (e) => { e.preventDefault(); drop.classList.remove('over'); }));
            drop.addEventListener('drop', (e) => { if (e.dataTransfer && e.dataTransfer.files) addFiles(e.dataTransfer.files); });
            // files dropped anywhere on the widget are added too; the rest of the SAC page is left alone
            rootEl.addEventListener('dragover', (e) => { if (hasFiles(e)) { e.preventDefault(); e.stopPropagation(); } });
            rootEl.addEventListener('drop', (e) => { if (!hasFiles(e)) return; e.preventDefault(); e.stopPropagation(); if (e.target.closest && !e.target.closest('#drop') && e.dataTransfer) addFiles(e.dataTransfer.files); });
            // typing in the widget must not trigger SAC keyboard shortcuts (e.g. Delete removes the widget)
            ['keydown', 'keyup', 'keypress'].forEach((tp) => rootEl.addEventListener(tp, (e) => {
                if (!isEditable(e.target) || e.key === 'Escape' || /^F\d+$/.test(e.key) || ((e.ctrlKey || e.metaKey) && /^s$/i.test(e.key))) return;
                e.stopPropagation();
            }));
            ['copy', 'cut', 'paste'].forEach((tp) => rootEl.addEventListener(tp, (e) => { if (isEditable(e.target)) e.stopPropagation(); }));

            shadow.querySelectorAll('.step-btn').forEach((b) => b.addEventListener('click', () => goStep(Number(b.dataset.step), true)));
            $('langSwitch').addEventListener('click', (e) => { const b = e.target.closest('[data-lang]'); if (b) setLang(b.dataset.lang, true); });
            $('openSettings').addEventListener('click', () => openDrawer($('openSettings')));
            $('summaryBtn').addEventListener('click', () => openDrawer($('summaryBtn')));
            $('closeSettings').addEventListener('click', closeDrawer);
            $('drawerDone').addEventListener('click', closeDrawer);
            $('scrim').addEventListener('click', closeDrawer);
            $('resetSettings').addEventListener('click', resetSettings);
            $('drawer').addEventListener('keydown', (e) => {
                if (e.key === 'Escape') { e.stopPropagation(); closeDrawer(); return; }
                if (e.key !== 'Tab') return;
                const items = Array.from($('drawer').querySelectorAll('button, input, select, textarea, [href]')).filter((el) => !el.disabled && el.getClientRects().length);
                if (!items.length) return;
                const first = items[0]; const last = items[items.length - 1];
                if (e.shiftKey && shadow.activeElement === first) { e.preventDefault(); last.focus(); } else if (!e.shiftKey && shadow.activeElement === last) { e.preventDefault(); first.focus(); }
            });
            $('lib').addEventListener('click', (e) => {
                const del = e.target.closest('[data-del]');
                if (del) { deleteFromLibrary(del.dataset.del); ($('lib').querySelector('[data-del]') || $('closeSettings')).focus(); return; }
                if (e.target.closest('[data-del-all]') && confirmClear()) { library = {}; saveLibrary(); $('closeSettings').focus(); }
            });

            // step 1
            $('correct').addEventListener('click', correct);
            $('clearAll').addEventListener('click', () => { clearAll(); $('pick').focus(); });
            $('fileList').addEventListener('click', (e) => {
                const btn = e.target.closest('[data-act]'); const li = e.target.closest('li[data-id]'); const f = fileOf(li);
                if (!btn || !f) return;
                if (btn.dataset.act === 'ov') { f.ovOpen = !f.ovOpen; renderFiles(); }
                else if (btn.dataset.act === 'remove') {
                    const i = files.indexOf(f); removeFile(f);
                    const rows = $('fileList').querySelectorAll('[data-act="remove"]');
                    (rows[Math.min(i, rows.length - 1)] || $('pick')).focus();
                }
            });
            ['input', 'change'].forEach((tp) => $('fileList').addEventListener(tp, (e) => {
                if (!e.target.matches('[data-ov]')) return;
                const li = e.target.closest('li[data-id]'); const f = fileOf(li); if (f) readOverrides(f, li);
            }));

            // step 2
            const figList = $('figList');
            function onAltEdited(li) {
                const g = groupOf(li); if (!g) return;
                const st = stateOf(g); const dec = li.querySelector('[data-dec]');
                st.alt = li.querySelector('[data-alt]').value; st.decorative = !!(dec && dec.checked); st.edited = true;
                li.querySelector('.fig-err').hidden = true; li.querySelector('[data-alt]').removeAttribute('aria-invalid');
                if (st.accepted) { st.accepted = false; setAccepted(li, false); }
                updateReviewBar();
            }
            figList.addEventListener('click', (e) => {
                const li = e.target.closest('li.fig'); if (!li) return;
                const chip = e.target.closest('[data-sugg]');
                if (chip) { const input = li.querySelector('[data-alt]'); input.value = chip.dataset.sugg; onAltEdited(li); input.focus(); return; }
                if (e.target.closest('[data-act="accept"]') && acceptItem(li)) focusNextFrom(li);
            });
            figList.addEventListener('input', (e) => { if (e.target.matches('[data-alt]')) onAltEdited(e.target.closest('li.fig')); });
            figList.addEventListener('change', (e) => { if (e.target.matches('[data-dec]')) onAltEdited(e.target.closest('li.fig')); });
            figList.addEventListener('keydown', (e) => {
                if (e.key !== 'Enter' || e.isComposing || !e.target.matches('[data-alt]')) return;
                e.preventDefault();
                const li = e.target.closest('li.fig');
                if (acceptItem(li)) focusNextFrom(li);
            });
            $('acceptAll').addEventListener('click', acceptAll);
            $('continue').addEventListener('click', continueReview);
            $('showAll').addEventListener('change', (e) => { showAll = e.target.checked; renderStep2(); });

            // step 3
            $('zipAll').addEventListener('click', downloadAll);
            $('csvAll').addEventListener('click', downloadCsv);
            $('rerunAll').addEventListener('click', rerunAll);
            $('addMore').addEventListener('click', () => { goStep(1, true); $('pick').focus(); });
            $('resultList').addEventListener('click', (e) => {
                const btn = e.target.closest('[data-act]'); const li = e.target.closest('li[data-id]'); const f = fileOf(li);
                if (!btn || !f) return;
                const a = btn.dataset.act;
                if (a === 'dl') download(new Blob([f.result.bytes], { type: 'application/pdf' }), outName(f.name));
                else if (a === 'report') download(new Blob([reportHTML(f)], { type: 'text/html' }), f.name.replace(/\.pdf$/i, '') + t('reportSuffix'));
                else if (a === 'toggle') { f.open = !f.open; renderResults(); }
                else if (a === 'rerun') { readOverrides(f, li); queue(f); startRun(); }
                else if (a === 'remove') { removeFile(f); ($('resultList').querySelector('[data-act]') || $('addMore')).focus(); }
                else if (a === 'edit-alts') { showAll = true; goStep(2, true); }
            });
            $('resultList').addEventListener('change', (e) => {
                const li = e.target.closest('li[data-id]'); const f = fileOf(li); if (!f) return;
                if (e.target.matches('[data-filter]')) {
                    f.onlyFailed = e.target.checked;
                    const det = e.target.closest('details');
                    det.querySelector('table.checks').classList.toggle('only-failed', f.onlyFailed);
                    det.querySelector('[data-allok]').hidden = !(f.onlyFailed && !det.querySelector('tr.fail'));
                } else if (e.target.matches('[data-ov]')) readOverrides(f, li);
            });
            $('resultList').addEventListener('input', (e) => {
                if (!e.target.matches('[data-ov]')) return;
                const li = e.target.closest('li[data-id]'); const f = fileOf(li); if (f) readOverrides(f, li);
            });

            // ------------------------------------------------------------------ scripting API
            function fileSummary(row) {
                const { f, r, cs, b, altTodo: todo } = row;
                return {
                    file: f.name, output: f.status === 'done' ? outName(f.name) : '', status: f.status, pages: r ? r.info.pages : null,
                    rulesBefore: b ? b.ok + '/' + b.total : '', rulesAfter: cs ? cs.ok + '/' + cs.total : '', passed: !!(f.status === 'done' && cs && cs.passed && !r.errors.length),
                    verdict: f.status === 'done' || f.status === 'error' ? ({ ok: 'ok', warn: 'hints', err: 'error' })[verdict(f).cls] : '',
                    title: r ? r.info.title || '' : '', lang: r ? r.info.lang || '' : '', altTextsToReview: todo === '' ? 0 : todo,
                    messages: r ? r.errors.concat(r.warnings).map((x) => x.msg) : (f.error ? [f.error] : [])
                };
            }
            const api = {
                applyProps,
                fileCount: () => files.length,
                doneCount: () => doneFiles().length,
                passedCount: () => doneFiles().filter((f) => f.result.report.checks && f.result.report.checks.passed && !f.result.report.errors.length).length,
                summary: () => summaryRows().map(fileSummary),
                lastProcessed: () => (lastDone && files.indexOf(lastDone) !== -1 ? fileSummary(summaryRows().find((x) => x.f === lastDone)) : null),
                startAll: correct, rerunAll, clearAll, downloadAll, downloadCsv, resetSettings,
                openFilePicker: () => $('file').click(),
                openFolderPicker: () => $('dir').click(),
                getSetting: (k) => (Object.prototype.hasOwnProperty.call(settings(), k) ? settings()[k] : undefined),
                setSetting(k, v) {
                    const id = fieldOf(k); if (!id) return false;
                    const el = $(id); const val = el.type === 'checkbox' ? (v === true || v === 'true') : String(v == null ? '' : v);
                    if (!validValue(k, val)) return false;
                    if (el.type === 'checkbox') el.checked = val; else el.value = val;
                    recordSetting(k, val); settingsChanged(); return true;
                },
                engineMode: () => (!started ? 'idle' : inline ? 'inline' : 'worker'),
                uiLanguage: () => lang,
                setUiLanguage: (l) => setLang(String(l || '').toLowerCase(), false),
                step: () => step,
                goToStep: (n) => goStep(Number(n), false),
                destroy() {
                    destroyed = true;
                    if (worker) { try { worker.terminate(); } catch (e) { /* already gone */ } }
                    worker = null; pending.clear();
                }
            };

            lang = initialLang();
            loadSettings(); applyProps(null); goStep(1);
            host.__pdfua = { files, addFiles, library: () => library, mode: () => (inline ? 'inline' : 'worker') };
            return api;
        }

        class BITPdfUa extends HTMLElement {
            constructor() {
                super();
                this._shadowRoot = this.attachShadow({ mode: 'open' });
                this._shadowRoot.appendChild(tmpl.content.cloneNode(true));
                this._props = {};
                Object.keys(PROPS).forEach((k) => { this._props[k] = PROPS[k][1]; });
                // values assigned before the element was upgraded
                Object.keys(PROPS).forEach((k) => {
                    if (Object.prototype.hasOwnProperty.call(this, k)) { const v = this[k]; delete this[k]; this._props[k] = coerce(k, v); }
                });
                this._app = createApp(this, this._shadowRoot);
            }

            connectedCallback() {}

            onCustomWidgetBeforeUpdate(changedProperties) {}

            onCustomWidgetAfterUpdate(changedProperties) {
                // SAC may pass values that did not change (e.g. echoes of our own propertiesChanged)
                const keys = Object.keys(changedProperties || {}).filter((k) => k in PROPS && coerce(k, changedProperties[k]) !== this._props[k]);
                keys.forEach((k) => { this._props[k] = coerce(k, changedProperties[k]); });
                if (keys.length) this._app.applyProps(keys);
            }

            onCustomWidgetResize(width, height) {}

            onCustomWidgetDestroy() { this._app.destroy(); }

            _fire(name) { this.dispatchEvent(new Event(name)); }

            _setProps(values) {
                const keys = Object.keys(values);
                keys.forEach((k) => { this._props[k] = values[k]; });
                this._app.applyProps(keys);
                this.dispatchEvent(new CustomEvent('propertiesChanged', { detail: { properties: values } }));
            }

            // Scriptable methods
            getFileCount() { return this._app.fileCount(); }
            getDoneCount() { return this._app.doneCount(); }
            getPassedCount() { return this._app.passedCount(); }
            getSummary() { return JSON.stringify(this._app.summary()); }
            getLastResult() { const r = this._app.lastProcessed(); return r ? JSON.stringify(r) : ''; }
            getLastProcessedFile() { const r = this._app.lastProcessed(); return r ? r.file : ''; }
            startAll() { this._app.startAll(); }
            rerunAll() { this._app.rerunAll(); }
            clearAll() { this._app.clearAll(); }
            downloadAll() { this._app.downloadAll(); }
            downloadCsv() { this._app.downloadCsv(); }
            openFilePicker() { this._app.openFilePicker(); }
            openFolderPicker() { this._app.openFolderPicker(); }
            getSetting(key) { const v = this._app.getSetting(key); return v === undefined ? '' : String(v); }
            setSetting(key, value) { this._app.setSetting(key, value); }
            resetSettings() { this._app.resetSettings(); }
            getEngineMode() { return this._app.engineMode(); }
            getUiLanguage() { return this._app.uiLanguage(); }
            setUiLanguage(language) { this._app.setUiLanguage(language); }
            getStep() { return this._app.step(); }
            goToStep(step) { this._app.goToStep(step); }
            getText(key) {
                if (TEXT_KEYS.indexOf(key) === -1) return '';
                return this._props[key] || '';
            }
            setText(key, value) {
                if (TEXT_KEYS.indexOf(key) === -1) return;
                this._setProps({ [key]: value == null ? '' : String(value) });
            }
            setVisibility(key, visible) {
                if (VISIBILITY_KEYS.indexOf(key) === -1) return;
                this._setProps({ [key]: !!visible });
            }
        }

        // get/set for every widget property
        Object.keys(PROPS).forEach((key) => {
            Object.defineProperty(BITPdfUa.prototype, key, {
                get() { return this._props[key]; },
                set(v) {
                    const c = coerce(key, v);
                    if (c === this._props[key]) return;
                    this._props[key] = c;
                    this._app.applyProps([key]);
                },
                configurable: true
            });
        });

        if (!customElements.get('bit-pdfua-widget')) customElements.define('bit-pdfua-widget', BITPdfUa);
    })();
})();
