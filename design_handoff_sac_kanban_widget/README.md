# Handoff: SAP Analytics Cloud — Kanban Vorhaben Übersicht (Custom Widget)

## Overview
A custom **SAP Analytics Cloud (SAC) widget** that visualizes a portfolio of "Vorhaben" (initiatives / projects) as a 6-column Kanban board (Funnel → Vorbereitung → Initialisierung → Umsetzung → Abschluss → Done). The widget supports:

- 4 SAC-style filter dropdowns (HA, BU, Phasen, Jahr) that narrow the visible cards and recompute counts + CHF totals.
- A **Styling Panel** for visual appearance (header, palette, density, radius, gaps, totals/avatars, font).
- A **Builder / Design Panel** for data binding, dimension mapping, filter visibility, and an **edit mode** that lets the user drag cards between phases, rename, add, and delete projects.

The intended deployment target is a real SAC custom widget (manifest.json + main webcomponent + styling.js + builder.js, deployable into a SAC tenant).

## About the Design Files
The files in this bundle are **design references created in HTML** — a high-fidelity React/Babel prototype showing intended look and behavior, not production code to copy directly. The task is to **recreate this design as a real SAC custom widget** using SAP's custom-widget framework (Web Components + manifest.json + JSON-driven panels).

If you are building it inside a normal codebase instead (React/Vue/etc.), use the JSX in `src/` as the structural reference and re-implement using the host codebase's component library and design tokens.

## Fidelity
**High-fidelity.** Final colors, type, spacing, shadows, and interactions are all decided. Implement pixel-perfectly, but swap in the host environment's component library where one exists (e.g. UI5 Web Components for SAC, or your existing design system).

---

## SAC Custom Widget — File Structure (target)
A real SAC custom widget bundle should look like:

```
sac-kanban-widget/
  manifest.json                  # widget metadata, properties, methods, events, panels
  main.js                        # <com-mycompany-kanban> web component (the runtime widget)
  builder.js                     # <com-mycompany-kanban-builder> (Builder panel web component)
  styling.js                     # <com-mycompany-kanban-styling> (Styling panel web component)
  icon.png                       # 32x32 widget icon
```

`manifest.json` declares the widget's properties (the same shape as our `styling` + `design` state objects), exposed methods (`refreshData`, `setFilter`, `setEditMode`, `getProjects`), and dispatched events (`onSelect`, `onPhaseChange`, `onFilterChange`).

---

## Screens / Views

There is a single composite view: the **Widget Canvas + Designer Panel**. In real SAC, the panels live in SAC's right rail; in our prototype they're docked on the right of the canvas to mimic that.

### 1. Widget — Header
- **Background**: `#2c4762` (Belize preset). Configurable via Styling Panel (5 presets + free color picker).
- **Foreground**: `#ffffff`.
- **Layout**: horizontal flex, 10px gap, 10px 16px padding.
- **Contents (left → right)**:
  - SAP logomark — `#0a6ed1` skewed parallelogram, 11px bold "SAP" white text.
  - Subtle "SAP Analytics Cloud" label, em-dash, then the **bold widget title** (default: "Kanban Vorhaben Übersicht").
  - Right side: pill `Live` badge — 11px text, 6px green dot (`#69d491`), translucent border `rgba(255,255,255,0.3)`.

### 2. Widget — Filter Bar
- **Background**: `#ffffff`.
- **Border-bottom**: 1px `#d5dae0`.
- **Padding**: 10px 14px. **Gap**: 10px.
- **Contents**: 4 SAC-style dropdowns:
  - `Filter HA: [Alle | IT | Finance | Operations | HR]`
  - `Filter BU: [Alle | Retail | Wholesale | Logistics | Digital]`
  - `Phasen:    [Alle | Plan | Genehmigt | Aktiv | Hold]`
  - (right-aligned) `Filter Jahr: [2024 | 2025 | 2026 | 2027]`
- Visibility toggled by `design.showFilters` from Builder Panel.

#### SAC Dropdown component
- Height 28px, padding 5px 26px 5px 9px.
- Border `1px solid #b3b9c2` with darker bottom border `#6a6d70` (SAC's signature "underlined input" look).
- Radius 3px, font-size 13px.
- `:hover` → background `#ebf5fe`, border `#0a6ed1`.
- Open state → border `#0a6ed1`, inset `1px solid #0a6ed1`.
- Caret is a 12px chevron-down 7px from the right.
- Menu: white surface, 1px border `#b3b9c2`, shadow `0 6px 18px -4px rgba(31,42,55,0.18)`, max-height 240px scroll.
- Menu items: 6px 12px padding. Selected → bg `#d4ebfb`, color `#085caf`, leading 12px check icon.

### 3. Widget — Kanban Grid
- **Layout**: CSS grid, `grid-template-columns: repeat(6, minmax(0, 1fr))`, gap from `styling.gap` (default 10px), padding 12px 14px 16px.
- **Background**: `#ffffff`.

#### Column
- Container: `#f6f8fa` background, 1px `#d5dae0` border, radius from `styling.radius` (default 4px), min-height 360px.
- **Column header**: 9px 10px padding, white 13px 600 weight, centered, `letter-spacing: 0.3px`, background = phase color (see palette below).
  - In edit mode shows a 22px round `+` button on the right (`rgba(255,255,255,0.2)`, hover `0.32`).
- **Column summary row**: 7px 10px padding, 1px bottom border `#d5dae0`, background = phase color at **18% opacity**, text = phase color **darkened 35–40%**.
  - Big count number 16px 700 weight + the word "Vorhaben" 12px 500.
  - Right-aligned `CHF X.X M` total (11px, hidden when `styling.showTotals` is false).

#### Card
- 7px 9px padding, 8px gap, 13px font, 500 weight name.
- Background `#ffffff`, 1px `#d5dae0` border, radius `styling.radius - 1` (min 2px).
- Shadow (when on): `0 1px 0 rgba(0,0,0,0.04), 0 1px 3px rgba(0,0,0,0.12)`.
- `:hover` → border `#aab2bb`, shadow strengthens.
- **Avatar**: 18px circle, 10px 600-weight white initials. Color comes from owner record. Hide when `styling.showAvatars` is false.
- **Name**: flex:1, `min-width:0`, `nowrap`, ellipsis. Double-click in edit mode → inline `<input>` on `#fffbe6` with autoselect; `Enter` commits, `Esc` cancels.
- **Amount**: `CHF X.XM`, 11px, color `#6a6d70`, flex-shrink:0.
- **Row actions** (only in edit mode + on hover): Pencil + Trash buttons, 20×20 transparent. Trash hover → `#ffe5e5` / `#d40000`.

##### Compact density (`styling.density === 'compact'`)
- Card padding 4px 8px, font 12px.
- Avatar 16×16, 9px font.
- Column header 7px 10px, font 12px.
- Summary 5px 9px, count 14px.

### 4. Designer Panel (right dock)
- **Width**: 320px (280px under 1100px viewport).
- **Background**: `#ffffff`. Left border `1px #d5dae0`. Subtle shadow `-4px 0 12px -8px rgba(0,0,0,0.1)`.
- **Tab strip** at top, 0 6px padding, 1px bottom border, bg `#fafbfc`:
  - "Builder" (icon: 4-square grid) and "Styling" (icon: paint roller).
  - Active tab: text `#0a6ed1`, 2px underline `#0a6ed1` flush with the section divider.
  - Far right: 11px `×` close button.

#### Section pattern (used in both panels)
- **Section head**: 9px 14px, 11px / 600 / uppercase / 0.8px letter-spacing label, `#fafbfc` bg, leading 12px icon, color `#6a6d70`.
- **Section body**: 12px 14px, 12px gap stack of `field` rows.
- **Field**: column flex, 4px gap. `<label>` is 12px 500 `#6a6d70`.

#### Form controls used in panels
- **`.sac-input`** — text/select. Height 28px, 4px 8px padding, 13px font, 1px border `#b3b9c2` with `#6a6d70` bottom, 3px radius. `:focus`/`:hover` → border `#0a6ed1`.
- **`.sac-switch`** — 38×20 pill, off `#c2c5ca`, on `#0a6ed1`. 16px white knob translates 18px on toggle. 0.15s transition.
- **`.segmented`** — inline-flex of buttons in a 1px-bordered, 3px-radius shell. Active button `#0a6ed1` bg / white. Hover `#ebf5fe` / `#0a6ed1`.
- **`.swatch`** — 24px circle, 1px border `#b3b9c2`. Selected ring `0 0 0 2px #0a6ed1`.
- **`.color-swatch`** (square, 22×22, 4px radius) — wraps a hidden `<input type="color">`.
- **Slider row** — `<input type=range>` with `accent-color: #0a6ed1`. 38px right-aligned tabular numeric value column.
- **`.palette-card`** — 1px border, 3px radius, 7px padding, 14px-tall horizontal color strip, 11px gray label below. Selected → border + 1px-inset shadow `#0a6ed1`.

### 5. Styling Panel sections (in order)
1. **Allgemein** — Widget Titel (text input), Schriftfamilie (select: Source Sans 3 / Segoe UI / System / JetBrains Mono).
2. **Header** — 5 preset palette-cards (Belize / Midnight / Ocean / Graphite / Paper), Hintergrund color picker, Textfarbe color picker.
3. **Phasen Farbpalette** — 4 preset palette-cards (Classic / Horizon / Vibrant / Mono) showing all 6 phase colors as a strip; below, a per-phase color picker row for fine-tuning.
4. **Layout** — Dichte segmented (Kompakt / Komfortabel), Eckenradius slider 0–14px, Spaltenabstand slider 4–24px, Karten-Schatten switch.
5. **Anzeige** — CHF Summen anzeigen switch, Verantwortlichen-Avatare switch.

### 6. Builder Panel sections (in order)
1. **Datenquelle** — Modell select (3 mock models), Aktualisierung segmented (Manuell / Live), summary stat row (count + total CHF).
2. **Dimensionen** — 6 read-only "dim cards" (Phase, Verantwortlich, Hauptabteilung, BU, Sub-Phase, Jahr) with tech IDs on the right; Kennzahl select (CHF Investition / CHF Forecast / EUR / FTE).
3. **Filter** — Filter-Leiste anzeigen switch + active-filter summary line.
4. **Interaktion** — Bearbeitungsmodus aktivieren switch (with hint), Doppelklick zum Umbenennen switch, Schreibzugriff in Modell switch. When write-back is on, show a yellow hint banner `#fffbe6` / border `#f0e2a4` / text `#7a5b00`.
5. **Skript-Aktionen** — Read-only list of 4 SAC script hooks (`onSelect(member)`, `onPhaseChange()`, `onFilterChange()`, `refreshData()`) shown as monospace strings with descriptions.

### 7. App Chrome (around the widget)
Used to imitate SAC's Story Designer so the widget looks deployed in context. Recreate only if your handoff target also wants the chrome; otherwise drop it and embed the widget directly.

- **Top bar**: 44px tall, gradient `#354a5f → #2a3e52`, white text. Holds SAP logo, "SAP Analytics Cloud · Story Designer", a story name, a "Designer" toggle button, refresh / save / preview icon-buttons, a 26px orange (`#ff8a3d`) user avatar.
- **Left rail**: 44px wide, white, 1px right border. Five 32×32 icon buttons (Story / Daten / Filter / Stil at top, Settings at bottom). Active state bg `#e3effa`, color `#0a6ed1`. Tooltips appear to the right on hover.
- **Canvas**: `#f5f6fa` with 16px-grid radial dots (`#d8dde3`). 18px padding. Click empty area = deselect widget. Click widget = blue selection outline (`#0a6ed1`).
- **Status bar** beneath the widget: 1px border, 6px 14px, 11px `#6a6d70` text. Shows `<visible>/<total> Vorhaben sichtbar`, model name, refresh mode, edit-mode indicator (blue dot when active).

---

## Interactions & Behavior

### Filtering
- Each of the 4 dropdowns updates the corresponding key in `filters` (`HA`, `BU`, `Phasen`, `Jahr`).
- A project is visible if every filter either equals `"Alle"` or matches the project field. Year is **always** matched (no "Alle" option for year).
- Counts and CHF totals on each column re-compute from the filtered set.
- Hook to dispatch `onFilterChange()` script action on change.

### Edit mode (Builder Panel → Bearbeitungsmodus)
When `design.editMode === true`:
- Cards become `draggable`. On `dragstart` we stash the project id; on column `drop` we move the project to that phase. Dispatch `onPhaseChange(projectId, fromPhase, toPhase)`.
- Drop targets get a dashed `#0a6ed1` outline + 6% blue tint while a card is dragged over them.
- Cards show a row of action buttons on hover (pencil / trash).
- Column headers reveal a `+` button. Clicking it inserts a new project (`"Neues Vorhaben"`, `CHF 1.0M`, owner randomized, ha/bu/subp = current filter or default `IT/Retail/Plan`) in that phase.
- Double-clicking a name (or the pencil) swaps to an inline input. Enter commits, Esc reverts.
- Trash icon removes a project.
- When `design.writeBack === true`, all of the above should also persist to the bound SAC model.

### Selection
- Click on the widget surface → adds blue selection outline. Click on canvas background → deselects. (Mimics SAC's selection model so the panels apply to "the selected widget".)

### Animations / Transitions
- Switches: `background 0.15s`, knob `transform 0.15s`.
- Card hover: `transform / shadow / border-color 0.12s`.
- Dropdown menu: instant open, click-outside closes.
- Dragging card: source becomes `opacity: 0.4`.

### Accessibility
- Dropdowns close on outside-click via `mousedown` listener.
- All interactive controls are real `<button>` / `<input>` so default focus + keyboard works.
- Color-pickers wrap a hidden `<input type="color">` so the OS dialog opens on click.

---

## State Management

The prototype uses 4 React `useState` slices. The same shape maps 1:1 to SAC widget properties:

```ts
type Styling = {
  title: string;
  headerBg: string; headerFg: string;
  palette: { funnel; vorbereitung; initialisierung; umsetzung; abschluss; done }; // hex strings
  density: 'compact' | 'comfortable';
  radius: number;     // px, 0–14
  gap: number;        // px, 4–24
  cardShadow: boolean;
  showTotals: boolean;
  showAvatars: boolean;
  fontFamily: string;
};

type Design = {
  model: string;
  refresh: 'manual' | 'live';
  measure: 'CHF Investition' | 'CHF Forecast' | 'EUR Investition' | 'Anzahl FTE';
  showFilters: boolean;
  editMode: boolean;
  dblClickRename: boolean;
  writeBack: boolean;
};

type Filters = { HA: string; BU: string; Phasen: string; Jahr: string };

type Project = {
  id: string;
  name: string;
  phase: 'funnel' | 'vorbereitung' | 'initialisierung' | 'umsetzung' | 'abschluss' | 'done';
  ha: string; bu: string; subp: string;
  owner: string;     // owner id
  amount: number;    // CHF in millions
  year: string;
};
```

Mock data lives in `src/data.jsx` (24 projects across all phases / years). Replace with the SAC `dataBindings` API in production.

---

## Design Tokens

### Color
| Token                | Hex        | Purpose                          |
|----------------------|------------|----------------------------------|
| `--sap-bg`           | `#edf1f5`  | App backdrop                     |
| `--sap-canvas`       | `#f5f6fa`  | Story canvas                     |
| `--sap-shell-bg`     | `#354a5f`  | Top bar (start)                  |
| `--sap-shell-bg-2`   | `#2a3e52`  | Top bar (end)                    |
| `--sap-border`       | `#d5dae0`  | Default border                   |
| `--sap-border-strong`| `#b3b9c2`  | Input border                     |
| `--sap-text`         | `#32363a`  | Body                             |
| `--sap-text-muted`   | `#6a6d70`  | Labels, secondary                |
| `--sap-text-subtle`  | `#89919a`  | Hints                            |
| `--sap-blue`         | `#0a6ed1`  | Primary action                   |
| `--sap-blue-hover`   | `#085caf`  | Primary hover                    |
| `--sap-link`         | `#0070f2`  | Links                            |
| `--sap-input-bg`     | `#ffffff`  | Inputs                           |
| `--sap-input-hover`  | `#ebf5fe`  | Input/menu hover                 |
| `--sap-panel-bg`     | `#ffffff`  | Designer panel                   |
| `--sap-panel-tab`    | `#fafbfc`  | Section heads, tab strip         |

### Phase palettes
- **Classic**: `#2f6db4 #2aa39a #f0b323 #e58a3a #5b9b46 #8c95a0`
- **Horizon**: `#5d6e87 #2b7c8f #a36d00 #a35a1a #3d7a3d #7a8189`
- **Vibrant**: `#1f6feb #06b6a4 #facc15 #f97316 #22c55e #94a3b8`
- **Mono**:    `#1f3b56 #324b66 #475e76 #5b6f86 #708296 #8595a6`

### Header presets
- Belize `#2c4762`, Midnight `#1f2d3d`, Ocean `#0a6ed1`, Graphite `#3a3f44`, Paper `#f4f5f7` (dark text).

### Owner avatar palette (cycled)
`#2f6db4 #2aa39a #e58a3a #5b9b46 #8c4fb8 #c95a6e`

### Spacing
4 / 6 / 8 / 10 / 12 / 14 / 16 / 18 / 24 px. Panel padding 12 / 14. Section head 9 / 14.

### Typography
- Family: SAP **"72"** in production (proprietary). The prototype substitutes **Source Sans 3** which is the closest open match; ship the real "72" family in the SAC bundle.
- Base 14px / 1.45.
- Card name 13/500. Card amount 11/400. Section head 11/600/uppercase. Big column count 16/700. Tab 13/500.

### Radius
0 / 1 (skewed-rect) / 3 (inputs) / 4 (cards/cols default) / 6.

### Shadow
- `--sap-shadow-1`: `0 0 0 1px rgba(0,0,0,0.04), 0 1px 2px rgba(0,0,0,0.06)`
- `--sap-shadow-2`: `0 0 0 1px rgba(0,0,0,0.05), 0 6px 18px -4px rgba(31,42,55,0.18)` (menus)
- Card: `0 1px 0 rgba(0,0,0,0.04), 0 1px 3px rgba(0,0,0,0.12)`
- Selection: `0 0 0 1px rgba(10,110,209,0.15), 0 8px 24px -6px rgba(10,110,209,0.25)`

---

## Assets
- All icons are **inline SVG** in `src/icons.jsx` (`Icon` component, named set: chevronDown, chevronRight, check, plus, pencil, trash, grip, settings, paint, database, builder, user, layers, filter, eye, play, refresh, save, close, info, sparkle).
- Owner avatars are CSS — initials on a colored circle. No image assets.
- The "SAP" logomark is plain HTML — a skewed `#0a6ed1` block with white text inside.

In production replace the inline icons with **SAP Icon font** (`SAP-icons.ttf`) glyphs that already ship with SAC custom widgets.

---

## SAC Custom-Widget specifics (target)

When wiring this into a real SAC tenant, the manifest properties should mirror `Styling` and `Design` shapes above. Map our two panels onto SAC's `stylingPanel` / `builderPanel` slots in the manifest:

```jsonc
{
  "id": "com.example.kanbanvorhaben",
  "version": "1.0.0",
  "name": "Kanban Vorhaben Übersicht",
  "newInstancePrefix": "KanbanVorhaben",
  "vendor": "Example",
  "icon": "icon.png",
  "eula": "",
  "license": "",
  "webcomponents": [
    { "kind": "main",          "tag": "com-example-kanbanvorhaben",          "url": "main.js",     "integrity": "", "ignoreIntegrity": true },
    { "kind": "styling",       "tag": "com-example-kanbanvorhaben-styling",  "url": "styling.js",  "integrity": "", "ignoreIntegrity": true },
    { "kind": "builder",       "tag": "com-example-kanbanvorhaben-builder",  "url": "builder.js",  "integrity": "", "ignoreIntegrity": true }
  ],
  "properties": { /* flatten Styling + Design + Filters here */ },
  "methods":    { "refreshData": {...}, "setFilter": {...}, "setEditMode": {...} },
  "events":     { "onSelect": {...}, "onPhaseChange": {...}, "onFilterChange": {...} },
  "dataBindings": {
    "myDataBinding": {
      "feeds": [
        { "id": "dimensions", "description": "Dimensions", "type": "dimension" },
        { "id": "measures",   "description": "Measures",   "type": "mainStructureMember" }
      ]
    }
  }
}
```

The runtime `<com-example-kanbanvorhaben>` web component should:
1. Read `dataBindings` and reshape into the `Project[]` model.
2. Render the kanban + filter bar identical to the prototype.
3. Expose getters/setters for every property in the manifest so the styling/builder panels can wire generic SAC inputs.
4. Dispatch the `onSelect` / `onPhaseChange` / `onFilterChange` events so the SAC story can run scripts on them.

---

## Files included in this handoff

```
SAC Kanban Widget.html             # entry — pulls React+Babel and the JSX modules below
src/icons.jsx                      # Icon component (inline SVG set)
src/data.jsx                       # PHASES, OWNERS, INITIAL_PROJECTS, palettes, presets
src/widget.jsx                     # SacSelect, ProjectCard, KanbanColumn, KanbanWidget
src/styling-panel.jsx              # StylingPanel
src/builder-panel.jsx              # BuilderPanel
src/app.jsx                        # App shell (top bar, rail, canvas, panel host) + state
README.md                          # this document
```

Open `SAC Kanban Widget.html` directly in a browser to see the live design reference.
