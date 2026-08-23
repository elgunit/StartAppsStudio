import React, { useEffect, useRef, useState } from "react";

const work = [
  {
    index: "01",
    type: "Launch site",
    title: "A sharper front door for Field Notes",
    detail: "Positioning, narrative and a fast publishing system for a climate research platform.",
    result: "2.6× more qualified conversations",
    color: "coral",
  },
  {
    index: "02",
    type: "Figma-led prototype",
    title: "The first believable version of Common Room",
    detail: "A collaborative prototype that helped a technical founder close the right first pilot.",
    result: "Pilot signed before engineering",
    color: "ochre",
  },
  {
    index: "03",
    type: "Founder-led MVP",
    title: "From messy workflow to usable product",
    detail: "A focused web app for an operations team who had outgrown spreadsheets.",
    result: "First customer in 7 weeks",
    color: "blue",
  },
];

const principles = [
  ["01", "Clarity before velocity", "We make the hard product decision before we make the easy screen."],
  ["02", "Prototypes earn their keep", "Every prototype has a job: align a team, test a risk, or win a first customer."],
  ["03", "One person stays close", "You get a senior partner who remembers why the decision was made."],
];

function Arrow() {
  return (
    <svg aria-hidden="true" viewBox="0 0 18 18" className="safl-arrow">
      <path d="M3 15 15 3M6 3h9v9" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function Mark() {
  return (
    <span className="safl-mark" aria-hidden="true">
      <svg viewBox="0 0 32 32">
        <circle cx="16" cy="16" r="12.3" fill="none" stroke="currentColor" strokeWidth="1.2" />
        <path d="m20.4 11.6-2.7 7-7 2.7 2.7-7 7-2.7Z" fill="none" stroke="currentColor" strokeWidth="1.2" strokeLinejoin="round" />
      </svg>
    </span>
  );
}

export function StartAppsStudioFullLandingPage() {
  const [activeWork, setActiveWork] = useState(0);
  const [openPrinciple, setOpenPrinciple] = useState(0);
  const [menuOpen, setMenuOpen] = useState(false);
  const [sent, setSent] = useState(false);
  const [email, setEmail] = useState("");
  const revealRoot = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const root = revealRoot.current;
    if (!root) return;
    const observer = new IntersectionObserver(
      (entries) => entries.forEach((entry) => entry.isIntersecting && entry.target.classList.add("is-visible")),
      { threshold: 0.12 },
    );
    root.querySelectorAll(".safl-reveal").forEach((node) => observer.observe(node));
    return () => observer.disconnect();
  }, []);

  const scrollTo = (id: string) => {
    setMenuOpen(false);
    document.getElementById(id)?.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <main className="safl-shell" ref={revealRoot}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700&family=Fraunces:opsz,wght@9..144,500;9..144,600;9..144,700&family=Space+Mono:wght@400;700&display=swap');
        .safl-shell, .safl-shell * { box-sizing:border-box; }
        .safl-shell { --ink:#183139; --paper:#f4f0e6; --muted:#667579; --line:rgba(24,49,57,.18); --coral:#ef7256; --ochre:#e6da66; --blue:#8ebbc0; --sage:#dbe4d9; min-height:100dvh; color:var(--ink); background:var(--paper); font-family:'DM Sans',sans-serif; overflow:hidden; }
        .safl-shell button, .safl-shell input { font:inherit; }
        .safl-shell a { color:inherit; }
        .safl-noise { position:fixed; inset:0; z-index:10; pointer-events:none; opacity:.045; background-image:url("data:image/svg+xml,%3Csvg viewBox='0 0 180 180' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence baseFrequency='.8' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E"); }
        .safl-frame { width:min(1320px,calc(100% - 64px)); margin:auto; }
        .safl-topbar { height:84px; display:flex; align-items:center; justify-content:space-between; border-bottom:1px solid var(--line); }
        .safl-brand { display:flex; align-items:center; gap:11px; text-decoration:none; font-size:12px; font-weight:700; letter-spacing:-.02em; line-height:.95; }
        .safl-brand small { margin-left:5px; color:var(--muted); font:9px/1.35 'Space Mono',monospace; letter-spacing:.04em; }
        .safl-mark { width:29px; height:29px; display:grid; place-items:center; color:var(--paper); background:var(--ink); border-radius:50%; }
        .safl-mark svg { width:18px; height:18px; }
        .safl-nav { display:flex; align-items:center; gap:27px; }
        .safl-nav button, .safl-menu-toggle { border:0; color:var(--muted); background:transparent; cursor:pointer; font-size:11px; }
        .safl-nav button:hover { color:var(--ink); }
        .safl-nav .safl-outline, .safl-outline { padding:11px 15px; color:var(--ink); border:1px solid var(--ink); }
        .safl-nav .safl-outline:hover { color:var(--paper); background:var(--ink); }
        .safl-menu-toggle { display:none; }
        .safl-hero { min-height:calc(100dvh - 84px); display:grid; grid-template-columns:minmax(0,1fr) minmax(400px,.92fr); gap:7vw; align-items:center; padding:70px 0 96px; }
        .safl-eyebrow { display:flex; align-items:center; gap:10px; color:var(--muted); font:10px 'Space Mono',monospace; letter-spacing:.08em; text-transform:uppercase; }
        .safl-dot { width:7px; height:7px; border-radius:50%; background:var(--coral); box-shadow:0 0 0 5px rgba(239,114,86,.14); }
        .safl-hero h1 { max-width:730px; margin:28px 0 28px; font:600 clamp(56px,7.3vw,108px)/.89 'Fraunces',serif; letter-spacing:-.07em; }
        .safl-hero h1 em { color:var(--coral); font-style:normal; }
        .safl-lede { max-width:500px; color:var(--muted); font-size:16px; line-height:1.55; }
        .safl-actions { display:flex; align-items:center; gap:21px; margin-top:34px; }
        .safl-primary { display:inline-flex; align-items:center; gap:15px; padding:15px 18px; border:0; color:var(--paper); background:var(--ink); cursor:pointer; font-size:12px; font-weight:700; transition:transform .25s,background .25s; }
        .safl-primary:hover { transform:translateY(-3px); background:#2a515b; }
        .safl-arrow { width:16px; height:16px; }
        .safl-link { padding:8px 0; border:0; border-bottom:1px solid var(--ink); color:var(--ink); background:transparent; cursor:pointer; font-size:12px; font-weight:600; }
        .safl-stamp { display:flex; align-items:center; gap:11px; margin-top:54px; color:var(--muted); font:9px/1.4 'Space Mono',monospace; }
        .safl-stamp i { width:47px; height:1px; background:var(--coral); }
        .safl-hero-art { position:relative; min-height:570px; display:grid; place-items:center; }
        .safl-orbit { position:absolute; width:min(43vw,550px); aspect-ratio:1; border:1px solid var(--line); border-radius:50%; transform:rotate(-17deg); }
        .safl-orbit:before, .safl-orbit:after { content:""; position:absolute; width:9px; height:9px; border-radius:50%; background:var(--coral); }
        .safl-orbit:before { top:7%; left:20%; } .safl-orbit:after { right:14%; bottom:10%; background:var(--blue); }
        .safl-card { position:relative; z-index:1; width:min(100%,500px); padding:28px; color:#eef0e8; background:var(--ink); box-shadow:17px 18px 0 rgba(24,49,57,.1); transform:rotate(2.4deg); transition:transform .4s; }
        .safl-card:hover { transform:rotate(0) translateY(-5px); }
        .safl-card:after { content:""; position:absolute; width:43px; height:43px; top:-13px; right:-13px; border:1px solid var(--ink); background:var(--ochre); }
        .safl-card-meta { display:flex; justify-content:space-between; padding-bottom:22px; border-bottom:1px solid rgba(244,240,230,.22); color:#acb9b5; font:9px 'Space Mono',monospace; text-transform:uppercase; letter-spacing:.08em; }
        .safl-card-meta b { color:var(--ochre); font-weight:400; }
        .safl-card h2 { max-width:380px; margin:46px 0 19px; font:500 clamp(32px,4vw,54px)/.96 'Fraunces',serif; letter-spacing:-.055em; }
        .safl-card p { max-width:350px; margin:0 0 44px; color:#acb9b5; font-size:13px; line-height:1.55; }
        .safl-card-foot { display:grid; grid-template-columns:1fr 1fr; gap:20px; padding-top:17px; border-top:1px solid rgba(244,240,230,.22); }
        .safl-card-foot strong { display:block; color:var(--ochre); font:30px/1 'Fraunces',serif; }
        .safl-card-foot span { display:block; margin-top:6px; color:#acb9b5; font:8px/1.4 'Space Mono',monospace; text-transform:uppercase; }
        .safl-label { color:var(--coral); font:700 9px 'Space Mono',monospace; letter-spacing:.1em; text-transform:uppercase; }
        .safl-rule { border-top:1px solid var(--line); }
        .safl-intro { display:grid; grid-template-columns:1fr 2fr; gap:7vw; padding:90px 0 104px; }
        .safl-intro h2, .safl-section-head h2, .safl-quote h2 { margin:14px 0 0; font:500 clamp(36px,4.6vw,65px)/.96 'Fraunces',serif; letter-spacing:-.06em; }
        .safl-intro-copy { max-width:640px; font:500 clamp(22px,2.65vw,38px)/1.15 'Fraunces',serif; letter-spacing:-.04em; }
        .safl-intro-copy span { color:var(--coral); }
        .safl-work { padding:100px 0 120px; background:var(--sage); }
        .safl-section-head { display:flex; align-items:flex-end; justify-content:space-between; margin-bottom:43px; }
        .safl-section-head p { max-width:240px; margin:0; color:var(--muted); font-size:12px; line-height:1.5; }
        .safl-work-layout { display:grid; grid-template-columns:.85fr 1.15fr; gap:36px; align-items:start; }
        .safl-work-tabs { border-top:1px solid var(--line); }
        .safl-work-tab { width:100%; display:grid; grid-template-columns:42px 1fr; gap:16px; padding:23px 7px; border:0; border-bottom:1px solid var(--line); color:var(--muted); background:transparent; cursor:pointer; text-align:left; transition:color .2s,transform .2s; }
        .safl-work-tab:hover, .safl-work-tab.active { color:var(--ink); transform:translateX(6px); }
        .safl-work-tab b { font:10px 'Space Mono',monospace; color:var(--coral); }
        .safl-work-tab strong { font-size:15px; }
        .safl-work-tab span { grid-column:2; margin-top:-8px; font-size:11px; line-height:1.45; }
        .safl-case { min-height:400px; padding:30px; display:flex; flex-direction:column; justify-content:space-between; background:var(--ink); color:var(--paper); transition:background .3s; }
        .safl-case-top { display:flex; justify-content:space-between; font:9px 'Space Mono',monospace; text-transform:uppercase; letter-spacing:.07em; color:#aab9b5; }
        .safl-case-top b { color:var(--ochre); font-weight:400; }
        .safl-case h3 { max-width:520px; margin:55px 0 15px; font:500 clamp(32px,4vw,57px)/.95 'Fraunces',serif; letter-spacing:-.055em; }
        .safl-case p { max-width:420px; margin:0; color:#b2c0bb; font-size:13px; line-height:1.5; }
        .safl-case-bottom { display:flex; align-items:end; justify-content:space-between; padding-top:30px; border-top:1px solid rgba(244,240,230,.2); }
        .safl-case-bottom strong { color:var(--ochre); font-size:13px; }
        .safl-case-bottom small { color:#aab9b5; font:9px 'Space Mono',monospace; text-transform:uppercase; }
        .safl-process { padding:115px 0; }
        .safl-process-grid { display:grid; grid-template-columns:1fr 1.25fr; gap:7vw; }
        .safl-process-list { margin-top:3px; border-top:1px solid var(--line); }
        .safl-principle { border-bottom:1px solid var(--line); }
        .safl-principle button { width:100%; display:flex; align-items:center; gap:18px; padding:21px 0; border:0; color:var(--ink); background:transparent; cursor:pointer; text-align:left; }
        .safl-principle button b { color:var(--coral); font:10px 'Space Mono',monospace; }
        .safl-principle button strong { flex:1; font-size:14px; }
        .safl-plus { font-size:20px; font-weight:400; transition:transform .25s; }
        .safl-principle.open .safl-plus { transform:rotate(45deg); }
        .safl-principle p { max-width:460px; margin:-5px 35px 21px; color:var(--muted); font-size:13px; line-height:1.55; }
        .safl-quote { display:grid; grid-template-columns:.85fr 1.15fr; gap:8vw; padding:105px 0; background:var(--coral); }
        .safl-quote > * { width:min(1320px,calc(100% - 64px)); }
        .safl-quote > :first-child { margin-left:max(32px,calc((100vw - 1320px)/2)); }
        .safl-quote > :last-child { margin-left:0; }
        .safl-quote h2 { color:var(--ink); }
        .safl-quote blockquote { margin:0; font:500 clamp(27px,3.3vw,47px)/1.05 'Fraunces',serif; letter-spacing:-.05em; }
        .safl-quote cite { display:block; margin-top:28px; font:10px 'Space Mono',monospace; font-style:normal; text-transform:uppercase; }
        .safl-contact { display:grid; grid-template-columns:.8fr 1.2fr; gap:8vw; padding:112px 0 125px; }
        .safl-contact h2 { margin:14px 0 23px; font:500 clamp(42px,5.2vw,78px)/.9 'Fraunces',serif; letter-spacing:-.07em; }
        .safl-contact p { max-width:300px; color:var(--muted); font-size:13px; line-height:1.5; }
        .safl-form { align-self:end; padding:30px; background:var(--ochre); }
        .safl-form label { display:block; margin-bottom:20px; font:10px 'Space Mono',monospace; text-transform:uppercase; }
        .safl-form-row { display:flex; gap:9px; }
        .safl-form input { min-width:0; flex:1; padding:14px; border:1px solid rgba(24,49,57,.4); outline:0; color:var(--ink); background:rgba(244,240,230,.68); font-size:12px; }
        .safl-form input:focus { border-color:var(--ink); }
        .safl-form button { padding:14px 17px; border:0; color:var(--paper); background:var(--ink); cursor:pointer; font-size:12px; font-weight:700; }
        .safl-success { font-size:13px; font-weight:700; }
        .safl-footer { display:flex; justify-content:space-between; padding:22px 0 30px; border-top:1px solid var(--line); color:var(--muted); font:9px 'Space Mono',monospace; text-transform:uppercase; }
        .safl-reveal { opacity:0; transform:translateY(22px); transition:opacity .7s ease,transform .7s ease; }
        .safl-reveal.is-visible { opacity:1; transform:translateY(0); }
        @media (max-width:900px) { .safl-hero,.safl-process-grid,.safl-contact,.safl-intro,.safl-work-layout { grid-template-columns:1fr; gap:38px; } .safl-hero { padding-top:62px; } .safl-hero-art { min-height:530px; } .safl-orbit { width:80vw; } .safl-intro-copy { max-width:660px; } .safl-quote { grid-template-columns:1fr; gap:38px; } .safl-quote > * { width:calc(100% - 64px); margin-left:32px !important; } }
        @media (max-width:640px) { .safl-frame { width:calc(100% - 32px); } .safl-topbar { height:70px; } .safl-brand small, .safl-nav { display:none; } .safl-menu-toggle { display:block; } .safl-nav.is-open { position:absolute; z-index:4; top:70px; left:16px; right:16px; display:flex; flex-direction:column; align-items:stretch; gap:0; padding:8px; border:1px solid var(--line); background:var(--paper); } .safl-nav.is-open button { padding:14px; text-align:left; } .safl-hero { min-height:auto; padding:58px 0 54px; } .safl-hero h1 { font-size:clamp(53px,15vw,78px); } .safl-lede { font-size:14px; } .safl-actions { align-items:flex-start; flex-direction:column; gap:17px; } .safl-hero-art { min-height:585px; margin-top:4px; align-items:start; padding-top:25px; } .safl-card { padding:22px; width:calc(100% - 7px); } .safl-card h2 { margin-top:40px; font-size:39px; } .safl-intro,.safl-process,.safl-contact { padding:72px 0; } .safl-work { padding:72px 0; } .safl-section-head { display:block; } .safl-section-head p { margin-top:18px; } .safl-case { min-height:390px; padding:23px; } .safl-case h3 { margin-top:45px; font-size:38px; } .safl-form-row { flex-direction:column; } .safl-quote { padding:75px 0; } .safl-footer { gap:18px; flex-direction:column; } }
        @media (prefers-reduced-motion:reduce) { .safl-shell *, .safl-shell *:before, .safl-shell *:after { transition-duration:.01ms !important; scroll-behavior:auto !important; } }
      `}</style>
      <div className="safl-noise" aria-hidden="true" />
      <div className="safl-frame">
        <header className="safl-topbar">
          <button type="button" className="safl-brand" onClick={() => scrollTo("safl-home")}>
            <Mark /><span>START APPS<br />STUDIO</span><small>PRODUCT PARTNER<br />FOR FOUNDERS</small>
          </button>
          <button type="button" className="safl-menu-toggle" onClick={() => setMenuOpen(!menuOpen)} aria-expanded={menuOpen}>Menu</button>
          <nav className={`safl-nav ${menuOpen ? "is-open" : ""}`} aria-label="Main navigation">
            <button type="button" onClick={() => scrollTo("safl-work")}>Selected work</button>
            <button type="button" onClick={() => scrollTo("safl-method")}>Our method</button>
            <button type="button" className="safl-outline" onClick={() => scrollTo("safl-contact")}>Start a conversation <Arrow /></button>
          </nav>
        </header>

        <section className="safl-hero" id="safl-home">
          <div className="safl-reveal">
            <div className="safl-eyebrow"><i className="safl-dot" /> Independent studio · Worldwide</div>
            <h1>Make the hard part <em>clear.</em></h1>
            <p className="safl-lede">A founder-led product studio for sharp ideas that deserve a thoughtful route into the world. Product thinking, interface design, and engineering — held together by one senior partner.</p>
            <div className="safl-actions"><button type="button" className="safl-primary" onClick={() => scrollTo("safl-contact")}>Tell us what you’re making <Arrow /></button><button type="button" className="safl-link" onClick={() => scrollTo("safl-work")}>See the work</button></div>
            <div className="safl-stamp"><i /> One accountable partner from first sketch<br />to first customer.</div>
          </div>
          <div className="safl-hero-art safl-reveal">
            <div className="safl-orbit" aria-hidden="true" />
            <article className="safl-card">
              <div className="safl-card-meta"><span>Your next move</span><b>01 / 03</b></div>
              <h2>Build the first version people can choose.</h2>
              <p>Start with the signal. Shape the story. Put a real product in front of real people before the edges get expensive.</p>
              <div className="safl-card-foot"><div><strong>6–8</strong><span>weeks to first release</span></div><div><strong>1:1</strong><span>with your product partner</span></div></div>
            </article>
          </div>
        </section>
      </div>

      <section className="safl-frame safl-intro safl-reveal" id="safl-method">
        <div><div className="safl-label">The useful difference</div><h2>Small team.<br />Full ownership.</h2></div>
        <p className="safl-intro-copy">You do not need more people in a project room. You need <span>fewer handoffs</span>, better questions, and someone senior enough to make the call when the path splits.</p>
      </section>

      <section className="safl-work" id="safl-work">
        <div className="safl-frame">
          <div className="safl-section-head safl-reveal"><div><div className="safl-label">Selected work</div><h2>Proof, not promises.</h2></div><p>Different starting points. The same care for the decision underneath.</p></div>
          <div className="safl-work-layout safl-reveal">
            <div className="safl-work-tabs">{work.map((item, index) => <button key={item.index} type="button" className={`safl-work-tab ${activeWork === index ? "active" : ""}`} onClick={() => setActiveWork(index)}><b>{item.index}</b><strong>{item.type}</strong><span>{item.title}</span></button>)}</div>
            <article className="safl-case">
              <div className="safl-case-top"><span>{work[activeWork].type}</span><b>{work[activeWork].index} / 03</b></div>
              <div><h3>{work[activeWork].title}</h3><p>{work[activeWork].detail}</p></div>
              <div className="safl-case-bottom"><strong>{work[activeWork].result}</strong><small>Outcome / {work[activeWork].color}</small></div>
            </article>
          </div>
        </div>
      </section>

      <section className="safl-frame safl-process safl-reveal">
        <div className="safl-process-grid">
          <div><div className="safl-label">How we work</div><h2 className="safl-intro-copy">A calm, direct route from maybe to <span>meaningful.</span></h2></div>
          <div className="safl-process-list">{principles.map(([number, title, copy], index) => <div className={`safl-principle ${openPrinciple === index ? "open" : ""}`} key={number}><button type="button" onClick={() => setOpenPrinciple(openPrinciple === index ? -1 : index)} aria-expanded={openPrinciple === index}><b>{number}</b><strong>{title}</strong><span className="safl-plus">+</span></button>{openPrinciple === index && <p>{copy}</p>}</div>)}</div>
        </div>
      </section>

      <section className="safl-quote safl-reveal">
        <div><div className="safl-label">A founder’s note</div><h2>The right partner makes ambition feel practical.</h2></div>
        <div><blockquote>“They did not just make the product look finished. They helped us understand what the product needed to be.”</blockquote><cite>— Maya Chen, founder of Common Room</cite></div>
      </section>

      <section className="safl-frame safl-contact safl-reveal" id="safl-contact">
        <div><div className="safl-label">Let’s begin honestly</div><h2>Bring the messy version.</h2><p>Tell us what you know, what you’re unsure about, and what needs to be true next. We’ll come back with a useful response — not a sales sequence.</p></div>
        <form className="safl-form" onSubmit={(event) => { event.preventDefault(); if (email.trim()) setSent(true); }}>
          {!sent ? <><label htmlFor="safl-email">Where should we write?</label><div className="safl-form-row"><input id="safl-email" type="email" required placeholder="you@company.com" value={email} onChange={(event) => setEmail(event.target.value)} /><button type="submit">Start the conversation <Arrow /></button></div></> : <div className="safl-success">Thanks — the first conversation starts in your inbox.</div>}
        </form>
      </section>

      <footer className="safl-frame safl-footer"><span>Start Apps Studio · Product partner for founders</span><span>Direction / Design / Build</span><span>© 2024</span></footer>
    </main>
  );
}

export default StartAppsStudioFullLandingPage;