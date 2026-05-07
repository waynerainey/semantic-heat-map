import { useState, useRef, useEffect, useCallback } from "react";

const TITLES = [
  "Account Executive","Brand Manager","Business Analyst","Business Development Manager",
  "Business Operations Manager","Chief Executive Officer","Chief Financial Officer",
  "Chief Marketing Officer","Chief Operating Officer","Chief People Officer",
  "Chief Revenue Officer","Chief Technology Officer","Communications Manager",
  "Compensation and Benefits Manager","Compliance Manager","Content Marketing Manager",
  "Controller","Customer Success Manager","Data Analyst","Data Scientist",
  "Department Manager","Digital Marketing Manager","Director of Engineering",
  "Director of Finance","Director of Operations","Director of Product Management",
  "Director of Sales","Engineering Manager","Executive Director","Finance Manager",
  "Financial Analyst","General Counsel","General Manager","HR Business Partner",
  "HR Director","HR Generalist","HR Manager","HR Operations Manager",
  "Human Resources Business Partner","Learning and Development Manager","Legal Counsel",
  "Management Consultant","Managing Director","Marketing Manager","Operations Manager",
  "Organizational Development Manager","People Operations Manager","Product Manager",
  "Program Manager","Project Manager","Recruiter","Risk Manager","Sales Manager",
  "Senior Business Analyst","Senior Financial Analyst","Senior HR Business Partner",
  "Senior Marketing Manager","Senior Operations Manager","Senior Product Manager",
  "Senior Program Manager","Senior Project Manager","Senior Recruiter",
  "Senior Software Engineer","Software Engineer","Strategy Consultant","Strategy Manager",
  "Talent Acquisition Manager","Talent Acquisition Specialist","Technical Recruiter",
  "UX Designer","UX/UI Designer","VP of Engineering","VP of Human Resources",
  "VP of Marketing","VP of Sales","Vice President","Workforce Planning Manager",
];

const BG      = "#F7F3EC";
const SURFACE  = "#EDE8DE";
const SURFACE2 = "#FFFFFF";
const BORDER   = "rgba(0,0,0,0.08)";
const SHADOW   = "0 1px 3px rgba(0,0,0,0.05),0 4px 12px rgba(0,0,0,0.04)";
const INK      = "#1C1917";
const INK2     = "#44403C";
const INK3     = "#6B6866";

const TC = {
  hot:  { label:"HOT",  color:"#B83000", border:"rgba(184,48,0,0.25)",  range:[75,100] },
  warm: { label:"WARM", color:"#B86000", border:"rgba(184,96,0,0.22)",  range:[50,74]  },
  cool: { label:"COOL", color:"#1A5AA0", border:"rgba(26,90,160,0.22)", range:[25,49]  },
  cold: { label:"COLD", color:"#0F3E8A", border:"rgba(15,62,138,0.22)", range:[0,24]   },
};

const COL_COLORS = {
  primary:   "#B83000",
  secondary: "#1A5AA0",
  tertiary:  "#6B5040",
};

// ── SIGNAL HIGHLIGHTER ───────────────────────────────────────────────────────
function splitSignals(content, hotSignals, coldSignals) {
  if (!content) return [{ text:"", type:"normal" }];
  const all = [
    ...(hotSignals||[]).filter(s=>s?.phrase).map(s=>({ phrase:s.phrase, type:"hot",  meta:s.cluster })),
    ...(coldSignals||[]).filter(s=>s?.phrase).map(s=>({ phrase:s.phrase, type:"cold", meta:s.reason  })),
  ];
  if (!all.length) return [{ text:content, type:"normal" }];
  let parts = [{ text:content, type:"normal" }];
  for (const sig of all) {
    const next = [];
    for (const part of parts) {
      if (part.type !== "normal") { next.push(part); continue; }
      const idx = part.text.toLowerCase().indexOf(sig.phrase.toLowerCase());
      if (idx === -1) { next.push(part); continue; }
      if (idx > 0) next.push({ text:part.text.slice(0,idx), type:"normal" });
      next.push({ text:part.text.slice(idx,idx+sig.phrase.length), type:sig.type, meta:sig.meta });
      const rest = part.text.slice(idx+sig.phrase.length);
      if (rest) next.push({ text:rest, type:"normal" });
    }
    parts = next;
  }
  return parts;
}

function HighlightedText({ content, hotSignals, coldSignals }) {
  const parts = splitSignals(content, hotSignals, coldSignals);
  return (
    <span>
      {parts.map((p,i) => {
        if (p.type==="hot") return (
          <mark key={i} title={p.meta} style={{ background:"rgba(184,48,0,0.09)", color:"#7A1E00", borderRadius:"3px", padding:"1px 4px", cursor:"help", borderBottom:"2px solid rgba(184,48,0,0.3)", fontWeight:"700", outline:"none" }}>{p.text}</mark>
        );
        if (p.type==="cold") return (
          <mark key={i} title={p.meta} style={{ background:"rgba(26,90,160,0.07)", color:"#153D70", borderRadius:"3px", padding:"1px 4px", cursor:"help", borderBottom:"2px dotted rgba(26,90,160,0.3)", outline:"none" }}>{p.text}</mark>
        );
        return <span key={i} style={{ color:INK2 }}>{p.text}</span>;
      })}
    </span>
  );
}

// ── THERMOMETER ──────────────────────────────────────────────────────────────
function Thermometer({ temperature, score }) {
  const cfg = TC[temperature] || TC.cool;
  return (
    <div style={{ display:"flex", alignItems:"center", gap:"32px", padding:"16px 0" }}>
      <div style={{ display:"flex", flexDirection:"column", height:"260px", justifyContent:"space-around", textAlign:"right" }}>
        {["hot","warm","cool","cold"].map(t => (
          <div key={t} style={{ fontFamily:"'Orbitron',monospace", fontSize:"9px", letterSpacing:"3px", color:TC[t].color, opacity:temperature===t?1:0.15, fontWeight:"700", transition:"opacity 0.5s" }}>{TC[t].label}</div>
        ))}
      </div>
      <div style={{ position:"relative", width:"26px", height:"260px" }}>
        <div style={{ position:"absolute", inset:0, borderRadius:"13px", background:"linear-gradient(to bottom,#B83000 0%,#B86000 33%,#1A5AA0 66%,#0F3E8A 100%)", opacity:0.07, border:`1px solid ${BORDER}` }}/>
        <div style={{ position:"absolute", bottom:0, left:0, right:0, height:`${score}%`, borderRadius:"13px", background:"linear-gradient(to top,#0F3E8A 0%,#1A5AA0 40%,#B86000 72%,#B83000 100%)", transition:"height 1.4s cubic-bezier(0.34,1.56,0.64,1)", opacity:0.5 }}/>
        {[25,50,75].map(p => (
          <div key={p} style={{ position:"absolute", left:"-5px", right:"-5px", top:`${100-p}%`, height:"1px", background:"rgba(0,0,0,0.08)" }}/>
        ))}
        <div style={{ position:"absolute", left:"50%", top:`${100-score}%`, transform:"translate(-50%,-50%)", width:"42px", height:"18px", background:cfg.color, borderRadius:"9px", display:"flex", alignItems:"center", justifyContent:"center", fontFamily:"'Orbitron',monospace", fontSize:"9px", color:"white", fontWeight:"700", letterSpacing:"1px", boxShadow:`0 2px 10px ${cfg.border}`, transition:"top 1.4s cubic-bezier(0.34,1.56,0.64,1)", zIndex:10 }}>{score}</div>
      </div>
      <div>
        <div style={{ fontFamily:"'Orbitron',monospace", fontSize:"46px", fontWeight:"900", color:cfg.color, lineHeight:1, letterSpacing:"-1px" }}>{cfg.label}</div>
        <div style={{ fontSize:"12px", color:INK3, marginTop:"8px", lineHeight:1.8, fontFamily:"'Nunito',sans-serif" }}>{score}/100 semantic match<br/>against target role</div>
      </div>
    </div>
  );
}

// ── SECTION ROW ──────────────────────────────────────────────────────────────
function SectionRow({ section }) {
  const hasHot  = section.hot_signals?.length > 0;
  const hasCold = section.cold_signals?.length > 0;
  return (
    <div style={{ display:"grid", gridTemplateColumns:"1fr 2fr 1fr", gap:"14px", padding:"22px 0", borderBottom:`1px solid ${BORDER}`, alignItems:"start" }}>
      <div>
        {hasHot ? section.hot_signals.map((sig,j) => (
          <div key={j} style={{ background:"rgba(184,48,0,0.04)", border:`1px solid rgba(184,48,0,0.15)`, borderLeft:"3px solid #B83000", borderRadius:"6px", padding:"10px 12px", marginBottom:"8px", boxShadow:SHADOW }}>
            <div style={{ color:"#7A1E00", fontSize:"12px", fontWeight:"700", marginBottom:"4px", lineHeight:1.4 }}>"{sig.phrase}"</div>
            <div style={{ color:INK3, fontSize:"11px", lineHeight:1.55 }}>{sig.cluster}</div>
          </div>
        )) : <div style={{ color:INK3, fontSize:"11px", fontStyle:"italic", textAlign:"center", paddingTop:"18px", opacity:0.4 }}>—</div>}
      </div>
      <div style={{ background:SURFACE2, border:`1px solid ${BORDER}`, borderRadius:"10px", padding:"16px 20px", boxShadow:SHADOW }}>
        <div style={{ fontFamily:"'Orbitron',monospace", fontSize:"8px", letterSpacing:"2.5px", color:INK3, marginBottom:"10px", textTransform:"uppercase" }}>{section.name}</div>
        <div style={{ fontSize:"13px", lineHeight:1.9, whiteSpace:"pre-wrap" }}>
          <HighlightedText content={section.content} hotSignals={section.hot_signals} coldSignals={section.cold_signals} />
        </div>
      </div>
      <div>
        {hasCold ? section.cold_signals.map((sig,j) => (
          <div key={j} style={{ background:"rgba(26,90,160,0.04)", border:`1px solid rgba(26,90,160,0.13)`, borderLeft:"3px solid #1A5AA0", borderRadius:"6px", padding:"10px 12px", marginBottom:"8px", boxShadow:SHADOW }}>
            <div style={{ color:"#153D70", fontSize:"12px", fontWeight:"600", marginBottom:"4px", lineHeight:1.4 }}>"{sig.phrase}"</div>
            <div style={{ color:INK3, fontSize:"11px", lineHeight:1.55 }}>{sig.reason}</div>
          </div>
        )) : <div style={{ color:INK3, fontSize:"11px", fontStyle:"italic", textAlign:"center", paddingTop:"18px", opacity:0.4 }}>—</div>}
      </div>
    </div>
  );
}

// ── CELL TOWER SVG ───────────────────────────────────────────────────────────
function CellTower({ color, height=2, isReceiver=false, animate=false }) {
  const H = isReceiver ? 110 : (height===1 ? 52 : height===2 ? 72 : 92);
  const W = isReceiver ? 52 : 36;
  const cx = W/2;
  const topY = isReceiver ? 18 : 10;
  const s = isReceiver ? 1.3 : 1;

  return (
    <svg width={W} height={H+10} viewBox={`0 0 ${W} ${H+10}`} style={{ display:"block" }}>
      {/* Signal arcs */}
      <path d={`M ${cx-12*s},${topY+3} Q ${cx},${topY-14*s} ${cx+12*s},${topY+3}`}
        fill="none" stroke={color} strokeWidth={isReceiver?"2":"1.5"} opacity="0.65"/>
      <path d={`M ${cx-20*s},${topY+3} Q ${cx},${topY-24*s} ${cx+20*s},${topY+3}`}
        fill="none" stroke={color} strokeWidth={isReceiver?"1.5":"1"} opacity="0.3"/>
      {/* Tip */}
      <circle cx={cx} cy={topY} r={isReceiver?4:3} fill={color}/>
      {/* Mast */}
      <line x1={cx} y1={H+8} x2={cx} y2={topY} stroke={color} strokeWidth={isReceiver?3:2}/>
      {/* Cross arms */}
      <line x1={cx-10*s} y1={topY+16*s} x2={cx+10*s} y2={topY+16*s} stroke={color} strokeWidth={isReceiver?2:1.6}/>
      {(height>=2||isReceiver) && <line x1={cx-7*s} y1={topY+28*s} x2={cx+7*s} y2={topY+28*s} stroke={color} strokeWidth={isReceiver?1.8:1.4}/>}
      {(height>=3||isReceiver) && <line x1={cx-5*s} y1={topY+40*s} x2={cx+5*s} y2={topY+40*s} stroke={color} strokeWidth={isReceiver?1.5:1.2}/>}
      {/* Base */}
      <line x1={cx-12} y1={H+8} x2={cx+12} y2={H+8} stroke={color} strokeWidth={isReceiver?2.5:2} opacity="0.4"/>
    </svg>
  );
}

// ── CATEGORIZATION VIZ ───────────────────────────────────────────────────────
function CategorizationViz({ analysis }) {
  const towers   = analysis.categorization?.towers   || [];
  const insight  = analysis.categorization?.insight  || "";

  const [dealtCount,   setDealtCount]   = useState(0);
  const [showPercent,  setShowPercent]  = useState(false);
  const [showBullets,  setShowBullets]  = useState(false);
  const [barWidths,    setBarWidths]    = useState({ primary:0, secondary:0, tertiary:0 });

  // Assign each tower to dominant receiver
  const assigned = towers.map(t => {
    const dom = (t.transmits_to||[]).reduce((a,b) => (a.strength||0) > (b.strength||0) ? a : b, { receiver:"primary", strength:0 });
    return { ...t, column: dom.receiver, domStrength: dom.strength };
  });

  const columns = {
    primary:   { label: analysis.primary_inference,   towers: assigned.filter(t=>t.column==="primary")   },
    secondary: { label: analysis.secondary_inference,  towers: assigned.filter(t=>t.column==="secondary") },
    tertiary:  { label: analysis.tertiary_inference,   towers: assigned.filter(t=>t.column==="tertiary")  },
  };

  // Weight = sum of heights in each column
  const weights = Object.fromEntries(
    Object.entries(columns).map(([k,c]) => [k, c.towers.reduce((s,t) => s+(t.height||1), 0)])
  );
  const totalWeight = Math.max(1, Object.values(weights).reduce((a,b) => a+b, 0));
  const pcts = Object.fromEntries(Object.entries(weights).map(([k,w]) => [k, Math.round(w/totalWeight*100)]));

  // Dealing animation
  useEffect(() => {
    if (towers.length === 0) return;
    if (dealtCount < towers.length) {
      const t = setTimeout(() => setDealtCount(d=>d+1), 380);
      return () => clearTimeout(t);
    }
    if (dealtCount === towers.length) {
      const t = setTimeout(() => setShowPercent(true), 600);
      return () => clearTimeout(t);
    }
  }, [dealtCount, towers.length]);

  useEffect(() => {
    if (!showPercent) return;
    // Animate bar widths
    const t = setTimeout(() => setBarWidths(pcts), 80);
    const t2 = setTimeout(() => setShowBullets(true), 900);
    return () => { clearTimeout(t); clearTimeout(t2); };
  }, [showPercent]);

  // Track which deal index each tower has
  const dealIndex = {};
  assigned.forEach((t,i) => { dealIndex[i] = i; });

  const COLKEYS = ["primary","secondary","tertiary"];

  return (
    <div style={{ padding:"24px 20px" }}>
      <style>{`
        @keyframes dealIn {
          from { opacity:0; transform:translateY(-24px) scale(0.85); }
          to   { opacity:1; transform:translateY(0) scale(1); }
        }
        @keyframes fadeIn {
          from { opacity:0; transform:translateY(8px); }
          to   { opacity:1; transform:translateY(0); }
        }
        @keyframes barGrow { from { width:0; } }
      `}</style>

      {/* Insight header */}
      {insight && (
        <div style={{ background:SURFACE2, border:`1px solid ${BORDER}`, borderLeft:"3px solid #B86000", borderRadius:"8px", padding:"14px 18px", marginBottom:"24px", boxShadow:SHADOW }}>
          <div style={{ fontFamily:"'Orbitron',monospace", fontSize:"8px", letterSpacing:"3px", color:INK3, marginBottom:"6px" }}>SIGNAL READ</div>
          <p style={{ color:INK2, fontSize:"14px", lineHeight:1.85, margin:0, fontStyle:"italic" }}>{insight}</p>
        </div>
      )}

      {/* Three columns */}
      <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr 1fr", gap:"16px" }}>
        {COLKEYS.map(key => {
          const col    = columns[key];
          const color  = COL_COLORS[key];
          const pct    = pcts[key] || 0;
          const isSole = key === COLKEYS.reduce((a,b) => pcts[a]>pcts[b]?a:b);

          return (
            <div key={key} style={{ background:SURFACE2, border:`1px solid ${BORDER}`, borderTop:`3px solid ${color}`, borderRadius:"10px", padding:"20px 16px", boxShadow:SHADOW, display:"flex", flexDirection:"column", gap:"16px" }}>

              {/* Column header */}
              <div>
                <div style={{ fontFamily:"'Orbitron',monospace", fontSize:"8px", letterSpacing:"2px", color, marginBottom:"4px" }}>
                  {key.toUpperCase()}
                </div>
                <div style={{ fontFamily:"'Nunito',sans-serif", fontSize:"13px", fontWeight:"700", color:INK, lineHeight:1.35 }}>
                  {col.label || "—"}
                </div>
              </div>

              {/* Receiver tower */}
              <div style={{ display:"flex", justifyContent:"center", paddingTop:"4px" }}>
                <CellTower color={color} isReceiver={true}/>
              </div>

              {/* Signal towers dealt in */}
              <div style={{ minHeight:"80px" }}>
                <div style={{ fontFamily:"'Orbitron',monospace", fontSize:"7px", letterSpacing:"2px", color:INK3, marginBottom:"10px" }}>
                  ALIGNED SIGNALS
                </div>
                <div style={{ display:"flex", flexWrap:"wrap", gap:"10px", alignItems:"flex-end" }}>
                  {col.towers.map((tower, colIdx) => {
                    const globalIdx = assigned.indexOf(tower);
                    const isVisible = globalIdx < dealtCount;
                    if (!isVisible) return null;
                    return (
                      <div key={colIdx} style={{
                        display:"flex", flexDirection:"column", alignItems:"center", gap:"4px",
                        animation:"dealIn 0.35s cubic-bezier(0.34,1.4,0.64,1) both",
                      }}>
                        <CellTower color={color} height={tower.height||1}/>
                        <div style={{ fontSize:"9px", color:INK2, textAlign:"center", maxWidth:"56px", lineHeight:1.3, fontWeight:"600" }}>
                          {tower.signal}
                        </div>
                      </div>
                    );
                  })}
                  {col.towers.length === 0 && dealtCount >= towers.length && (
                    <div style={{ color:INK3, fontSize:"11px", fontStyle:"italic", opacity:0.5 }}>No dominant signal</div>
                  )}
                </div>
              </div>

              {/* Percentage bar */}
              {showPercent && (
                <div style={{ animation:"fadeIn 0.5s ease both" }}>
                  <div style={{ display:"flex", justifyContent:"space-between", marginBottom:"6px" }}>
                    <span style={{ fontFamily:"'Orbitron',monospace", fontSize:"8px", letterSpacing:"2px", color:INK3 }}>SIGNAL WEIGHT</span>
                    <span style={{ fontFamily:"'Orbitron',monospace", fontSize:"11px", fontWeight:"700", color }}>
                      {pct}%
                    </span>
                  </div>
                  <div style={{ height:"8px", background:"rgba(0,0,0,0.06)", borderRadius:"4px", overflow:"hidden" }}>
                    <div style={{
                      height:"100%", background:color, borderRadius:"4px",
                      width:`${barWidths[key]||0}%`,
                      transition:"width 0.9s cubic-bezier(0.34,1.1,0.64,1)",
                    }}/>
                  </div>
                  {isSole && (
                    <div style={{ marginTop:"6px", fontSize:"9px", color, fontFamily:"'Orbitron',monospace", letterSpacing:"1px" }}>
                      ▲ DOMINANT IDENTITY
                    </div>
                  )}
                </div>
              )}

              {/* Bullet list */}
              {showBullets && col.towers.length > 0 && (
                <div style={{ animation:"fadeIn 0.5s ease both", borderTop:`1px solid ${BORDER}`, paddingTop:"14px" }}>
                  <div style={{ fontFamily:"'Orbitron',monospace", fontSize:"7px", letterSpacing:"2px", color:INK3, marginBottom:"10px" }}>
                    WHAT'S BUILDING THIS IDENTITY
                  </div>
                  <ul style={{ margin:0, padding:0, listStyle:"none", display:"flex", flexDirection:"column", gap:"6px" }}>
                    {col.towers.map((t, i) => (
                      <li key={i} style={{ display:"flex", gap:"8px", alignItems:"flex-start" }}>
                        <span style={{ color, fontSize:"10px", marginTop:"2px", flexShrink:0 }}>▸</span>
                        <div>
                          <div style={{ fontSize:"12px", color:INK, fontWeight:"600", lineHeight:1.35 }}>{t.signal}</div>
                          {t.why && <div style={{ fontSize:"11px", color:INK3, lineHeight:1.4, marginTop:"2px" }}>{t.why}</div>}
                        </div>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

            </div>
          );
        })}
      </div>

      {/* Disclaimer */}
      <p style={{ color:INK3, fontSize:"11px", lineHeight:1.8, marginTop:"20px", fontStyle:"italic" }}>
        Signal assignments are based on dominant transmission strength per cluster. Actual system categorization weights are proprietary and unknown. This is an approximation, not a measurement.
      </p>
    </div>
  );
}

function CategorizationLocked({ score }) {
  return (
    <div style={{ textAlign:"center", padding:"72px 40px" }}>
      <div style={{ fontSize:"36px", marginBottom:"20px" }}>🔒</div>
      <div style={{ fontFamily:"'Orbitron',monospace", fontSize:"11px", letterSpacing:"3px", color:INK2, marginBottom:"18px" }}>CATEGORIZATION LOCKED</div>
      <p style={{ fontSize:"14px", color:INK3, lineHeight:2, maxWidth:"420px", margin:"0 auto 16px" }}>
        Categorization analysis requires a Discovery score of 75 or higher. Below that threshold the categorical signal is too diffuse to produce a reliable directional read.
      </p>
      <p style={{ fontSize:"13px", color:INK3, lineHeight:1.9, maxWidth:"420px", margin:"0 auto" }}>
        Your current score is <strong style={{ color:INK2 }}>{score}</strong>. Strengthen discovery signal first — then return to see your transmission map.
      </p>
    </div>
  );
}

// ── DCR>O ABOUT TAB ──────────────────────────────────────────────────────────
const DCRO_STAGES = [
  {
    letter:"D", name:"Discovery",
    badge:"DIAGNOSTIC AVAILABLE", badgeColor:"#B83000", diagnosable:true,
    what:"When a recruiter runs a search, the system scans every profile in its database and decides which ones are worth surfacing. Your profile either makes the cut or it doesn't — before any human sees your name. The question at this stage is simple: does your profile speak the same language as the role you're targeting?",
    why:"This is where you have the most direct control. The words you use, where you use them, and how specifically you describe your experience all influence whether the system finds you. The heat map shows you exactly which parts of your profile are working — and which ones are invisible to the search.",
    note:null,
  },
  {
    letter:"C", name:"Categorization",
    badge:"DIAGNOSTIC AVAILABLE AT 75+", badgeColor:"#B86000", diagnosable:true,
    what:"Once the system finds you, it tries to figure out what kind of professional you are. Think of it as the system asking: which drawer does this person go in? HR leader? Technical recruiter? Operations manager? Getting found is step one. Getting filed correctly is step two — and you can pass step one and still fail step two.",
    why:"When your discovery score reaches 75, there's enough signal to see how the system is categorizing you. The identity columns show which parts of your profile are building which professional identity — and what percentage of your overall signal is going to each one. If the wrong identity is getting the most signal, that's the problem to fix.",
    note:"In reality, discovery and categorization happen at the same time — the system doesn't pause between them. This framework separates them to make each one easier to understand. Think of it like slow-motion replay of something that takes a fraction of a second.",
  },
  {
    letter:"R", name:"Ranking",
    badge:"NOT DIAGNOSABLE", badgeColor:"#A8A29E", diagnosable:false,
    what:"Once the system has found and filed you, it decides where to place you in the results. Candidates who more closely match the ideal pattern for that role get ranked higher. Candidates who are further from that pattern get buried. Most career advice focuses on this stage — but few tools can actually measure it honestly.",
    why:"Here's the truth: we can't tell you where you'll rank. Your position depends on who else came up in that same search — and that changes every single time someone runs it. A recruiter searching on Tuesday gets different results than the same search on Thursday. We can help you build the strongest possible signal. Where that puts you relative to everyone else is not something any tool can honestly predict.",
    note:"Any tool that gives you a ranking score is making an educated guess based on incomplete information. Be skeptical of false precision. The best realistic outcome is getting your profile strong enough to land in the top half of searches in your target role. That's the ceiling of what's actually in your control.",
  },
  {
    letter:"O", name:"Output",
    badge:"HUMAN JUDGMENT", badgeColor:"#A8A29E", diagnosable:false,
    what:"This is where the algorithm hands off to a human. A recruiter or hiring manager sees your profile and decides whether to reach out. Everything from this point forward — the tone of the message, the first impression, the interview — is driven by human judgment, not a system.",
    why:"No tool can predict what a specific person will think of your profile on a specific day. What you can do is make sure the system delivered you to the right person in the right context — which is exactly what the first two stages address. Getting discovery and categorization right means you show up where you're supposed to. What happens after that is between you and another human.",
    note:null,
  },
];

function DCROTab() {
  const [open, setOpen] = useState({ D:true, C:false, R:false, O:false });
  return (
    <div style={{ padding:"32px 28px", maxWidth:"780px", margin:"0 auto" }}>
      <div style={{ fontFamily:"'Orbitron',monospace", fontSize:"9px", letterSpacing:"4px", color:INK3, marginBottom:"8px" }}>HOW SEMANTIC SEARCH ACTUALLY WORKS</div>
      <h2 style={{ fontFamily:"'Orbitron',monospace", fontSize:"20px", fontWeight:"900", color:INK, margin:"0 0 6px", letterSpacing:"-0.5px" }}>D &nbsp;›&nbsp; C &nbsp;›&nbsp; R &nbsp;›&nbsp; O</h2>
      <div style={{ fontSize:"12px", color:INK3, marginBottom:"10px" }}>
        The DCR›O Framework · Developed by{" "}
        <a href="https://linkedin.com/in/wrainey" target="_blank" rel="noopener noreferrer" style={{ color:"#B86000", textDecoration:"none", fontWeight:"700" }}>Wayne Rainey</a>
        {" · "}
        <a href="https://thecareercantina.com" target="_blank" rel="noopener noreferrer" style={{ color:INK3, textDecoration:"none" }}>The Career Cantina</a>
      </div>
      <p style={{ color:INK2, fontSize:"14px", lineHeight:1.9, marginBottom:"32px", maxWidth:"600px" }}>
        Most people think hiring systems search for keywords — so they stuff their profiles with terms from job descriptions. That's not wrong, but it's incomplete. Keyword search finds exact matches. Semantic search finds meaning. The difference matters: a system using semantic search can recognize that 'talent acquisition' and 'recruiting' describe the same professional identity even if neither word appears in the job posting. It can also recognize that 'results-driven professional' means almost nothing — because the phrase appears on so many profiles it has lost all distinguishing signal. Understanding this changes how you think about your profile entirely.
      </p>
      <p style={{ color:INK2, fontSize:'14px', lineHeight:1.9, marginBottom:'32px', maxWidth:'600px' }}>
        When a recruiter searches for candidates, a lot happens before any human sees your name. This tool breaks that process into four stages so you can see exactly where you have influence — and where you don't.
      </p>
      <div style={{ display:"flex", alignItems:"center", gap:"2px", marginBottom:"32px", flexWrap:"wrap" }}>
        {DCRO_STAGES.map((s,i) => (
          <div key={s.letter} style={{ display:"flex", alignItems:"center" }}>
            <div onClick={()=>setOpen(p=>({...p,[s.letter]:!p[s.letter]}))} style={{ background:s.diagnosable?(s.letter==="D"?"#B83000":"#B86000"):SURFACE, color:s.diagnosable?"white":INK3, borderRadius:"8px", padding:"10px 18px", cursor:"pointer", fontFamily:"'Orbitron',monospace", fontSize:"11px", fontWeight:"700", letterSpacing:"1px", border:`1px solid ${s.diagnosable?"transparent":BORDER}`, transition:"all 0.2s", boxShadow:s.diagnosable?"0 2px 8px rgba(0,0,0,0.12)":"none" }}>
              {s.letter} — {s.name}
            </div>
            {i<3 && <div style={{ color:INK3, fontSize:"16px", padding:"0 6px" }}>›</div>}
          </div>
        ))}
      </div>
      <div style={{ display:"flex", flexDirection:"column", gap:"12px" }}>
        {DCRO_STAGES.map(s => (
          <div key={s.letter} style={{ background:SURFACE2, border:`1px solid ${BORDER}`, borderLeft:`3px solid ${s.badgeColor}`, borderRadius:"8px", overflow:"hidden", boxShadow:SHADOW }}>
            <div onClick={()=>setOpen(p=>({...p,[s.letter]:!p[s.letter]}))} style={{ display:"flex", alignItems:"center", justifyContent:"space-between", padding:"16px 20px", cursor:"pointer" }}>
              <div style={{ display:"flex", alignItems:"center", gap:"14px" }}>
                <div style={{ fontFamily:"'Orbitron',monospace", fontSize:"22px", fontWeight:"900", color:s.badgeColor, lineHeight:1, minWidth:"24px" }}>{s.letter}</div>
                <div>
                  <div style={{ fontFamily:"'Orbitron',monospace", fontSize:"11px", fontWeight:"700", color:INK, letterSpacing:"1px" }}>{s.name}</div>
                  <span style={{ background:`${s.badgeColor}18`, color:s.badgeColor, fontSize:"9px", fontFamily:"'Orbitron',monospace", letterSpacing:"1.5px", padding:"2px 8px", borderRadius:"3px", fontWeight:"700", marginTop:"4px", display:"inline-block" }}>{s.badge}</span>
                </div>
              </div>
              <div style={{ color:INK3, fontSize:"18px", transform:open[s.letter]?"rotate(180deg)":"none", transition:"transform 0.2s" }}>∨</div>
            </div>
            {open[s.letter] && (
              <div style={{ padding:"0 20px 20px", borderTop:`1px solid ${BORDER}` }}>
                <div style={{ paddingTop:"16px" }}>
                  <div style={{ fontFamily:"'Orbitron',monospace", fontSize:"8px", letterSpacing:"2px", color:INK3, marginBottom:"6px" }}>WHAT HAPPENS HERE</div>
                  <p style={{ color:INK2, fontSize:"13px", lineHeight:1.9, margin:"0 0 16px" }}>{s.what}</p>
                  <div style={{ fontFamily:"'Orbitron',monospace", fontSize:"8px", letterSpacing:"2px", color:INK3, marginBottom:"6px" }}>{s.diagnosable?"WHY YOU CAN ACT ON THIS":"WHY THIS CAN'T BE MEASURED"}</div>
                  <p style={{ color:INK2, fontSize:"13px", lineHeight:1.9, margin:"0 0 12px" }}>{s.why}</p>
                  {s.note && <div style={{ background:SURFACE, borderRadius:"6px", padding:"12px 16px", borderLeft:`2px solid ${BORDER}` }}><p style={{ color:INK3, fontSize:"12px", lineHeight:1.8, margin:0, fontStyle:"italic" }}>{s.note}</p></div>}
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
      <div style={{ marginTop:"32px", padding:"20px", background:SURFACE, borderRadius:"8px", border:`1px solid ${BORDER}` }}>
        <div style={{ fontFamily:"'Orbitron',monospace", fontSize:"8px", letterSpacing:"2px", color:INK3, marginBottom:"8px" }}>GOOD TO KNOW</div>
        <p style={{ color:INK2, fontSize:"12px", lineHeight:1.9, margin:0 }}>In reality, Discovery, Categorization, and Ranking happen in a single inference pass — the system doesn't pause between them. Output is different: it's the moment the result surfaces to a human, which happens after the machine process completes. This framework separates all four stages to make each mechanism visible and to show where your leverage actually lives.</p>
      </div>
    </div>
  );
}

// ── FACTOIDS ─────────────────────────────────────────────────────────────────
const FACTOIDS = [
  { term:"How AI Reads Your Profile", def:"Hiring systems don't read your profile the way a human does. They convert it into a kind of fingerprint — a pattern they can compare against other profiles. Similar career backgrounds produce similar patterns, which is how the system groups people together." },
  { term:"Meaning Over Keywords", def:"The system isn't looking for exact words — it's looking for meaning. So 'recruiter' and 'talent acquisition specialist' point to the same professional identity even if neither appears in the job description. That's the difference between keyword search and meaning-based search." },
  { term:"Getting Found vs. Getting Chosen", def:"Getting found is a yes/no question — does the system pull your profile at all? Getting chosen is about where you land once you're in the pile. These are two different problems. Most advice focuses on the second one. This tool focuses on the first." },
  { term:"What the Outside World Can See", def:"LinkedIn controls what its own search sees — your full profile. But other tools and search engines only see a limited public version. No Featured section, no Recommendations, no Publications. What this tool analyzes is closer to that limited public view." },
  { term:"The Bullseye for Your Target Role", def:"Every job title has a bullseye — a pattern of experience, skills, and language the system associates most strongly with that role. The closer your profile gets to that bullseye, the more confidently the system recognizes you as belonging there." },
  { term:"Not All Profile Sections Are Equal", def:"Your headline and current job title carry more weight than a role you held a decade ago. The system pays more attention to what you're doing now than what you did in 2013. If your most current signal doesn't match your target role, older roles can't make up for it." },
  { term:"Action Words Without Proof", def:"Phrases like 'led strategic initiatives' or 'drove organizational change' look impressive but tell the system almost nothing. Without a specific outcome, a number, or a named result attached, action words are just noise. The system can't do anything with a verb that has no evidence behind it." },
  { term:"Your Past Competing With Your Present", def:"If your most detailed, specific experience is from ten years ago, the system may still read you as that person — even if you've moved on. An old job with rich content can outweigh a newer role with vague language. The past can quietly override the present." },
  { term:"Which Box the System Puts You In", def:"After finding you, the system tries to figure out what kind of professional you are. It sorts you into a category — HR leader, technical recruiter, operations manager — based on your overall pattern. If it puts you in the wrong category, you won't show up when the right people search." },
  { term:"Two Rounds of Evaluation", def:"Round one: does your profile get pulled at all? Round two: of the profiles pulled, does yours rise to the top? Most people focus on round two — polishing bullets, adding keywords. But if round one fails, round two never happens." },
  { term:"Sending Mixed Messages", def:"If your profile points strongly toward two or three different career identities at once, the system gets confused. Instead of confidently filing you under one role, it gives you a lower-confidence read across all of them. Versatility looks like ambiguity to an algorithm." },
  { term:"When a Non-Linear Career Gets Penalized", def:"If you've worked across multiple fields or made a deliberate pivot, your profile often sends signals pointing in different directions. That's not a weakness — it's a history. But the system reads it as uncertainty and categorizes you with less confidence than a straight-line career." },
  { term:"How Much Evidence Is in Your Profile", def:"Numbers, named tools, specific results — these are the things the system can actually work with. 'Reduced time-to-fill by 30%' tells it far more than 'improved recruiting efficiency.' The more specific evidence you attach to your experience, the stronger your signal." },
  { term:"The Words That Do Nothing", def:"Phrases like 'results-driven professional' or 'strategic thought leader' are so common the system has learned to tune them out. They sound good to humans but register as background noise to the algorithm. Every line of filler is a line that could have been a skill, a named tool, or a real result." },
  { term:"What LinkedIn Leaves Out of Your Export", def:"When you download your profile as a PDF, LinkedIn quietly drops several sections — Featured posts, Recommendations, Publications, Volunteer work, and Projects. The file you upload here is already missing pieces of your profile. This tool tells you what it can see. It can't see what LinkedIn chose not to include." },
  { term:"The Standard Version of Your Job Title", def:"Hiring systems normalize job titles into a standard list. 'Growth Ninja,' 'People Ops Wizard,' and 'Talent Champion' may not map to anything the system recognizes. If your title doesn't match a standard industry format, the system may not know what to do with you." },
  { term:"Why You Can't Know Where You'll Rank", def:"Even if this tool shows your profile is strong, we can't tell you where you'll land in a recruiter's search results. Your rank depends on who else came up in that same search — and that changes every time someone runs it. You can improve your signal. You cannot control the competition." },
  { term:"Hot Signal", def:"A hot signal is a phrase or term the system strongly associates with your target role. When it appears in your profile, the system's confidence goes up that you belong in that category. The heat map highlights these so you can see exactly what's working." },
  { term:"Cold Signal", def:"A cold signal is language that either means nothing to the system or actively points it toward the wrong category. It's not neutral — it's potentially misdirecting. The heat map highlights these so you can see what's creating static in your signal." },
  { term:"Your Signal is an Approximation", def:"Nothing in this tool is a precise measurement. It's an informed read — the same kind a recruiter or sourcing system would make based on the visible text of your profile. Use it as a directional diagnosis, not a final verdict." },
];

function AnalyzingScreen({ selectedRole }) {
  const [idx, setIdx] = useState(() => Math.floor(Math.random() * FACTOIDS.length));
  const [visible, setVisible] = useState(true);
  useEffect(() => {
    const cycle = setInterval(() => {
      setVisible(false);
      setTimeout(() => {
        setIdx(i => { let n; do { n = Math.floor(Math.random() * FACTOIDS.length); } while (n===i); return n; });
        setVisible(true);
      }, 480);
    }, 6000);
    return () => clearInterval(cycle);
  }, []);
  const f = FACTOIDS[idx];
  return (
    <div style={{ minHeight:"100vh", background:BG, display:"flex", flexDirection:"column", alignItems:"center", justifyContent:"center", padding:"40px 20px", fontFamily:"'Nunito',sans-serif" }}>
      <style>{`@keyframes spin{to{transform:rotate(360deg)}}@keyframes pulse{0%,100%{opacity:0.22}50%{opacity:0.7}}@keyframes fadeUp{from{opacity:0;transform:translateY(10px)}to{opacity:1;transform:translateY(0)}}@keyframes fadeDown{from{opacity:1}to{opacity:0;transform:translateY(-8px)}}`}</style>
      <div style={{ position:"relative", width:"62px", height:"62px", marginBottom:"26px" }}>
        <div style={{ position:"absolute", inset:0, border:"1.5px solid rgba(184,96,0,0.1)", borderTop:"2px solid #B86000", borderRadius:"50%", animation:"spin 1.2s linear infinite" }}/>
        <div style={{ position:"absolute", inset:"13px", border:"1px solid rgba(184,48,0,0.07)", borderBottom:"2px solid #B83000", borderRadius:"50%", animation:"spin 2s linear infinite reverse" }}/>
      </div>
      <div style={{ fontFamily:"'Orbitron',monospace", fontSize:"9px", letterSpacing:"4px", color:INK3, marginBottom:"5px", animation:"pulse 2s ease-in-out infinite" }}>READING SEMANTIC SIGNAL</div>
      <div style={{ color:INK3, fontSize:"12px", marginBottom:"48px" }}>Analyzing against: <span style={{ color:"#B86000", fontWeight:"700" }}>{selectedRole}</span></div>
      <div style={{ maxWidth:"520px", width:"100%", animation: visible ? "fadeUp 0.48s ease forwards" : "fadeDown 0.38s ease forwards" }}>
        <div style={{ display:"flex", alignItems:"center", gap:"10px", marginBottom:"16px" }}>
          <div style={{ height:"1px", flex:1, background:BORDER }}/>
          <div style={{ fontFamily:"'Orbitron',monospace", fontSize:"8px", letterSpacing:"3px", color:INK3 }}>WHILE YOU WAIT</div>
          <div style={{ height:"1px", flex:1, background:BORDER }}/>
        </div>
        <div style={{ background:SURFACE2, border:`1px solid ${BORDER}`, borderTop:"2px solid #B86000", borderRadius:"10px", padding:"28px 32px", boxShadow:SHADOW }}>
          <div style={{ fontFamily:"'Orbitron',monospace", fontSize:"13px", fontWeight:"700", color:"#B86000", marginBottom:"14px" }}>{f.term}</div>
          <div style={{ fontSize:"14px", lineHeight:2, color:INK2 }}>{f.def}</div>
        </div>
        <div style={{ display:"flex", justifyContent:"center", gap:"5px", marginTop:"22px" }}>
          {FACTOIDS.map((_,i) => <div key={i} style={{ width:i===idx?"18px":"5px", height:"5px", borderRadius:"3px", background:i===idx?"#B86000":BORDER, transition:"all 0.4s ease" }}/>)}
        </div>
      </div>
    </div>
  );
}

// ── MAIN APP ─────────────────────────────────────────────────────────────────
function MobileBanner() {
  return (
    <div style={{ background:"#1C1917", padding:"20px 24px", fontFamily:"'Nunito',sans-serif", textAlign:"center", borderBottom:"3px solid #B86000" }}>
      <div style={{ fontSize:"28px", marginBottom:"10px" }}>💻</div>
      <div style={{ fontFamily:"'Orbitron',monospace", fontSize:"11px", fontWeight:"900", color:"white", marginBottom:"8px", letterSpacing:"1px" }}>
        Desktop works best
      </div>
      <p style={{ color:"rgba(255,255,255,0.65)", fontSize:"12px", lineHeight:1.8, margin:"0 0 12px" }}>
        LinkedIn only allows PDF downloads from a desktop browser. Get your PDF there, then come back here.
      </p>
      <div style={{ background:"rgba(255,255,255,0.06)", borderRadius:"8px", padding:"12px 16px", textAlign:"left", marginBottom:"12px" }}>
        <div style={{ fontFamily:"'Orbitron',monospace", fontSize:"8px", letterSpacing:"2px", color:"rgba(255,255,255,0.4)", marginBottom:"8px" }}>HOW TO GET YOUR PDF</div>
        <ol style={{ margin:0, padding:"0 0 0 16px", color:"rgba(255,255,255,0.7)", fontSize:"12px", lineHeight:2 }}>
          <li>Open LinkedIn on a desktop browser</li>
          <li>Go to your profile → click <strong>More</strong> → <strong>Save to PDF</strong></li>
          <li>Come back here with that file</li>
        </ol>
      </div>
      <p style={{ color:"rgba(255,184,0,0.8)", fontSize:"12px", marginBottom:"4px" }}>
        Already have your PDF on this device? ↓ Scroll down to use the tool anyway
      </p>
    </div>
  );
}

// ── DEMO ANALYSIS — Jordan M. Calloway, Talent Acquisition Manager ──────────
const DEMO_ANALYSIS = {
  temperature: "hot",
  temperature_score: 84,
  primary_inference: "Talent Acquisition Manager",
  secondary_inference: "HR Business Partner",
  tertiary_inference: "Recruiting Operations Manager",
  alignment_note: "Strong current-role vocabulary, proven metrics, and explicit TA leadership signal align cleanly with the Talent Acquisition Manager centroid.",
  sections: [
    {
      name: "Headline",
      content: "Talent Acquisition Manager | Full-Cycle Recruiting | Employer Branding | Workforce Planning",
      hot_signals: [
        { phrase: "Talent Acquisition Manager", cluster: "exact target role title match" },
        { phrase: "Full-Cycle Recruiting", cluster: "core TA function vocabulary" },
        { phrase: "Workforce Planning", cluster: "strategic TA capability signal" },
      ],
      cold_signals: [],
    },
    {
      name: "About",
      content: "Talent acquisition leader with 12 years of full-cycle recruiting experience across technology, SaaS, and enterprise software. I build and scale TA functions that hire with precision and speed...",
      hot_signals: [
        { phrase: "talent acquisition leader", cluster: "seniority + domain match" },
        { phrase: "build and scale TA functions", cluster: "function ownership signal" },
        { phrase: "data-driven recruiting metrics", cluster: "analytics capability in TA" },
      ],
      cold_signals: [
        { phrase: "operational rigor and human judgment", cluster: "filler — vague values statement, no proof" },
      ],
    },
    {
      name: "Experience: Talent Acquisition Manager at Veridian Technologies",
      content: "Lead a team of six recruiters supporting full-cycle talent acquisition across engineering, product, sales, and G&A. Reduced time-to-fill from 52 to 34 days. Offer acceptance rate improved from 71% to 88%.",
      hot_signals: [
        { phrase: "reduced time-to-fill from 52 to 34 days", cluster: "quantified TA efficiency proof" },
        { phrase: "offer acceptance rate from 71% to 88%", cluster: "measurable recruiting outcome" },
        { phrase: "Greenhouse ATS implementation", cluster: "named tool — TA tech stack signal" },
      ],
      cold_signals: [],
    },
    {
      name: "Experience: Senior Technical Recruiter at Meridian Cloud Solutions",
      content: "Full-cycle technical recruiting for SaaS product, engineering, and data science teams. Hired 90+ engineers, product managers, and data scientists across three years.",
      hot_signals: [
        { phrase: "full-cycle technical recruiting", cluster: "TA domain vocabulary" },
        { phrase: "hired 90+ engineers", cluster: "volume proof in technical recruiting" },
        { phrase: "talent mapping", cluster: "sourcing strategy signal" },
      ],
      cold_signals: [],
    },
    {
      name: "Skills",
      content: "Full-Cycle Recruiting · Talent Acquisition Strategy · Technical Recruiting · ATS Administration · LinkedIn Recruiter · Employer Branding · Diversity Recruiting · Workforce Planning",
      hot_signals: [
        { phrase: "Talent Acquisition Strategy", cluster: "strategic TA signal" },
        { phrase: "ATS Administration", cluster: "TA tech operations" },
        { phrase: "LinkedIn Recruiter", cluster: "named sourcing tool" },
      ],
      cold_signals: [],
    },
  ],
  categorization: {
    insight: "Signal is overwhelmingly concentrated in Talent Acquisition with minor bleed into HR generalist vocabulary — a clean, well-architected TA profile.",
    towers: [
      { signal: "TA Manager Title", height: 3, why: "Current title exact match to target role", transmits_to: [{ receiver:"primary", strength:0.92 }, { receiver:"secondary", strength:0.06 }, { receiver:"tertiary", strength:0.02 }] },
      { signal: "Full-Cycle Recruiting", height: 3, why: "Core TA vocabulary repeated throughout", transmits_to: [{ receiver:"primary", strength:0.88 }, { receiver:"secondary", strength:0.08 }, { receiver:"tertiary", strength:0.04 }] },
      { signal: "Quantified Outcomes", height: 3, why: "Time-to-fill and offer rate metrics", transmits_to: [{ receiver:"primary", strength:0.85 }, { receiver:"secondary", strength:0.1 }, { receiver:"tertiary", strength:0.05 }] },
      { signal: "ATS & Tech Stack", height: 2, why: "Greenhouse, Lever, Workday named", transmits_to: [{ receiver:"primary", strength:0.80 }, { receiver:"secondary", strength:0.12 }, { receiver:"tertiary", strength:0.08 }] },
      { signal: "Workforce Planning", height: 2, why: "Strategic TA signal beyond sourcing", transmits_to: [{ receiver:"primary", strength:0.75 }, { receiver:"secondary", strength:0.18 }, { receiver:"tertiary", strength:0.07 }] },
      { signal: "Employer Branding", height: 2, why: "TA function ownership signal", transmits_to: [{ receiver:"primary", strength:0.78 }, { receiver:"secondary", strength:0.14 }, { receiver:"tertiary", strength:0.08 }] },
      { signal: "Diversity Recruiting", height: 1, why: "Specialized TA capability signal", transmits_to: [{ receiver:"primary", strength:0.72 }, { receiver:"secondary", strength:0.2 }, { receiver:"tertiary", strength:0.08 }] },
      { signal: "Recruiter Team Mgmt", height: 2, why: "People management elevates seniority read", transmits_to: [{ receiver:"primary", strength:0.70 }, { receiver:"secondary", strength:0.22 }, { receiver:"tertiary", strength:0.08 }] },
    ],
  },
};

export default function App() {
  const [stage,        setStage]       = useState("input");
  const [query,        setQuery]       = useState("");
  const [selectedRole, setSelectedRole]= useState("");
  const [showDrop,     setShowDrop]    = useState(false);
  const [pdfName,      setPdfName]     = useState("");
  const [pdfBase64,    setPdfBase64]   = useState("");
  const [analysis,     setAnalysis]    = useState(null);
  const [error,        setError]       = useState("");
  const [activeTab,    setActiveTab]   = useState("discovery");
  const [catLoading,   setCatLoading]  = useState(false);
  const [catError,     setCatError]    = useState("");
  const fileRef = useRef(null);
  const dropRef = useRef(null);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth < 768);
    check();
    window.addEventListener("resize", check);
    return () => window.removeEventListener("resize", check);
  }, []);

  useEffect(() => {
    const link = document.createElement("link");
    link.href = "https://fonts.googleapis.com/css2?family=Orbitron:wght@400;700;900&family=Nunito:wght@400;600;700&display=swap";
    link.rel = "stylesheet";
    document.head.appendChild(link);
    return () => document.head.removeChild(link);
  }, []);

  useEffect(() => {
    const close = e => { if (dropRef.current && !dropRef.current.contains(e.target)) setShowDrop(false); };
    document.addEventListener("mousedown", close);
    return () => document.removeEventListener("mousedown", close);
  }, []);

  const filtered = TITLES.filter(t => query.length >= 2 && t.toLowerCase().includes(query.toLowerCase())).slice(0,8);

  const handleFile = useCallback(e => {
    const file = e.target.files[0];
    if (!file) return;
    setPdfName(file.name);
    const reader = new FileReader();
    reader.onload = ev => setPdfBase64(ev.target.result.split(",")[1]);
    reader.readAsDataURL(file);
  }, []);

  const reset = () => {
    setStage("input"); setAnalysis(null); setPdfBase64(""); setPdfName("");
    setSelectedRole(""); setQuery(""); setError(""); setActiveTab("discovery");
    setCatLoading(false); setCatError("");
  };

  const repairJSON = raw => {
    let s = raw.replace(/```json|```/g,"").trim().replace(/,\s*$/,"").replace(/,\s*"[^"]*$/,"").replace(/"[^"]*$/,'"..."');
    let o=0,a=0; for(const c of s){if(c==="{")o++;else if(c==="}")o--;else if(c==="[")a++;else if(c==="]")a--;} while(a>0){s+="]";a--;} while(o>0){s+="}";o--;}
    return s;
  };

  const analyze = async () => {
    if (!selectedRole || !pdfBase64) return;
    setStage("analyzing"); setError("");
    try {
      const res = await fetch("/.netlify/functions/claude", {
        method:"POST", headers:{ "Content-Type":"application/json" },
        body: JSON.stringify({
          model:"claude-sonnet-4-20250514", max_tokens:8000,
          messages:[{ role:"user", content:[
            { type:"document", source:{ type:"base64", media_type:"application/pdf", data:pdfBase64 } },
            { type:"text", text:`Semantic search analyst. Analyze this LinkedIn PDF against target role: "${selectedRole}".

Return ONLY raw JSON — no markdown, no preamble.
KEEP CONCISE: section content max 300 chars. Signal phrases under 8 words. Cluster/reason notes under 12 words.

{
  "temperature": "warm",
  "temperature_score": 62,
  "primary_inference": "role system most confidently categorizes this person as",
  "secondary_inference": "second most likely role cluster",
  "tertiary_inference": "third most likely role cluster",
  "alignment_note": "one precise sentence on fit or gap vs ${selectedRole}",
  "sections": [
    {
      "name": "Headline",
      "content": "verbatim text max 300 chars",
      "hot_signals": [{"phrase":"exact phrase max 8 words","cluster":"cluster activated max 12 words"}],
      "cold_signals": [{"phrase":"exact phrase max 8 words","reason":"failure mode max 12 words"}]
    }
  ]
}

Sections: Headline, About, each job as "Experience: [Title at Company]", Skills, Education.
Max 3 hot_signals and 3 cold_signals per section. Empty array if none apply.

SCORING RULES — apply these strictly, in order:

1. RECENCY FIRST: The current role (most recent) carries 3x the weight of any previous role. A profile whose current title and current role content do not match the target role CANNOT score above 72 regardless of historical signal strength.

2. SIGNAL MASS vs SIGNAL RECENCY: Strong historical signal (5+ years ago) with weak or misaligned current signal is a warm profile at best. Do not let past depth compensate for present mismatch.

3. TITLE ALIGNMENT: If the current job title does not contain vocabulary from the target role cluster, deduct 15 points before applying any other scoring.

4. TRANSITION PENALTY: If the current role language points toward a different identity (advisory, consulting, board work, coaching) than the target role, apply a 10-20 point penalty reflecting categorical ambiguity.

5. SCORE ANCHORS — use these as calibration:
   - 85-100 (HOT): Current role title AND content densely match target role. Multiple recent roles reinforce the same identity. Certifications and skills section aligned. No competing clusters.
   - 65-74 (WARM): Strong historical signal but current role is misaligned, transitional, or thin on target-role vocabulary. Profile is in flux.
   - 45-64 (COOL): Scattered signal across multiple identities. Current role pointing away from target role. Historical signal relevant but not dominant.
   - 0-44 (COLD): Insufficient signal for target role. Current role and history both pointing elsewhere.

Temperature bands: hot=75-100, warm=50-74, cool=25-49, cold=0-24.` }
          ]}]
        })
      });
      const data = await res.json();
      if (data.error) throw new Error(data.error.message || "API error");
      const raw = data.content?.find(c=>c.type==="text")?.text || "";
      let parsed;
      try { parsed = JSON.parse(raw.replace(/```json|```/g,"").trim()); }
      catch { parsed = JSON.parse(repairJSON(raw)); }
      setAnalysis(parsed); setStage("results");
    } catch(err) {
      setError("Analysis failed — " + err.message + ". Please try again."); setStage("input");
    }
  };

  const fetchCategorization = async (currentAnalysis) => {
    if (!pdfBase64 || !selectedRole) return;
    setCatLoading(true); setCatError("");
    try {
      const res = await fetch("/.netlify/functions/claude", {
        method:"POST", headers:{ "Content-Type":"application/json" },
        body: JSON.stringify({
          model:"claude-sonnet-4-20250514", max_tokens:2500,
          messages:[{ role:"user", content:[
            { type:"document", source:{ type:"base64", media_type:"application/pdf", data:pdfBase64 } },
            { type:"text", text:`Semantic search analyst. This LinkedIn profile was analyzed against "${selectedRole}". The system identified three identity clusters: Primary="${currentAnalysis.primary_inference}", Secondary="${currentAnalysis.secondary_inference}", Tertiary="${currentAnalysis.tertiary_inference}".

Return ONLY raw JSON — no markdown, no preamble.

Assign each hot signal from this profile to the identity cluster it most strongly supports. Group them into max 8 towers total:

{
  "insight": "one sentence describing the signal distribution — e.g. 'Your signal is heavily weighted toward X with meaningful bleed into Y'",
  "towers": [
    {
      "signal": "signal label max 5 words",
      "height": 2,
      "why": "one phrase explaining why this signal builds that identity max 10 words",
      "transmits_to": [
        {"receiver":"primary","strength":0.82},
        {"receiver":"secondary","strength":0.13},
        {"receiver":"tertiary","strength":0.05}
      ]
    }
  ]
}

height: 1=rare mention, 2=moderate presence, 3=strong repeated presence.
IMPORTANT: Weight recent signals (current role, last 12 months) as height 3 regardless of word count. Weight signals from roles ended 2+ years ago as maximum height 2. A short current role with clear target-role vocabulary outweighs a long historical role with rich content.
transmits_to: all three receivers, strengths must sum to 1.0.
Max 8 towers. Omit towers where dominant strength < 0.15.` }
          ]}]
        })
      });
      const data = await res.json();
      if (data.error) throw new Error(data.error.message);
      const raw = data.content?.find(c=>c.type==="text")?.text || "";
      let parsed;
      try { parsed = JSON.parse(raw.replace(/```json|```/g,"").trim()); }
      catch { parsed = JSON.parse(repairJSON(raw)); }
      setAnalysis(prev => ({ ...prev, categorization: parsed }));
    } catch(err) {
      setCatError("Categorization failed — " + err.message);
    } finally {
      setCatLoading(false);
    }
  };

  const handleTabClick = (tabId, currentAnalysis) => {
    setActiveTab(tabId);
    if (tabId==="categorization" && currentAnalysis?.temperature_score>=75
        && !currentAnalysis.categorization?.towers?.length && !catLoading) {
      fetchCategorization(currentAnalysis);
    }
  };

  // ── INPUT ────────────────────────────────────────────────────────────────────
  const showMobileBanner = isMobile && stage === "input";

  if (stage==="input") return (
    <div style={{ minHeight:"100vh", background:BG, fontFamily:"'Nunito',sans-serif" }}>
      <style>{`*{box-sizing:border-box}input::placeholder{color:${INK3}}::-webkit-scrollbar{width:5px}::-webkit-scrollbar-thumb{background:rgba(0,0,0,0.12);border-radius:3px}`}</style>
      {showMobileBanner && <MobileBanner/>}
      <div style={{ display:"flex", alignItems:"center", justifyContent:"center", padding:"40px 20px" }}>
      <div style={{ maxWidth:"500px", width:"100%" }}>
        <div style={{ textAlign:"center", marginBottom:"44px" }}>
          <div style={{ fontFamily:"'Orbitron',monospace", fontSize:"9px", letterSpacing:"5px", color:INK3, marginBottom:"6px" }}>THE CAREER CANTINA</div>
          <div style={{ fontSize:"12px", color:INK3, marginBottom:"18px" }}>
            by <a href="https://linkedin.com/in/wrainey" target="_blank" rel="noopener noreferrer" style={{ color:"#B86000", textDecoration:"none", fontWeight:"700" }}>Wayne Rainey</a>
            {" · "}
            <a href="https://thecareercantina.com" target="_blank" rel="noopener noreferrer" style={{ color:INK3, textDecoration:"none" }}>thecareercantina.com</a>
          </div>
          <h1 style={{ fontFamily:"'Orbitron',monospace", fontSize:"24px", fontWeight:"900", color:INK, margin:0, lineHeight:1.3 }}>Semantic<br/>Heat Map</h1>
          <p style={{ color:INK2, fontSize:"14px", marginTop:"16px", lineHeight:1.85, maxWidth:"360px", margin:"16px auto 0" }}>
            See your LinkedIn profile through a semantic search system's eyes. Declare your target role, upload your PDF, get the verdict.
          </p>
        </div>
        <div style={{ marginBottom:"18px" }}>
          <label style={{ display:"block", fontFamily:"'Orbitron',monospace", fontSize:"9px", letterSpacing:"3px", color:INK3, marginBottom:"8px" }}>01 / TARGET ROLE</label>
          <div ref={dropRef} style={{ position:"relative" }}>
            <input value={query} onChange={e=>{ setQuery(e.target.value); setShowDrop(true); setSelectedRole(""); }} onFocus={()=>setShowDrop(true)}
              placeholder="Start typing a job title…"
              style={{ width:"100%", background:SURFACE2, border:`1.5px solid ${selectedRole?TC.warm.color:BORDER}`, borderRadius:"8px", padding:"13px 16px", color:selectedRole?TC.warm.color:INK, fontSize:"15px", fontFamily:"'Nunito',sans-serif", outline:"none", transition:"border-color 0.2s", boxShadow:SHADOW }}
            />
            {showDrop && filtered.length>0 && !selectedRole && (
              <div style={{ position:"absolute", top:"calc(100% + 4px)", left:0, right:0, background:SURFACE2, border:`1px solid ${BORDER}`, borderRadius:"8px", zIndex:100, overflow:"hidden", boxShadow:"0 8px 32px rgba(0,0,0,0.1)" }}>
                {filtered.map(t=>(
                  <div key={t} onClick={()=>{ setSelectedRole(t); setQuery(t); setShowDrop(false); }}
                    onMouseEnter={e=>e.currentTarget.style.background="rgba(184,96,0,0.05)"}
                    onMouseLeave={e=>e.currentTarget.style.background="transparent"}
                    style={{ padding:"11px 16px", fontSize:"14px", color:INK2, cursor:"pointer", borderBottom:`1px solid ${BORDER}`, transition:"background 0.12s" }}>{t}</div>
                ))}
              </div>
            )}
          </div>
        </div>
        <div style={{ marginBottom:"26px" }}>
          <label style={{ display:"block", fontFamily:"'Orbitron',monospace", fontSize:"9px", letterSpacing:"3px", color:INK3, marginBottom:"8px" }}>02 / LINKEDIN PDF EXPORT</label>
          <div onClick={()=>fileRef.current?.click()} style={{ border:`1.5px dashed ${pdfName?TC.cool.color:"rgba(0,0,0,0.14)"}`, borderRadius:"8px", padding:"28px 20px", textAlign:"center", cursor:"pointer", background:pdfName?"rgba(26,90,160,0.03)":SURFACE2, transition:"all 0.2s", boxShadow:SHADOW }}>
            <div style={{ fontSize:"22px", marginBottom:"8px" }}>{pdfName?"📄":"⬆️"}</div>
            <div style={{ color:pdfName?TC.cool.color:INK2, fontSize:"14px", fontWeight:"700" }}>{pdfName||"Click to upload"}</div>
            {!pdfName && <div style={{ color:INK3, fontSize:"11px", marginTop:"6px", lineHeight:1.7 }}>LinkedIn PDF export — save from your profile page<br/><em>Note: Featured, Recommendations &amp; Projects are omitted</em></div>}
          </div>
          <input ref={fileRef} type="file" accept=".pdf" onChange={handleFile} style={{ display:"none" }}/>
        </div>
        {error && <div style={{ color:"#7A1E00", fontSize:"13px", marginBottom:"16px", textAlign:"center", background:"rgba(184,48,0,0.06)", padding:"10px 14px", borderRadius:"6px", border:`1px solid rgba(184,48,0,0.15)` }}>{error}</div>}
        <button onClick={analyze} disabled={!selectedRole||!pdfBase64} style={{ width:"100%", padding:"15px", background:selectedRole&&pdfBase64?`linear-gradient(135deg,${TC.hot.color},${TC.warm.color})`:SURFACE, border:"none", borderRadius:"8px", color:selectedRole&&pdfBase64?"white":INK3, fontFamily:"'Orbitron',monospace", fontSize:"11px", letterSpacing:"3px", cursor:selectedRole&&pdfBase64?"pointer":"not-allowed", transition:"all 0.2s", fontWeight:"700", boxShadow:selectedRole&&pdfBase64?"0 4px 20px rgba(184,48,0,0.18)":"none" }}>
          ANALYZE PROFILE →
        </button>
        <div style={{ textAlign:"center", marginTop:"20px" }}>
          <button onClick={()=>{ setAnalysis(DEMO_ANALYSIS); setSelectedRole("Talent Acquisition Manager"); setStage("results"); setActiveTab("discovery"); }}
            style={{ background:"transparent", border:`1px solid ${BORDER}`, borderRadius:"8px", padding:"10px 20px", color:INK3, fontFamily:"'Nunito',sans-serif", fontSize:"13px", cursor:"pointer", transition:"all 0.2s" }}
            onMouseEnter={e=>e.currentTarget.style.borderColor=INK2}
            onMouseLeave={e=>e.currentTarget.style.borderColor=BORDER}>
            👀 See how it works — view a sample analysis
          </button>
        </div>
      </div>
      </div>
    </div>
  );

  if (stage==="analyzing") return <AnalyzingScreen selectedRole={selectedRole}/>;

  // ── RESULTS ──────────────────────────────────────────────────────────────────
  if (stage==="results" && analysis) {
    const cfg = TC[analysis.temperature] || TC.cool;
    const unlocked = analysis.temperature_score >= 75;
    const TABS = [
      { id:"discovery",      label:"Discovery Heat Map" },
      { id:"categorization", label:"Categorization",    locked:!unlocked },
      { id:"about",          label:"What is Semantic Search" },
    ];
    return (
      <div style={{ minHeight:"100vh", background:BG, fontFamily:"'Nunito',sans-serif" }}>
        <style>{`*{box-sizing:border-box}::-webkit-scrollbar{width:5px}::-webkit-scrollbar-thumb{background:rgba(0,0,0,0.1);border-radius:3px}@keyframes spin{to{transform:rotate(360deg)}}`}</style>

        {/* DEMO BANNER */}
        {stage==="results" && !pdfBase64 && (
          <div style={{ background:"#1C1917", padding:"14px 24px", display:"flex", alignItems:"center", justifyContent:"space-between", flexWrap:"wrap", gap:"12px" }}>
            <div style={{ display:"flex", alignItems:"center", gap:"12px" }}>
              <span style={{ fontSize:"16px" }}>👀</span>
              <div>
                <span style={{ color:"white", fontSize:"13px", fontWeight:"700" }}>Sample analysis — Jordan M. Calloway</span>
                <span style={{ color:"rgba(255,255,255,0.5)", fontSize:"12px", marginLeft:"8px" }}>Talent Acquisition Manager · fictional profile</span>
              </div>
            </div>
            <button onClick={reset} style={{ background:"#B86000", border:"none", borderRadius:"6px", padding:"8px 16px", color:"white", fontFamily:"'Orbitron',monospace", fontSize:"9px", letterSpacing:"2px", cursor:"pointer", whiteSpace:"nowrap" }}>
              ANALYZE MY PROFILE →
            </button>
          </div>
        )}

        {/* VERDICT HERO */}
        <div style={{ background:SURFACE, padding:"52px 40px 44px", textAlign:"center", borderBottom:`1px solid ${BORDER}` }}>
          <div style={{ display:"flex", justifyContent:"center", alignItems:"center", gap:"16px", marginBottom:"4px" }}>
            <div style={{ fontFamily:"'Orbitron',monospace", fontSize:"9px", letterSpacing:"5px", color:INK3 }}>SEMANTIC TEMPERATURE CHECK</div>
            <div style={{ width:"1px", height:"12px", background:BORDER }}/>
            <a href="https://thecareercantina.com" target="_blank" rel="noopener noreferrer" style={{ fontFamily:"'Orbitron',monospace", fontSize:"8px", letterSpacing:"3px", color:INK3, textDecoration:"none", opacity:0.6 }}>THE CAREER CANTINA</a>
          </div>
          <div style={{ fontFamily:"'Orbitron',monospace", fontSize:"13px", color:INK2, marginBottom:"32px", letterSpacing:"1px" }}>{selectedRole}</div>
          <div style={{ display:"flex", justifyContent:"center" }}>
            <Thermometer temperature={analysis.temperature} score={analysis.temperature_score}/>
          </div>
          <div style={{ maxWidth:"460px", margin:"16px auto 0", color:INK2, fontSize:"13px", fontStyle:"italic", lineHeight:1.85 }}>{analysis.alignment_note}</div>
          <div style={{ display:"flex", gap:"12px", justifyContent:"center", marginTop:"30px", flexWrap:"wrap" }}>
            {[
              { label:"System Reads You As", val:analysis.primary_inference,   opacity:1,   border:cfg.color },
              { label:"Secondary Cluster",   val:analysis.secondary_inference, opacity:0.5, border:BORDER    },
              { label:"Tertiary Cluster",    val:analysis.tertiary_inference,  opacity:0.3, border:BORDER    },
            ].map(({ label,val,opacity,border })=>(
              <div key={label} style={{ background:SURFACE2, border:`1px solid ${BORDER}`, borderTop:`2px solid ${border}`, borderRadius:"8px", padding:"14px 18px", opacity, minWidth:"148px", boxShadow:SHADOW }}>
                <div style={{ fontFamily:"'Orbitron',monospace", fontSize:"7px", letterSpacing:"2px", color:INK3, marginBottom:"6px" }}>{label.toUpperCase()}</div>
                <div style={{ color:INK, fontSize:"13px", fontWeight:"700", lineHeight:1.35 }}>{val}</div>
              </div>
            ))}
          </div>
        </div>

        {/* TAB BAR */}
        <div style={{ background:INK, borderBottom:`3px solid ${cfg.color}`, display:"flex" }}>
          {TABS.map(tab => {
            const isActive = activeTab===tab.id;
            return (
              <button key={tab.id} onClick={()=>handleTabClick(tab.id, analysis)}
                onMouseEnter={e=>{ if(!isActive) e.currentTarget.style.background="rgba(255,255,255,0.07)"; }}
                onMouseLeave={e=>{ if(!isActive) e.currentTarget.style.background="transparent"; }}
                style={{ flex:1, padding:"18px 12px", background:isActive?cfg.color:"transparent", border:"none", color:isActive?"white":"rgba(255,255,255,0.72)", fontFamily:"'Orbitron',monospace", fontSize:"9px", letterSpacing:"2px", cursor:"pointer", transition:"all 0.2s", fontWeight:isActive?"700":"400", display:"flex", alignItems:"center", justifyContent:"center", gap:"8px", borderRight:`1px solid rgba(255,255,255,0.05)` }}>
                {tab.label}
                {tab.locked && <span style={{ fontSize:"11px", opacity:0.5 }}>🔒</span>}
                {!tab.locked && tab.id==="categorization" && unlocked && (
                  <span style={{ fontSize:"8px", background:"rgba(255,255,255,0.15)", padding:"1px 6px", borderRadius:"3px", letterSpacing:"0" }}>UNLOCKED</span>
                )}
              </button>
            );
          })}
        </div>

        {/* DISCOVERY TAB */}
        {activeTab==="discovery" && <>
          <div style={{ padding:"12px 28px", borderBottom:`1px solid ${BORDER}`, display:"flex", gap:"20px", alignItems:"center", flexWrap:"wrap", background:SURFACE2 }}>
            <span style={{ fontFamily:"'Orbitron',monospace", fontSize:"8px", letterSpacing:"3px", color:INK3 }}>LEGEND</span>
            <div style={{ display:"flex", gap:"8px", alignItems:"center" }}>
              <span style={{ background:"rgba(184,48,0,0.09)", color:"#7A1E00", borderRadius:"3px", padding:"1px 10px", fontSize:"12px", fontWeight:"700", borderBottom:"2px solid rgba(184,48,0,0.28)" }}>hot signal</span>
              <span style={{ color:INK3, fontSize:"12px" }}>activates target role cluster</span>
            </div>
            <div style={{ display:"flex", gap:"8px", alignItems:"center" }}>
              <span style={{ background:"rgba(26,90,160,0.07)", color:"#153D70", borderRadius:"3px", padding:"1px 10px", fontSize:"12px", borderBottom:"2px dotted rgba(26,90,160,0.28)" }}>cold signal</span>
              <span style={{ color:INK3, fontSize:"12px" }}>filler, orphan verb, or mis-categorizing language</span>
            </div>
            <span style={{ marginLeft:"auto", color:INK3, fontSize:"11px", fontStyle:"italic" }}>hover highlighted text for diagnostic note</span>
          </div>
          <div style={{ display:"grid", gridTemplateColumns:"1fr 2fr 1fr", gap:"14px", padding:"14px 20px 6px", borderBottom:`1px solid ${BORDER}` }}>
            <div style={{ fontFamily:"'Orbitron',monospace", fontSize:"8px", letterSpacing:"3px", color:TC.hot.color, textAlign:"center", opacity:0.65 }}>← HOT SIGNALS</div>
            <div style={{ fontFamily:"'Orbitron',monospace", fontSize:"8px", letterSpacing:"3px", color:INK3, textAlign:"center" }}>PROFILE CONTENT</div>
            <div style={{ fontFamily:"'Orbitron',monospace", fontSize:"8px", letterSpacing:"3px", color:TC.cool.color, textAlign:"center", opacity:0.65 }}>COLD SIGNALS →</div>
          </div>
          <div style={{ padding:"0 20px" }}>
            {(analysis.sections||[]).map((section,i)=><SectionRow key={i} section={section}/>)}
          </div>
        </>}

        {/* CATEGORIZATION TAB */}
        {activeTab==="categorization" && (
          !unlocked
            ? <CategorizationLocked score={analysis.temperature_score}/>
            : catLoading
              ? <div style={{ textAlign:"center", padding:"72px 40px" }}>
                  <div style={{ position:"relative", width:"52px", height:"52px", margin:"0 auto 24px" }}>
                    <div style={{ position:"absolute", inset:0, border:"1.5px solid rgba(184,96,0,0.1)", borderTop:`2px solid ${TC.warm.color}`, borderRadius:"50%", animation:"spin 1.2s linear infinite" }}/>
                  </div>
                  <div style={{ fontFamily:"'Orbitron',monospace", fontSize:"9px", letterSpacing:"4px", color:INK3 }}>SORTING SIGNAL CLUSTERS</div>
                </div>
              : catError
                ? <div style={{ textAlign:"center", padding:"72px 40px", color:"#7A1E00", fontSize:"13px" }}>{catError}</div>
                : analysis.categorization?.towers?.length
                  ? <CategorizationViz analysis={analysis}/>
                  : <div style={{ textAlign:"center", padding:"72px 40px" }}>
                      <button onClick={()=>fetchCategorization(analysis)} style={{ background:TC.warm.color, border:"none", borderRadius:"8px", padding:"12px 28px", color:"white", fontFamily:"'Orbitron',monospace", fontSize:"9px", letterSpacing:"3px", cursor:"pointer" }}>
                        LOAD CATEGORIZATION
                      </button>
                    </div>
        )}

        {/* ABOUT TAB */}
        {activeTab==="about" && <DCROTab/>}

        {/* FOOTER */}
        <div style={{ padding:"40px", textAlign:"center", borderTop:`1px solid ${BORDER}`, background:SURFACE, marginTop:"24px" }}>
          <div style={{ marginBottom:"28px", paddingBottom:"24px", borderBottom:`1px solid ${BORDER}` }}>
            <div style={{ fontFamily:"'Orbitron',monospace", fontSize:"9px", letterSpacing:"3px", color:INK, marginBottom:"10px" }}>THE CAREER CANTINA</div>
            <p style={{ color:INK2, fontSize:"13px", lineHeight:1.9, margin:"0 0 10px", maxWidth:"480px", marginLeft:"auto", marginRight:"auto" }}>
              The Semantic Heat Map is an original diagnostic tool built on the DCR›O Framework — a methodology developed by <strong>Wayne Rainey</strong> to map how AI-mediated hiring systems discover, categorize, rank, and surface professional profiles.
            </p>
            <div style={{ display:"flex", gap:"20px", justifyContent:"center", flexWrap:"wrap", marginTop:"12px" }}>
              {[
                { label:"LinkedIn", href:"https://linkedin.com/in/wrainey" },
                { label:"The Career Cantina", href:"https://thecareercantina.com" },
                { label:"Writing on Medium", href:"https://medium.com/@wrainey929" },
              ].map(({ label, href }) => (
                <a key={label} href={href} target="_blank" rel="noopener noreferrer"
                  style={{ color:"#B86000", fontSize:"12px", textDecoration:"none", fontWeight:"600", fontFamily:"'Nunito',sans-serif" }}>
                  {label} ↗
                </a>
              ))}
            </div>
          </div>
          <div style={{ fontFamily:"'Orbitron',monospace", fontSize:"8px", letterSpacing:"3px", color:INK3, marginBottom:"12px" }}>ANALYSIS DISCLAIMER</div>
          <p style={{ color:INK3, fontSize:"12px", lineHeight:2, maxWidth:"500px", margin:"0 auto 24px" }}>
            This analysis is based on your LinkedIn PDF export. LinkedIn's export quietly leaves out several sections — Featured posts, Recommendations, Publications, Volunteer work, and Projects. What you see here is an approximation of how outside systems read your profile, not a window into LinkedIn's own search. And even a strong score here doesn't guarantee a high ranking — because ranking depends on who else showed up in that same search, which is information no tool has access to.
          </p>
          <button onClick={reset}
            onMouseEnter={e=>e.currentTarget.style.color=INK}
            onMouseLeave={e=>e.currentTarget.style.color=INK3}
            style={{ background:"transparent", border:`1.5px solid ${BORDER}`, borderRadius:"8px", padding:"10px 28px", color:INK3, fontFamily:"'Orbitron',monospace", fontSize:"9px", letterSpacing:"3px", cursor:"pointer", transition:"all 0.2s" }}>
            ANALYZE ANOTHER PROFILE
          </button>
          <div style={{ marginTop:"20px", color:"rgba(0,0,0,0.12)", fontSize:"10px", fontFamily:"monospace", letterSpacing:"1px" }}>v1.0.3</div>
        </div>
      </div>
    );
  }
  return null;
}
