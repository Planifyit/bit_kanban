// SAC Kanban Widget component
const { useState, useRef, useEffect, useCallback, useMemo } = React;

// SAC-style dropdown
function SacSelect({ label, value, options, onChange, compact, width }) {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);
  useEffect(() => {
    const onDoc = (e) => { if (ref.current && !ref.current.contains(e.target)) setOpen(false); };
    document.addEventListener('mousedown', onDoc);
    return () => document.removeEventListener('mousedown', onDoc);
  }, []);
  return (
    <div ref={ref} className={`sac-select ${compact ? 'compact' : ''} ${open ? 'is-open' : ''}`} style={width ? { minWidth: width } : null}>
      <button onClick={() => setOpen(o => !o)}>
        {label && <span className="label">{label}:</span>}
        <span className="value">{value}</span>
        <Icon name="chevronDown" size={12} className="caret" />
      </button>
      {open && (
        <div className="sac-select-menu">
          {options.map(o => (
            <div
              key={o}
              className={`opt ${o === value ? 'is-selected' : ''}`}
              onClick={() => { onChange(o); setOpen(false); }}
            >
              <Icon name="check" size={12} className="check" />
              <span>{o}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// Card
function ProjectCard({ project, editMode, showAvatar, onRename, onDelete, onDragStart, onDragEnd, isDragging }) {
  const owner = ownerOf(OWNERS.findIndex(o => o.id === project.owner));
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(project.name);
  const inputRef = useRef(null);
  useEffect(() => { if (editing && inputRef.current) inputRef.current.select(); }, [editing]);

  const commit = () => {
    const v = draft.trim();
    if (v && v !== project.name) onRename(project.id, v);
    setEditing(false);
  };
  return (
    <div
      className={`card ${isDragging ? 'is-dragging' : ''}`}
      draggable={editMode && !editing}
      onDragStart={(e) => onDragStart(e, project)}
      onDragEnd={onDragEnd}
      style={{ '--avatar-bg': owner?.color }}
    >
      {showAvatar && <span className="avatar" title={owner?.name}>{owner?.initials}</span>}
      <span className="name" onDoubleClick={() => editMode && setEditing(true)}>
        {editing ? (
          <input
            ref={inputRef}
            value={draft}
            onChange={e => setDraft(e.target.value)}
            onBlur={commit}
            onKeyDown={(e) => {
              if (e.key === 'Enter') commit();
              if (e.key === 'Escape') { setDraft(project.name); setEditing(false); }
            }}
          />
        ) : project.name}
      </span>
      <span className="amt">CHF {project.amount.toFixed(1)}M</span>
      {editMode && (
        <span className="row-actions">
          <button title="Umbenennen" onClick={() => setEditing(true)}><Icon name="pencil" size={11} /></button>
          <button className="del" title="Löschen" onClick={() => onDelete(project.id)}><Icon name="trash" size={11} /></button>
        </span>
      )}
    </div>
  );
}

// Column
function KanbanColumn({ phase, projects, palette, editMode, showAvatar, onAdd, onRename, onDelete, onDrop, dragging, onDragStart, onDragEnd, onDragOverCol, onDragLeaveCol, isDropTarget }) {
  const color = palette[phase.id];
  // soft summary background derived from color
  const totalAmount = projects.reduce((a, p) => a + p.amount, 0);
  return (
    <div className="col" style={{ '--col-color': color }}>
      <div className="col-head">
        {phase.label}
        <button className="add-btn" title="Vorhaben hinzufügen" onClick={() => onAdd(phase.id)}>+</button>
      </div>
      <div className="col-summary" style={{ '--col-summary-bg': hexToRgba(color, 0.18), '--col-summary-fg': darken(color, 0.35) }}>
        <span className="count" style={{ color: darken(color, 0.4) }}>{projects.length}</span>
        <span className="label" style={{ color: darken(color, 0.4) }}>Vorhaben</span>
        <span className="amount" style={{ color: darken(color, 0.4) }}>CHF {totalAmount.toFixed(1)} M</span>
      </div>
      <div
        className={`col-body ${isDropTarget ? 'drop-target' : ''}`}
        onDragOver={(e) => { e.preventDefault(); onDragOverCol(phase.id); }}
        onDragLeave={() => onDragLeaveCol(phase.id)}
        onDrop={(e) => { e.preventDefault(); onDrop(phase.id); }}
      >
        {projects.map(p => (
          <ProjectCard
            key={p.id}
            project={p}
            editMode={editMode}
            showAvatar={showAvatar}
            onRename={onRename}
            onDelete={onDelete}
            onDragStart={onDragStart}
            onDragEnd={onDragEnd}
            isDragging={dragging === p.id}
          />
        ))}
      </div>
    </div>
  );
}

// color helpers
function hexToRgba(hex, a) {
  const h = hex.replace('#', '');
  const r = parseInt(h.substring(0,2),16), g = parseInt(h.substring(2,4),16), b = parseInt(h.substring(4,6),16);
  return `rgba(${r},${g},${b},${a})`;
}
function darken(hex, amt) {
  const h = hex.replace('#', '');
  let r = parseInt(h.substring(0,2),16), g = parseInt(h.substring(2,4),16), b = parseInt(h.substring(4,6),16);
  r = Math.max(0, Math.round(r*(1-amt)));
  g = Math.max(0, Math.round(g*(1-amt)));
  b = Math.max(0, Math.round(b*(1-amt)));
  return `rgb(${r},${g},${b})`;
}

// Main widget
function KanbanWidget({ styling, design, projects, setProjects, filters, setFilters, selected, onSelect }) {
  const [dragging, setDragging] = useState(null);
  const [dropTargetCol, setDropTargetCol] = useState(null);

  const visible = useMemo(() => {
    return projects.filter(p => {
      if (filters.HA !== 'Alle' && p.ha !== filters.HA) return false;
      if (filters.BU !== 'Alle' && p.bu !== filters.BU) return false;
      if (filters.Phasen !== 'Alle' && p.subp !== filters.Phasen) return false;
      if (String(p.year) !== String(filters.Jahr)) return false;
      return true;
    });
  }, [projects, filters]);

  const byPhase = useMemo(() => {
    const m = {};
    PHASES.forEach(ph => m[ph.id] = []);
    visible.forEach(p => { if (m[p.phase]) m[p.phase].push(p); });
    return m;
  }, [visible]);

  const onDragStart = (e, p) => {
    if (!design.editMode) { e.preventDefault(); return; }
    setDragging(p.id);
    e.dataTransfer.effectAllowed = 'move';
    try { e.dataTransfer.setData('text/plain', p.id); } catch(_){}
  };
  const onDragEnd = () => { setDragging(null); setDropTargetCol(null); };
  const onDrop = (phaseId) => {
    if (!dragging) return;
    setProjects(ps => ps.map(p => p.id === dragging ? { ...p, phase: phaseId } : p));
    setDragging(null);
    setDropTargetCol(null);
  };
  const onAdd = (phaseId) => {
    const id = 'p' + Math.random().toString(36).slice(2, 7);
    const newP = { id, name: 'Neues Vorhaben', phase: phaseId, ha: filters.HA === 'Alle' ? 'IT' : filters.HA, bu: filters.BU === 'Alle' ? 'Retail' : filters.BU, subp: filters.Phasen === 'Alle' ? 'Plan' : filters.Phasen, owner: OWNERS[Math.floor(Math.random()*OWNERS.length)].id, amount: 1.0, year: filters.Jahr };
    setProjects(ps => [...ps, newP]);
  };
  const onRename = (id, name) => setProjects(ps => ps.map(p => p.id === id ? { ...p, name } : p));
  const onDelete = (id) => setProjects(ps => ps.filter(p => p.id !== id));

  const widgetClass = [
    'widget',
    design.editMode ? 'edit-on' : '',
    styling.density === 'compact' ? 'density-compact' : '',
    !styling.showTotals ? 'hide-totals' : '',
    !styling.showAvatars ? 'hide-avatars' : '',
    selected ? 'is-selected' : '',
  ].filter(Boolean).join(' ');

  const widgetStyle = {
    '--w-radius': styling.radius + 'px',
    '--w-card-radius': Math.max(2, styling.radius - 1) + 'px',
    '--w-header-bg': styling.headerBg,
    '--w-header-fg': styling.headerFg,
    '--w-gap': styling.gap + 'px',
    '--w-card-shadow': styling.cardShadow ? '0 1px 0 rgba(0,0,0,0.04), 0 1px 3px rgba(0,0,0,0.12)' : 'none',
    fontFamily: styling.fontFamily,
  };

  return (
    <div className={widgetClass} style={widgetStyle} onClick={onSelect}>
      <div className="widget-header">
        <span className="sap-mark"><span>SAP</span></span>
        <span className="title-sep">SAP Analytics Cloud</span>
        <span className="title-sep">—</span>
        <span><b>{styling.title}</b></span>
        <span className="pill"><span className="dot"></span> Live</span>
      </div>

      {design.showFilters && (
        <div className="filter-bar">
          <SacSelect label="Filter HA"     value={filters.HA}     options={HAS}   onChange={(v) => setFilters(f => ({ ...f, HA: v }))} />
          <SacSelect label="Filter BU"     value={filters.BU}     options={BUS}   onChange={(v) => setFilters(f => ({ ...f, BU: v }))} />
          <SacSelect label="Phasen"        value={filters.Phasen} options={SUBP}  onChange={(v) => setFilters(f => ({ ...f, Phasen: v }))} />
          <span className="grow"></span>
          <SacSelect label="Filter Jahr"   value={filters.Jahr}   options={YEARS} onChange={(v) => setFilters(f => ({ ...f, Jahr: v }))} />
        </div>
      )}

      <div className="kanban">
        {PHASES.map(ph => (
          <KanbanColumn
            key={ph.id}
            phase={ph}
            palette={styling.palette}
            projects={byPhase[ph.id] || []}
            editMode={design.editMode}
            showAvatar={styling.showAvatars}
            onAdd={onAdd}
            onRename={onRename}
            onDelete={onDelete}
            onDragStart={onDragStart}
            onDragEnd={onDragEnd}
            onDragOverCol={(id) => setDropTargetCol(id)}
            onDragLeaveCol={(id) => setDropTargetCol(curr => curr === id ? null : curr)}
            onDrop={onDrop}
            dragging={dragging}
            isDropTarget={dropTargetCol === ph.id}
          />
        ))}
      </div>
    </div>
  );
}

Object.assign(window, { KanbanWidget, SacSelect });
