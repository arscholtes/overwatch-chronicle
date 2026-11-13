
/* ---------- members: sign in, your own spotlight, messages ---------- */
const MEM={session:null,me:null,dir:[],profiles:new Map(),email:"",view:"spot",thread:null,note:""};
const SESSION_KEY="owc-session";
function backend(){const b=DATA.site&&DATA.site.backend;return b&&/^https?:\/\//.test(b.url||"")&&b.key?b:null}
function memberOf(rosterId){return MEM.dir.find(m=>m.roster_id===rosterId)}
function memberName(userId){const m=MEM.dir.find(x=>x.user_id===userId);const p=m&&DATA.alumni.people.find(x=>x.id===m.roster_id);return p?p.name:"A member"}
function keep(session){MEM.session=session;try{session?localStorage.setItem(SESSION_KEY,JSON.stringify(session)):localStorage.removeItem(SESSION_KEY)}catch(e){console.warn("this browser will not keep you signed in",e)}}
async function ask(path,{method="GET",body,auth=true,prefer}={}){
  const b=backend();
  if(auth&&MEM.session&&MEM.session.expires_at*1000<Date.now()+60000)await renew();
  const r=await fetch(b.url+path,{method,headers:{apikey:b.key,Authorization:`Bearer ${auth&&MEM.session?MEM.session.access_token:b.key}`,"Content-Type":"application/json",...(prefer?{Prefer:prefer}:{})},body:body===undefined?undefined:JSON.stringify(body)});
  const text=await r.text();const data=text?JSON.parse(text):null;
  if(!r.ok)throw new Error((data&&(data.msg||data.message||data.error_description||data.error))||`The server answered ${r.status}`);
  return data;
}
async function renew(){
  const b=backend();
  const r=await fetch(b.url+"/auth/v1/token?grant_type=refresh_token",{method:"POST",headers:{apikey:b.key,"Content-Type":"application/json"},body:JSON.stringify({refresh_token:MEM.session.refresh_token})});
  if(!r.ok){keep(null);MEM.me=null;throw new Error("Your sign-in ran out. Sign in again.")}
  keep(await r.json());
}
async function membersInit(){
  if(!backend())return;
  const btn=$("#memberBtn");btn.hidden=false;
  for(const p of await ask("/rest/v1/profile_public?select=roster_id,bio,hidden",{auth:false}))MEM.profiles.set(p.roster_id,p);
  let saved=null;try{saved=JSON.parse(localStorage.getItem(SESSION_KEY))}catch(e){console.warn("no saved sign-in could be read",e)}
  if(saved&&saved.refresh_token){MEM.session=saved;await whoAmI()}
}
async function whoAmI(){
  MEM.dir=await ask("/rest/v1/member?select=user_id,roster_id,owner");
  MEM.me=MEM.dir.find(m=>m.user_id===MEM.session.user.id)||null;
  $("#memberBtn").textContent=MEM.me?memberName(MEM.me.user_id):"Members";
}
function mnote(){return MEM.note?`<p class="mnote" role="status">${esc(MEM.note)}</p>`:""}
function showMembers(inner,title){
  $("#sBody").innerHTML=`<div class="sp-hero" style="--tc:${PURPLE}">${monogram("TL",PURPLE)}<div><div class="kicker" style="color:${PURPLE}">Members</div><h2 id="sTitle">${esc(title)}</h2></div></div>${mnote()}${inner}`;
  const m=$("#smodal");m.hidden=false;document.body.style.overflow="hidden";
}
async function openMembers(){
  if(!MEM.session)return showMembers(`<section class="sp-sec"><p class="sp-ov">For people who were at Timeless. Enter the email address your invite went to and we'll send a six-digit code.</p>
   <form class="mform" data-m="code"><input name="email" type="email" required autocomplete="email" placeholder="you@example.com" aria-label="Email address" value="${esc(MEM.email)}"><button class="btn play">Send my code</button></form>
   ${MEM.email?`<form class="mform" data-m="verify"><input name="token" inputmode="numeric" pattern="[0-9]{6}" required autocomplete="one-time-code" placeholder="6-digit code" aria-label="Sign-in code"><button class="btn play">Sign in</button></form>`:""}</section>`,"Sign in");
  if(!MEM.me)return showMembers(`<section class="sp-sec"><p class="sp-ov">You're signed in, but this account isn't tied to a roster entry yet. Ask whoever invited you to finish setting it up.</p><div class="actions"><button class="btn" data-m="out">Sign out</button></div></section>`,"Almost there");
  const nav=`<div class="tfilter">${[["spot","My spotlight"],["mail","Messages"]].map(([k,l])=>`<button class="chip" data-mview="${k}" aria-pressed="${MEM.view===k}" style="--c:${PURPLE}"><i></i>${l}</button>`).join("")}<button class="chip" data-m="out"><i></i>Sign out</button></div>`;
  if(MEM.view==="spot"){
    const mine=(await ask(`/rest/v1/profile?roster_id=eq.${encodeURIComponent(MEM.me.roster_id)}&select=bio,hidden`))[0]||{bio:"",hidden:false};
    return showMembers(`${nav}<section class="sp-sec"><h4>In your words</h4><form class="mform col" data-m="profile">
     <textarea name="bio" maxlength="1200" rows="7" aria-label="Your bio" placeholder="Anything you want on your spotlight: what you did here, what you're doing now.">${esc(mine.bio)}</textarea>
     <label class="mcheck"><input type="checkbox" name="hidden"${mine.hidden?" checked":""}> Hide my spotlight from the public page</label>
     <button class="btn play">Save</button></form></section>`,memberName(MEM.me.user_id));
  }
  const rows=await ask("/rest/v1/thread_member?select=thread_id,user_id");
  const others=rows.filter(r=>r.user_id!==MEM.me.user_id);
  if(!MEM.thread)return showMembers(`${nav}<section class="sp-sec"><h4>Conversations</h4>${others.length?`<ul class="mthreads">${others.map(o=>`<li><button class="btn" data-thread="${esc(o.thread_id)}">${esc(memberName(o.user_id))}</button></li>`).join("")}</ul>`:`<p class="aempty">No conversations yet. Open a member's spotlight in the Timeless tab and press Message.</p>`}</section>`,"Messages");
  const other=others.find(o=>o.thread_id===MEM.thread);
  const [msgs,blocks]=await Promise.all([ask(`/rest/v1/message?thread_id=eq.${encodeURIComponent(MEM.thread)}&select=id,sender,body,sent_at&order=sent_at.asc&limit=300`),ask("/rest/v1/block?select=blocked")]);
  const blocked=other&&blocks.some(b=>b.blocked===other.user_id);
  showMembers(`${nav}<section class="sp-sec"><h4>${esc(other?memberName(other.user_id):"Conversation")}</h4>
   <ol class="mlog">${msgs.map(m=>`<li class="${m.sender===MEM.me.user_id?"mine":""}"><p>${esc(m.body)}</p><span class="when">${esc(new Date(m.sent_at).toLocaleString())}${m.sender===MEM.me.user_id?"":` · <button class="mlink" data-report="${esc(m.id)}">Report</button>`}</span></li>`).join("")||`<li class="aempty">Nothing here yet.</li>`}</ol>
   <form class="mform col" data-m="send"><textarea name="body" maxlength="4000" rows="3" required aria-label="Your message" placeholder="Write a message"></textarea><button class="btn play">Send</button></form>
   <div class="actions"><button class="btn" data-thread="">All conversations</button>${other?`<button class="btn" data-block="${esc(other.user_id)}" data-on="${blocked}">${blocked?"Unblock":"Block"} ${esc(memberName(other.user_id))}</button>`:""}</div></section>`,"Messages");
}
async function memberAction(run){MEM.note="";try{await run()}catch(e){MEM.note=e.message}await openMembers().catch(e=>{MEM.note=e.message;showMembers("","Members")})}
document.addEventListener("submit",e=>{
  const f=e.target.closest("form[data-m]");if(!f)return;e.preventDefault();const v=Object.fromEntries(new FormData(f));
  memberAction({
    code:async()=>{MEM.email=v.email.trim();await ask("/auth/v1/otp",{method:"POST",auth:false,body:{email:MEM.email,create_user:false}});MEM.note="Check your email for the code."},
    verify:async()=>{keep(await ask("/auth/v1/verify",{method:"POST",auth:false,body:{type:"email",email:MEM.email,token:v.token.trim()}}));await whoAmI()},
    profile:async()=>{const row={roster_id:MEM.me.roster_id,bio:v.bio,hidden:v.hidden==="on",updated_at:new Date().toISOString()};await ask("/rest/v1/profile",{method:"POST",prefer:"resolution=merge-duplicates",body:row});MEM.profiles.set(row.roster_id,row);MEM.note="Saved.";cases()},
    send:async()=>{await ask("/rest/v1/message",{method:"POST",body:{thread_id:MEM.thread,sender:MEM.me.user_id,body:v.body}})},
  }[f.dataset.m]);
});
document.addEventListener("click",e=>{
  const t=e.target;if(!t.closest)return;
  if(t.closest("#memberBtn"))return void memberAction(async()=>{});
  const out=t.closest("[data-m='out']");if(out)return void memberAction(async()=>{keep(null);MEM.me=null;MEM.dir=[];MEM.thread=null;$("#memberBtn").textContent="Members"});
  const mv=t.closest("[data-mview]");if(mv)return void memberAction(async()=>{MEM.view=mv.dataset.mview;MEM.thread=null});
  const th=t.closest("[data-thread]");if(th)return void memberAction(async()=>{MEM.view="mail";MEM.thread=th.dataset.thread||null});
  const to=t.closest("[data-message]");if(to)return void memberAction(async()=>{MEM.thread=await ask("/rest/v1/rpc/start_thread",{method:"POST",body:{recipient:to.dataset.message}});MEM.view="mail"});
  const rp=t.closest("[data-report]");if(rp)return void memberAction(async()=>{await ask("/rest/v1/report",{method:"POST",body:{message_id:Number(rp.dataset.report),reporter:MEM.me.user_id,reason:"Reported from the conversation"}});MEM.note="Reported to the owners."});
  const bl=t.closest("[data-block]");if(bl)return void memberAction(async()=>{bl.dataset.on==="true"?await ask(`/rest/v1/block?blocked=eq.${encodeURIComponent(bl.dataset.block)}`,{method:"DELETE"}):await ask("/rest/v1/block",{method:"POST",body:{blocker:MEM.me.user_id,blocked:bl.dataset.block}})});
});
