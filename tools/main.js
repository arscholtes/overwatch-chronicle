/* Overwatch Chronicle — app logic. Data lives in /data/*.json and is refreshed weekly by the bot. */
function art(key,glow){return `<svg viewBox="0 0 100 100" style="color:#dfe8fb;--glow:${glow}" aria-hidden="true">${ICON[key]||ICON.hex}</svg>`}
function monogram(txt,c){return `<svg viewBox="0 0 48 48" aria-hidden="true"><polygon points="24,2 44,13 44,35 24,46 4,35 4,13" fill="${c}" fill-opacity=".16" stroke="${c}" stroke-width="2"/><text x="24" y="31" text-anchor="middle" font-family="Teko,Barlow Condensed,sans-serif" font-size="${txt.length>2?16:20}" font-weight="600" fill="#eaf1ff">${txt}</text></svg>`}
const $=s=>document.querySelector(s);
const esc=s=>String(s??"").replace(/[&<>"]/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;"}[c]));
const fmt=n=>n>=1e6?(n/1e6).toFixed(n>=1e7?0:1).replace(/\.0$/,"")+"M":n>=1e3?Math.round(n/1e3)+"K":String(n);
const TALK=`<svg viewBox="0 0 16 16" aria-hidden="true"><path d="M2 3h12v8H7l-3 3v-3H2z" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linejoin="round"/><circle cx="5.5" cy="7" r="1" fill="currentColor"/><circle cx="8" cy="7" r="1" fill="currentColor"/><circle cx="10.5" cy="7" r="1" fill="currentColor"/></svg>`;
const MOODS={hype:"Hype",celebration:"Celebration",mixed:"Mixed",backlash:"Backlash"};
const PLAY=`<svg viewBox="0 0 10 10"><path d="M2 1 L9 5 L2 9 Z" fill="currentColor"/></svg>`;

const DATA={};
const state={view:"lore",era:"all",q:"",tlOnly:false,region:"All"};
const TABS=[["lore","Lore",""],["esports","Esports","esp"],["t2","Tier 2","t2"],["teams","Teams","teams"],["numbers","Numbers","nums"],["triumvirate","Triumvirate","tri"]];

async function load(){
  const files=["lore","esports","t2","social","teams","metrics","site","meta","alumni","triumvirate"];
  const res=await Promise.all(files.map(f=>fetch(`data/${f}.json`,{cache:"no-cache"}).then(r=>r.json())));
  files.forEach((f,i)=>DATA[f]=res[i]);
}

/* ---------- header / hero ---------- */
function tabs(){
  $("#tabs").innerHTML=TABS.map(([v,l,c])=>`<button class="tab ${c}" role="tab" id="tab-${v}" aria-selected="${state.view===v}" data-view="${v}">${l}</button>`).join("");
}
function hero(){
  const v=state.view;
  document.body.className={esports:"esports",t2:"t2",teams:"teamsv",numbers:"numsv",triumvirate:"triv"}[v]||"";
  const D=DATA[v==="t2"?"t2":v]||{};
  const H={
   lore:{k:"Mission archive · Story",h:`The world could always use <em>more heroes</em>`,p:"Every major turn of the Overwatch story in order, from the first omniums to the Reign of Talon. Events before 2026 are grouped by era, since Blizzard rarely gives exact dates.",s:[[DATA.lore.items.length,"Events"],[DATA.lore.eras.length,"Eras"],[10,"Heroes in 2026"]]},
   esports:{k:"Mission archive · Competition",h:`Ten years of <em>pro Overwatch</em>`,p:"APEX, the Overwatch League, the World Cup and the Champions Series. Tap Watch to play a match here, or Community to see how people reacted at the time.",s:[[DATA.esports.items.length,"Events"],[DATA.esports.items.filter(i=>i.vods).length,"With VODs"],["401K","Peak · OWWC 2026"]]},
   t2:{k:"Mission archive · Path to Pro",h:`Where the pros <em>come from</em>`,p:"Tier 2 Overwatch, from Open Division and Contenders to FACEIT League and promotion fights. Timeless events are highlighted in violet.",s:[[DATA.t2.items.length,"Events"],[DATA.t2.items.filter(i=>i.tl).length,"Timeless moments"],["S10","FACEIT League now"]]},
   teams:{k:"Mission archive · Rosters",h:`Every team, <em>every era</em>`,p:"OWCS teams, league franchises, tier 2 orgs and national teams, with links to Liquipedia and socials. Every org that competed for a year or more. Tap a tier 2 team to see its alumni and where they play now.",s:[[DATA.teams.length,"Teams"],[DATA.teams.filter(t=>t.tier==="T1").length,"Top flight now"],[DATA.teams.filter(t=>t.tier==="T2").length,"Tier 2"]]},
   triumvirate:{k:"Mission archive · The founders",h:`The <em>triumvirate</em>`,p:DATA.triumvirate.intro,s:[[3,"People"],["2020","Hour Zero begins"],["2026","Timeless returns"]]},
   numbers:{k:"Mission archive · Data",h:`How many are <em>watching & playing</em>`,p:"Viewership for the biggest events and the player base over time. Steam numbers are measured; all-platform numbers are estimates.",s:[[fmt(DATA.metrics.steamPeak.value),"Steam peak"],["~"+fmt(DATA.metrics.allPlatform.concurrentLow)+"–"+fmt(DATA.metrics.allPlatform.concurrentHigh),"Est. concurrent, all platforms"]]}
  }[v];
  $("#heroInner").innerHTML=`<div class="kicker">${H.k}</div><h1>${H.h}</h1><p class="lede">${H.p}</p><div class="stats">${H.s.map(([b,s])=>`<div class="stat"><b>${b}</b><span>${s}</span></div>`).join("")}</div>`;
  const tl=v==="timeline";
  $(".controls").hidden=!["lore","esports","t2"].includes(v);
}

/* ---------- sections above the timeline ---------- */
function cases(){
  const v=state.view;let h="";
  if(v==="esports"){
    const trophy=`<svg viewBox="0 0 100 100" style="color:#ffd36b;--glow:#ffd36b">${ICON.trophy}</svg>`;
    h+=`<section class="case"><h2>Trophy case</h2><div class="case-grid">${DATA.esports.cups.map(c=>`<div class="cup"><h3>${trophy}${esc(c.h)}</h3><ol>${c.list.map(([y,w])=>`<li><b>${y}</b><span>${w}</span></li>`).join("")}</ol></div>`).join("")}</div></section>`;
    h+=feed("esports","On the timeline · how the scene talked");
  }
  if(v==="t2"){
    h+=`<section class="case"><h2>Spotlight</h2><div class="spot">${monogram("TL","#c9a7ff")}<div><h3>Timeless</h3>
    <p>A North American org founded in October 2022, shut down in May 2025 and revived in 2026. Its peaks: 2nd in OWCS NA Stage 1, an Esports World Cup qualification won against NRG Shock, and a 0–3 reverse sweep of TSM for the FACEIT Season 2 title.</p>
    <div class="stats"><div class="stat"><b>~$86K</b><span>Total winnings</span></div><div class="stat"><b>5</b><span>Titles</span></div><div class="stat"><b>2nd</b><span>OWCS NA S1 2024</span></div><div class="stat"><b>EWC</b><span>NA #3 seed 2024</span></div></div>
    <p style="margin-top:12px;display:flex;gap:8px;flex-wrap:wrap"><button class="tl-toggle" data-spot="timeless">Full Timeless spotlight</button><button class="tl-toggle" id="tlOnly" aria-pressed="${state.tlOnly}">Show only Timeless</button></p></div></div></section>`;
    h+=feed("t2","On the timeline · Timeless");
  }
  if(v==="teams") h+=teamsView();
  if(v==="numbers") h+=numbersView();
  if(v==="triumvirate") h+=triView();
  $("#case").innerHTML=h;
}
function feed(v,title){
  return `<section class="case"><h2>${title}</h2><div class="feed">${DATA.social.filter(s=>s.v===v).map(s=>{
    const tag=s.url?"a":"article";const attrs=s.url?` href="${esc(s.url)}" target="_blank" rel="noopener"`:"";
    return `<${tag} class="post${s.hot?" hot":""}"${attrs}><header>${monogram(s.m,s.c)}<div><b>${esc(s.who)}</b><span>${esc(s.h)} · ${esc(s.d)}</span></div><span class="k">${esc(s.k)}</span></header><p>${esc(s.x)}</p>${s.n?`<div class="n">${esc(s.n)}</div>`:""}${s.url?`<span class="open">${s.exact?"Open post ↗":"Open account ↗"}</span>`:""}</${tag}>`}).join("")}</div></section>`;
}

/* ---------- teams ---------- */
function teamsView(){
  const TIERS=[["All","All"],["T1","Top flight now"],["T2","Tier 2"],["National","National"],["Legacy","League & legacy"]];
  const rk=r=>{const k=[];if(/North America|NA/.test(r))k.push("North America");if(/EMEA|Europe/.test(r))k.push("EMEA");if(/Korea/.test(r))k.push("Korea");if(/Japan/.test(r))k.push("Japan");if(/China/.test(r))k.push("China");if(/Pacific/.test(r))k.push("Pacific");return k};
  const regions=["All","North America","EMEA","Korea","Japan","China","Pacific"];
  const list=DATA.teams.filter(t=>(state.region==="All"||rk(t.region).includes(state.region))&&(!state.tierF||state.tierF==="All"||t.tier===state.tierF));
  return `<section class="case"><div class="tfilter">${TIERS.map(([k,l])=>`<button class="chip" data-tierf="${k}" aria-pressed="${(state.tierF||"All")===k}" style="--c:#ffd36b"><i></i>${l}</button>`).join("")}</div><div class="tfilter">${regions.map(r=>`<button class="chip" data-region="${esc(r)}" aria-pressed="${state.region===r}"><i></i>${esc(r)}</button>`).join("")}</div>
  <div class="tgrid">${list.map(t=>{const n=teamAlumni(t).length;return `<article class="tcard${t.featured?" feat":""}" style="--tc:${t.c}">
   <header role="button" tabindex="0" data-spot="${esc(t.id)}" aria-label="Open ${esc(t.name)} spotlight">${monogram(t.m,t.c)}<div><h3>${esc(t.name)}</h3><div class="meta">${esc(t.region)} · <span class="status ${t.tier==="T1"?"active":""}">${esc(t.status)}</span></div></div><span class="chev" aria-hidden="true">›</span></header>
   <p>${esc(t.blurb)}</p>${t.titles&&t.titles.length?`<div class="tags">${t.titles.map(x=>`<span class="tag w">${esc(x)}</span>`).join("")}</div>`:""}
   <div class="actions"><button class="btn play" data-spot="${esc(t.id)}">Spotlight${n?` · ${n} alumni`:""}</button><a class="btn" target="_blank" rel="noopener" href="https://liquipedia.net/overwatch/index.php?search=${encodeURIComponent(t.name)}">Liquipedia ↗</a>${t.x?`<a class="btn" target="_blank" rel="noopener" href="https://x.com/${esc(t.x)}">@${esc(t.x)} ↗</a>`:""}</div></article>`}).join("")}</div></section>`;
}
function teamAlumni(t){return ((DATA.alumni&&DATA.alumni.people)||[]).filter(p=>(p.teams||[]).includes(t.id))}
function teamNames(t){const base=[t.name,...(t.aliases||[])];return base.map(n=>n.toLowerCase())}
function mentions(t,text){const s=" "+String(text).toLowerCase()+" ";return teamNames(t).some(n=>{const i=s.indexOf(n);if(i<0)return false;const a=s[i-1],b=s[i+n.length];return !/[a-z0-9]/.test(a)&&!/[a-z0-9]/.test(b)})}
function teamEvents(t){
  const out=[];[["lore",DATA.lore],["esports",DATA.esports],["t2",DATA.t2]].forEach(([v,D])=>D.items.forEach(it=>{
    const hay=[it.t,it.d,it.win||"",...(it.tags||[]),...(it.score||[])].join(" | ");
    if(mentions(t,hay)){const won=it.win&&mentions(t,it.win);out.push({it,v,won,era:D.eras.find(e=>e.id===it.e)})}}));
  return out;
}
function teamPosts(t){return DATA.social.filter(s=>mentions(t,[s.who,s.h,s.x].join(" "))||(t.x&&(s.h||"").toLowerCase()==="@"+t.x.toLowerCase()))}
function openSpot(id){
  const t=DATA.teams.find(x=>x.id===id);if(!t)return;
  const ev=teamEvents(t),alum=teamAlumni(t),posts=teamPosts(t);
  const wins=ev.filter(e=>e.won),finals=ev.filter(e=>e.it.score);
  const t1=alum.filter(p=>p.tier==="T1").length;
  const stats=[[t.status,"Status"],[(t.titles||[]).length||wins.length,"Titles"],[ev.length,"Timeline moments"]];
  if(alum.length)stats.push([alum.length,"Alumni"]);if(t1)stats.push([t1,"Alumni in OWCS now"]);
  const tierName={T1:"Top flight",T2:"Tier 2",National:"National team",Legacy:"League & legacy"}[t.tier]||t.tier;
  const overview=t.overview||t.blurb;
  let h=`<div class="sp-hero" style="--tc:${t.c}">${monogram(t.m,t.c)}<div><div class="kicker" style="color:${t.c}">${esc(tierName)} · ${esc(t.region)}</div><h2 id="sTitle">${esc(t.name)}</h2></div></div>
  <section class="sp-sec"><h4>Overview</h4><p class="sp-ov">${esc(overview)}</p>
   <div class="stats">${stats.map(([b,s])=>`<div class="stat"><b>${esc(b)}</b><span>${esc(s)}</span></div>`).join("")}</div>
   ${t.titles&&t.titles.length?`<div class="tags" style="margin-top:10px">${t.titles.map(x=>`<span class="tag w">${esc(x)}</span>`).join("")}</div>`:""}
   <div class="actions"><a class="btn" target="_blank" rel="noopener" href="https://liquipedia.net/overwatch/index.php?search=${encodeURIComponent(t.name)}">Liquipedia ↗</a>${t.x?`<a class="btn" target="_blank" rel="noopener" href="https://x.com/${esc(t.x)}">@${esc(t.x)} ↗</a>`:""}</div></section>`;
  if(ev.length)h+=`<section class="sp-sec"><h4>On the timeline</h4><ul class="sp-ev">${ev.map(({it,v,won,era})=>`<li style="--ec:${it.tl?"#c9a7ff":era.c}"><span class="when">${esc(it.when)}</span><b>${esc(it.t)}</b>${won?`<span class="tag w">Champion</span>`:""}${it.score?`<div class="score"><span>${esc(it.score[0])}</span><span class="s">${esc(it.score[1])}</span><span class="lose">${esc(it.score[2])}</span></div>`:""}<p>${esc(it.d)}</p><div class="actions">${it.vods?`<button class="btn play" data-vod="${esc(it.id)}">${PLAY}Watch</button>`:""}${it.community?`<button class="btn talk mood-${esc(it.community.mood)}" data-talk="${esc(it.id)}">${TALK}Community</button>`:""}<button class="btn" data-goto="${esc(v)}|${esc(it.id)}">Open in timeline</button></div></li>`).join("")}</ul></section>`;
  if(alum.length)h+=`<section class="sp-sec"><h4>Alumni · where they are now</h4><div class="astats"><span><b>${alum.length}</b> alumni</span><span><b>${t1}</b> on OWCS rosters now</span></div><ul class="alist">${alum.map(p=>`<li class="${p.star?"star":""}"><div><b>${esc(p.name)}</b> <span class="status ${p.tier==="T1"?"active":""}">${esc(p.tier)}</span><span class="arole">${esc(p.role)}</span></div><div class="anow">Now: ${esc(p.now)}</div><div class="ahi">${esc(p.hi)}</div>${p.teams[0]===t.id&&p.era?`<div class="aera">With the team: ${esc(p.era)}</div>`:""}<a href="${esc(p.url)}" target="_blank" rel="noopener">Source ↗</a></li>`).join("")}</ul></section>`;
  else if(t.tier==="T2")h+=`<section class="sp-sec"><h4>Alumni</h4><p class="aempty">No alumni tracked yet. The weekly bot adds them as it finds them.</p></section>`;
  if(posts.length)h+=`<section class="sp-sec"><h4>On social</h4><div class="feed">${posts.map(s=>`<a class="post${s.hot?" hot":""}" ${s.url?`href="${esc(s.url)}" target="_blank" rel="noopener"`:""}><header>${monogram(s.m,s.c)}<div><b>${esc(s.who)}</b><span>${esc(s.h)} · ${esc(s.d)}</span></div><span class="k">${esc(s.k)}</span></header><p>${esc(s.x)}</p>${s.n?`<div class="n">${esc(s.n)}</div>`:""}</a>`).join("")}</div></section>`;
  if(!ev.length&&!alum.length&&!posts.length)h+=`<section class="sp-sec"><p class="aempty">More on this team is coming as the weekly bot researches it.</p></section>`;
  $("#sBody").innerHTML=h;const m=$("#smodal");m.hidden=false;m.querySelector(".modal-box").scrollTop=0;$("#sClose").focus();
  document.body.style.overflow="hidden";
}
function closeSpot(){$("#smodal").hidden=true;document.body.style.overflow=""}

function triView(){
  const T=DATA.triumvirate;
  return `<section class="case"><div class="tri">${T.people.map(p=>`<article class="tri-card" style="--tc:${p.c}">
   <header>${monogram(p.m,p.c)}<div><div class="kicker" style="color:${p.c}">${esc(p.role)}</div><h3>${esc(p.name)}</h3></div></header>
   <p class="tri-sum">${esc(p.summary)}</p>
   <ol class="tri-ch">${p.chapters.map(c=>`<li><span class="when">${esc(c.when)}</span><b>${esc(c.t)}</b><p>${esc(c.d)}</p></li>`).join("")}</ol>
   <div class="actions">${(p.links||[]).map(l=>`<a class="btn" href="${esc(l.url)}" target="_blank" rel="noopener">${esc(l.label)} ↗</a>`).join("")}<button class="btn" data-spot="timeless">Timeless spotlight</button></div></article>`).join("")}</div>
   <p class="cnote">Sources: ${T.sources.map(s=>`<a href="${esc(s.url)}" target="_blank" rel="noopener">${esc(s.label)}</a>`).join(" · ")}. Alex's chapters are his own account.</p></section>`;
}
/* ---------- numbers ---------- */
function lineChart(pts,{w=480,h=240,color="#43c6ff",label=v=>fmt(v)}={}){
  if(!pts.length)return"";
  const pad={l:46,r:26,t:22,b:30};const max=Math.max(...pts.map(p=>p.y))*1.12;
  const x=i=>pad.l+(pts.length===1?0:i*(w-pad.l-pad.r)/(pts.length-1));const y=v=>h-pad.b-(v/max)*(h-pad.t-pad.b);
  const grid=[0,.25,.5,.75,1].map(f=>`<line x1="${pad.l}" x2="${w-pad.r}" y1="${y(max*f)}" y2="${y(max*f)}" stroke="#2a3a5c" stroke-width="1"/><text x="${pad.l-6}" y="${y(max*f)+4}" text-anchor="end" fill="#9aabc9" font-size="13">${fmt(Math.round(max*f))}</text>`).join("");
  const d=pts.map((p,i)=>`${i?"L":"M"}${x(i)},${y(p.y)}`).join(" ");
  const area=`${d} L${x(pts.length-1)},${y(0)} L${x(0)},${y(0)} Z`;
  return `<svg viewBox="0 0 ${w} ${h}" role="img">${grid}<path d="${area}" fill="${color}" opacity=".12"/><path d="${d}" fill="none" stroke="${color}" stroke-width="2.5"/>${pts.map((p,i)=>`<circle cx="${x(i)}" cy="${y(p.y)}" r="${i===pts.length-1?5:3}" fill="${color}"/><text x="${x(i)}" y="${h-10}" text-anchor="middle" fill="#9aabc9" font-size="13">${esc(p.x)}</text>${i===pts.length-1||p.y===Math.max(...pts.map(q=>q.y))?`<text x="${x(i)}" y="${y(p.y)-9}" text-anchor="middle" fill="#eaf1ff" font-size="15" font-weight="600">${label(p.y)}</text>`:""}`).join("")}</svg>`;
}
function barChart(rows,{w=480,color="#ffd36b"}={}){
  const max=Math.max(...rows.map(r=>r.v));const rh=44,h=rows.length*rh+10,l=0;
  return `<svg viewBox="0 0 ${w} ${h}" role="img">${rows.map((r,i)=>`<text x="0" y="${i*rh+15}" fill="#c6d3ea" font-size="15">${esc(r.k)}</text><rect x="0" y="${i*rh+21}" width="${(w-80)*r.v/max}" height="16" fill="${color}" opacity=".85"/><text x="${(w-80)*r.v/max+8}" y="${i*rh+35}" fill="#eaf1ff" font-size="15" font-weight="600">${r.approx?"~":""}${fmt(r.v)}</text>`).join("")}</svg>`;
}
function numbersView(){
  const M=DATA.metrics;const AP=M.allPlatform;
  const latest=(M.steamSamples.length?M.steamSamples[M.steamSamples.length-1]:null);
  const ratioLo=AP.concurrentLow/AP.steamAtTime, ratioHi=AP.concurrentHigh/AP.steamAtTime;
  const estNow=latest?`<div class="est"><small>Latest Steam snapshot · ${esc(latest.date)}</small><b>${fmt(latest.ccu)}</b><small>Measured on Steam right now. Scaled by the ${ratioLo.toFixed(1)}–${ratioHi.toFixed(1)}× ratio implied by third-party all-platform models, that's about <strong>${fmt(latest.ccu*ratioLo)}–${fmt(latest.ccu*ratioHi)}</strong> concurrent across all platforms (estimate).</small></div>`:"";
  return `<section class="case"><div class="numgrid">
   <div class="chart"><h3>Peak viewers · biggest events</h3>${barChart(M.viewership.map(r=>({k:r.event,v:r.peak,approx:r.approx})))}<div class="src">Sources: ${[...new Set(M.viewership.map(r=>r.src))].join(", ")}. Peak concurrent viewers across official streams.</div></div>
   <div class="chart"><h3>Steam average concurrent players · monthly</h3>${lineChart(M.steamMonthly.map(r=>({x:r.m.slice(2).replace("-","/"),y:r.avg})))}<div class="src">Measured, Steam only (most PC players use Battle.net, and consoles aren't counted). Steam all-time peak: ${fmt(M.steamPeak.value)} on ${M.steamPeak.date}.</div></div>
   ${M.steamSamples.length>1?`<div class="chart"><h3>Weekly Steam snapshots (bot)</h3>${lineChart(M.steamSamples.map(r=>({x:r.date.slice(5),y:r.ccu})),{color:"#5be3a6"})}<div class="src">Steam Web API, sampled each time the bot runs.</div></div>`:""}
   <div class="chart"><h3>All-platform playerbase · estimate</h3>
    <div class="est"><small>Concurrent players, all platforms</small><b>${fmt(AP.concurrentLow)}–${fmt(AP.concurrentHigh)}</b><small>Third-party modelling, not Blizzard data.</small></div>
    <div class="est" style="margin-top:8px"><small>Monthly active players</small><b>${fmt(AP.mauLow)}–${fmt(AP.mauHigh)}</b><small>Third-party estimate band.</small></div>
    ${estNow?`<div style="margin-top:8px">${estNow}</div>`:""}
    <div class="src">${esc(M.note)} <a href="${esc(AP.url)}" target="_blank" rel="noopener">Source ↗</a></div></div>
  </div></section>`;
}

/* ---------- timeline ---------- */
function ribbon(){
  const D=DATA[state.view];
  $("#ribbon").innerHTML=`<button class="chip" aria-pressed="${state.era==="all"}" data-era="all" style="--c:#eaf1ff"><i></i>All eras</button>`+D.eras.map(e=>`<button class="chip" aria-pressed="${state.era===e.id}" data-era="${e.id}" style="--c:${e.c}"><i></i>${e.n} · ${esc(e.name)}</button>`).join("");
}
function card(it,idx,side,era){
  const tags=(it.tags||[]).map(t=>`<span class="tag">${esc(t)}</span>`).join("")+(it.win?`<span class="tag w">Champion · ${esc(it.win)}</span>`:"")+(it.src?`<span class="tag src">${esc(it.src)}</span>`:"")+(it.tl?`<span class="tag tlm">Timeless</span>`:"")+(it.bot?`<span class="tag src">Added by bot</span>`:"");
  const sc=it.score?`<div class="score"><span>${esc(it.score[0])}</span><span class="s">${esc(it.score[1])}</span><span class="lose">${esc(it.score[2])}</span></div>`:"";
  const v=it.views;
  const views=v?`<div class="views">${v.peak?`<span><b>${v.approx?"~":""}${fmt(v.peak)}</b>peak viewers</span>`:""}${v.avg?`<span><b>${fmt(v.avg)}</b>avg</span>`:""}${v.hours?`<span><b>${v.approx?"~":""}${fmt(v.hours)}</b>hours watched</span>`:""}${v.url?`<a href="${esc(v.url)}" target="_blank" rel="noopener">${esc(v.src)} ↗</a>`:""}</div>`:"";
  const acts=(it.vods||[]).length||(it.links||[]).length||it.community?`<div class="actions">${it.community?`<button class="btn talk mood-${esc(it.community.mood)}" data-talk="${esc(it.id)}" title="What the community said">${TALK}Community</button>`:""}${it.vods?`<button class="btn play" data-vod="${esc(it.id)}">${PLAY}Watch${it.vods.length>1?` (${it.vods.length})`:""}</button>`:""}${(it.links||[]).map(l=>`<a class="btn" href="${esc(l.url)}" target="_blank" rel="noopener">${esc(l.label)} ↗</a>`).join("")}</div>`:"";
  const c=it.tl?"#c9a7ff":era.c;
  return `<article class="item ${side}${it.up?" upcoming":""}${it.tl?" timeless":""}" id="${esc(it.id)}" style="--ec:${c}"><div class="card">${it.up?'<span class="flag-up">UPCOMING</span>':""}
   <div class="art">${art(it.ic,c)}<span class="num">${era.n}·${String(idx).padStart(2,"0")}</span></div>
   <div class="body"><div class="when">${esc(it.when)}</div><h3>${esc(it.t)}</h3><p>${esc(it.d)}</p>${sc}${views}<div class="tags">${tags}</div>${acts}</div></div></article>`;
}
function timeline(){
  const v=state.view;
  if(!["lore","esports","t2"].includes(v)){$("#tl").innerHTML="";$("#empty").style.display="none";return}
  const D=DATA[v];const q=state.q.trim().toLowerCase();
  let html='<div class="spine" aria-hidden="true"></div>',shown=0,side=0;
  D.eras.forEach(era=>{
    if(state.era!=="all"&&state.era!==era.id)return;
    const list=D.items.filter(it=>it.e===era.id).filter(it=>!(v==="t2"&&state.tlOnly)||it.tl).filter(it=>!q||[it.t,it.d,it.when,it.win||"",...(it.tags||[]),...(it.score||[])].join(" ").toLowerCase().includes(q));
    if(!list.length)return;shown+=list.length;
    html+=`<section class="era" style="--ec:${era.c}"><div class="era-head"><div class="era-badge"><small>Era ${era.n}</small><b>${esc(era.name)}</b></div></div><p class="era-sub">${esc(era.sub)}</p><div class="items">${list.map((it,k)=>card(it,k+1,(side++%2)?"left":"right",era)).join("")}</div></section>`;
  });
  $("#tl").innerHTML=html;$("#count").textContent=`${shown} of ${D.items.length}`;$("#empty").style.display=shown?"none":"block";
}

/* ---------- footer ---------- */
function footer(){
  const S=DATA.site;
  $("#foot").innerHTML=`<p>A fan archive. Overwatch belongs to Blizzard Entertainment. All artwork here is original, and team names appear as text with original monogram badges. Videos are embedded from YouTube, and posts link to their original source.</p>
  <div class="credit"><div>Built by <a class="me" href="${esc(S.owner.url)}" target="_blank" rel="noopener">${esc(S.owner.name)}</a><div class="updated">Data updated ${esc(DATA.meta.lastUpdated)}${DATA.meta.lastBotRun?` · bot ran ${esc(DATA.meta.lastBotRun)}`:""}</div></div>
  ${S.buyMeACoffee?`<a class="bmc" href="${esc(S.buyMeACoffee)}" target="_blank" rel="noopener">☕ Buy me a coffee</a>`:""}</div>`;
}

/* ---------- video modal ---------- */
function openVod(id){
  const it=[...DATA.lore.items,...DATA.esports.items,...DATA.t2.items].find(i=>i.id===id);if(!it||!it.vods)return;
  const m=$("#modal");m.hidden=false;$("#mTitle").textContent=it.t;
  $("#mChips").innerHTML=it.vods.map((v,i)=>`<button class="vchip" data-yt="${esc(v.yt)}" data-start="${v.start||0}" aria-pressed="${i===0}">${esc(v.label||"VOD "+(i+1))}</button>`).join("");
  playYt(it.vods[0].yt,it.vods[0].start||0);$("#mClose").focus();
}
function playYt(yt,start){
  const src=`https://www.youtube-nocookie.com/embed/${encodeURIComponent(yt)}?autoplay=1&rel=0${start?`&start=${start}`:""}`;
  $("#mFrame").innerHTML=`<div class="fallback">If the player doesn't appear, this preview can't embed video. It plays on the hosted site, or <a href="https://www.youtube.com/watch?v=${encodeURIComponent(yt)}" target="_blank" rel="noopener">open it on YouTube ↗</a></div><iframe src="${src}" title="Video player" allow="autoplay; encrypted-media; picture-in-picture; fullscreen" allowfullscreen referrerpolicy="strict-origin-when-cross-origin"></iframe>`;
  $("#mOpen").href=`https://www.youtube.com/watch?v=${encodeURIComponent(yt)}${start?`&t=${start}`:""}`;
}
function closeVod(){$("#modal").hidden=true;$("#mFrame").innerHTML=""}

function openTalk(id){
  const it=[...DATA.lore.items,...DATA.esports.items,...DATA.t2.items].find(i=>i.id===id);if(!it||!it.community)return;const c=it.community;
  $("#cTitle").textContent=it.t;
  $("#cBody").innerHTML=`<div class="moodrow"><span class="mood mood-${esc(c.mood)}">${esc(MOODS[c.mood]||c.mood)}</span><span class="when">${esc(it.when)}</span></div><p class="csum">${esc(c.summary)}</p>
   ${(c.voices||[]).length?`<h4>Voices &amp; posts</h4><ul class="voices">${c.voices.map(v=>`<li><b>${esc(v.who)}</b><span>${esc(v.gist)}</span>${v.url?`<a href="${esc(v.url)}" target="_blank" rel="noopener">Open ↗</a>`:""}</li>`).join("")}</ul>`:""}
   <p class="cnote">Summarized from posts and coverage. Quotes are kept short, so open each link for the original.${c.updated?` Updated ${esc(c.updated)}.`:""}</p>`;
  $("#cmodal").hidden=false;$("#cClose").focus();
}
/* ---------- events ---------- */
function render(){tabs();hero();cases();if(["lore","esports","t2"].includes(state.view))ribbon();timeline();footer();fx.retint()}
document.addEventListener("click",e=>{
  const t=e.target.closest("[data-view]");if(t){location.hash=t.dataset.view;return}
  const vod=e.target.closest("[data-vod]");if(vod){openVod(vod.dataset.vod);return}
  const yt=e.target.closest("[data-yt]");if(yt){document.querySelectorAll(".vchip").forEach(b=>b.setAttribute("aria-pressed",b===yt));playYt(yt.dataset.yt,+yt.dataset.start);return}
  if(e.target.closest("#mClose")||e.target.id==="modal"){closeVod();return}
  const talk=e.target.closest("[data-talk]");if(talk){openTalk(talk.dataset.talk);return}
  if(e.target.closest("#cClose")||e.target.id==="cmodal"){$("#cmodal").hidden=true;return}
  if(e.target.closest("#tlOnly")){state.tlOnly=!state.tlOnly;e.target.closest("#tlOnly").setAttribute("aria-pressed",state.tlOnly);timeline();return}
  const sp=e.target.closest("[data-spot]");if(sp){openSpot(sp.dataset.spot);return}
  if(e.target.closest("#sClose")||e.target.id==="smodal"){closeSpot();return}
  const go=e.target.closest("[data-goto]");if(go){const [v,id]=go.dataset.goto.split("|");closeSpot();location.hash=v;setTimeout(()=>{const el=document.getElementById(id);if(el){el.scrollIntoView({block:"center",behavior:"smooth"});el.classList.add("flash");setTimeout(()=>el.classList.remove("flash"),2000)}},150);return}
  const tf=e.target.closest("[data-tierf]");if(tf){state.tierF=tf.dataset.tierf;cases();return}
  const r=e.target.closest("[data-region]");if(r){state.region=r.dataset.region;cases();return}
  const tm=e.target.closest("[data-team]");if(tm){const name=tm.dataset.team;location.hash=name.toLowerCase().includes("timeless")?"t2":"esports";setTimeout(()=>{state.q=name.replace(/^Team /,"");$("#q").value=state.q;timeline();window.scrollTo({top:$(".controls").offsetTop-70,behavior:"smooth"})},0);return}
  const c=e.target.closest("[data-era]");if(c){state.era=c.dataset.era;ribbon();timeline()}
});
document.addEventListener("keydown",e=>{if((e.key==="Enter"||e.key===" ")&&e.target.matches&&e.target.matches("header[data-spot]")){e.preventDefault();e.target.click();return}if(e.key==="Escape"){if(!$("#modal").hidden){closeVod();return}if(!$("#cmodal").hidden){$("#cmodal").hidden=true;return}closeSpot()}});
$("#q").addEventListener("input",e=>{state.q=e.target.value;timeline()});
function route(){const h=location.hash.slice(1);const v=TABS.some(t=>t[0]===h)?h:"lore";if(v!==state.view||!$("#tabs").children.length){state.view=v;state.era="all";state.q="";$("#q").value="";render()}}
window.addEventListener("hashchange",route);

/* ---------- hero canvas ---------- */
const fx=(()=>{
  const cv=$("#fx"),ctx=cv.getContext("2d");let w,h,parts=[],tint=["#f99e1a","#43c6ff"],raf;
  const reduce=window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  function size(){const dpr=Math.min(2,window.devicePixelRatio||1);w=cv.clientWidth;h=cv.clientHeight;cv.width=w*dpr;cv.height=h*dpr;ctx.setTransform(dpr,0,0,dpr,0,0);parts=Array.from({length:Math.round(w/14)},()=>({x:Math.random()*w,y:Math.random()*h,r:Math.random()*1.8+.4,v:Math.random()*.35+.1,c:Math.random()<.5?0:1}))}
  function hexes(){const s=26,hh=Math.sqrt(3)*s;ctx.lineWidth=1;for(let row=-1;row*hh*.5<h+hh;row++){for(let col=-1;col*s*3<w+s*3;col++){const cx=col*s*3+(row%2?s*1.5:0),cy=row*hh*.5;const a=Math.max(0,.16-Math.hypot((cx-w*.78)/w,(cy-h*.2)/h)*.22);if(a<=.005)continue;ctx.strokeStyle=`rgba(234,241,255,${a})`;ctx.beginPath();for(let k=0;k<6;k++){const an=Math.PI/3*k;ctx.lineTo(cx+s*.9*Math.cos(an),cy+s*.9*Math.sin(an))}ctx.closePath();ctx.stroke()}}}
  function frame(){ctx.clearRect(0,0,w,h);hexes();parts.forEach(p=>{p.y-=p.v;p.x+=Math.sin(p.y/40)*.15;if(p.y<-4){p.y=h+4;p.x=Math.random()*w}ctx.fillStyle=tint[p.c];ctx.globalAlpha=.55;ctx.beginPath();ctx.arc(p.x,p.y,p.r,0,7);ctx.fill();ctx.globalAlpha=1});
    ctx.save();ctx.globalAlpha=.10;ctx.fillStyle=tint[0];ctx.beginPath();ctx.moveTo(w*.55,0);ctx.lineTo(w*.62,0);ctx.lineTo(w*.42,h);ctx.lineTo(w*.35,h);ctx.fill();ctx.fillStyle=tint[1];ctx.beginPath();ctx.moveTo(w*.66,0);ctx.lineTo(w*.68,0);ctx.lineTo(w*.48,h);ctx.lineTo(w*.46,h);ctx.fill();ctx.restore();
    if(!reduce)raf=requestAnimationFrame(frame)}
  function start(){cancelAnimationFrame(raf);size();frame()}
  window.addEventListener("resize",start);
  return{retint(){tint={triumvirate:["#f99e1a","#c9a7ff"],lore:["#f99e1a","#43c6ff"],t2:["#c9a7ff","#43c6ff"],teams:["#ffd36b","#f99e1a"],numbers:["#5be3a6","#43c6ff"]}[state.view]||["#43c6ff","#ffd36b"];start()}};
})();

load().then(()=>{route()}).catch(err=>{$("#heroInner").innerHTML=`<h1>Couldn't load data</h1><p class="lede">${esc(err.message)}. If you opened this file directly, serve the folder instead (for example: <code>python3 -m http.server</code> inside <code>site/</code>).</p>`});
