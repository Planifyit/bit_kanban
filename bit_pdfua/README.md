# BIT PDF/UA-Korrektur – SAC Custom Widget

The stand-alone program `PDF-UA-Korrektur.html` as an SAP Analytics Cloud custom widget. Same engine,
interface in three steps – *Hochladen · Prüfen · Herunterladen* – in German, French and Italian. PDF
files are made accessible (PDF/UA-1) and checked entirely in the browser; no file leaves the
computer. The widget needs no data binding.

1. **Hochladen** – files or a whole folder, the file list below; *Korrigieren* starts with the
   current settings, a one-line summary opens the settings drawer.
2. **Prüfen** – live progress per file, then only the alternative texts that need a person: image
   next to its suggested text, inline editing, Enter accepts and moves on, *Alle übernehmen*,
   suggestions from the saved texts (also for similar images). Skipped when nothing needs checking.
3. **Herunterladen** – status per file (*PDF/UA erfüllt*, *Hinweise* or *Fehler*) with its own
   download, ZIP and CSV; *Details anzeigen* shows outline, corrections and the check log
   (filterable to failed rules); *Erneut verarbeiten*.

Interface texts are German, French and Italian (DE/FR/IT switch, the choice is remembered). Messages
of the engine – corrections, notes, rule texts of the check log – are German only; in French and
Italian they are marked `lang="de"` for screen readers. The French and Italian texts
(`src/pdfua-i18n.js`) should be reviewed by native speakers.

## Upload to SAC

`dist/BIT_pdfua_2.zip` contains the manifest and both web components, flat (SAC does not accept
subfolders), with relative URLs and SHA-256 integrity hashes – the same layout as `BIT_kanban_1.zip`.
Version 2.0.0 keeps the widget ID and all properties of version 1, so uploading it replaces version 1
and stories keep their configuration.

1. Open the list of custom widgets in SAC (where *BIT Kanban* was uploaded) and choose *+* (needs the *Create* permission for custom widgets).
2. Select `dist/pdfuaWidget.json`, then the ZIP `dist/BIT_pdfua_2.zip` when SAC asks for the resource files.
3. Insert *BIT PDF/UA-Korrektur* into a story or application. Default size 1100 × 760 px; below about
   820 px width the stepper shows numbers only, below 640 px the layout becomes one column.

## Build

```
python3 build.py                                  # src/ -> dist/ (JS, manifest with hashes, ZIP)
python3 build.py --html PDF-UA-Korrektur.html     # take the engine from a new version of the program first
```

Always upload the files from one build together: the manifest pins the exact bytes of both JS files.

| File | Content |
| --- | --- |
| `src/pdfua-engine.js` | engine of the program (pdf-lib, fonts, PDF/UA modules), copied unchanged from its `engine-src` script |
| `src/pdfua-widget.src.js` | main web component `bit-pdfua-widget`: the three steps, settings drawer, SAC lifecycle, properties, methods, events |
| `src/pdfua-i18n.js` | interface texts in German, French and Italian |
| `src/pdfua-widget.css` | styles: light and dark scheme, one accent colour, system fonts, WCAG AA contrast |
| `src/pdfua-styling-panel.js` | styling panel `com-bit-pdfua-styling` |
| `src/pdfuaWidget.json` | manifest; `build.py` fills in the integrity hashes |

The build inserts texts, styles and the engine into the main component; the engine as `function PDFUA_ENGINE(globalThis)`. Its
only change is pdf-lib's UMD header, which would otherwise register pdf-lib with the AMD loader of
the SAC page instead of creating `PDFLib`. The engine runs in a Web Worker created from that
function's source; if the tenant's Content Security Policy does not allow `blob:` workers, the
widget runs it on the main thread (no `eval`, no inline script, no globals) – the results are the
same, the page is just busy while a file is processed. `getEngineMode()` tells which mode is used.

## Configuration

Styling panel (or properties in the manifest):

- **Sprache der Oberfläche** – default language (de, fr, it). Users switch with DE/FR/IT; their
  choice is remembered when `rememberSettings` is on.
- **Standard-Einstellungen** – defaults for document language, title, alternative texts, file name
  suffix, handling of tagged PDFs, bookmarks, artifacts, autostart. Users can change them in the
  settings drawer; their changes are kept in the browser (`rememberSettings`) and *Standardeinstellungen
  wiederherstellen* returns to the story defaults. With the settings hidden, the defaults always apply.
- **Sichtbarkeit** – logo and name, language switch, settings (button and summary), saved alternative
  texts and *Über dieses Werkzeug* in the drawer.
- **Texte** – tool name, tagline, logo text. Left at their defaults they follow the interface language.
- **Darstellung** – light / dark / system color scheme, accent color (light colours are darkened to
  keep AA contrast), font, maximum content width.

The default alternative texts (*Logo*, *Abbildung*, *Diagramm*) are written into the PDFs, so they
are settings, not interface texts: they do not change with the interface language.

Saved alternative texts stay in the browser (local storage) and are shared by all widgets of the tenant, as in the program.

## Scripting

Methods: `getFileCount`, `getDoneCount`, `getPassedCount`, `getSummary` (JSON), `getLastResult` (JSON),
`getLastProcessedFile`, `startAll`, `rerunAll`, `clearAll`, `downloadAll`, `downloadCsv`,
`openFilePicker`, `openFolderPicker`, `getSetting`, `setSetting`, `resetSettings`, `getEngineMode`,
`getText`, `setText`, `setVisibility`, `getUiLanguage`, `setUiLanguage`, `getStep`, `goToStep`.

Events: `onFilesAdded`, `onFileProcessed`, `onQueueFinished`, `onStepChanged`.

```js
// e.g. in onQueueFinished
Application.showMessage(ApplicationMessageType.Info,
    bit_pdfua_1.getPassedCount() + " von " + bit_pdfua_1.getDoneCount() + " PDFs haben die PDF/UA-Prüfung bestanden.");
```

## Where is what (v1 → v2)

| Program / v1 | v2 |
| --- | --- |
| Header: logo, title, tagline | Top bar: logo and tool name; tagline under the heading of step 1 |
| Settings: document language, document title | Settings drawer → *Dokument*; one-line summary in step 1 opens the drawer |
| Alternative texts for logos, images, charts | Drawer → *Alternativtexte* |
| File name suffix, already tagged PDFs, bookmarks, headers/footers as artifacts, autostart | Drawer → *Verarbeitung* |
| Restore default settings | Drawer footer |
| Drag & drop, choose files, choose folder | Step 1 selection area |
| Title / language / logo text per file before the run | Step 1 file list → *Anpassen* |
| Start processing (all / per file) | Step 1 → *Korrigieren* |
| Progress and stage per file | Step 2, live |
| Figures and alternative texts, decorative, save and re-create | Step 2 review: inline editing, Enter = accept and next, *Alle übernehmen*, suggestions from the library; figures that need no review via *Alle Abbildungen anzeigen* |
| Status per file | Step 3: *PDF/UA erfüllt*, *Hinweise* or *Fehler* |
| Download PDF | Step 3, per file |
| Download all (ZIP), overview (CSV), process all again | Step 3 toolbar (*Erneut verarbeiten*) |
| Details: title, language, check before/after, structure counts, outline, corrections, notes, check log, test report (HTML) | Step 3 → *Details anzeigen* (check log filterable to failed rules) |
| Adjust title / language / logo text after the run and re-create | Step 3 → *Details anzeigen* → *Erneut verarbeiten* |
| Remove file, clear list | Step 1 file list; *Entfernen* also in step 3 details |
| Saved alternative texts (list, delete, delete all) | Drawer → *Gespeicherte Alternativtexte* |
| Footer: what is corrected automatically / what a person should check | Drawer → *Über dieses Werkzeug* |
| Screen-reader announcements | Kept, plus progress and step changes |
