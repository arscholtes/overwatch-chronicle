const ICON = {
 factory:`<rect x="14" y="44" width="72" height="36" fill="none" stroke="currentColor" stroke-width="3"/><path d="M22 44 V20 h10 v24 M44 44 V28 h10 v16 M66 44 V14 h10 v30" fill="none" stroke="currentColor" stroke-width="3"/><circle cx="50" cy="62" r="9" fill="none" stroke="var(--glow)" stroke-width="3"/><circle cx="50" cy="62" r="3" fill="var(--glow)"/>`,
 omnic:`<rect x="22" y="22" width="56" height="50" rx="10" fill="none" stroke="currentColor" stroke-width="3"/><circle cx="38" cy="44" r="5" fill="var(--glow)"/><circle cx="62" cy="44" r="5" fill="var(--glow)"/><path d="M36 60 h28" stroke="currentColor" stroke-width="3"/><path d="M50 22 V10 M44 10 h12" stroke="currentColor" stroke-width="3"/><path d="M30 72 l-6 14 M70 72 l6 14" stroke="currentColor" stroke-width="3"/>`,
 tower:`<path d="M50 8 L64 30 L58 30 L66 90 H34 L42 30 H36 Z" fill="none" stroke="currentColor" stroke-width="3" stroke-linejoin="round"/><circle cx="50" cy="44" r="6" fill="var(--glow)"/><path d="M20 90 H80" stroke="currentColor" stroke-width="3"/><path d="M50 44 L18 26 M50 44 L82 26" stroke="var(--glow)" stroke-width="1.5" opacity=".7"/>`,
 shield:`<path d="M50 10 L82 22 V48 C82 68 68 82 50 90 C32 82 18 68 18 48 V22 Z" fill="none" stroke="currentColor" stroke-width="3"/><path d="M50 22 L70 30 V48 C70 61 62 71 50 77 C38 71 30 61 30 48 V30 Z" fill="var(--glow)" opacity=".22"/><path d="M38 54 L50 32 L62 54 M42 47 H58" fill="none" stroke="var(--glow)" stroke-width="3.5" stroke-linejoin="round"/>`,
 hammer:`<rect x="20" y="16" width="44" height="24" fill="none" stroke="currentColor" stroke-width="3" transform="rotate(-30 42 28)"/><path d="M48 38 L74 86" stroke="currentColor" stroke-width="5" stroke-linecap="round"/><circle cx="74" cy="86" r="3" fill="var(--glow)"/><path d="M14 72 L30 60 M10 58 L26 52" stroke="var(--glow)" stroke-width="2.5"/>`,
 pyramid:`<path d="M50 14 L86 82 H14 Z" fill="none" stroke="currentColor" stroke-width="3" stroke-linejoin="round"/><path d="M50 14 L58 82" stroke="currentColor" stroke-width="1.5" opacity=".6"/><circle cx="50" cy="56" r="8" fill="none" stroke="var(--glow)" stroke-width="3"/><circle cx="50" cy="56" r="2.5" fill="var(--glow)"/><path d="M8 90 H92" stroke="currentColor" stroke-width="3"/>`,
 strike:`<polygon points="50,10 59,38 88,38 64,55 73,84 50,66 27,84 36,55 12,38 41,38" fill="none" stroke="currentColor" stroke-width="3" stroke-linejoin="round"/><polygon points="50,28 55,42 70,42 58,51 62,66 50,57 38,66 42,51 30,42 45,42" fill="var(--glow)" opacity=".5"/>`,
 sun:`<circle cx="50" cy="50" r="16" fill="var(--glow)" opacity=".5"/><circle cx="50" cy="50" r="16" fill="none" stroke="currentColor" stroke-width="3"/><g stroke="currentColor" stroke-width="3" stroke-linecap="round"><path d="M50 12v12M50 76v12M12 50h12M76 50h12M23 23l8 8M69 69l8 8M77 23l-8 8M31 69l-8 8"/></g>`,
 split:`<path d="M50 10 V90" stroke="currentColor" stroke-width="3"/><path d="M50 18 C24 26 18 44 22 74 L50 86" fill="none" stroke="currentColor" stroke-width="3"/><path d="M50 18 C76 26 82 44 78 74 L50 86" fill="var(--glow)" fill-opacity=".18" stroke="var(--glow)" stroke-width="3"/><circle cx="36" cy="48" r="4" fill="currentColor"/><circle cx="64" cy="48" r="4" fill="var(--glow)"/>`,
 tower2:`<path d="M10 90 H90" stroke="currentColor" stroke-width="3"/><path d="M30 90 V40 L50 22 L70 40 V90" fill="none" stroke="currentColor" stroke-width="3"/><path d="M42 90 V64 h16 v26" fill="none" stroke="currentColor" stroke-width="3"/><path d="M50 22 V8 l14 5 -14 5" fill="var(--glow)" stroke="var(--glow)" stroke-width="2"/>`,
 radiation:`<circle cx="50" cy="50" r="38" fill="none" stroke="currentColor" stroke-width="3"/><circle cx="50" cy="50" r="6" fill="var(--glow)"/><path d="M50 44 L40 26 A28 28 0 0 1 60 26 Z M55 53 L76 53 A28 28 0 0 1 66 70 Z M45 53 L34 70 A28 28 0 0 1 24 53 Z" fill="var(--glow)" opacity=".75"/>`,
 dragon:`<path d="M18 70 C26 40 46 26 72 24 C64 32 64 38 70 42 C58 44 50 52 48 66 C40 58 30 60 18 70 Z" fill="none" stroke="currentColor" stroke-width="3" stroke-linejoin="round"/><circle cx="64" cy="31" r="2.5" fill="var(--glow)"/><path d="M24 80 C40 70 60 72 82 82" fill="none" stroke="var(--glow)" stroke-width="3" stroke-linecap="round"/><path d="M72 24 L84 16 M70 42 L84 44" stroke="currentColor" stroke-width="2.5"/>`,
 hat:`<ellipse cx="50" cy="62" rx="38" ry="10" fill="none" stroke="currentColor" stroke-width="3"/><path d="M30 60 C30 36 36 26 50 26 C64 26 70 36 70 60" fill="none" stroke="currentColor" stroke-width="3"/><path d="M31 52 H69" stroke="var(--glow)" stroke-width="4"/><circle cx="50" cy="80" r="4" fill="var(--glow)"/>`,
 clock:`<circle cx="50" cy="50" r="34" fill="none" stroke="currentColor" stroke-width="3"/><circle cx="50" cy="50" r="22" fill="var(--glow)" opacity=".2"/><path d="M50 50 V28 M50 50 L66 58" stroke="var(--glow)" stroke-width="4" stroke-linecap="round"/><path d="M14 30 C6 46 8 62 18 74 M86 70 C94 54 92 38 82 26" fill="none" stroke="currentColor" stroke-width="2" opacity=".6"/>`,
 wings:`<path d="M50 38 C38 22 20 18 8 20 C16 30 18 42 30 50 C20 52 16 58 14 66 C28 64 40 60 50 52 C60 60 72 64 86 66 C84 58 80 52 70 50 C82 42 84 30 92 20 C80 18 62 22 50 38 Z" fill="none" stroke="currentColor" stroke-width="3" stroke-linejoin="round"/><path d="M46 56 h8 v28 h-8z M38 64 h24 v8 H38z" fill="var(--glow)"/>`,
 spider:`<circle cx="50" cy="52" r="12" fill="none" stroke="currentColor" stroke-width="3"/><circle cx="50" cy="32" r="7" fill="none" stroke="currentColor" stroke-width="3"/><g stroke="currentColor" stroke-width="2.5" fill="none"><path d="M40 46 L20 30 L12 40 M40 54 L16 56 L10 68 M42 60 L26 76 L24 88 M60 46 L80 30 L88 40 M60 54 L84 56 L90 68 M58 60 L74 76 L76 88"/></g><circle cx="47" cy="31" r="1.6" fill="var(--glow)"/><circle cx="53" cy="31" r="1.6" fill="var(--glow)"/>`,
 scope:`<circle cx="50" cy="50" r="34" fill="none" stroke="currentColor" stroke-width="3"/><circle cx="50" cy="50" r="18" fill="none" stroke="currentColor" stroke-width="1.5" opacity=".6"/><path d="M50 8 V30 M50 70 V92 M8 50 H30 M70 50 H92" stroke="currentColor" stroke-width="3"/><circle cx="50" cy="50" r="4" fill="var(--glow)"/>`,
 canal:`<path d="M8 72 C22 64 36 80 50 72 C64 64 78 80 92 72" fill="none" stroke="var(--glow)" stroke-width="3"/><path d="M8 84 C22 76 36 92 50 84 C64 76 78 92 92 84" fill="none" stroke="var(--glow)" stroke-width="2" opacity=".6"/><path d="M20 62 V36 C20 26 30 22 36 22 C42 22 52 26 52 36 V62 M60 62 V30 h22 v32" fill="none" stroke="currentColor" stroke-width="3"/><path d="M20 62 H82" stroke="currentColor" stroke-width="3"/>`,
 megaphone:`<path d="M18 42 H34 L74 22 V78 L34 58 H18 Z" fill="none" stroke="currentColor" stroke-width="3" stroke-linejoin="round"/><path d="M30 58 L36 80 H46 L42 60" fill="none" stroke="currentColor" stroke-width="3"/><path d="M82 36 C88 44 88 56 82 64" fill="none" stroke="var(--glow)" stroke-width="3" stroke-linecap="round"/>`,
 blast:`<polygon points="50,6 58,34 86,22 68,46 94,58 64,62 74,90 50,70 26,90 36,62 6,58 32,46 14,22 42,34" fill="var(--glow)" fill-opacity=".25" stroke="currentColor" stroke-width="3" stroke-linejoin="round"/><circle cx="50" cy="52" r="10" fill="var(--glow)"/>`,
 gavel:`<rect x="28" y="20" width="36" height="18" fill="none" stroke="currentColor" stroke-width="3" transform="rotate(40 46 29)"/><path d="M46 36 L22 68" stroke="currentColor" stroke-width="5" stroke-linecap="round"/><path d="M48 84 H88 M54 76 H82" stroke="var(--glow)" stroke-width="3"/>`,
 mask:`<path d="M50 12 C28 12 18 28 18 46 C18 66 32 82 50 90 C68 82 82 66 82 46 C82 28 72 12 50 12 Z" fill="none" stroke="currentColor" stroke-width="3"/><path d="M28 44 L44 50 L36 58 Z M72 44 L56 50 L64 58 Z" fill="var(--glow)"/><path d="M50 62 V78 M44 70 H56" stroke="currentColor" stroke-width="2.5"/>`,
 visor:`<path d="M14 50 C14 30 30 18 50 18 C70 18 86 30 86 50 V66 H14 Z" fill="none" stroke="currentColor" stroke-width="3"/><path d="M22 44 H78 L72 54 H28 Z" fill="var(--glow)" opacity=".85"/><path d="M50 66 V82 M36 82 H64" stroke="currentColor" stroke-width="3"/>`,
 fist:`<rect x="24" y="34" width="52" height="40" rx="6" fill="none" stroke="currentColor" stroke-width="3"/><path d="M24 46 H76 M38 34 V46 M50 34 V46 M62 34 V46" stroke="currentColor" stroke-width="2.5"/><path d="M32 74 V88 H68 V74" fill="none" stroke="currentColor" stroke-width="3"/><path d="M10 54 H20 M8 64 H20 M80 54 H90" stroke="var(--glow)" stroke-width="3"/>`,
 gorilla:`<circle cx="50" cy="46" r="26" fill="none" stroke="currentColor" stroke-width="3"/><rect x="32" y="38" width="36" height="12" rx="6" fill="none" stroke="var(--glow)" stroke-width="3"/><path d="M40 62 C46 66 54 66 60 62" fill="none" stroke="currentColor" stroke-width="3"/><path d="M18 88 C24 74 36 70 50 70 C64 70 76 74 82 88" fill="none" stroke="currentColor" stroke-width="3"/>`,
 moon:`<path d="M62 14 A36 36 0 1 0 86 64 A28 28 0 1 1 62 14 Z" fill="none" stroke="currentColor" stroke-width="3"/><circle cx="40" cy="58" r="5" fill="none" stroke="currentColor" stroke-width="2"/><circle cx="30" cy="40" r="3" fill="none" stroke="currentColor" stroke-width="2"/><path d="M72 30 L84 12 M80 28 L90 22" stroke="var(--glow)" stroke-width="3"/><circle cx="86" cy="12" r="3" fill="var(--glow)"/>`,
 mech:`<path d="M24 30 H76 L84 58 L66 74 H34 L16 58 Z" fill="none" stroke="currentColor" stroke-width="3" stroke-linejoin="round"/><circle cx="50" cy="50" r="10" fill="var(--glow)" opacity=".8"/><path d="M34 74 L28 90 M66 74 L72 90 M24 30 L16 18 M76 30 L84 18" stroke="currentColor" stroke-width="3"/>`,
 skull:`<path d="M50 12 C30 12 18 26 18 44 C18 56 24 62 30 66 V80 H70 V66 C76 62 82 56 82 44 C82 26 70 12 50 12 Z" fill="none" stroke="currentColor" stroke-width="3"/><circle cx="37" cy="44" r="7" fill="var(--glow)"/><circle cx="63" cy="44" r="7" fill="var(--glow)"/><path d="M42 80 V70 M50 80 V70 M58 80 V70" stroke="currentColor" stroke-width="2.5"/>`,
 eiffel:`<path d="M50 8 L56 36 L62 60 L76 90 M50 8 L44 36 L38 60 L24 90 M42 36 H58 M36 60 H64" fill="none" stroke="currentColor" stroke-width="3" stroke-linejoin="round"/><path d="M38 90 C40 76 60 76 62 90" fill="none" stroke="currentColor" stroke-width="3"/><circle cx="50" cy="8" r="3" fill="var(--glow)"/><path d="M8 30 L22 34 M92 30 L78 34 M10 50 L22 50 M90 50 L78 50" stroke="var(--glow)" stroke-width="2.5"/>`,
 globe:`<circle cx="50" cy="50" r="36" fill="none" stroke="currentColor" stroke-width="3"/><ellipse cx="50" cy="50" rx="16" ry="36" fill="none" stroke="currentColor" stroke-width="2"/><path d="M16 38 H84 M16 62 H84" stroke="currentColor" stroke-width="2"/><circle cx="34" cy="38" r="4" fill="var(--glow)"/><circle cx="66" cy="62" r="4" fill="var(--glow)"/><circle cx="58" cy="30" r="4" fill="var(--glow)"/>`,
 fox:`<path d="M20 20 L40 38 H60 L80 20 L76 54 L50 84 L24 54 Z" fill="none" stroke="currentColor" stroke-width="3" stroke-linejoin="round"/><path d="M36 54 L44 58 M64 54 L56 58" stroke="var(--glow)" stroke-width="4" stroke-linecap="round"/><path d="M50 70 L46 66 H54 Z" fill="var(--glow)"/>`,
 crown:`<path d="M14 72 L20 30 L38 50 L50 22 L62 50 L80 30 L86 72 Z" fill="none" stroke="currentColor" stroke-width="3" stroke-linejoin="round"/><path d="M14 82 H86" stroke="currentColor" stroke-width="3"/><circle cx="50" cy="60" r="6" fill="var(--glow)"/><circle cx="30" cy="62" r="3.5" fill="var(--glow)"/><circle cx="70" cy="62" r="3.5" fill="var(--glow)"/>`,
 talon:`<path d="M50 10 C60 30 76 38 88 40 C74 46 64 60 60 86 C56 70 52 62 50 58 C48 62 44 70 40 86 C36 60 26 46 12 40 C24 38 40 30 50 10 Z" fill="var(--glow)" fill-opacity=".25" stroke="currentColor" stroke-width="3" stroke-linejoin="round"/><circle cx="50" cy="40" r="5" fill="var(--glow)"/>`,
 mountain:`<path d="M6 84 L36 32 L50 52 L64 26 L94 84 Z" fill="none" stroke="currentColor" stroke-width="3" stroke-linejoin="round"/><path d="M56 40 L64 26 L72 40 L66 36 L62 42 Z" fill="var(--glow)"/><path d="M64 26 V8 L78 13 L64 18" fill="var(--glow)" stroke="var(--glow)" stroke-width="2"/>`,
 tiger:`<circle cx="50" cy="52" r="30" fill="none" stroke="currentColor" stroke-width="3"/><path d="M26 32 L20 16 L36 24 M74 32 L80 16 L64 24" fill="none" stroke="currentColor" stroke-width="3"/><path d="M50 26 V38 M38 30 L42 40 M62 30 L58 40" stroke="var(--glow)" stroke-width="3"/><path d="M36 54 L44 52 M64 54 L56 52" stroke="var(--glow)" stroke-width="4" stroke-linecap="round"/><path d="M44 66 L50 72 L56 66" fill="none" stroke="currentColor" stroke-width="3"/>`,
 fang:`<path d="M20 22 C34 30 66 30 80 22 L76 44 C66 40 34 40 24 44 Z" fill="none" stroke="currentColor" stroke-width="3" stroke-linejoin="round"/><path d="M34 42 L40 76 L46 42 M54 42 L60 76 L66 42" fill="var(--glow)" stroke="var(--glow)" stroke-width="2" stroke-linejoin="round"/><circle cx="40" cy="84" r="3" fill="var(--glow)"/>`,
 ice:`<path d="M50 10 V90 M15 30 L85 70 M85 30 L15 70" stroke="currentColor" stroke-width="3"/><path d="M42 18 L50 26 L58 18 M42 82 L50 74 L58 82 M20 40 L30 36 L26 26 M80 60 L70 64 L74 74 M80 40 L70 36 L74 26 M20 60 L30 64 L26 74" fill="none" stroke="var(--glow)" stroke-width="2.5"/>`,
 trophy:`<path d="M30 14 H70 V36 C70 52 60 60 50 60 C40 60 30 52 30 36 Z" fill="var(--glow)" fill-opacity=".25" stroke="currentColor" stroke-width="3"/><path d="M30 22 H16 C16 36 22 42 30 42 M70 22 H84 C84 36 78 42 70 42" fill="none" stroke="currentColor" stroke-width="3"/><path d="M50 60 V74 M34 86 H66 L62 74 H38 Z" fill="none" stroke="currentColor" stroke-width="3" stroke-linejoin="round"/><polygon points="50,24 53,32 61,32 55,37 57,45 50,40 43,45 45,37 39,32 47,32" fill="var(--glow)"/>`,
 cup2:`<path d="M24 16 H76 L70 52 C68 62 60 68 50 68 C40 68 32 62 30 52 Z" fill="none" stroke="currentColor" stroke-width="3"/><circle cx="50" cy="40" r="12" fill="none" stroke="var(--glow)" stroke-width="3"/><path d="M38 40 H62 M50 28 C44 34 44 46 50 52 C56 46 56 34 50 28" fill="none" stroke="var(--glow)" stroke-width="2"/><path d="M50 68 V78 M32 88 H68 V78 H32 Z" fill="none" stroke="currentColor" stroke-width="3"/>`,
 arena:`<ellipse cx="50" cy="66" rx="40" ry="14" fill="none" stroke="currentColor" stroke-width="3"/><path d="M10 66 V44 C10 36 28 30 50 30 C72 30 90 36 90 44 V66" fill="none" stroke="currentColor" stroke-width="3"/><path d="M30 14 L36 30 M50 8 V30 M70 14 L64 30" stroke="var(--glow)" stroke-width="3" stroke-linecap="round"/><rect x="40" y="52" width="20" height="10" fill="var(--glow)" opacity=".8"/>`,
 broadcast:`<circle cx="50" cy="44" r="7" fill="var(--glow)"/><path d="M34 28 C26 36 26 52 34 60 M66 28 C74 36 74 52 66 60 M24 18 C10 32 10 56 24 70 M76 18 C90 32 90 56 76 70" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round"/><path d="M50 52 L38 90 M50 52 L62 90 M42 78 H58" stroke="currentColor" stroke-width="3"/>`,
 city:`<path d="M8 88 H92" stroke="currentColor" stroke-width="3"/><path d="M14 88 V50 h14 v38 M32 88 V30 h16 v58 M52 88 V44 h14 v44 M70 88 V22 h16 v66" fill="none" stroke="currentColor" stroke-width="3"/><g fill="var(--glow)"><rect x="37" y="38" width="6" height="6"/><rect x="75" y="30" width="6" height="6"/><rect x="75" y="46" width="6" height="6"/><rect x="18" y="58" width="6" height="6"/><rect x="56" y="54" width="6" height="6"/></g>`,
 hex:`<polygon points="50,8 86,29 86,71 50,92 14,71 14,29" fill="none" stroke="currentColor" stroke-width="3"/><polygon points="50,24 72,37 72,63 50,76 28,63 28,37" fill="var(--glow)" opacity=".3"/><path d="M40 50 L48 58 L62 42" fill="none" stroke="var(--glow)" stroke-width="4" stroke-linecap="round" stroke-linejoin="round"/>`,
 fall:`<path d="M30 14 H70 V36 C70 52 60 60 50 60 C40 60 30 52 30 36 Z" fill="none" stroke="currentColor" stroke-width="3" stroke-dasharray="6 5"/><path d="M50 60 V74 M34 86 H66" stroke="currentColor" stroke-width="3" stroke-dasharray="6 5"/><path d="M20 20 L80 80" stroke="var(--glow)" stroke-width="4" stroke-linecap="round"/>`,
 rocket:`<path d="M50 8 C64 20 68 40 64 66 H36 C32 40 36 20 50 8 Z" fill="none" stroke="currentColor" stroke-width="3"/><circle cx="50" cy="36" r="7" fill="var(--glow)"/><path d="M36 54 L22 70 L36 70 M64 54 L78 70 L64 70" fill="none" stroke="currentColor" stroke-width="3" stroke-linejoin="round"/><path d="M42 72 L50 92 L58 72" fill="var(--glow)" opacity=".8"/>`,
 seal:`<circle cx="50" cy="50" r="36" fill="none" stroke="currentColor" stroke-width="3"/><circle cx="50" cy="50" r="28" fill="none" stroke="currentColor" stroke-width="1.5" stroke-dasharray="3 4"/><path d="M36 58 L50 30 L64 58 M40 50 H60" fill="none" stroke="var(--glow)" stroke-width="4" stroke-linejoin="round"/>`
};
/* Overwatch Chronicle — app logic. Data lives in /data/*.json and is refreshed weekly by the bot. */
function art(key,glow){return `<svg viewBox="0 0 100 100" style="color:#dfe8fb;--glow:${hex(glow)}" aria-hidden="true">${ICON[key]||ICON.hex}</svg>`}
function monogram(txt,c){const size=String(txt??"").length>2?16:20;txt=esc(txt);c=hex(c);return `<svg viewBox="0 0 48 48" aria-hidden="true"><polygon points="24,2 44,13 44,35 24,46 4,35 4,13" fill="${c}" fill-opacity=".16" stroke="${c}" stroke-width="2"/><text x="24" y="31" text-anchor="middle" font-family="Teko,Barlow Condensed,sans-serif" font-size="${size}" font-weight="600" fill="#eaf1ff">${txt}</text></svg>`}
function badge(m,c,x){const pic=/^[A-Za-z0-9_]{1,15}$/.test(x||"")?`<img class="av" src="https://unavatar.io/x/${x}?fallback=false" alt="" loading="lazy" referrerpolicy="no-referrer">`:"";return `<span class="badge">${monogram(m,c)}${pic}</span>`}
const $=s=>document.querySelector(s);
const esc=s=>String(s??"").replace(/[&<>"]/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;"}[c]));
const hex=c=>/^#[0-9a-fA-F]{3,8}$/.test(c)?c:"#9aabc9";
const link=u=>/^https?:\/\//i.test(u)?esc(u):"#";
const fmt=v=>{const n=Number(v);return n>=1e6?(n/1e6).toFixed(n>=1e7?0:1).replace(/\.0$/,"")+"M":n>=1e3?Math.round(n/1e3)+"K":String(n)};
const TALK=`<svg viewBox="0 0 16 16" aria-hidden="true"><path d="M2 3h12v8H7l-3 3v-3H2z" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linejoin="round"/><circle cx="5.5" cy="7" r="1" fill="currentColor"/><circle cx="8" cy="7" r="1" fill="currentColor"/><circle cx="10.5" cy="7" r="1" fill="currentColor"/></svg>`;
const MOODS={hype:"Hype",celebration:"Celebration",mixed:"Mixed",backlash:"Backlash"};
const PLAY=`<svg viewBox="0 0 10 10"><path d="M2 1 L9 5 L2 9 Z" fill="currentColor"/></svg>`;

const DATA={};
const state={view:"lore",era:"all",q:"",tlOnly:false,region:"All"};
const TABS=[["lore","Lore",""],["esports","Esports","esp"],["t2","Tier 2","t2"],["teams","Teams","teams"],["numbers","Numbers","nums"],["people","Timeless","ppl"],["triumvirate","Triumvirate","tri"]];

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
  document.body.className={esports:"esports",t2:"t2",teams:"teamsv",numbers:"numsv",people:"pplv",triumvirate:"triv"}[v]||"";
  const D=DATA[v==="t2"?"t2":v]||{};
  const H={
   lore:{k:"Mission archive · Story",h:`The world could always use <em>more heroes</em>`,p:"Every major turn of the Overwatch story in order, from the first omniums to the Reign of Talon. Events before 2026 are grouped by era, since Blizzard rarely gives exact dates.",s:[[DATA.lore.items.length,"Events"],[DATA.lore.eras.length,"Eras"],[10,"Heroes in 2026"]]},
   esports:{k:"Mission archive · Competition",h:`Ten years of <em>pro Overwatch</em>`,p:"APEX, the Overwatch League, the World Cup and the Champions Series. Tap Watch to play a match here, or Community to see how people reacted at the time.",s:[[DATA.esports.items.length,"Events"],[DATA.esports.items.filter(i=>i.vods).length,"With VODs"],["401K","Peak · OWWC 2026"]]},
   t2:{k:"Mission archive · Path to Pro",h:`Where the pros <em>come from</em>`,p:"Tier 2 Overwatch, from Open Division and Contenders to FACEIT League and promotion fights. Timeless events are highlighted in violet.",s:[[DATA.t2.items.length,"Events"],[DATA.t2.items.filter(i=>i.tl).length,"Timeless moments"],["S10","FACEIT League now"]]},
   teams:{k:"Mission archive · Rosters",h:`Every team, <em>every era</em>`,p:"OWCS teams, league franchises, tier 2 orgs and national teams, with links to Liquipedia and socials. Every org that competed for a year or more. Tap a tier 2 team to see its alumni and where they play now.",s:[[DATA.teams.length,"Teams"],[DATA.teams.filter(t=>t.tier==="T1").length,"Top flight now"],[DATA.teams.filter(t=>t.tier==="T2").length,"Tier 2"]]},
   people:{k:"Mission archive · The roster",h:`Everyone who was <em>Timeless</em>`,p:"Every player, coach, manager and creator who wore the name, across Timeless, Timeless Ethereal, Timeless Obsidian and the 2026 return. Tap anyone for their time with the org, what they won there and where to find them now.",s:[[roster().length,"People"],[roster().filter(p=>!p.staff).length,"Players"],[roster().filter(p=>p.staff).length,"Staff"],[roster().filter(p=>p.tier==="T1").length,"In OWCS now"]]},
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
    h+=`<section class="case"><h2>Trophy case</h2><div class="case-grid">${DATA.esports.cups.map(c=>`<div class="cup"><h3>${trophy}${esc(c.h)}</h3><ol>${c.list.map(([y,w])=>`<li><b>${esc(y)}</b><span>${w}</span></li>`).join("")}</ol></div>`).join("")}</div></section>`;
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
  if(v==="people") h+=peopleView();
  if(v==="triumvirate") h+=triView();
  $("#case").innerHTML=h;
}
function feed(v,title){
  return `<section class="case"><h2>${title}</h2><div class="feed">${DATA.social.filter(s=>s.v===v).map(s=>{
    const tag=s.url?"a":"article";const attrs=s.url?` href="${link(s.url)}" target="_blank" rel="noopener"`:"";
    return `<${tag} class="post${s.hot?" hot":""}"${attrs}><header>${monogram(s.m,s.c)}<div><b>${esc(s.who)}</b><span>${esc(s.h)} · ${esc(s.d)}</span></div><span class="k">${esc(s.k)}</span></header><p>${esc(s.x)}</p>${s.n?`<div class="n">${esc(s.n)}</div>`:""}${s.url?`<span class="open">${s.exact?"Open post ↗":"Open account ↗"}</span>`:""}</${tag}>`}).join("")}</div></section>`;
}

/* ---------- teams ---------- */
function teamsView(){
  const TIERS=[["All","All"],["T1","Top flight now"],["T2","Tier 2"],["National","National"],["Legacy","League & legacy"]];
  const rk=r=>{const k=[];if(/North America|NA/.test(r))k.push("North America");if(/EMEA|Europe/.test(r))k.push("EMEA");if(/Korea/.test(r))k.push("Korea");if(/Japan/.test(r))k.push("Japan");if(/China/.test(r))k.push("China");if(/Pacific/.test(r))k.push("Pacific");return k};
  const regions=["All","North America","EMEA","Korea","Japan","China","Pacific"];
  const list=DATA.teams.filter(t=>(state.region==="All"||rk(t.region).includes(state.region))&&(!state.tierF||state.tierF==="All"||t.tier===state.tierF));
  return `<section class="case"><div class="tfilter">${TIERS.map(([k,l])=>`<button class="chip" data-tierf="${k}" aria-pressed="${(state.tierF||"All")===k}" style="--c:#ffd36b"><i></i>${l}</button>`).join("")}</div><div class="tfilter">${regions.map(r=>`<button class="chip" data-region="${esc(r)}" aria-pressed="${state.region===r}"><i></i>${esc(r)}</button>`).join("")}</div>
  <div class="tgrid">${list.map(t=>{const n=teamAlumni(t).length;return `<article class="tcard${t.featured?" feat":""}" style="--tc:${hex(t.c)}">
   <header role="button" tabindex="0" data-spot="${esc(t.id)}" aria-label="Open ${esc(t.name)} spotlight">${badge(t.m,t.c,t.x)}<div><h3>${esc(t.name)}</h3><div class="meta">${esc(t.region)} · <span class="status ${t.tier==="T1"?"active":""}">${esc(t.status)}</span></div></div><span class="chev" aria-hidden="true">›</span></header>
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
  let h=`<div class="sp-hero" style="--tc:${hex(t.c)}">${badge(t.m,t.c,t.x)}<div><div class="kicker" style="color:${hex(t.c)}">${esc(tierName)} · ${esc(t.region)}</div><h2 id="sTitle">${esc(t.name)}</h2></div></div>
  <section class="sp-sec"><h4>Overview</h4><p class="sp-ov">${esc(overview)}</p>
   <div class="stats">${stats.map(([b,s])=>`<div class="stat"><b>${esc(b)}</b><span>${esc(s)}</span></div>`).join("")}</div>
   ${t.titles&&t.titles.length?`<div class="tags" style="margin-top:10px">${t.titles.map(x=>`<span class="tag w">${esc(x)}</span>`).join("")}</div>`:""}
   <div class="actions"><a class="btn" target="_blank" rel="noopener" href="https://liquipedia.net/overwatch/index.php?search=${encodeURIComponent(t.name)}">Liquipedia ↗</a>${t.x?`<a class="btn" target="_blank" rel="noopener" href="https://x.com/${esc(t.x)}">@${esc(t.x)} ↗</a>`:""}</div></section>`;
  if(ev.length)h+=`<section class="sp-sec"><h4>On the timeline</h4><ul class="sp-ev">${ev.map(({it,v,won,era})=>`<li style="--ec:${it.tl?"#c9a7ff":hex(era.c)}"><span class="when">${esc(it.when)}</span><b>${esc(it.t)}</b>${won?`<span class="tag w">Champion</span>`:""}${it.score?`<div class="score"><span>${esc(it.score[0])}</span><span class="s">${esc(it.score[1])}</span><span class="lose">${esc(it.score[2])}</span></div>`:""}<p>${esc(it.d)}</p><div class="actions">${it.vods?`<button class="btn play" data-vod="${esc(it.id)}">${PLAY}Watch</button>`:""}${it.community?`<button class="btn talk mood-${esc(it.community.mood)}" data-talk="${esc(it.id)}">${TALK}Community</button>`:""}<button class="btn" data-goto="${esc(v)}|${esc(it.id)}">Open in timeline</button></div></li>`).join("")}</ul></section>`;
  if(alum.length)h+=`<section class="sp-sec"><h4>Alumni · where they are now</h4><div class="astats"><span><b>${alum.length}</b> alumni</span><span><b>${t1}</b> on OWCS rosters now</span></div><ul class="alist">${alum.filter(p=>p.hi).map(p=>`<li class="${p.star?"star":""}"><div><b>${esc(p.name)}</b> <span class="status ${p.tier==="T1"?"active":""}">${esc(p.tier)}</span><span class="arole">${esc(p.role)}</span></div><div class="anow">Now: ${esc(p.now)}</div><div class="ahi">${esc(p.hi)}</div>${p.teams[0]===t.id&&p.era?`<div class="aera">With the team: ${esc(p.era)}</div>`:""}<a href="${link(p.url)}" target="_blank" rel="noopener">Source ↗</a></li>`).join("")}</ul>${t.id==="timeless"?`<div class="actions"><button class="btn play" data-view="people">Everyone who was Timeless · ${roster().length}</button></div>`:""}</section>`;
  else if(t.tier==="T2")h+=`<section class="sp-sec"><h4>Alumni</h4><p class="aempty">No alumni tracked yet. The weekly bot adds them as it finds them.</p></section>`;
  if(posts.length)h+=`<section class="sp-sec"><h4>On social</h4><div class="feed">${posts.map(s=>`<a class="post${s.hot?" hot":""}" ${s.url?`href="${link(s.url)}" target="_blank" rel="noopener"`:""}><header>${monogram(s.m,s.c)}<div><b>${esc(s.who)}</b><span>${esc(s.h)} · ${esc(s.d)}</span></div><span class="k">${esc(s.k)}</span></header><p>${esc(s.x)}</p>${s.n?`<div class="n">${esc(s.n)}</div>`:""}</a>`).join("")}</div></section>`;
  if(!ev.length&&!alum.length&&!posts.length)h+=`<section class="sp-sec"><p class="aempty">More on this team is coming as the weekly bot researches it.</p></section>`;
  $("#sBody").innerHTML=h;const m=$("#smodal");m.hidden=false;m.querySelector(".modal-box").scrollTop=0;$("#sClose").focus();
  document.body.style.overflow="hidden";
}
function closeSpot(){$("#smodal").hidden=true;document.body.style.overflow=""}

/* ---------- Timeless people ---------- */
const PURPLE="#c9a7ff";
function roster(){return ((DATA.alumni&&DATA.alumni.people)||[]).filter(p=>p.stints)}
function initials(n){return String(n).replace(/[^A-Za-z0-9]/g,"").slice(0,2).toUpperCase()||"TL"}
function month(d){const m=/^(\d{4})-(\d\d)/.exec(d||"");return m?["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"][m[2]-1]+" "+m[1]:String(d||"")}
function span(p){const a=p.stints.map(s=>s.from.slice(0,4)).sort()[0];const open=p.stints.some(s=>!s.to);const b=open?"now":p.stints.map(s=>s.to.slice(0,4)).sort().pop();return a===b?a:`${a}–${b}`}
function titles(p){return (p.results||[]).filter(r=>r.place==="1st").length}
function peopleView(){
  const FILTERS=[["All","Everyone"],["Players","Players"],["Staff","Staff"],["Timeless","Timeless"],["Timeless Ethereal","Ethereal"],["Timeless Obsidian","Obsidian"],["Timeless x Missing","2026 return"]];
  const f=state.pf||"All";
  const list=roster().filter(p=>f==="All"||(f==="Players"&&!p.staff)||(f==="Staff"&&p.staff)||p.stints.some(s=>s.team===f));
  return `<section class="case"><div class="tfilter">${FILTERS.map(([k,l])=>`<button class="chip" data-pf="${esc(k)}" aria-pressed="${f===k}" style="--c:${PURPLE}"><i></i>${esc(l)}</button>`).join("")}</div>
  <div class="search psearch"><input id="pq" type="search" placeholder="Find someone by name, role or team" aria-label="Find a person"></div>
  <div class="pgrid">${list.map(p=>{const won=titles(p);return `<article class="pcard${p.star?" star":""}" role="button" tabindex="0" data-person="${esc(p.id)}" data-find="${esc([p.name,p.role,p.now,...p.stints.map(s=>s.team)].join(" ").toLowerCase())}" aria-label="Open ${esc(p.name)}">
   ${badge(initials(p.name),PURPLE,p.x)}<div class="pmeta"><h3>${esc(p.name)}</h3><div class="meta">${esc(p.role)} · ${esc(span(p))}</div>${p.now?`<div class="pnow">${esc(p.now)}</div>`:""}</div>${won?`<span class="pwins" title="Titles won with the org">${won}×<small>title${won>1?"s":""}</small></span>`:""}</article>`}).join("")}</div>
  <p class="cnote">Rosters, dates and handles: <a href="${link(DATA.alumni.roster.url)}" target="_blank" rel="noopener">${esc(DATA.alumni.roster.label)}</a>, read ${esc(DATA.alumni.roster.read)}. Profile pictures load from each person's own X account. If this is you and something is wrong or you want it removed, tell Timeless and it comes down.</p></section>`;
}
function openPerson(id){
  const p=roster().find(x=>x.id===id);if(!p)return;
  const won=titles(p);
  const stats=[[span(p),"With the org"],[p.stints.length,p.stints.length>1?"Stints":"Stint"]];
  if(won)stats.push([won,won>1?"Titles":"Title"]);if(p.status)stats.push([p.status,"Status"]);
  const SOC=[["x","https://x.com/","X · @"],["twitch","https://www.twitch.tv/","Twitch · "],["youtube","https://www.youtube.com/","YouTube · "],["instagram","https://www.instagram.com/","Instagram · "],["tiktok","https://www.tiktok.com/@","TikTok · "]];
  const socials=SOC.filter(([k])=>p[k]).map(([k,u,l])=>`<a class="btn" target="_blank" rel="noopener" href="${u}${encodeURIComponent(p[k]).replace(/%40/g,"@")}">${esc(l+p[k])} ↗</a>`).join("")+(p.wiki?`<a class="btn" target="_blank" rel="noopener" href="${link(p.wiki)}">Liquipedia ↗</a>`:"");
  const founder=["chase","th3mfg","doc"].includes(p.id);
  let h=`<div class="sp-hero pp-hero" style="--tc:${PURPLE}">${badge(initials(p.name),PURPLE,p.x)}<div><div class="kicker" style="color:${PURPLE}">${esc([p.role,p.country].filter(Boolean).join(" · "))}</div><h2 id="sTitle">${esc(p.name)}</h2>${p.now?`<div class="pnow">Now: ${esc(p.now)}</div>`:""}</div></div>
  <section class="sp-sec">${p.hi?`<p class="sp-ov">${esc(p.hi)} <a href="${link(p.url)}" target="_blank" rel="noopener">Source ↗</a></p>`:""}
   <div class="stats">${stats.map(([b,s])=>`<div class="stat"><b>${esc(b)}</b><span>${esc(s)}</span></div>`).join("")}</div>
   ${socials||founder?`<div class="actions">${socials}${founder?`<button class="btn play" data-view="triumvirate">Their story · Triumvirate</button>`:""}</div>`:""}</section>
  <section class="sp-sec"><h4>Time at Timeless</h4><ul class="sp-ev">${p.stints.slice().reverse().map(s=>`<li style="--ec:${PURPLE}"><span class="when">${esc(month(s.from))} – ${s.to?esc(month(s.to)):"now"}</span><b>${esc(s.team)}</b>${s.role?`<span class="tag">${esc(s.role)}</span>`:""}${s.next?`<p>Next: ${esc(s.next)}</p>`:""}</li>`).join("")}</ul></section>`;
  if((p.results||[]).length)h+=`<section class="sp-sec"><h4>${p.staff?"While on staff":"On the roster for"}</h4><ul class="presults">${p.results.map(r=>`<li class="${r.place==="1st"?"won":""}"><b>${esc(r.place)}</b><span>${esc(r.event)}</span><span class="when">${esc(month(r.date))}</span></li>`).join("")}</ul></section>`;
  if((p.heroes||[]).length)h+=`<section class="sp-sec"><h4>Signature heroes</h4><div class="tags">${p.heroes.map(x=>`<span class="tag">${esc(x)}</span>`).join("")}</div></section>`;
  $("#sBody").innerHTML=h;const m=$("#smodal");m.hidden=false;m.querySelector(".modal-box").scrollTop=0;$("#sClose").focus();
  document.body.style.overflow="hidden";
}

function triView(){
  const T=DATA.triumvirate;
  return `<section class="case"><div class="tri">${T.people.map(p=>`<article class="tri-card" style="--tc:${hex(p.c)}">
   <header>${monogram(p.m,p.c)}<div><div class="kicker" style="color:${hex(p.c)}">${esc(p.role)}</div><h3>${esc(p.name)}</h3></div></header>
   <p class="tri-sum">${esc(p.summary)}</p>
   <ol class="tri-ch">${p.chapters.map(c=>`<li><span class="when">${esc(c.when)}</span><b>${esc(c.t)}</b><p>${esc(c.d)}</p></li>`).join("")}</ol>
   <div class="actions">${(p.links||[]).map(l=>`<a class="btn" href="${link(l.url)}" target="_blank" rel="noopener">${esc(l.label)} ↗</a>`).join("")}<button class="btn" data-spot="timeless">Timeless spotlight</button></div></article>`).join("")}</div>
   <p class="cnote">Sources: ${T.sources.map(s=>`<a href="${link(s.url)}" target="_blank" rel="noopener">${esc(s.label)}</a>`).join(" · ")}. Alex's chapters are his own account.</p></section>`;
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
   <div class="chart"><h3>Peak viewers · biggest events</h3>${barChart(M.viewership.map(r=>({k:r.event,v:r.peak,approx:r.approx})))}<div class="src">Sources: ${[...new Set(M.viewership.map(r=>r.src))].map(esc).join(", ")}. Peak concurrent viewers across official streams.</div></div>
   <div class="chart"><h3>Steam average concurrent players · monthly</h3>${lineChart(M.steamMonthly.map(r=>({x:r.m.slice(2).replace("-","/"),y:r.avg})))}<div class="src">Measured, Steam only (most PC players use Battle.net, and consoles aren't counted). Steam all-time peak: ${fmt(M.steamPeak.value)} on ${M.steamPeak.date}.</div></div>
   ${M.steamSamples.length>1?`<div class="chart"><h3>Weekly Steam snapshots (bot)</h3>${lineChart(M.steamSamples.map(r=>({x:r.date.slice(5),y:r.ccu})),{color:"#5be3a6"})}<div class="src">Steam Web API, sampled each time the bot runs.</div></div>`:""}
   <div class="chart"><h3>All-platform playerbase · estimate</h3>
    <div class="est"><small>Concurrent players, all platforms</small><b>${fmt(AP.concurrentLow)}–${fmt(AP.concurrentHigh)}</b><small>Third-party modelling, not Blizzard data.</small></div>
    <div class="est" style="margin-top:8px"><small>Monthly active players</small><b>${fmt(AP.mauLow)}–${fmt(AP.mauHigh)}</b><small>Third-party estimate band.</small></div>
    ${estNow?`<div style="margin-top:8px">${estNow}</div>`:""}
    <div class="src">${esc(M.note)} <a href="${link(AP.url)}" target="_blank" rel="noopener">Source ↗</a></div></div>
  </div></section>`;
}

/* ---------- timeline ---------- */
function ribbon(){
  const D=DATA[state.view];
  $("#ribbon").innerHTML=`<button class="chip" aria-pressed="${state.era==="all"}" data-era="all" style="--c:#eaf1ff"><i></i>All eras</button>`+D.eras.map(e=>`<button class="chip" aria-pressed="${state.era===e.id}" data-era="${esc(e.id)}" style="--c:${hex(e.c)}"><i></i>${esc(e.n)} · ${esc(e.name)}</button>`).join("");
}
function card(it,idx,side,era){
  const tags=(it.tags||[]).map(t=>`<span class="tag">${esc(t)}</span>`).join("")+(it.win?`<span class="tag w">Champion · ${esc(it.win)}</span>`:"")+(it.src?`<span class="tag src">${esc(it.src)}</span>`:"")+(it.tl?`<span class="tag tlm">Timeless</span>`:"")+(it.bot?`<span class="tag src">Added by bot</span>`:"");
  const sc=it.score?`<div class="score"><span>${esc(it.score[0])}</span><span class="s">${esc(it.score[1])}</span><span class="lose">${esc(it.score[2])}</span></div>`:"";
  const v=it.views;
  const views=v?`<div class="views">${v.peak?`<span><b>${v.approx?"~":""}${fmt(v.peak)}</b>peak viewers</span>`:""}${v.avg?`<span><b>${fmt(v.avg)}</b>avg</span>`:""}${v.hours?`<span><b>${v.approx?"~":""}${fmt(v.hours)}</b>hours watched</span>`:""}${v.url?`<a href="${link(v.url)}" target="_blank" rel="noopener">${esc(v.src)} ↗</a>`:""}</div>`:"";
  const acts=(it.vods||[]).length||(it.links||[]).length||it.community?`<div class="actions">${it.community?`<button class="btn talk mood-${esc(it.community.mood)}" data-talk="${esc(it.id)}" title="What the community said">${TALK}Community</button>`:""}${it.vods?`<button class="btn play" data-vod="${esc(it.id)}">${PLAY}Watch${it.vods.length>1?` (${it.vods.length})`:""}</button>`:""}${(it.links||[]).map(l=>`<a class="btn" href="${link(l.url)}" target="_blank" rel="noopener">${esc(l.label)} ↗</a>`).join("")}</div>`:"";
  const c=it.tl?"#c9a7ff":hex(era.c);
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
    html+=`<section class="era" style="--ec:${hex(era.c)}"><div class="era-head"><div class="era-badge"><small>Era ${esc(era.n)}</small><b>${esc(era.name)}</b></div></div><p class="era-sub">${esc(era.sub)}</p><div class="items">${list.map((it,k)=>card(it,k+1,(side++%2)?"left":"right",era)).join("")}</div></section>`;
  });
  $("#tl").innerHTML=html;$("#count").textContent=`${shown} of ${D.items.length}`;$("#empty").style.display=shown?"none":"block";
}

/* ---------- footer ---------- */
function footer(){
  const S=DATA.site;
  $("#foot").innerHTML=`<p>A fan archive. Overwatch belongs to Blizzard Entertainment. The artwork here is original. Teams and people appear as text with monogram badges, and where one has an X account its own profile picture loads from there. Videos are embedded from YouTube, and posts link to their original source.</p>
  <div class="credit"><div>Built by <a class="me" href="${link(S.owner.url)}" target="_blank" rel="noopener">${esc(S.owner.name)}</a><div class="updated">Data updated ${esc(DATA.meta.lastUpdated)}${DATA.meta.lastBotRun?` · bot ran ${esc(DATA.meta.lastBotRun)}`:""}</div></div>
  ${S.buyMeACoffee?`<a class="bmc" href="${link(S.buyMeACoffee)}" target="_blank" rel="noopener">☕ Buy me a coffee</a>`:""}</div>`;
}

/* ---------- video modal ---------- */
function openVod(id){
  const it=[...DATA.lore.items,...DATA.esports.items,...DATA.t2.items].find(i=>i.id===id);if(!it||!it.vods)return;
  const m=$("#modal");m.hidden=false;$("#mTitle").textContent=it.t;
  $("#mChips").innerHTML=it.vods.map((v,i)=>`<button class="vchip" data-yt="${esc(v.yt)}" data-start="${Number(v.start)||0}" aria-pressed="${i===0}">${esc(v.label||"VOD "+(i+1))}</button>`).join("");
  playYt(it.vods[0].yt,Number(it.vods[0].start)||0);$("#mClose").focus();
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
   ${(c.voices||[]).length?`<h4>Voices &amp; posts</h4><ul class="voices">${c.voices.map(v=>`<li><b>${esc(v.who)}</b><span>${esc(v.gist)}</span>${v.url?`<a href="${link(v.url)}" target="_blank" rel="noopener">Open ↗</a>`:""}</li>`).join("")}</ul>`:""}
   <p class="cnote">Summarized from posts and coverage. Quotes are kept short, so open each link for the original.${c.updated?` Updated ${esc(c.updated)}.`:""}</p>`;
  $("#cmodal").hidden=false;$("#cClose").focus();
}
/* ---------- events ---------- */
function render(){tabs();hero();cases();if(["lore","esports","t2"].includes(state.view))ribbon();timeline();footer();fx.retint()}
document.addEventListener("click",e=>{
  const t=e.target.closest("[data-view]");if(t){closeSpot();location.hash=t.dataset.view;return}
  const person=e.target.closest("[data-person]");if(person){openPerson(person.dataset.person);return}
  const pf=e.target.closest("[data-pf]");if(pf){state.pf=pf.dataset.pf;cases();return}
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
document.addEventListener("keydown",e=>{if((e.key==="Enter"||e.key===" ")&&e.target.matches&&e.target.matches("header[data-spot],[data-person]")){e.preventDefault();e.target.click();return}if(e.key==="Escape"){if(!$("#modal").hidden){closeVod();return}if(!$("#cmodal").hidden){$("#cmodal").hidden=true;return}closeSpot()}});
$("#q").addEventListener("input",e=>{state.q=e.target.value;timeline()});
document.addEventListener("input",e=>{if(e.target.id!=="pq")return;const q=e.target.value.trim().toLowerCase();document.querySelectorAll(".pcard").forEach(c=>{c.hidden=!c.dataset.find.includes(q)})});
document.addEventListener("error",e=>{if(e.target.classList&&e.target.classList.contains("av"))e.target.remove()},true);
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
  return{retint(){tint={triumvirate:["#f99e1a","#c9a7ff"],lore:["#f99e1a","#43c6ff"],t2:["#c9a7ff","#43c6ff"],teams:["#ffd36b","#f99e1a"],numbers:["#5be3a6","#43c6ff"],people:["#c9a7ff","#f99e1a"]}[state.view]||["#43c6ff","#ffd36b"];start()}};
})();

load().then(()=>{route()}).catch(err=>{$("#heroInner").innerHTML=`<h1>Couldn't load data</h1><p class="lede">${esc(err.message)}. If you opened this file directly, serve the folder instead (for example: <code>python3 -m http.server</code> inside <code>site/</code>).</p>`});
