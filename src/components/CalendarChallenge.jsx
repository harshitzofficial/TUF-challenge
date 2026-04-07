import { useState, useEffect, useMemo, useCallback } from "react";
import './Calendar.css';

// ─── Data ─────────────────────────────────────────────────────────────────────
const MONTH_NAMES = [
  "January","February","March","April","May","June",
  "July","August","September","October","November","December",
];
const DAY_LABELS = ["Sun","Mon","Tue","Wed","Thu","Fri","Sat"];

const HOLIDAYS = {
  "0,1":  "New Year's Day",
  "1,14": "Valentine's Day",
  "2,17": "St. Patrick's Day",
  "4,26": "Memorial Day",
  "6,4":  "Independence Day",
  "9,31": "Halloween",
  "10,11":"Veterans Day",
  "11,25":"Christmas Day",
  "11,31":"New Year's Eve",
};

// 12 distinct, carefully chosen seasonal themes
const THEMES = [
  { accent:"#3D6494", aAlpha:"rgba(61,100,148,0.15)",  bg:"#E9EFF8", vibe:"Still & Serene",   img:"arctic" },
  { accent:"#943D5A", aAlpha:"rgba(148,61,90,0.15)",   bg:"#F8E9EF", vibe:"Soft & Tender",    img:"rose-flowers" },
  { accent:"#3D9466", aAlpha:"rgba(61,148,102,0.15)",  bg:"#E9F8F1", vibe:"Fresh & New",      img:"spring-meadow" },
  { accent:"#7A3D94", aAlpha:"rgba(122,61,148,0.15)",  bg:"#F2E9F8", vibe:"Gentle Bloom",     img:"purple-blossom" },
  { accent:"#3D9449", aAlpha:"rgba(61,148,73,0.15)",   bg:"#E9F8EC", vibe:"Lush & Vivid",     img:"green-garden" },
  { accent:"#947E3D", aAlpha:"rgba(148,126,61,0.15)",  bg:"#F8F5E9", vibe:"Warm & Golden",    img:"summer-beach" },
  { accent:"#943D3D", aAlpha:"rgba(148,61,61,0.15)",   bg:"#F8E9E9", vibe:"Bold & Bright",    img:"mountain-sunset" },
  { accent:"#94843D", aAlpha:"rgba(148,132,61,0.15)",  bg:"#F8F4E9", vibe:"Rich & Radiant",   img:"sunflower-field" },
  { accent:"#9A6040", aAlpha:"rgba(154,96,64,0.15)",   bg:"#F8F0E9", vibe:"Harvest Warmth",   img:"autumn-forest" },
  { accent:"#944A3D", aAlpha:"rgba(148,74,61,0.15)",   bg:"#F8EDE9", vibe:"Deep & Moody",     img:"october-fog" },
  { accent:"#3D5A94", aAlpha:"rgba(61,90,148,0.15)",   bg:"#E9EFF8", vibe:"Quiet & Still",    img:"november-mist" },
  { accent:"#3D5E8A", aAlpha:"rgba(61,94,138,0.15)",   bg:"#E9F1F8", vibe:"Cozy & Magical",   img:"christmas-snow" },
];

// ─── Utilities ─────────────────────────────────────────────────────────────────
const mkDate   = (y, m, d) => new Date(y, m, d);
const cmp      = (a, b)    => a && b ? a.getTime() - b.getTime() : 0;
const fmtShort = (d)       => d ? `${MONTH_NAMES[d.getMonth()].slice(0,3)} ${d.getDate()}` : "";

function sortPair(a, b) {
  if (!a || !b) return [a, b];
  return cmp(a, b) <= 0 ? [a, b] : [b, a];
}

// ─── Component ─────────────────────────────────────────────────────────────────
export default function WallCalendar() {
  const today = new Date();

  const [month,    setMonth]    = useState(today.getMonth());
  const [year,     setYear]     = useState(today.getFullYear());
  const [selStart, setSelStart] = useState(null);
  const [selEnd,   setSelEnd]   = useState(null);
  const [hover,    setHover]    = useState(null);
  const [noteText, setNoteText] = useState("");
  const [notes,    setNotes]    = useState([]);
  const [gridKey,  setGridKey]  = useState(0);
  const [imgLoaded,setImgLoaded]= useState(false);
  const [isMenuOpen,setIsMenuOpen]= useState(false);

  // Dark Mode State
  const [isDark, setIsDark] = useState(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('wcal-darkmode');
      return saved ? JSON.parse(saved) : window.matchMedia('(prefers-color-scheme: dark)').matches;
    }
    return false;
  });

  useEffect(() => {
    localStorage.setItem('wcal-darkmode', JSON.stringify(isDark));
  }, [isDark]);

  const theme       = THEMES[month];
  const heroUrl     = `https://picsum.photos/seed/${theme.img}/640/420`;
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const firstDOW    = new Date(year, month, 1).getDay();

  // Effective range
  const effectiveEnd = selEnd ?? (selStart && !selEnd ? hover : null);
  const [sortedStart, sortedEnd] = useMemo(
    () => sortPair(selStart, effectiveEnd),
    [selStart, effectiveEnd]
  );

  // Per-cell state helpers
  const isStart = useCallback((d) => sortedStart && d.getTime() === sortedStart.getTime(), [sortedStart]);
  const isEnd = useCallback((d) => selEnd && sortedEnd && d.getTime() === sortedEnd.getTime(), [selEnd, sortedEnd]);
  const inRange = useCallback((d) => sortedStart && sortedEnd && d > sortedStart && d < sortedEnd, [sortedStart, sortedEnd]);

  // Click handler
  const handleDayClick = (d) => {
    const clicked = mkDate(year, month, d);
    if (!selStart || selEnd) {
      setSelStart(clicked);
      setSelEnd(null);
      setNoteText("");
    } else {
      setSelEnd(clicked);
      const [s, e] = sortPair(selStart, clicked);
      const match = notes.find(n =>
        n.start.getTime() === s.getTime() && n.end.getTime() === e.getTime()
      );
      if (match) setNoteText(match.text);
    }
  };

  const handleSaveNote = () => {
    if (!noteText.trim() || !selStart || !selEnd) return;
    const [s, e] = sortPair(selStart, selEnd);
    setNotes(prev => {
      const filtered = prev.filter(n => !(n.start.getTime() === s.getTime() && n.end.getTime() === e.getTime()));
      return [{ start: s, end: e, text: noteText.trim() }, ...filtered];
    });
  };

  const handleDeleteNote = (e, idx) => {
    e.stopPropagation();
    setNotes(prev => prev.filter((_, i) => i !== idx));
  };

  const navigate = (dir) => {
    setGridKey(k => k + 1);
    setImgLoaded(false);
    if (dir === 1) {
      if (month === 11) { setMonth(0);  setYear(y => y + 1); }
      else setMonth(m => m + 1);
    } else {
      if (month === 0) { setMonth(11); setYear(y => y - 1); }
      else setMonth(m => m - 1);
    }
  };

  const goToday = () => {
    setGridKey(k => k + 1);
    setImgLoaded(false);
    setMonth(today.getMonth());
    setYear(today.getFullYear());
  };

  const clearSel = () => {
    setSelStart(null);
    setSelEnd(null);
    setNoteText("");
    setHover(null);
  };

  const selLabel = () => {
    if (!selStart) return "Click a date to begin your selection";
    if (!selEnd)   return `Starting ${fmtShort(selStart)} — click an end date`;
    const [s, e] = sortPair(selStart, selEnd);
    if (s.getTime() === e.getTime()) return fmtShort(s);
    const days = Math.round((e - s) / 86400000) + 1;
    return `${fmtShort(s)} → ${fmtShort(e)} · ${days} day${days > 1 ? "s" : ""}`;
  };

  const cells = [];
  for (let i = 0; i < firstDOW; i++) cells.push(null);
  for (let d = 1; d <= daysInMonth; d++) cells.push(d);

  const isToday = (d) => d === today.getDate() && month === today.getMonth() && year === today.getFullYear();

  return (
    <>
      <div className={`wcal-root ${isDark ? 'dark-mode' : ''}`} style={{ background: isDark ? '#080C14' : theme.bg, "--accent": theme.accent, "--accent-a": theme.aAlpha }}>
        
        <div className="wcal-card">
          
          {/* GLASSMORPHISM MONTH OVERLAY */}
          <div className={`wcal-month-overlay ${isMenuOpen ? 'open' : ''}`} onClick={() => setIsMenuOpen(false)}>
            <div className="wcal-month-grid-container" onClick={e => e.stopPropagation()}>
              <h2 className="wcal-overlay-title">Select Month</h2>
              <div className="wcal-month-grid">
                {MONTH_NAMES.map((m, i) => (
                  <button
                    key={m}
                    className={`wcal-month-btn ${i === month ? 'active' : ''}`}
                    onClick={() => {
                      if (i !== month) {
                        setGridKey(k => k + 1);
                        setImgLoaded(false);
                        setMonth(i);
                      }
                      setIsMenuOpen(false);
                    }}
                  >
                    {m.slice(0, 3)}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* AREA 1: HERO */}
          <div className="wcal-hero">
            <img key={heroUrl} className={`wcal-hero-img ${imgLoaded ? "loaded" : "loading"}`} src={heroUrl} alt={MONTH_NAMES[month]} onLoad={() => setImgLoaded(true)} />
            <div className="wcal-hero-grad" />
            <div className="wcal-hero-badge">
              <div className="wcal-hero-month">{MONTH_NAMES[month]}</div>
              <div className="wcal-hero-year">{year}</div>
              <div className="wcal-hero-vibe">{theme.vibe}</div>
            </div>
          </div>

          {/* AREA 2: NOTES */}
          <div className="wcal-notes">
            <div className="wcal-notes-header">
              <span className="wcal-section-label">Notes</span>
              {selStart && selEnd && sortedStart && sortedEnd && (
                <span className="wcal-notes-range-tag">
                  {fmtShort(sortedStart)}
                  {sortedStart.getTime() !== sortedEnd.getTime() && ` — ${fmtShort(sortedEnd)}`}
                </span>
              )}
            </div>

            <textarea
              className="wcal-textarea"
              value={noteText}
              onChange={e => setNoteText(e.target.value)}
              placeholder={
                selStart && selEnd
                  ? `Focus points for ${fmtShort(sortedStart)}:\n• \n• \n• `
                  : "Select a date range to add focus points..."
              }
              disabled={!selStart || !selEnd}
            />

            {selStart && selEnd && (
              <div className="wcal-btn-row">
                <button
                  className="wcal-save-btn"
                  onClick={handleSaveNote}
                  disabled={!noteText.trim()}
                  style={{ opacity: noteText.trim() ? 1 : 0.45, cursor: noteText.trim() ? "pointer" : "default" }}
                >
                  Save Note
                </button>
                {noteText && (
                  <button className="wcal-clear-note-btn" onClick={() => setNoteText("")} title="Clear note">×</button>
                )}
              </div>
            )}

            {notes.length > 0 && (
              <>
                <span className="wcal-section-label" style={{ marginTop: 4 }}>Saved</span>
                <div className="wcal-saved-list">
                  {notes.map((n, i) => (
                    <div key={i} className="wcal-saved-item" onClick={() => { setSelStart(n.start); setSelEnd(n.end); setNoteText(n.text); }}>
                      <div className="wcal-saved-item-date">
                        {fmtShort(n.start)}
                        {n.start.getTime() !== n.end.getTime() && ` — ${fmtShort(n.end)}`}
                      </div>
                      <div className="wcal-saved-item-text">{n.text}</div>
                      <button className="wcal-saved-item-del" onClick={(e) => handleDeleteNote(e, i)} title="Delete note">×</button>
                    </div>
                  ))}
                </div>
              </>
            )}
          </div>

          {/* AREA 3: RIGHT PANEL (GRID) */}
          <div className="wcal-right">
            
            {/* Header with Clickable Dropdown trigger */}
            <div className="wcal-header">
              <div className="wcal-title-block" onClick={() => setIsMenuOpen(true)}>
                <div className="wcal-month-title flex-title">
                  {MONTH_NAMES[month]}
                  <svg className={`dropdown-arrow ${isMenuOpen ? 'rotated' : ''}`} width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m6 9 6 6 6-6"/></svg>
                </div>
                <div className="wcal-year-label">{year}</div>
              </div>
              
              <div className="wcal-controls">
                <button className="wcal-today-btn" onClick={goToday}>Today</button>
                <button className="wcal-nav" onClick={() => navigate(-1)}>‹</button>
                <button className="wcal-nav" onClick={() => navigate(1)}>›</button>
                <button className="wcal-theme-toggle" onClick={() => setIsDark(!isDark)} title={`Switch to ${isDark ? 'Light' : 'Dark'} Mode`}>
                  {isDark ? (
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="5"></circle><line x1="12" y1="1" x2="12" y2="3"></line><line x1="12" y1="21" x2="12" y2="23"></line><line x1="4.22" y1="4.22" x2="5.64" y2="5.64"></line><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"></line><line x1="1" y1="12" x2="3" y2="12"></line><line x1="21" y1="12" x2="23" y2="12"></line><line x1="4.22" y1="19.78" x2="5.64" y2="18.36"></line><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"></line></svg>
                  ) : (
                    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"></path></svg>
                  )}
                </button>
              </div>
            </div>

            <div className="wcal-sel-bar">
              <div className="wcal-sel-pip" />
              <span className="wcal-sel-txt">{selLabel()}</span>
              {selStart && (
                <button className="wcal-sel-x" onClick={clearSel} title="Clear selection">×</button>
              )}
            </div>

            <div className="wcal-grid-wrap">
              <div className="wcal-day-labels">
                {DAY_LABELS.map(d => <div key={d} className="wcal-dl">{d}</div>)}
              </div>

              <div className={`wcal-grid wcal-grid-anim`} key={gridKey}>
                {cells.map((d, i) => {
                  if (!d) return <div key={`e${i}`} className="wcal-cell empty" />;
                  const date     = mkDate(year, month, d);
                  const col      = i % 7;
                  const start    = isStart(date);
                  const end      = isEnd(date);
                  const between  = inRange(date);
                  const today_   = isToday(d);
                  const weekend  = col === 0 || col === 6;
                  const holiday  = HOLIDAYS[`${month},${d}`];
                  const single   = start && end; 

                  let barStyle = null;
                  if ((start || end || between) && !single) {
                    barStyle = { left: start ? "50%" : "0", right: end ? "50%" : "0" };
                  }

                  const classes = ["wcal-cell", start ? "is-start" : "", end ? "is-end" : "", between ? "is-between" : "", today_ ? "is-today" : "", weekend ? "is-weekend" : ""].filter(Boolean).join(" ");

                  return (
                    <div key={d} className={classes} style={{ animationDelay: `${(i - firstDOW) * 13}ms` }} onClick={() => handleDayClick(d)} onMouseEnter={() => selStart && !selEnd && setHover(date)} onMouseLeave={() => setHover(null)}>
                      {barStyle && <div className="wcal-cell-bar" style={barStyle} />}
                      <div className="wcal-cell-disc"><span className="wcal-cell-num">{d}</span></div>
                      {holiday && <div className="wcal-cell-dot" />}
                      {holiday && <div className="wcal-cell-tip">{holiday}</div>}
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

        </div>
      </div>
    </>
  );
}
