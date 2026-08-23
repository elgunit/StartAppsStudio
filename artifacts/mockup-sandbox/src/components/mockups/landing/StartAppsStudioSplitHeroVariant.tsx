import React, { useState } from "react";

const lanes = [
  {
    id: "build",
    number: "01",
    label: "Build from zero",
    title: "Make the first version feel inevitable.",
    copy: "A clear route from sharp idea to a product people can actually use — not a deck that gathers dust.",
    metric: "6–8 weeks",
    metricLabel: "typical first release",
    color: "coral",
  },
  {
    id: "grow",
    number: "02",
    label: "Grow what works",
    title: "Turn early signal into momentum.",
    copy: "A founder-led product partner for the next release, the next decision, and the parts your users keep asking for.",
    metric: "3.4×",
    metricLabel: "faster decision cycles",
    color: "yellow",
  },
  {
    id: "rescue",
    number: "03",
    label: "Rescue the in-between",
    title: "Give a half-built product a way out.",
    copy: "An honest audit, a practical fix list, and the engineering muscle to get your MVP across the line.",
    metric: "12 days",
    metricLabel: "to a clear rescue plan",
    color: "teal",
  },
] as const;

const proofItems = [
  { label: "Direction", detail: "A product brief you can make decisions from", mark: "01" },
  { label: "Design", detail: "Flows that make the value obvious", mark: "02" },
  { label: "Build", detail: "A shippable codebase in your name", mark: "03" },
];

function ArrowUpRight() {
  return (
    <svg aria-hidden="true" viewBox="0 0 20 20" fill="none" className="sasv-arrow">
      <path d="M4.5 15.5 15.5 4.5M7 4.5h8.5V13" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function CompassIcon() {
  return (
    <svg aria-hidden="true" viewBox="0 0 24 24" fill="none" className="sasv-compass">
      <circle cx="12" cy="12" r="8.5" stroke="currentColor" strokeWidth="1.2" />
      <path d="m15.4 8.6-1.9 4.9-4.9 1.9 1.9-4.9 4.9-1.9Z" stroke="currentColor" strokeWidth="1.2" strokeLinejoin="round" />
      <path d="M12 2v2M22 12h-2M12 22v-2M2 12h2" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" />
    </svg>
  );
}

export function StartAppsStudioSplitHeroVariant() {
  const [activeLane, setActiveLane] = useState<(typeof lanes)[number]["id"]>("build");
  const [formOpen, setFormOpen] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [email, setEmail] = useState("");
  const [proofIndex, setProofIndex] = useState(0);

  const lane = lanes.find((item) => item.id === activeLane) ?? lanes[0];

  const openBrief = () => {
    setFormOpen(true);
    setSubmitted(false);
    window.setTimeout(() => document.getElementById("sasv-brief")?.scrollIntoView({ behavior: "smooth", block: "center" }), 30);
  };

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (email.trim()) setSubmitted(true);
  };

  return (
    <main className="sasv-shell">
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700&family=Fraunces:opsz,wght@9..144,500;9..144,600;9..144,700&family=Space+Mono:wght@400;700&display=swap');
        .sasv-shell, .sasv-shell * { box-sizing: border-box; }
        .sasv-shell { --ink:#183139; --muted:#607075; --paper:#f5f1e8; --panel:#e7ece7; --line:rgba(24,49,57,.18); --coral:#ef7256; --yellow:#e6dc68; --teal:#6fbab1; min-height:100dvh; background:var(--paper); color:var(--ink); font-family:'DM Sans', sans-serif; overflow:hidden; }
        .sasv-shell button, .sasv-shell input { font:inherit; }
        .sasv-noise { position:fixed; inset:0; pointer-events:none; opacity:.055; z-index:20; background-image:url("data:image/svg+xml,%3Csvg viewBox='0 0 180 180' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='.85' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)' opacity='.7'/%3E%3C/svg%3E"); }
        .sasv-frame { width:min(1360px, calc(100% - 48px)); margin:0 auto; }
        .sasv-topbar { height:82px; display:flex; align-items:center; justify-content:space-between; border-bottom:1px solid var(--line); }
        .sasv-brand { display:flex; align-items:center; gap:11px; color:var(--ink); text-decoration:none; font-size:13px; font-weight:700; letter-spacing:-.02em; }
        .sasv-brand-mark { width:28px; height:28px; display:grid; place-items:center; border-radius:50%; color:var(--paper); background:var(--ink); }
        .sasv-brand-mark svg { width:17px; height:17px; }
        .sasv-brand-note { color:var(--muted); font-family:'Space Mono', monospace; font-size:9px; font-weight:400; letter-spacing:.05em; margin-left:5px; }
        .sasv-nav { display:flex; align-items:center; gap:26px; }
        .sasv-nav a { color:var(--muted); font-size:12px; text-decoration:none; transition:color .2s ease; }
        .sasv-nav a:hover { color:var(--ink); }
        .sasv-top-cta { color:var(--ink); border:1px solid var(--ink); background:transparent; padding:10px 15px; cursor:pointer; font-size:11px; font-weight:700; letter-spacing:.01em; transition:background .2s ease,color .2s ease,transform .2s ease; }
        .sasv-top-cta:hover { background:var(--ink); color:var(--paper); transform:translateY(-2px); }
        .sasv-hero { min-height:calc(100dvh - 82px); display:grid; grid-template-columns:minmax(0, 1.02fr) minmax(400px, .98fr); gap:clamp(40px, 7vw, 112px); align-items:center; padding:clamp(48px, 7vh, 100px) 0 68px; }
        .sasv-kicker { display:flex; align-items:center; gap:10px; margin-bottom:30px; color:var(--muted); font-family:'Space Mono', monospace; font-size:10px; letter-spacing:.07em; text-transform:uppercase; }
        .sasv-kicker i { display:block; width:7px; height:7px; border-radius:50%; background:var(--coral); box-shadow:0 0 0 4px rgba(239,114,86,.15); }
        .sasv-hero h1 { max-width:650px; margin:0; font-family:'Fraunces', Georgia, serif; font-size:clamp(53px, 7vw, 104px); font-weight:600; letter-spacing:-.065em; line-height:.92; }
        .sasv-hero h1 em { color:var(--coral); font-style:normal; }
        .sasv-dek { max-width:495px; margin:32px 0 33px; color:var(--muted); font-size:16px; line-height:1.55; letter-spacing:-.01em; }
        .sasv-hero-actions { display:flex; align-items:center; gap:17px; }
        .sasv-primary { display:inline-flex; align-items:center; gap:15px; padding:14px 18px; border:0; color:#f7f3ea; background:var(--ink); cursor:pointer; font-size:12px; font-weight:700; transition:transform .2s ease, background .2s ease; }
        .sasv-primary:hover { transform:translateY(-3px); background:#244954; }
        .sasv-primary .sasv-arrow { width:16px; }
        .sasv-text-btn { border:0; padding:10px 2px; color:var(--ink); background:transparent; border-bottom:1px solid var(--ink); cursor:pointer; font-size:12px; font-weight:600; }
        .sasv-stamp { display:flex; align-items:center; gap:10px; margin-top:54px; color:var(--muted); font-family:'Space Mono', monospace; font-size:9px; line-height:1.35; }
        .sasv-stamp-rule { width:48px; height:1px; background:var(--coral); }
        .sasv-stage { position:relative; min-height:565px; display:flex; align-items:center; justify-content:center; }
        .sasv-stage-orbit { position:absolute; width:min(41vw, 540px); aspect-ratio:1; border:1px solid rgba(24,49,57,.16); border-radius:50%; transform:rotate(-17deg); }
        .sasv-stage-orbit::before, .sasv-stage-orbit::after { content:""; position:absolute; width:8px; height:8px; border-radius:50%; background:var(--coral); }
        .sasv-stage-orbit::before { top:7%; left:20%; } .sasv-stage-orbit::after { bottom:9%; right:15%; background:var(--teal); }
        .sasv-stage-card { position:relative; z-index:1; width:min(100%, 500px); margin-left:4%; padding:28px; background:var(--ink); color:#edf0e8; box-shadow:16px 18px 0 rgba(24,49,57,.08); transform:rotate(2.5deg); transition:transform .3s ease; }
        .sasv-stage-card:hover { transform:rotate(0deg) translateY(-4px); }
        .sasv-stage-card::before { content:""; position:absolute; width:42px; height:42px; right:-13px; top:-13px; border:1px solid var(--ink); background:var(--yellow); }
        .sasv-card-top { display:flex; align-items:center; justify-content:space-between; padding-bottom:24px; border-bottom:1px solid rgba(237,240,232,.2); }
        .sasv-card-label { color:#aab9b4; font-family:'Space Mono', monospace; font-size:9px; letter-spacing:.08em; text-transform:uppercase; }
        .sasv-card-index { font-family:'Space Mono', monospace; color:var(--yellow); font-size:11px; }
        .sasv-stage-card h2 { max-width:370px; margin:44px 0 18px; font-family:'Fraunces', Georgia, serif; font-size:clamp(32px, 4vw, 53px); line-height:.98; letter-spacing:-.045em; font-weight:500; }
        .sasv-stage-card p { max-width:345px; margin:0 0 43px; color:#aab9b4; font-size:13px; line-height:1.55; }
        .sasv-stage-footer { display:grid; grid-template-columns:1fr 1fr; gap:20px; padding-top:18px; border-top:1px solid rgba(237,240,232,.2); }
        .sasv-metric { color:var(--yellow); font-family:'Fraunces', Georgia, serif; font-size:30px; line-height:1; }
        .sasv-metric-label { display:block; margin-top:6px; color:#aab9b4; font-family:'Space Mono', monospace; font-size:8px; line-height:1.4; text-transform:uppercase; }
        .sasv-lane-tabs { position:absolute; bottom:2px; left:4%; z-index:2; width:92%; display:flex; gap:8px; }
        .sasv-lane-tab { flex:1; min-height:60px; display:flex; align-items:center; gap:12px; padding:11px 12px; border:1px solid var(--line); color:var(--muted); background:rgba(245,241,232,.82); cursor:pointer; text-align:left; transition:background .2s ease,color .2s ease,border .2s ease,transform .2s ease; }
        .sasv-lane-tab:hover { transform:translateY(-3px); border-color:var(--ink); }
        .sasv-lane-tab.is-active { color:var(--paper); border-color:var(--ink); background:var(--ink); }
        .sasv-lane-tab b { font-family:'Space Mono', monospace; font-size:9px; font-weight:400; opacity:.65; }
        .sasv-lane-tab span { font-size:10px; font-weight:700; line-height:1.15; }
        .sasv-divider { width:min(1360px, calc(100% - 48px)); margin:auto; border-top:1px solid var(--line); }
        .sasv-proof { display:grid; grid-template-columns:1.1fr 2fr; min-height:300px; padding:70px 0; gap:70px; }
        .sasv-proof-intro p { max-width:280px; margin:18px 0 0; color:var(--muted); font-size:13px; line-height:1.55; }
        .sasv-eyebrow { color:var(--coral); font-family:'Space Mono', monospace; font-size:9px; font-weight:700; letter-spacing:.1em; text-transform:uppercase; }
        .sasv-proof h3 { margin:13px 0 0; font-family:'Fraunces', Georgia, serif; font-size:37px; font-weight:500; letter-spacing:-.05em; line-height:1; }
        .sasv-proof-list { border-top:1px solid var(--line); }
        .sasv-proof-row { display:grid; grid-template-columns:53px 1fr 1.2fr; align-items:center; gap:20px; min-height:73px; border-bottom:1px solid var(--line); }
        .sasv-proof-row b { color:var(--coral); font-family:'Space Mono', monospace; font-size:10px; font-weight:400; }
        .sasv-proof-row strong { font-size:13px; }
        .sasv-proof-row span { color:var(--muted); font-size:12px; }
        .sasv-bottom-grid { display:grid; grid-template-columns:1fr 1fr; min-height:310px; gap:28px; padding:60px 0 80px; }
        .sasv-note { padding:26px; border:1px solid var(--line); background:var(--panel); }
        .sasv-note h3 { max-width:320px; margin:16px 0 24px; font-family:'Fraunces', Georgia, serif; font-size:32px; line-height:1.02; letter-spacing:-.045em; font-weight:500; }
        .sasv-note small { color:var(--muted); font-family:'Space Mono', monospace; font-size:9px; text-transform:uppercase; }
        .sasv-note button { display:inline-flex; align-items:center; gap:10px; padding:0; border:0; border-bottom:1px solid var(--ink); color:var(--ink); background:transparent; cursor:pointer; font-size:11px; font-weight:700; }
        .sasv-brief { position:relative; padding:26px; border:1px solid var(--ink); background:var(--yellow); }
        .sasv-brief h3 { margin:9px 0 20px; font-family:'Fraunces', Georgia, serif; font-size:32px; line-height:.98; letter-spacing:-.045em; font-weight:500; }
        .sasv-brief p { margin:0 0 20px; font-size:12px; line-height:1.45; }
        .sasv-brief form { display:flex; gap:8px; }
        .sasv-brief input { min-width:0; flex:1; padding:12px; border:1px solid rgba(24,49,57,.4); outline:0; color:var(--ink); background:rgba(245,241,232,.75); font-size:11px; }
        .sasv-brief input:focus { border-color:var(--ink); }
        .sasv-brief form button { padding:12px 15px; border:0; color:var(--paper); background:var(--ink); cursor:pointer; font-size:11px; font-weight:700; }
        .sasv-success { color:var(--ink); font-size:12px; font-weight:700; }
        .sasv-hidden-form { overflow:hidden; max-height:0; opacity:0; transition:max-height .35s ease,opacity .3s ease; }
        .sasv-hidden-form.is-open { max-height:90px; opacity:1; }
        @media (max-width: 900px) { .sasv-hero { grid-template-columns:1fr; gap:24px; padding-top:65px; } .sasv-stage { min-height:530px; } .sasv-stage-orbit { width:80vw; } .sasv-stage-card { margin-left:0; } .sasv-lane-tabs { left:0; width:100%; } .sasv-proof { grid-template-columns:1fr; gap:32px; } }
        @media (max-width: 640px) { .sasv-frame, .sasv-divider { width:calc(100% - 32px); } .sasv-topbar { height:68px; } .sasv-brand-note, .sasv-nav a { display:none; } .sasv-nav { gap:0; } .sasv-hero { min-height:auto; padding:60px 0 45px; } .sasv-hero h1 { font-size:clamp(51px, 15vw, 76px); } .sasv-dek { margin:25px 0 28px; font-size:14px; } .sasv-stamp { margin-top:38px; } .sasv-stage { min-height:590px; margin-top:12px; align-items:flex-start; padding-top:24px; } .sasv-stage-card { padding:22px; width:calc(100% - 7px); } .sasv-stage-card h2 { margin-top:40px; font-size:39px; } .sasv-lane-tabs { bottom:0; flex-direction:column; gap:5px; } .sasv-lane-tab { min-height:46px; flex:none; } .sasv-lane-tab span { font-size:11px; } .sasv-proof { padding:55px 0; } .sasv-proof h3 { font-size:32px; } .sasv-proof-row { grid-template-columns:35px 1fr; gap:10px; padding:15px 0; } .sasv-proof-row span { grid-column:2; margin-top:-7px; } .sasv-bottom-grid { grid-template-columns:1fr; padding-top:15px; } .sasv-brief form { flex-direction:column; } }
        @media (prefers-reduced-motion: reduce) { .sasv-shell *, .sasv-shell *::before, .sasv-shell *::after { transition-duration:.01ms !important; } }
      `}</style>
      <div className="sasv-noise" aria-hidden="true" />
      <div className="sasv-frame">
        <header className="sasv-topbar">
          <div className="sasv-brand">
            <span className="sasv-brand-mark"><CompassIcon /></span>
            <span>START APPS<br />STUDIO</span>
            <span className="sasv-brand-note">PRODUCT PARTNER<br />FOR FOUNDERS</span>
          </div>
          <nav className="sasv-nav" aria-label="Main navigation">
            <a href="#sasv-proof">The method</a>
            <a href="#sasv-brief">Get in touch</a>
            <button type="button" className="sasv-top-cta" onClick={openBrief}>Start a brief <span aria-hidden="true">↗</span></button>
          </nav>
        </header>

        <section className="sasv-hero" aria-labelledby="sasv-title">
          <div>
            <div className="sasv-kicker"><i /> Independent studio · Worldwide</div>
            <h1 id="sasv-title">A product studio with <em>skin in the game.</em></h1>
            <p className="sasv-dek">You bring the conviction. We bring the product thinking, design, and build power to turn it into something people can choose.</p>
            <div className="sasv-hero-actions">
              <button type="button" className="sasv-primary" onClick={openBrief}>Tell us what you’re making <ArrowUpRight /></button>
              <button type="button" className="sasv-text-btn" onClick={() => document.getElementById("sasv-proof")?.scrollIntoView({ behavior: "smooth" })}>See how it works</button>
            </div>
            <div className="sasv-stamp"><span className="sasv-stamp-rule" /> One senior partner from first sketch<br />to first customer.</div>
          </div>

          <div className="sasv-stage" aria-live="polite">
            <div className="sasv-stage-orbit" aria-hidden="true" />
            <article className="sasv-stage-card">
              <div className="sasv-card-top"><span className="sasv-card-label">Your next move</span><span className="sasv-card-index">{lane.number} / 03</span></div>
              <h2>{lane.title}</h2>
              <p>{lane.copy}</p>
              <div className="sasv-stage-footer"><div><span className="sasv-metric">{lane.metric}</span><span className="sasv-metric-label">{lane.metricLabel}</span></div><div><span className="sasv-metric">1:1</span><span className="sasv-metric-label">with your product partner</span></div></div>
            </article>
            <div className="sasv-lane-tabs" role="tablist" aria-label="Choose your product stage">
              {lanes.map((item) => <button key={item.id} type="button" role="tab" aria-selected={activeLane === item.id} className={`sasv-lane-tab ${activeLane === item.id ? "is-active" : ""}`} onClick={() => setActiveLane(item.id)}><b>{item.number}</b><span>{item.label}</span></button>)}
            </div>
          </div>
        </section>

        <div className="sasv-divider" />
        <section className="sasv-proof" id="sasv-proof">
          <div className="sasv-proof-intro">
            <div className="sasv-eyebrow">Not a handoff factory</div>
            <h3>Small team.<br />Full ownership.</h3>
            <p>Every decision stays close to the person who will live with the outcome. That is the advantage.</p>
          </div>
          <div className="sasv-proof-list">
            {proofItems.map((item, index) => <button key={item.mark} type="button" className="sasv-proof-row" onClick={() => setProofIndex(index)} style={{ width: "100%", borderLeft: proofIndex === index ? "3px solid var(--coral)" : "3px solid transparent", paddingLeft: proofIndex === index ? 17 : 20, textAlign: "left", background: "transparent", cursor: "pointer" }}><b>{item.mark}</b><strong>{item.label}</strong><span>{item.detail}</span></button>)}
          </div>
        </section>

        <section className="sasv-bottom-grid">
          <article className="sasv-note">
            <small>Field note / 04</small>
            <h3>Good products make the next decision easier.</h3>
            <button type="button" onClick={() => setProofIndex((proofIndex + 1) % proofItems.length)}>Read our point of view <ArrowUpRight /></button>
          </article>
          <article className="sasv-brief" id="sasv-brief">
            <div className="sasv-eyebrow">A useful first conversation</div>
            <h3>Start with the messy version.</h3>
            <p>Drop your email and we’ll send three questions worth answering before you build anything.</p>
            {!submitted ? <><button type="button" className="sasv-text-btn" onClick={() => setFormOpen(!formOpen)}>{formOpen ? "Close form" : "Open the short form"} <span aria-hidden="true">↓</span></button><div className={`sasv-hidden-form ${formOpen ? "is-open" : ""}`}><form onSubmit={handleSubmit}><input aria-label="Email address" type="email" required placeholder="you@company.com" value={email} onChange={(event) => setEmail(event.target.value)} /><button type="submit">Send it</button></form></div></> : <div className="sasv-success">Sent. Check your inbox for the three questions.</div>}
          </article>
        </section>
      </div>
    </main>
  );
}

export default StartAppsStudioSplitHeroVariant;