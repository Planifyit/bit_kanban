# BIT PDF/UA-Korrektur – SAC Custom Widget

The stand-alone program `PDF-UA-Korrektur.html` as an SAP Analytics Cloud custom widget. Same user
interface, same engine: PDF files are made accessible (PDF/UA-1) and checked entirely in the
browser; no file leaves the computer. The widget needs no data binding.

## Upload to SAC

`dist/BIT_pdfua_1.zip` contains the manifest and both web components, flat (SAC does not accept
subfolders), with relative URLs and SHA-256 integrity hashes – the same layout as `BIT_kanban_1.zip`.

1. Open the list of custom widgets in SAC (where *BIT Kanban* was uploaded) and choose *+* (needs the *Create* permission for custom widgets).
2. Select `dist/pdfuaWidget.json`, then the ZIP `dist/BIT_pdfua_1.zip` when SAC asks for the resource files.
3. Insert *BIT PDF/UA-Korrektur* into a story or application. Default size 1100 × 860 px.

## Build

```
python3 build.py                                  # src/ -> dist/ (JS, manifest with hashes, ZIP)
python3 build.py --html PDF-UA-Korrektur.html     # take the engine from a new version of the program first
```

Always upload the files from one build together: the manifest pins the exact bytes of both JS files.

| File | Content |
| --- | --- |
| `src/pdfua-engine.js` | engine of the program (pdf-lib, fonts, PDF/UA modules), copied unchanged from its `engine-src` script |
| `src/pdfua-widget.src.js` | main web component `bit-pdfua-widget`: user interface of the program, SAC lifecycle, properties, methods, events |
| `src/pdfua-styling-panel.js` | styling panel `com-bit-pdfua-styling` |
| `src/pdfuaWidget.json` | manifest; `build.py` fills in the integrity hashes |

The build inserts the engine into the main component as `function PDFUA_ENGINE(globalThis)`. Its
only change is pdf-lib's UMD header, which would otherwise register pdf-lib with the AMD loader of
the SAC page instead of creating `PDFLib`. The engine runs in a Web Worker created from that
function's source; if the tenant's Content Security Policy does not allow `blob:` workers, the
widget runs it on the main thread (no `eval`, no inline script, no globals) – the results are the
same, the page is just busy while a file is processed. `getEngineMode()` tells which mode is used.

## Configuration

Styling panel (or properties in the manifest):

- **Standard-Einstellungen** – defaults for language, title, alternative texts, file name suffix,
  handling of tagged PDFs, bookmarks, artifacts, autostart. Users can change them in the widget;
  their changes are kept in the browser (`rememberSettings`) and *Standardeinstellungen
  wiederherstellen* returns to the story defaults. With the settings panel hidden, the defaults always apply.
- **Sichtbarkeit** – header, settings panel, saved alternative texts, footer.
- **Texte** – title, tagline, logo text.
- **Darstellung** – light / dark / system color scheme, accent color, font, maximum content width.

Saved alternative texts stay in the browser (local storage) and are shared by all widgets of the tenant, as in the program.

## Scripting

Methods: `getFileCount`, `getDoneCount`, `getPassedCount`, `getSummary` (JSON), `getLastResult` (JSON),
`getLastProcessedFile`, `startAll`, `rerunAll`, `clearAll`, `downloadAll`, `downloadCsv`,
`openFilePicker`, `openFolderPicker`, `getSetting`, `setSetting`, `resetSettings`, `getEngineMode`,
`getText`, `setText`, `setVisibility`.

Events: `onFilesAdded`, `onFileProcessed`, `onQueueFinished`.

```js
// e.g. in onQueueFinished
Application.showMessage(ApplicationMessageType.Info,
    bit_pdfua_1.getPassedCount() + " von " + bit_pdfua_1.getDoneCount() + " PDFs haben die PDF/UA-Prüfung bestanden.");
```
