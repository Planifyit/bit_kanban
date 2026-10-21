/* BIT PDF/UA-Korrektur – SAP Analytics Cloud custom widget (main web component).
 * Port of the stand-alone program PDF-UA-Korrektur.html. build.py inserts the PDF/UA engine
 * (pdf-lib, fonts and the remediation/check modules) as the function PDFUA_ENGINE below. The
 * engine runs in a Web Worker; if the tenant's Content Security Policy blocks blob: workers it
 * runs on the main thread instead. No eval, no inline <script>, no global variables. */
(function () {
    /* @@PDFUA_ENGINE@@ */

    (function () {
        'use strict';

        const LANGS = [['de-CH', 'Deutsch (Schweiz)'], ['fr-CH', 'Französisch (Schweiz)'], ['it-CH', 'Italienisch (Schweiz)'], ['rm-CH', 'Rätoromanisch'], ['en', 'Englisch'], ['de-DE', 'Deutsch (Deutschland)'], ['de-AT', 'Deutsch (Österreich)'], ['fr-FR', 'Französisch (Frankreich)'], ['it-IT', 'Italienisch (Italien)'], ['auto', 'Automatisch erkennen']];
        const DEFAULT_FONT = 'system-ui, -apple-system, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif';
        const DEFAULT_TAGLINE = 'Macht PDF-Dateien automatisch barrierefrei (PDF/UA-1). Alles läuft lokal in Ihrem Browser – keine Datei verlässt Ihren Computer.';

        // widget properties: name -> [type, default]; keep in sync with pdfuaWidget.json
        const PROPS = {
            appTitle: ['string', 'PDF/UA-Korrektur'],
            appTagline: ['string', DEFAULT_TAGLINE],
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
        const TEXT_KEYS = ['appTitle', 'appTagline', 'logoText'];
        const VISIBILITY_KEYS = ['showHeader', 'showSettings', 'showLibrary', 'showFooter'];
        const LOOK_KEYS = ['colorScheme', 'accentColor', 'fontFamily', 'contentMaxWidth'];
        // setting key (as in the stand-alone program) -> widget property with its story default
        const SETTING_PROPS = { lang: 'defaultLang', title: 'defaultTitleMode', logoAlt: 'defaultLogoAlt', imgAlt: 'defaultImgAlt', chartAlt: 'defaultChartAlt', suffix: 'defaultSuffix', existing: 'defaultExisting', bookmarks: 'defaultBookmarks', running: 'defaultRunning', autostart: 'defaultAutostart' };

        function coerce(key, v) {
            const [type, def] = PROPS[key];
            if (type === 'boolean') return v === true || v === 'true' ? true : v === false || v === 'false' ? false : def;
            if (type === 'integer') { const n = parseInt(v, 10); return isNaN(n) ? def : n; }
            return v === null || v === undefined ? def : String(v);
        }

        const tmpl = document.createElement('template');
        tmpl.innerHTML = `
<style>
:host { display: block; width: 100%; height: 100%; }
.pdfua {
  --bg: #f6f7f9; --surface: #ffffff; --surface-2: #f0f2f5; --text: #1b1f24; --muted: #5b6470; --border: #d9dde3;
  --accent: var(--user-accent, #0b5f8a); --accent-ink: var(--user-accent-ink, #ffffff); --accent-soft: var(--user-accent-soft, #e3f0f7);
  --ok: #1d7a3e; --ok-soft: #e4f4ea; --warn: #8a5a00; --warn-soft: #fbf1dc; --err: #b3261e; --err-soft: #fbe7e5;
  --focus: #f0a400; --radius: 10px; --shadow: 0 1px 2px rgba(16,24,40,.06), 0 1px 3px rgba(16,24,40,.08);
}
.pdfua.scheme-dark {
  --bg: #12161b; --surface: #1a2027; --surface-2: #222a33; --text: #e7ebf0; --muted: #9aa5b1; --border: #313b46;
  --accent: #5db3e0; --accent-ink: #0b1620; --accent-soft: #16303f;
  --ok: #6fd391; --ok-soft: #173325; --warn: #f0c060; --warn-soft: #3a2f16; --err: #ff8a80; --err-soft: #3d1c1a;
  --shadow: none;
}
@media (prefers-color-scheme: dark) {
  .pdfua.scheme-auto {
    --bg: #12161b; --surface: #1a2027; --surface-2: #222a33; --text: #e7ebf0; --muted: #9aa5b1; --border: #313b46;
    --accent: #5db3e0; --accent-ink: #0b1620; --accent-soft: #16303f;
    --ok: #6fd391; --ok-soft: #173325; --warn: #f0c060; --warn-soft: #3a2f16; --err: #ff8a80; --err-soft: #3d1c1a;
    --shadow: none;
  }
}
* { box-sizing: border-box; }
[hidden] { display: none !important; }
.pdfua { width: 100%; height: 100%; overflow: auto; margin: 0; background: var(--bg); color: var(--text); font: 15px/1.5 var(--user-font, system-ui, -apple-system, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif); container-type: inline-size; }
a { color: var(--accent); }
:focus-visible { outline: 3px solid var(--focus); outline-offset: 2px; border-radius: 4px; }
.wrap { max-width: var(--content-max, 1080px); margin: 0 auto; padding: 0 16px; }
header.app { background: var(--surface); border-bottom: 1px solid var(--border); }
header.app .wrap { display: flex; align-items: center; gap: 14px; padding-top: 18px; padding-bottom: 18px; }
.logo { width: 40px; height: 40px; border-radius: 10px; background: var(--accent); color: var(--accent-ink); display: grid; place-items: center; font-weight: 700; font-size: 13px; letter-spacing: .02em; flex: none; }
h1 { font-size: 20px; margin: 0; line-height: 1.2; }
.tagline { margin: 2px 0 0; color: var(--muted); font-size: 14px; }
.panel { background: var(--surface); border: 1px solid var(--border); border-radius: var(--radius); box-shadow: var(--shadow); }
.drop { padding: 28px 20px; text-align: center; border: 2px dashed var(--border); border-radius: var(--radius); background: var(--surface); transition: border-color .15s, background .15s; }
.drop.over { border-color: var(--accent); background: var(--accent-soft); }
.drop p { margin: 6px 0; }
.drop .hint { color: var(--muted); font-size: 13.5px; }
.btn { display: inline-flex; align-items: center; gap: 6px; border: 1px solid var(--border); background: var(--surface); color: var(--text); padding: 8px 14px; border-radius: 8px; font: inherit; font-weight: 600; cursor: pointer; text-decoration: none; }
.btn:hover { background: var(--surface-2); }
.btn.primary { background: var(--accent); border-color: var(--accent); color: var(--accent-ink); }
.btn.primary:hover { filter: brightness(1.07); }
.btn.small { padding: 5px 10px; font-size: 13.5px; font-weight: 600; }
.btn[disabled] { opacity: .5; cursor: not-allowed; }
.btn.link { border: none; background: none; padding: 4px 6px; color: var(--accent); font-weight: 600; }
.row { display: flex; gap: 10px; flex-wrap: wrap; align-items: center; }
.space { flex: 1; }
details.settings { margin-top: 16px; }
details.settings > summary, details.sub > summary { cursor: pointer; font-weight: 600; padding: 12px 16px; list-style: none; display: flex; align-items: center; gap: 8px; }
details.settings > summary::-webkit-details-marker, details.sub > summary::-webkit-details-marker { display: none; }
details > summary .chev { transition: transform .15s; display: inline-block; }
details[open] > summary .chev { transform: rotate(90deg); }
.settings .grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(240px, 1fr)); gap: 14px 18px; padding: 4px 16px 16px; }
label.f { display: flex; flex-direction: column; gap: 4px; font-size: 13.5px; color: var(--muted); font-weight: 600; }
label.f input[type=text], label.f select, textarea, input.t, select.t { font: inherit; color: var(--text); background: var(--surface); border: 1px solid var(--border); border-radius: 7px; padding: 7px 9px; }
label.c { display: flex; gap: 8px; align-items: flex-start; font-size: 14px; }
.toolbar { display: flex; flex-wrap: wrap; gap: 8px; align-items: center; margin: 22px 0 10px; }
.toolbar .count { color: var(--muted); font-size: 14px; }
.files { display: flex; flex-direction: column; gap: 10px; }
.file { padding: 12px 14px; }
.file .head { display: flex; gap: 12px; align-items: center; flex-wrap: wrap; }
.file .name { font-weight: 650; word-break: break-word; }
.file .meta { color: var(--muted); font-size: 13px; }
.pill { display: inline-flex; align-items: center; gap: 6px; padding: 3px 10px; border-radius: 999px; font-size: 13px; font-weight: 650; white-space: nowrap; }
.pill.ok { background: var(--ok-soft); color: var(--ok); }
.pill.warn { background: var(--warn-soft); color: var(--warn); }
.pill.err { background: var(--err-soft); color: var(--err); }
.pill.run, .pill.queue { background: var(--surface-2); color: var(--muted); }
.progress { height: 6px; background: var(--surface-2); border-radius: 99px; overflow: hidden; margin-top: 8px; }
.progress > i { display: block; height: 100%; background: var(--accent); width: 0; transition: width .2s; }
.details { border-top: 1px solid var(--border); margin-top: 12px; padding-top: 12px; display: grid; gap: 14px; }
.details h3 { font-size: 14.5px; margin: 0 0 6px; }
.details ul { margin: 0; padding-left: 20px; }
.details li { margin: 2px 0; }
.kv { display: grid; grid-template-columns: repeat(auto-fit, minmax(220px, 1fr)); gap: 10px; }
.kv .box { background: var(--surface-2); border-radius: 8px; padding: 8px 10px; font-size: 13.5px; }
.kv .box b { display: block; font-size: 12px; color: var(--muted); font-weight: 650; }
.figs { display: grid; grid-template-columns: repeat(auto-fill, minmax(230px, 1fr)); gap: 10px; }
.fig { border: 1px solid var(--border); border-radius: 8px; padding: 8px; display: grid; gap: 6px; background: var(--surface); }
.fig .thumb { height: 110px; display: grid; place-items: center; background: var(--surface-2); border-radius: 6px; overflow: hidden; color: var(--muted); font-size: 13px; text-align: center; padding: 4px; }
.fig .thumb img, .fig .thumb canvas { max-width: 100%; max-height: 104px; }
.fig textarea { width: 100%; min-height: 54px; resize: vertical; }
.fig .src { font-size: 12px; color: var(--muted); }
table.checks { width: 100%; border-collapse: collapse; font-size: 13.5px; }
table.checks th, table.checks td { text-align: left; padding: 5px 8px; border-bottom: 1px solid var(--border); vertical-align: top; }
table.checks th { color: var(--muted); font-weight: 650; font-size: 12.5px; }
table.checks td.id { white-space: nowrap; color: var(--muted); font-variant-numeric: tabular-nums; }
.st-ok { color: var(--ok); font-weight: 650; } .st-err { color: var(--err); font-weight: 650; }
.note { font-size: 13.5px; color: var(--muted); }
.callout { border-radius: 8px; padding: 9px 12px; font-size: 14px; }
.callout.err { background: var(--err-soft); color: var(--err); }
.callout.warn { background: var(--warn-soft); color: var(--warn); }
.lib { padding: 4px 16px 16px; display: grid; gap: 8px; }
.lib .item { display: flex; gap: 10px; align-items: center; border-bottom: 1px solid var(--border); padding: 6px 0; }
.lib .item img { width: 48px; height: 48px; object-fit: contain; background: var(--surface-2); border-radius: 6px; }
.lib .item .txt { flex: 1; font-size: 14px; }
footer.app { color: var(--muted); font-size: 13px; padding: 20px 0 40px; border-top: 1px solid var(--border); }
.sr-only { position: absolute; width: 1px; height: 1px; padding: 0; margin: -1px; overflow: hidden; clip: rect(0,0,0,0); border: 0; }
@container (max-width: 600px) { .file .head { align-items: flex-start; } .toolbar .space { display: none; } }
ol.outline { margin: 4px 0 0; padding-left: 26px; font-size: 13.5px; max-height: 360px; overflow: auto; }
ol.outline li { margin: 3px 0; }
.tag { display: inline-block; font-size: 11.5px; font-weight: 700; padding: 1px 7px; border-radius: 6px; background: var(--surface-2); color: var(--muted); margin-right: 4px; }
.tag-H1, .tag-H2, .tag-H3, .tag-H4, .tag-H5, .tag-H6 { background: var(--accent-soft); color: var(--accent); }
.tag-Table, .tag-L { background: var(--ok-soft); color: var(--ok); }
.tag-Figure { background: var(--warn-soft); color: var(--warn); }
/* step layout: 1 settings, 2 add files, 3 files */
.setpanel { padding: 14px 16px 12px; margin-bottom: 18px; }
.sethead { display: flex; flex-wrap: wrap; align-items: baseline; gap: 4px 14px; margin-bottom: 10px; }
.sethead h2, .steph { font-size: 16px; margin: 0; display: flex; align-items: center; gap: 8px; }
.steph { margin: 0 0 10px; }
.sethead .note { margin: 0; }
.stepno { display: inline-grid; place-items: center; width: 22px; height: 22px; border-radius: 50%; background: var(--accent); color: var(--accent-ink); font-size: 12.5px; font-weight: 700; flex: none; }
.setpanel .grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(240px, 1fr)); gap: 14px 18px; }
.setpanel .g2 { grid-template-columns: minmax(220px, 1fr) minmax(280px, 2fr); margin-bottom: 14px; }
.setpanel .g3 { grid-template-columns: repeat(3, minmax(180px, 1fr)); }
.setpanel .autostart { margin-top: 14px; }
@container (max-width: 760px) { .setpanel .g2, .setpanel .g3 { grid-template-columns: 1fr; } }
.setpanel details.more { margin-top: 12px; border-top: 1px solid var(--border); }
.setpanel details.more > summary { padding: 10px 0; }
.setpanel details.more .grid { padding: 2px 0 8px; }
.setfoot { margin-top: 10px; justify-content: flex-end; }
.prerun { border-top: 1px solid var(--border); margin-top: 12px; padding-top: 12px; display: grid; grid-template-columns: minmax(220px, 2fr) minmax(180px, 1fr) minmax(180px, 1fr) auto; gap: 10px 12px; align-items: end; }
.prerun label.f { margin: 0; }
.prerun .note { grid-column: 1 / -1; margin: 0; }
@container (max-width: 760px) { .prerun { grid-template-columns: 1fr; } }
</style>
<section class="pdfua scheme-light" id="root" aria-label="PDF/UA-Korrektur">
<header class="app" id="appHeader">
  <div class="wrap">
    <div class="logo" aria-hidden="true" id="logo">UA</div>
    <div>
      <h1 id="appTitle">PDF/UA-Korrektur</h1>
      <p class="tagline" id="appTagline"></p>
    </div>
  </div>
</header>

<div class="wrap">
  <section class="panel setpanel" aria-labelledby="set-h" id="setPanel">
    <div class="sethead">
      <h2 id="set-h"><span class="stepno" aria-hidden="true">1</span> Einstellungen</h2>
      <p class="note" id="setNote">Gelten für alle Dateien und bleiben in diesem Browser gespeichert. Pro Datei lässt sich alles vor dem Start überschreiben.</p>
    </div>
    <div class="grid g2">
      <label class="f">Dokumentsprache
        <select id="optLang">
          ${LANGS.map(([v, n]) => '<option value="' + v + '">' + n + '</option>').join('')}
        </select>
      </label>
      <label class="f">Dokumenttitel
        <select id="optTitle">
          <option value="keep">Vorhandenen Titel behalten, sonst aus dem Inhalt</option>
          <option value="content">Immer aus dem Inhalt (Hauptüberschrift)</option>
          <option value="filename">Aus dem Dateinamen</option>
        </select>
      </label>
    </div>
    <div class="grid g3">
      <label class="f">Alternativtext für Logos
        <input type="text" id="optLogoAlt" value="Logo">
      </label>
      <label class="f">Alternativtext für Bilder
        <input type="text" id="optImgAlt" value="Abbildung">
      </label>
      <label class="f">Alternativtext für Diagramme
        <input type="text" id="optChartAlt" value="Diagramm">
      </label>
    </div>
    <label class="c autostart"><input type="checkbox" id="optAutostart"> Dateien sofort nach dem Hinzufügen verarbeiten (ohne Anpassung pro Datei)</label>
    <details class="sub more">
      <summary><span class="chev" aria-hidden="true">▸</span> Weitere Einstellungen</summary>
      <div class="grid">
        <label class="f">Zusatz im Dateinamen
          <input type="text" id="optSuffix" value="_barrierefrei">
        </label>
        <label class="f">Bereits getaggte PDFs
          <select id="optExisting">
            <option value="auto">Automatisch: gute Tags behalten, fehlerhafte neu erstellen</option>
            <option value="retag">Tags immer neu erstellen</option>
            <option value="keep">Vorhandene Tags immer behalten (nur reparieren)</option>
          </select>
        </label>
        <label class="c"><input type="checkbox" id="optBookmarks" checked> Lesezeichen aus Überschriften erstellen (wenn keine vorhanden)</label>
        <label class="c"><input type="checkbox" id="optRunning" checked> Wiederkehrende Kopf-/Fusszeilen als Artefakt markieren</label>
      </div>
    </details>
    <div class="row setfoot"><button class="btn small" id="resetSettings" type="button">Standardeinstellungen wiederherstellen</button></div>
  </section>

  <section aria-labelledby="add-h">
    <h2 id="add-h" class="steph"><span class="stepno" aria-hidden="true" data-step="2">2</span> Dateien hinzufügen</h2>
    <div class="drop" id="drop">
      <p><strong>PDF-Dateien hierher ziehen</strong></p>
      <p class="row" style="justify-content:center">
        <button class="btn primary" id="pick" type="button">Dateien auswählen …</button>
        <button class="btn" id="pickDir" type="button">Ordner auswählen …</button>
      </p>
      <p class="hint" id="dropHint">Mehrere Dateien möglich. Die Dateien erscheinen zuerst in der Liste – dort können Sie pro Datei Titel, Sprache und Logo-Text anpassen und dann die Verarbeitung starten.</p>
      <input type="file" id="file" accept=".pdf,application/pdf" multiple hidden>
      <input type="file" id="dir" webkitdirectory multiple hidden>
    </div>
  </section>

  <section aria-labelledby="list-h">
    <div class="toolbar">
      <h2 id="list-h" class="steph" style="margin:0"><span class="stepno" aria-hidden="true" data-step="3">3</span> Dateien</h2>
      <span class="count" id="count" aria-live="polite"></span>
      <span class="space"></span>
      <button class="btn small primary" id="startAll" type="button" disabled>Verarbeitung starten</button>
      <button class="btn small" id="zipAll" type="button" disabled>Alle herunterladen (ZIP)</button>
      <button class="btn small" id="csvAll" type="button" disabled>Übersicht (CSV)</button>
      <button class="btn small" id="rerunAll" type="button" disabled>Alle neu verarbeiten</button>
      <button class="btn small" id="clearAll" type="button" disabled>Liste leeren</button>
    </div>
    <div class="files" id="files"></div>
    <p class="note" id="empty">Noch keine Dateien. Ziehen Sie PDFs in das Feld oben oder wählen Sie sie aus.</p>
  </section>

  <details class="settings panel" id="libBox">
    <summary><span class="chev" aria-hidden="true">▸</span> Gespeicherte Alternativtexte <span id="libCount" class="note"></span></summary>
    <div class="lib" id="lib"></div>
  </details>
</div>

<footer class="app" id="appFooter">
  <div class="wrap">
    <p><strong>Was das Programm automatisch korrigiert:</strong> Tags/Strukturbaum (Überschriften, Absätze, Listen, Tabellen mit Kopfzellen – auch über mehrere Seiten –, Abbildungen, Diagramme, Formeln, Fussnoten, Links, Formularfelder), Lesereihenfolge, Artefakte (Kopf-/Fusszeilen, Seitenzahlen, wiederholte Tabellenköpfe, Hintergründe, unsichtbarer Text), Unicode-Zuordnung der Schriften, Einbettung fehlender Schriften, Glyphenbreiten, Dokumentsprache, Titel, Titelanzeige, Lesezeichen, XMP-Metadaten mit PDF/UA-Kennung, Tab-Reihenfolge und Beschreibungen von Links, Formularfeldern und Anmerkungen.</p>
    <p><strong>Was eine Person prüfen sollte:</strong> ob die Alternativtexte von Bildern, Diagrammen und Formeln den Inhalt treffend beschreiben und ob die erkannte Struktur inhaltlich stimmt. Die integrierte Prüfung deckt die maschinell prüfbaren Regeln von PDF/UA-1 ab (Regelnummern wie bei veraPDF). Gescannte PDFs ohne Text brauchen zuerst eine Texterkennung (OCR); sie werden nicht als PDF/UA gekennzeichnet.</p>
  </div>
</footer>

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

        /** The user interface of PDF-UA-Korrektur.html, bound to one widget instance and its shadow root. */
        function createApp(host, shadow) {
            const $ = (id) => shadow.getElementById(id);
            const P = () => host._props;
            const esc = (s) => String(s == null ? '' : s).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
            const store = {
                get(k, d) { try { const v = localStorage.getItem(k); return v ? JSON.parse(v) : d; } catch (e) { return d; } },
                set(k, v) { try { localStorage.setItem(k, JSON.stringify(v)); } catch (e) { /* storage unavailable */ } },
            };

            // ------------------------------------------------------------------ settings
            // Defaults come from the widget properties (story design). Changes made in the widget are kept
            // as overrides of those defaults and, if allowed, remembered in this browser.
            const OVERRIDES_KEY = 'pdfua-sac-settings-v1'; const LIB_KEY = 'pdfua-alt-library-v1';
            const fields = { optLang: 'lang', optTitle: 'title', optLogoAlt: 'logoAlt', optImgAlt: 'imgAlt', optChartAlt: 'chartAlt', optSuffix: 'suffix', optBookmarks: 'bookmarks', optRunning: 'running', optExisting: 'existing', optAutostart: 'autostart' };
            const langName = (v) => { const l = LANGS.find((x) => x[0] === v); return l ? l[1] : v; };
            let DEFAULTS = {}; let overrides = {};
            function fieldOf(k) { return Object.keys(fields).find((id) => fields[id] === k); }
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
                const where = P().showSettings ? 'mit den Einstellungen oben' : 'mit den Standard-Einstellungen';
                $('dropHint').textContent = settings().autostart
                    ? 'Mehrere Dateien möglich. Die Verarbeitung startet sofort ' + where + '.'
                    : 'Mehrere Dateien möglich. Die Dateien erscheinen zuerst in der Liste – dort können Sie pro Datei Titel, Sprache und Logo-Text anpassen und dann die Verarbeitung starten.';
                files.forEach((f) => { if (f.status === 'ready') renderFile(f); }); // placeholders show the current settings
            }
            function resetSettings() {
                overrides = {}; saveSettings(); applySettings(DEFAULTS); settingsChanged(); announce('Standardeinstellungen wiederhergestellt.');
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
                            try { engine = inlineEngine(); } catch (e) { onMessage({ id, type: 'error', message: 'Die Verarbeitung konnte nicht gestartet werden: ' + ((e && e.message) || e) }); resolve(); return; }
                            engine.handleJob(msg, (m) => { onMessage(m); if (m.type !== 'progress') resolve(); });
                        }, 0);
                    }));
                }
            }

            // ------------------------------------------------------------------ files
            const files = []; let nextId = 1; let running = false; let processedSinceIdle = false; let lastDone = null;
            function outName(name) {
                const s = settings().suffix || '';
                return name.replace(/\.pdf$/i, '') + s + '.pdf';
            }
            async function addFiles(list) {
                const arr = Array.from(list).filter((f) => /\.pdf$/i.test(f.name) || f.type === 'application/pdf');
                if (!arr.length) { announce('Keine PDF-Dateien gefunden.'); return; }
                for (const f of arr) {
                    const buf = await f.arrayBuffer();
                    const item = { id: nextId++, name: f.name, size: f.size, bytes: buf, status: settings().autostart ? 'queued' : 'ready', overrides: {}, altOverrides: {}, open: false };
                    files.push(item); renderFile(item);
                }
                updateToolbar(); host._fire('onFilesAdded'); pump();
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
            function pump() {
                if (running) return;
                const f = files.find((x) => x.status === 'queued');
                if (!f) {
                    updateToolbar();
                    if (processedSinceIdle) { processedSinceIdle = false; host._fire('onQueueFinished'); }
                    return;
                }
                running = true; f.status = 'running'; f.stage = 'Start'; f.frac = 0.02; renderFile(f);
                runJob(f.id, f.bytes, buildOpts(f), (m) => {
                    if (m.type === 'progress') { f.stage = m.stage; f.frac = m.frac; renderProgress(f); return; }
                    pending.delete(f.id);
                    if (m.type === 'done') {
                        f.result = { bytes: m.bytes, report: m.report };
                        f.status = m.bytes ? 'done' : 'error';
                        if (!m.bytes) f.error = (m.report.errors[0] && m.report.errors[0].msg) || 'Unbekannter Fehler';
                        const c = m.report.checks;
                        announce(f.name + ': ' + (m.bytes ? (c && c.passed ? 'fertig, PDF/UA-Prüfung bestanden.' : 'fertig, mit offenen Punkten.') : 'Fehler.'));
                    } else { f.status = 'error'; f.error = m.message; announce(f.name + ': Fehler bei der Verarbeitung.'); }
                    renderFile(f); running = false; updateToolbar();
                    processedSinceIdle = true; lastDone = f; host._fire('onFileProcessed');
                    pump();
                });
            }

            // ------------------------------------------------------------------ rendering
            function announce(t) { $('live').textContent = t; }
            function fmtSize(n) { return n > 1048576 ? (n / 1048576).toFixed(1) + ' MB' : Math.max(1, Math.round(n / 1024)) + ' KB'; }
            function checkSummary(c) { if (!c) return null; const ok = c.items.filter((i) => i.ok).length; return { ok, total: c.items.length, passed: c.passed }; }
            function statusPill(f) {
                if (f.status === 'ready') return '<span class="pill queue">Bereit</span>';
                if (f.status === 'queued') return '<span class="pill queue">Wartet</span>';
                if (f.status === 'running') return '<span class="pill run">In Arbeit …</span>';
                if (f.status === 'error') return '<span class="pill err">Fehler</span>';
                const r = f.result.report; const cs = checkSummary(r.checks);
                if (r.errors.some((e) => e.code === 'no-text')) return '<span class="pill err" title="Die Datei enthält nur Bilder von Text">Texterkennung (OCR) nötig</span>';
                if (r.errors.length) return '<span class="pill warn">Mit Einschränkungen</span>';
                const altTodo = (r.figures || []).filter((x) => !x.decorative && (x.source === 'default' || x.source === 'logo' || x.source === 'formula')).length;
                const altPill = altTodo ? ' <span class="pill warn" title="Automatisch gesetzte Alternativtexte bitte prüfen">Alt-Texte prüfen (' + altTodo + ')</span>' : '';
                if (cs && cs.passed) return '<span class="pill ok">✓ PDF/UA-Prüfung bestanden</span>' + altPill;
                return '<span class="pill warn">' + (cs ? (cs.total - cs.ok) + ' Regel(n) offen' : 'Fertig') + '</span>';
            }
            function renderFile(f) {
                if (!f.el) {
                    f.el = document.createElement('article'); f.el.className = 'file panel'; f.el.setAttribute('aria-label', f.name);
                    $('files').appendChild(f.el);
                }
                const r = f.result && f.result.report;
                const pages = r && r.info.pages ? r.info.pages + ' Seite' + (r.info.pages === 1 ? '' : 'n') + ' · ' : '';
                f.el.innerHTML = '<div class="head">' +
                    '<div style="flex:1;min-width:200px"><div class="name">' + esc(f.name) + '</div><div class="meta">' + pages + fmtSize(f.size) + (f.status === 'done' ? ' → ' + fmtSize(f.result.bytes.byteLength) : '') + '</div></div>' +
                    statusPill(f) +
                    '<div class="row">' +
                    (f.status === 'ready' ? '<button class="btn small primary" data-act="start" type="button" aria-label="' + esc(f.name) + ' starten">Starten</button>' : '') +
                    (f.status === 'done' ? '<button class="btn small primary" data-act="dl" type="button">Herunterladen</button><button class="btn small" data-act="report" type="button">Prüfbericht</button>' : '') +
                    (r ? '<button class="btn small" data-act="toggle" type="button" aria-expanded="' + (f.open ? 'true' : 'false') + '">' + (f.open ? 'Details ausblenden' : 'Details') + '</button>' : '') +
                    '<button class="btn small link" data-act="remove" type="button" aria-label="' + esc(f.name) + ' entfernen">Entfernen</button>' +
                    '</div></div>' +
                    (f.status === 'running' ? '<div class="progress" role="progressbar" aria-label="Fortschritt" aria-valuemin="0" aria-valuemax="100" aria-valuenow="' + Math.round((f.frac || 0) * 100) + '"><i style="width:' + Math.round((f.frac || 0) * 100) + '%"></i></div><div class="meta" data-stage>' + esc(stageText(f.stage)) + '</div>' : '') +
                    (f.status === 'ready' ? overrideForm(f, null) : '') +
                    (f.status === 'error' && !r ? '<div class="callout err" style="margin-top:10px">' + esc(f.error || 'Fehler') + '</div>' : '') +
                    (r && f.open ? detailsHTML(f, r) : '');
                bindCard(f);
                if (r && f.open) drawThumbs(f, r);
                $('empty').hidden = files.length > 0;
            }
            /** per-file title / language / logo text; before the run (info = null) or to re-create a processed file */
            function overrideForm(f, info) {
                const s = settings(); const ov = f.overrides; const pre = !info;
                const titlePh = s.title === 'filename' ? 'aus dem Dateinamen' : (s.title === 'content' ? 'automatisch aus dem Inhalt' : 'vorhandener Titel oder aus dem Inhalt');
                const titleVal = pre ? (ov.title || '') : (ov.title || info.title || '');
                return '<div class="prerun">' +
                    (pre ? '<p class="note">Optional – leer lassen, um ' + (P().showSettings ? 'die Einstellungen oben' : 'die Standard-Einstellungen') + ' zu verwenden.</p>' : '') +
                    '<label class="f">Titel<input class="t" type="text" data-ov="title" value="' + esc(titleVal) + '" placeholder="' + esc(titlePh) + '"></label>' +
                    '<label class="f">Sprache<select class="t" data-ov="lang"><option value=""' + (!ov.lang ? ' selected' : '') + '>wie Einstellungen (' + esc(langName(s.lang)) + ')</option>' +
                    LANGS.map(([v, n]) => '<option value="' + v + '"' + (ov.lang === v ? ' selected' : '') + '>' + esc(n) + '</option>').join('') + '</select></label>' +
                    '<label class="f">Alternativtext für Logos<input class="t" type="text" data-ov="logoAlt" value="' + esc(ov.logoAlt || '') + '" placeholder="' + esc(s.logoAlt || 'Logo') + '"></label>' +
                    (pre ? '<span></span>' : '<button class="btn small" data-act="rerun" type="button">Neu erstellen</button>') +
                    '</div>';
            }
            function readOverrides(f) {
                const q = (k) => f.el.querySelector('[data-ov="' + k + '"]');
                const t = q('title') ? q('title').value.trim() : ''; const l = q('lang') ? q('lang').value : ''; const lg = q('logoAlt') ? q('logoAlt').value.trim() : '';
                const computed = f.result && f.result.report.info.title;
                const o = {};
                if (t && t !== computed) o.title = t; else if (t && f.overrides.title) o.title = f.overrides.title;
                if (l) o.lang = l;
                if (lg) o.logoAlt = lg;
                f.overrides = o;
            }
            function stageText(s) { return ({ Start: 'Wird gelesen …', Analyse: 'Inhalt wird analysiert …', Layout: 'Struktur wird erkannt …', Tags: 'Tags werden geschrieben …', Schriften: 'Schriften werden repariert …', Speichern: 'Wird gespeichert …', 'Prüfung': 'PDF/UA-Prüfung …', Fertig: 'Fertig' })[s] || s || ''; }
            function renderProgress(f) {
                if (!f.el) return;
                const bar = f.el.querySelector('.progress');
                if (!bar) { renderFile(f); return; }
                const pct = Math.round((f.frac || 0) * 100);
                bar.setAttribute('aria-valuenow', pct); bar.firstChild.style.width = pct + '%';
                const st = f.el.querySelector('[data-stage]'); if (st) st.textContent = stageText(f.stage);
            }
            function figGroups(r) {
                const map = new Map();
                for (const fg of r.figures || []) {
                    const k = fg.hash || ('p' + fg.page + ':' + fg.bbox.join(','));
                    if (!map.has(k)) map.set(k, Object.assign({ key: k, count: 0, pages: [] }, fg));
                    const g = map.get(k); g.count++; if (!g.pages.includes(fg.page + 1)) g.pages.push(fg.page + 1);
                }
                return Array.from(map.values());
            }
            function detailsHTML(f, r) {
                const cs = checkSummary(r.checks); const before = r.before ? checkSummary(r.before) : null;
                const info = r.info || {};
                let h = '<div class="details">';
                for (const e of r.errors) h += '<div class="callout err">' + esc(e.msg) + '</div>';
                h += '<div class="kv">' +
                    '<div class="box"><b>Titel</b>' + esc(info.title || '–') + '</div>' +
                    '<div class="box"><b>Sprache</b>' + esc(info.lang || '–') + '</div>' +
                    '<div class="box"><b>Automatische PDF/UA-Prüfung</b>' + (cs ? (before ? 'vorher ' + before.ok + '/' + before.total + ' → ' : '') + 'nachher ' + cs.ok + '/' + cs.total + ' Regeln erfüllt' : '–') + '</div>' +
                    '<div class="box"><b>Erkannte Struktur</b>' + structSummary(r) + '</div></div>';
                // per-file overrides
                h += '<div><h3>Titel, Sprache und Logo-Text anpassen</h3>' + overrideForm(f, info) + '</div>';
                const groups = figGroups(r);
                if (groups.length) {
                    h += '<div><h3>Abbildungen und Alternativtexte (' + groups.length + ')</h3><p class="note" style="margin:0 0 8px">Beschreiben Sie, was das Bild aussagt. Gespeicherte Texte werden bei allen künftigen Dateien mit demselben Bild automatisch verwendet. „Dekorativ“ blendet das Bild für Screenreader aus.</p><div class="figs">';
                    groups.forEach((g, i) => {
                        const ov = f.altOverrides[g.key] || library[g.key] || (g.phash ? library[g.phash] : null);
                        const alt = ov && ov.alt !== undefined ? ov.alt : g.alt;
                        const dec = ov ? !!ov.decorative : !!g.decorative;
                        const src = ov ? 'gespeichert' : ({ default: 'automatisch', logo: 'automatisch (Logo)', settings: 'aus Einstellungen', caption: 'aus Bildunterschrift', formula: 'automatisch gelesen', tags: 'aus vorhandenen Tags', library: 'gespeichert' }[g.source] || g.source);
                        h += '<div class="fig" data-key="' + esc(g.key) + '"><div class="thumb" data-thumb="' + i + '">' + (g.formula ? 'Formel' : g.vector ? 'Vektorgrafik / Diagramm' : 'Bild') + '</div>' +
                            '<div class="src">Seite ' + g.pages.slice(0, 6).join(', ') + (g.pages.length > 6 ? ' …' : '') + (g.count > 1 ? ' · ' + g.count + '×' : '') + ' · ' + esc(src) + '</div>' +
                            '<label class="sr-only" for="alt-' + f.id + '-' + i + '">Alternativtext</label><textarea id="alt-' + f.id + '-' + i + '" data-alt>' + esc(alt) + '</textarea>' +
                            (g.formula ? '' : '<label class="c"><input type="checkbox" data-dec' + (dec ? ' checked' : '') + '> Dekorativ (kein Alternativtext)</label>') + '</div>';
                    });
                    h += '</div><div class="row" style="margin-top:8px"><button class="btn small primary" data-act="saveAlts" type="button">Speichern und neu erstellen</button></div></div>';
                }
                if (r.outline && r.outline.length) {
                    const names = { H1: 'Überschrift 1', H2: 'Überschrift 2', H3: 'Überschrift 3', H4: 'Überschrift 4', H5: 'Überschrift 5', H6: 'Überschrift 6', P: 'Absatz', Table: 'Tabelle', L: 'Liste', Figure: 'Abbildung', Formula: 'Formel', Note: 'Fussnote', Link: 'Link', Form: 'Formularfeld', Annot: 'Anmerkung' };
                    h += '<details class="sub"><summary><span class="chev" aria-hidden="true">▸</span> Erkannte Struktur in Lesereihenfolge (' + r.outline.length + (r.outline.length >= 400 ? '+' : '') + ' Elemente)</summary><ol class="outline">' +
                        r.outline.map((o) => '<li><span class="tag tag-' + esc(o.type) + '">' + esc(names[o.type] || o.type) + '</span> ' + esc(o.text) + ' <span class="note">S. ' + o.page + '</span></li>').join('') + '</ol></details>';
                }
                if (r.fixes.length) h += '<div><h3>Durchgeführte Korrekturen</h3><ul>' + r.fixes.map((x) => '<li>' + esc(x.msg) + '</li>').join('') + '</ul></div>';
                if (r.warnings.length) h += '<div><h3>Hinweise</h3><ul>' + r.warnings.map((x) => '<li>' + esc(x.msg) + '</li>').join('') + '</ul></div>';
                if (r.checks) {
                    const items = r.checks.items.slice().sort((a, b) => (a.ok === b.ok ? 0 : a.ok ? 1 : -1));
                    h += '<details class="sub"><summary><span class="chev" aria-hidden="true">▸</span> Prüfprotokoll (' + cs.ok + '/' + cs.total + ' Regeln erfüllt)</summary><table class="checks"><thead><tr><th>Regel</th><th>Anforderung</th><th>Ergebnis</th></tr></thead><tbody>' +
                        items.map((i) => '<tr><td class="id">' + esc(i.id) + '</td><td>' + esc(i.title) + (i.details && i.details.length ? '<div class="note">' + esc(i.details.join('; ')) + '</div>' : '') + '</td><td class="' + (i.ok ? 'st-ok">erfüllt' : 'st-err">nicht erfüllt') + '</td></tr>').join('') +
                        '</tbody></table></details>';
                }
                h += '</div>';
                return h;
            }
            function reportHTML(f) {
                const r = f.result.report; const cs = checkSummary(r.checks); const b = r.before ? checkSummary(r.before) : null;
                const li = (arr) => arr.map((x) => '<li>' + esc(x.msg) + '</li>').join('');
                const rows = (r.checks ? r.checks.items : []).map((i) => '<tr><td>' + esc(i.id) + '</td><td>' + esc(i.title) + (i.details && i.details.length ? '<br><small>' + esc(i.details.join('; ')) + '</small>' : '') + '</td><td>' + (i.ok ? 'erfüllt' : '<b>nicht erfüllt</b>') + '</td></tr>').join('');
                const figs = figGroups(r).map((g) => '<tr><td>' + g.pages.join(', ') + '</td><td>' + (g.decorative ? '<i>dekorativ</i>' : esc(g.alt)) + '</td></tr>').join('');
                return '<!doctype html><html lang="de"><head><meta charset="utf-8"><title>Prüfbericht ' + esc(f.name) + '</title><style>body{font:14px/1.5 system-ui,sans-serif;max-width:900px;margin:24px auto;padding:0 16px;color:#1b1f24}table{border-collapse:collapse;width:100%}td,th{border-bottom:1px solid #ddd;padding:4px 6px;text-align:left;vertical-align:top}h1{font-size:20px}h2{font-size:16px;margin-top:22px}</style></head><body>' +
                    '<h1>Prüfbericht Barrierefreiheit (PDF/UA-1)</h1><p><b>Datei:</b> ' + esc(f.name) + ' → ' + esc(outName(f.name)) + '<br><b>Erstellt:</b> ' + esc(new Date().toLocaleString('de-CH')) + '<br><b>Titel:</b> ' + esc(r.info.title) + '<br><b>Sprache:</b> ' + esc(r.info.lang) + '<br><b>Seiten:</b> ' + esc(r.info.pages) + '</p>' +
                    '<p><b>Automatische Prüfung:</b> ' + (b ? 'vorher ' + b.ok + '/' + b.total + ', ' : '') + 'nachher ' + (cs ? cs.ok + '/' + cs.total : '–') + ' maschinell prüfbare Regeln erfüllt (Regelnummern nach veraPDF-Profil PDF/UA-1).</p>' +
                    (r.errors.length ? '<h2>Fehler</h2><ul>' + li(r.errors) + '</ul>' : '') +
                    '<h2>Durchgeführte Korrekturen</h2><ul>' + li(r.fixes) + '</ul>' + (r.warnings.length ? '<h2>Hinweise (manuell prüfen)</h2><ul>' + li(r.warnings) + '</ul>' : '') +
                    (figs ? '<h2>Alternativtexte</h2><table><tr><th>Seite(n)</th><th>Alternativtext</th></tr>' + figs + '</table>' : '') +
                    '<h2>Prüfprotokoll</h2><table><tr><th>Regel</th><th>Anforderung</th><th>Ergebnis</th></tr>' + rows + '</table>' +
                    '<p><small>Nicht maschinell prüfbar und daher manuell zu kontrollieren: inhaltliche Richtigkeit der Alternativtexte, sinnvolle Lesereihenfolge, korrekte Auszeichnung von Überschriften und Tabellen, Farbkontraste.</small></p></body></html>';
            }
            function structSummary(r) {
                const c = r.counts || {}; const parts = [];
                if (r.info.structElements) parts.push(r.info.structElements + ' Tags');
                if (c.tables) parts.push(c.tables + ' Tabelle' + (c.tables > 1 ? 'n' : ''));
                if (c.lists) parts.push(c.lists + ' Liste' + (c.lists > 1 ? 'n' : ''));
                const nf = (r.figures || []).filter((x) => !x.formula).length;
                if (nf) parts.push(nf + ' Abbildung' + (nf > 1 ? 'en' : ''));
                if (c.formulas) parts.push(c.formulas + ' Formel' + (c.formulas > 1 ? 'n' : ''));
                if (c.notes) parts.push(c.notes + ' Fussnote' + (c.notes > 1 ? 'n' : ''));
                return esc(parts.join(' · ') || '–');
            }
            function drawThumbs(f, r) {
                const groups = figGroups(r);
                groups.forEach((g, i) => {
                    const box = f.el.querySelector('[data-thumb="' + i + '"]'); if (!box) return;
                    const lib = library[g.key];
                    if (g.thumb) {
                        const c = document.createElement('canvas'); c.width = g.thumb.w; c.height = g.thumb.h;
                        c.getContext('2d').putImageData(new ImageData(new Uint8ClampedArray(g.thumb.rgba), g.thumb.w, g.thumb.h), 0, 0);
                        c.setAttribute('role', 'img'); c.setAttribute('aria-label', 'Vorschau');
                        box.textContent = ''; box.appendChild(c); g._canvas = c;
                    } else if (g.jpeg) {
                        const img = document.createElement('img'); img.alt = 'Vorschau';
                        const dataUrl = () => 'data:image/jpeg;base64,' + bytesToBase64(new Uint8Array(g.jpeg));
                        if (blobImagesBlocked) img.src = dataUrl();
                        else {
                            const url = URL.createObjectURL(new Blob([g.jpeg], { type: 'image/jpeg' }));
                            // if the Content Security Policy does not allow blob: images, use a data: URL
                            img.onerror = () => { img.onerror = null; blobImagesBlocked = true; URL.revokeObjectURL(url); img.src = dataUrl(); };
                            img.src = url;
                        }
                        box.textContent = ''; box.appendChild(img); g._img = img;
                    } else if (lib && lib.thumb) {
                        const img = document.createElement('img'); img.alt = 'Vorschau'; img.src = lib.thumb; box.textContent = ''; box.appendChild(img);
                    }
                });
                f._groups = groups;
            }
            function smallThumb(g) {
                try {
                    const src = g._canvas || g._img; if (!src) return null;
                    const w = src.width || src.naturalWidth; const h = src.height || src.naturalHeight; if (!w || !h) return null;
                    const s = Math.min(1, 64 / Math.max(w, h)); const c = document.createElement('canvas');
                    c.width = Math.max(1, Math.round(w * s)); c.height = Math.max(1, Math.round(h * s));
                    c.getContext('2d').drawImage(src, 0, 0, c.width, c.height);
                    return c.toDataURL('image/jpeg', 0.75);
                } catch (e) { return null; }
            }
            function bindCard(f) {
                f.el.querySelectorAll('[data-act]').forEach((b) => b.addEventListener('click', () => act(f, b.dataset.act)));
                if (f.status === 'ready') f.el.querySelectorAll('[data-ov]').forEach((el) => { el.addEventListener('input', () => readOverrides(f)); el.addEventListener('change', () => readOverrides(f)); });
            }
            function act(f, a) {
                if (a === 'dl') download(new Blob([f.result.bytes], { type: 'application/pdf' }), outName(f.name));
                else if (a === 'report') download(new Blob([reportHTML(f)], { type: 'text/html' }), f.name.replace(/\.pdf$/i, '') + '_Pruefbericht.html');
                else if (a === 'toggle') { f.open = !f.open; renderFile(f); const b = f.el.querySelector('[data-act="toggle"]'); if (b) b.focus(); }
                else if (a === 'remove') { const i = files.indexOf(f); if (i >= 0 && f.status !== 'running') { files.splice(i, 1); f.el.remove(); updateToolbar(); $('empty').hidden = files.length > 0; } }
                else if (a === 'rerun') { readOverrides(f); requeue(f); }
                else if (a === 'start') { readOverrides(f); f.status = 'queued'; renderFile(f); updateToolbar(); pump(); }
                else if (a === 'saveAlts') {
                    (f._groups || []).forEach((g) => {
                        const card = f.el.querySelector('.fig[data-key="' + cssEsc(g.key) + '"]'); if (!card) return;
                        const alt = card.querySelector('[data-alt]').value.trim(); const decBox = card.querySelector('[data-dec]'); const dec = !!(decBox && decBox.checked);
                        if (!dec && !alt) return;
                        const prev = library[g.key];
                        const entry = { alt, decorative: dec, thumb: (prev && prev.thumb) || smallThumb(g), saved: new Date().toISOString().slice(0, 10) };
                        library[g.key] = entry;
                        if (g.phash) library[g.phash] = Object.assign({}, entry, { thumb: null, alias: g.key });
                    });
                    saveLibrary(); requeue(f);
                }
            }
            function cssEsc(s) { return (window.CSS && CSS.escape) ? CSS.escape(s) : s.replace(/["\\]/g, '\\$&'); }
            function requeue(f) { f.status = 'queued'; f.result = null; f.open = true; renderFile(f); updateToolbar(); pump(); }
            function updateToolbar() {
                const done = files.filter((f) => f.status === 'done').length;
                const passed = files.filter((f) => f.status === 'done' && f.result.report.checks && f.result.report.checks.passed && !f.result.report.errors.length).length;
                const busy = files.some((f) => f.status === 'running' || f.status === 'queued');
                const ready = files.filter((f) => f.status === 'ready').length;
                $('count').textContent = files.length ? files.length + ' Datei' + (files.length === 1 ? '' : 'en') + (ready ? ' · ' + ready + ' bereit' : '') + ' · ' + done + ' fertig · ' + passed + ' bestanden' + (busy ? ' · in Arbeit …' : '') : '';
                $('startAll').disabled = ready === 0; $('startAll').textContent = ready > 1 ? 'Verarbeitung starten (' + ready + ')' : 'Verarbeitung starten';
                $('zipAll').disabled = done === 0; $('csvAll').disabled = done === 0; $('rerunAll').disabled = !files.some((f) => f.status === 'done' || f.status === 'error') || busy; $('clearAll').disabled = !files.length || busy;
            }

            // ------------------------------------------------------------------ library
            function renderLibrary() {
                const keys = Object.keys(library).filter((k) => !library[k].alias);
                $('libCount').textContent = keys.length ? '(' + keys.length + ')' : '(leer)';
                const box = $('lib');
                if (!keys.length) { box.innerHTML = '<p class="note">Noch keine gespeicherten Alternativtexte. Sie entstehen, wenn Sie bei einer Datei Alternativtexte speichern.</p>'; return; }
                box.innerHTML = keys.map((k) => { const v = library[k]; return '<div class="item">' + (v.thumb ? '<img src="' + esc(v.thumb) + '" alt="">' : '<span class="note" style="width:48px">' + (k.startsWith('vec:') ? 'Grafik' : 'Bild') + '</span>') + '<div class="txt">' + (v.decorative ? '<em>dekorativ</em>' : esc(v.alt)) + '</div><button class="btn small link" type="button" data-del="' + esc(k) + '">Löschen</button></div>'; }).join('') +
                    '<div class="row"><button class="btn small" type="button" id="libClear">Alle löschen</button></div>';
                box.querySelectorAll('[data-del]').forEach((b) => b.addEventListener('click', () => {
                    const k = b.dataset.del; delete library[k];
                    Object.keys(library).forEach((x) => { if (library[x].alias === k) delete library[x]; });
                    saveLibrary();
                }));
                $('libClear').addEventListener('click', () => { if (confirmClear()) { library = {}; saveLibrary(); } });
            }
            function confirmClear() { return window.confirm ? window.confirm('Alle gespeicherten Alternativtexte löschen?') : true; }

            // ------------------------------------------------------------------ downloads & zip
            function download(blob, name) {
                const a = document.createElement('a'); a.href = URL.createObjectURL(blob); a.download = name;
                // keep the click inside the widget so no SAC handler can intercept the link
                a.addEventListener('click', (e) => e.stopPropagation());
                $('root').appendChild(a); a.click(); setTimeout(() => { URL.revokeObjectURL(a.href); a.remove(); }, 4000);
            }
            const CRC = (() => { const t = new Uint32Array(256); for (let n = 0; n < 256; n++) { let c = n; for (let k = 0; k < 8; k++) c = c & 1 ? 0xEDB88320 ^ (c >>> 1) : c >>> 1; t[n] = c >>> 0; } return t; })();
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

            // ------------------------------------------------------------------ wiring
            function downloadAll() {
                const done = files.filter((f) => f.status === 'done');
                if (!done.length) return;
                download(zip(done.map((f) => ({ name: outName(f.name), data: f.result.bytes }))), 'PDF-UA-Korrektur.zip');
            }
            function summaryRows() {
                return files.map((f) => {
                    const r = f.result && f.result.report; const cs = r && checkSummary(r.checks); const b = r && r.before ? checkSummary(r.before) : null;
                    const altTodo = r ? (r.figures || []).filter((x) => !x.decorative && (x.source === 'default' || x.source === 'logo' || x.source === 'formula')).length : '';
                    return { f, r, cs, b, altTodo };
                });
            }
            function downloadCsv() {
                const q = (v) => '"' + String(v == null ? '' : v).replace(/"/g, '""') + '"';
                const lines = [['Datei', 'Ausgabe', 'Status', 'Seiten', 'Regeln vorher', 'Regeln nachher', 'PDF/UA-Prüfung', 'Titel', 'Sprache', 'Abbildungen mit Standard-Alternativtext', 'Fehler/Hinweise'].map(q).join(';')];
                summaryRows().forEach(({ f, r, cs, b, altTodo }) => {
                    lines.push([f.name, f.status === 'done' ? outName(f.name) : '', f.status === 'done' ? 'fertig' : f.status === 'error' ? 'Fehler' : 'offen', r ? r.info.pages : '', b ? b.ok + '/' + b.total : '', cs ? cs.ok + '/' + cs.total : '', cs ? (cs.passed ? 'bestanden' : 'offen') : '', r ? r.info.title : '', r ? r.info.lang : '', altTodo,
                        r ? r.errors.concat(r.warnings).map((x) => x.msg).join(' | ') : (f.error || '')].map(q).join(';'));
                });
                download(new Blob(['\ufeff' + lines.join('\r\n')], { type: 'text/csv;charset=utf-8' }), 'PDF-UA-Korrektur_Uebersicht.csv');
            }
            function startAll() { files.forEach((f) => { if (f.status === 'ready') { readOverrides(f); f.status = 'queued'; renderFile(f); } }); updateToolbar(); pump(); }
            function rerunAll() {
                if (files.some((f) => f.status === 'running' || f.status === 'queued')) return;
                files.forEach((f) => { if (f.status === 'done' || f.status === 'error') { f.status = 'queued'; f.result = null; renderFile(f); } }); updateToolbar(); pump();
            }
            function clearAll() { files.slice().forEach((f) => { if (f.status !== 'running') { files.splice(files.indexOf(f), 1); f.el.remove(); } }); updateToolbar(); $('empty').hidden = files.length > 0; }

            $('pick').addEventListener('click', () => $('file').click());
            $('pickDir').addEventListener('click', () => $('dir').click());
            $('file').addEventListener('change', (e) => { addFiles(e.target.files); e.target.value = ''; });
            $('dir').addEventListener('change', (e) => { addFiles(e.target.files); e.target.value = ''; });
            const drop = $('drop');
            ['dragenter', 'dragover'].forEach((t) => drop.addEventListener(t, (e) => { if (!hasFiles(e)) return; e.preventDefault(); drop.classList.add('over'); }));
            ['dragleave', 'drop'].forEach((t) => drop.addEventListener(t, (e) => { e.preventDefault(); drop.classList.remove('over'); }));
            drop.addEventListener('drop', (e) => { if (e.dataTransfer && e.dataTransfer.files) addFiles(e.dataTransfer.files); });
            // files dropped anywhere on the widget are added too; the rest of the SAC page is left alone
            const rootEl = $('root');
            rootEl.addEventListener('dragover', (e) => { if (hasFiles(e)) { e.preventDefault(); e.stopPropagation(); } });
            rootEl.addEventListener('drop', (e) => { if (!hasFiles(e)) return; e.preventDefault(); e.stopPropagation(); if (e.target.closest && !e.target.closest('#drop') && e.dataTransfer) addFiles(e.dataTransfer.files); });
            // typing in the widget must not trigger SAC keyboard shortcuts (e.g. Delete removes the widget)
            ['keydown', 'keyup', 'keypress'].forEach((t) => rootEl.addEventListener(t, (e) => {
                if (!isEditable(e.target) || e.key === 'Escape' || /^F\d+$/.test(e.key) || ((e.ctrlKey || e.metaKey) && /^s$/i.test(e.key))) return;
                e.stopPropagation();
            }));
            ['copy', 'cut', 'paste'].forEach((t) => rootEl.addEventListener(t, (e) => { if (isEditable(e.target)) e.stopPropagation(); }));
            $('zipAll').addEventListener('click', downloadAll);
            $('csvAll').addEventListener('click', downloadCsv);
            $('startAll').addEventListener('click', startAll);
            $('rerunAll').addEventListener('click', rerunAll);
            $('resetSettings').addEventListener('click', resetSettings);
            $('clearAll').addEventListener('click', clearAll);

            // ------------------------------------------------------------------ widget properties
            function applyTexts() {
                const p = P();
                $('appTitle').textContent = p.appTitle;
                $('appTagline').textContent = p.appTagline;
                $('logo').textContent = p.logoText;
                $('root').setAttribute('aria-label', p.appTitle || 'PDF/UA-Korrektur');
            }
            function applyVisibility() {
                const p = P();
                $('appHeader').hidden = !p.showHeader;
                $('setPanel').hidden = !p.showSettings;
                $('libBox').hidden = !p.showLibrary;
                $('appFooter').hidden = !p.showFooter;
                // without the settings panel the remaining steps are numbered 1 and 2
                shadow.querySelectorAll('[data-step]').forEach((el) => { el.textContent = String(Number(el.dataset.step) - (p.showSettings ? 0 : 1)); });
            }
            function applyLook() {
                const p = P(); const root = $('root');
                const scheme = ['light', 'dark', 'auto'].indexOf(p.colorScheme) !== -1 ? p.colorScheme : 'light';
                root.classList.remove('scheme-light', 'scheme-dark', 'scheme-auto');
                root.classList.add('scheme-' + scheme);
                const rgb = hexToRgb(p.accentColor);
                if (rgb) {
                    // soft tint and readable ink derived from the accent, like the program's own palette
                    const soft = rgb.map((c) => Math.round(c * 0.12 + 255 * 0.88));
                    const lum = (0.2126 * rgb[0] + 0.7152 * rgb[1] + 0.0722 * rgb[2]) / 255;
                    root.style.setProperty('--user-accent', p.accentColor.trim());
                    root.style.setProperty('--user-accent-soft', 'rgb(' + soft.join(',') + ')');
                    root.style.setProperty('--user-accent-ink', lum > 0.6 ? '#1b1f24' : '#ffffff');
                } else {
                    ['--user-accent', '--user-accent-soft', '--user-accent-ink'].forEach((v) => root.style.removeProperty(v));
                }
                if (p.fontFamily && p.fontFamily.trim()) root.style.setProperty('--user-font', p.fontFamily); else root.style.removeProperty('--user-font');
                root.style.setProperty('--content-max', p.contentMaxWidth > 0 ? p.contentMaxWidth + 'px' : 'none');
            }
            function applyDefaults(reloadOverrides) {
                captureDefaults();
                if (reloadOverrides) loadSettings();
                $('setNote').textContent = (P().rememberSettings ? 'Gelten für alle Dateien und bleiben in diesem Browser gespeichert.' : 'Gelten für alle Dateien.') + ' Pro Datei lässt sich alles vor dem Start überschreiben.';
                applySettings(Object.assign({}, DEFAULTS, overrides));
                settingsChanged();
            }
            function applyProps(keys) {
                const has = (list) => !keys || keys.some((k) => list.indexOf(k) !== -1);
                if (has(TEXT_KEYS)) applyTexts();
                if (has(VISIBILITY_KEYS)) applyVisibility();
                if (has(LOOK_KEYS)) applyLook();
                const reload = has(['rememberSettings', 'showSettings']);
                if (reload || has(Object.values(SETTING_PROPS))) applyDefaults(reload);
            }

            // ------------------------------------------------------------------ scripting API
            function fileSummary(row) {
                const { f, r, cs, b, altTodo } = row;
                return {
                    file: f.name, output: f.status === 'done' ? outName(f.name) : '', status: f.status, pages: r ? r.info.pages : null,
                    rulesBefore: b ? b.ok + '/' + b.total : '', rulesAfter: cs ? cs.ok + '/' + cs.total : '', passed: !!(f.status === 'done' && cs && cs.passed && !r.errors.length),
                    title: r ? r.info.title || '' : '', lang: r ? r.info.lang || '' : '', altTextsToReview: altTodo === '' ? 0 : altTodo,
                    messages: r ? r.errors.concat(r.warnings).map((x) => x.msg) : (f.error ? [f.error] : [])
                };
            }
            const api = {
                applyProps,
                fileCount: () => files.length,
                doneCount: () => files.filter((f) => f.status === 'done').length,
                passedCount: () => files.filter((f) => f.status === 'done' && f.result.report.checks && f.result.report.checks.passed && !f.result.report.errors.length).length,
                summary: () => summaryRows().map(fileSummary),
                lastProcessed: () => (lastDone && files.indexOf(lastDone) !== -1 ? fileSummary(summaryRows().find((x) => x.f === lastDone)) : null),
                startAll, rerunAll, clearAll, downloadAll, downloadCsv, resetSettings,
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
                destroy() {
                    destroyed = true;
                    if (worker) { try { worker.terminate(); } catch (e) { /* already gone */ } }
                    worker = null; pending.clear();
                }
            };

            loadSettings(); applyProps(null); renderLibrary(); updateToolbar();
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
