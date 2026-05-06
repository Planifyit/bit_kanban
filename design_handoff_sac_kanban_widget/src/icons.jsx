// SAP-ish icons (simple, monoline)
const Icon = ({ name, size = 14, className = '' }) => {
  const paths = {
    chevronDown: <path d="M3 5l5 5 5-5" stroke="currentColor" strokeWidth="1.5" fill="none" strokeLinecap="round" strokeLinejoin="round" />,
    chevronRight: <path d="M5 3l5 5-5 5" stroke="currentColor" strokeWidth="1.5" fill="none" strokeLinecap="round" strokeLinejoin="round" />,
    check: <path d="M3 8l3 3 7-7" stroke="currentColor" strokeWidth="1.8" fill="none" strokeLinecap="round" strokeLinejoin="round" />,
    plus: <path d="M8 3v10M3 8h10" stroke="currentColor" strokeWidth="1.6" fill="none" strokeLinecap="round" />,
    pencil: <g stroke="currentColor" strokeWidth="1.3" fill="none" strokeLinejoin="round"><path d="M11.5 2.5l2 2L5 13l-2.5.5L3 11l8.5-8.5z" /></g>,
    trash: <g stroke="currentColor" strokeWidth="1.3" fill="none" strokeLinecap="round" strokeLinejoin="round"><path d="M3 4h10M5.5 4V2.5h5V4M4.5 4l.5 9h6l.5-9" /></g>,
    grip: <g fill="currentColor"><circle cx="6" cy="4" r="1" /><circle cx="6" cy="8" r="1" /><circle cx="6" cy="12" r="1" /><circle cx="10" cy="4" r="1" /><circle cx="10" cy="8" r="1" /><circle cx="10" cy="12" r="1" /></g>,
    settings: <g stroke="currentColor" strokeWidth="1.3" fill="none"><circle cx="8" cy="8" r="2" /><path d="M8 1v2M8 13v2M1 8h2M13 8h2M3.2 3.2l1.4 1.4M11.4 11.4l1.4 1.4M3.2 12.8l1.4-1.4M11.4 4.6l1.4-1.4" strokeLinecap="round" /></g>,
    paint: <g stroke="currentColor" strokeWidth="1.3" fill="none" strokeLinecap="round" strokeLinejoin="round"><path d="M2 4.5C2 3 3 2 4.5 2H10v3.5h2.5L13 7.5l-7.5 7.5L2 11.5l4-4-1.5-1.5h-2C1.5 6 2 5 2 4.5z" /></g>,
    database: <g stroke="currentColor" strokeWidth="1.3" fill="none"><ellipse cx="8" cy="3.5" rx="5" ry="1.8" /><path d="M3 3.5v9c0 1 2.2 1.8 5 1.8s5-.8 5-1.8v-9M3 8c0 1 2.2 1.8 5 1.8s5-.8 5-1.8" /></g>,
    builder: <g stroke="currentColor" strokeWidth="1.3" fill="none"><rect x="2" y="2" width="5" height="5" /><rect x="9" y="2" width="5" height="5" /><rect x="2" y="9" width="5" height="5" /><rect x="9" y="9" width="5" height="5" /></g>,
    user: <g stroke="currentColor" strokeWidth="1.3" fill="none"><circle cx="8" cy="5.5" r="2.5" /><path d="M3 14c0-2.5 2.2-4.5 5-4.5s5 2 5 4.5" /></g>,
    layers: <g stroke="currentColor" strokeWidth="1.3" fill="none" strokeLinejoin="round"><path d="M8 1.5l6.5 3.5L8 8.5 1.5 5 8 1.5zM2 8.5L8 12l6-3.5M2 11.5L8 15l6-3.5" /></g>,
    filter: <g stroke="currentColor" strokeWidth="1.3" fill="none" strokeLinejoin="round" strokeLinecap="round"><path d="M2 3h12l-4.5 5.5V13l-3 1.5V8.5L2 3z" /></g>,
    eye: <g stroke="currentColor" strokeWidth="1.3" fill="none"><path d="M1.5 8s2.5-4 6.5-4 6.5 4 6.5 4-2.5 4-6.5 4-6.5-4-6.5-4z" /><circle cx="8" cy="8" r="2" /></g>,
    play: <path d="M4 3l9 5-9 5V3z" fill="currentColor" />,
    refresh: <g stroke="currentColor" strokeWidth="1.3" fill="none" strokeLinecap="round" strokeLinejoin="round"><path d="M14 8a6 6 0 1 1-1.8-4.2L14 5" /><path d="M14 1.5V5h-3.5" /></g>,
    save: <g stroke="currentColor" strokeWidth="1.3" fill="none" strokeLinejoin="round"><path d="M2 2h10l2 2v10H2V2z" /><path d="M5 2v4h6V2M5 14v-4h6v4" /></g>,
    close: <path d="M3 3l10 10M13 3L3 13" stroke="currentColor" strokeWidth="1.5" fill="none" strokeLinecap="round" />,
    info: <g stroke="currentColor" strokeWidth="1.3" fill="none"><circle cx="8" cy="8" r="6.5" /><path d="M8 7v4M8 5v.5" strokeLinecap="round" /></g>,
    sparkle: <g fill="currentColor"><path d="M8 1l1.4 4.6L14 7l-4.6 1.4L8 13l-1.4-4.6L2 7l4.6-1.4L8 1z" /></g>,
  };
  return (
    <svg className={`ic ${className}`} width={size} height={size} viewBox="0 0 16 16" aria-hidden>
      {paths[name]}
    </svg>
  );
};

window.Icon = Icon;
