import {demoEvents,match} from './events.js';
import {at,story,clock,overlay,recap} from './stories.js';
import {createMemory,memorySVG,memoryHTML,memoryLink,parseMomentLink} from './memories.js';
const $=id=>document.getElementById(id);
const prefs={mode:'fan',language:'en',team:'all',player:'all'};
let index=0,timer=null,revision=0,controller=null,currentStory=null,ablation=false,aiAvailable=false;
const escape=text=>String(text).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const translatedType=e=>prefs.language==='es'?({pass:'Pase',pressure:'Presión',shot:'Remate',tackle:'Entrada'}[e.type]):e.type.toUpperCase();
function visible(e){return (prefs.team==='all'||e.team===prefs.team)&&(prefs.player==='all'||e.player===prefs.player);}
function point(e,p){return e.team===match.home?p:[105-p[0],68-p[1]];}
function stop(){clearInterval(timer);timer=null;$('play').textContent='▶ Play sequence';}
function download(name,value,type='application/json'){const url=URL.createObjectURL(new Blob([value],{type}));const a=document.createElement('a');a.href=url;a.download=name;a.click();setTimeout(()=>URL.revokeObjectURL(url),1000);}
function narrative(s){
 currentStory=s;$('story-title').textContent=s.title;$('observed').textContent=s.observed;$('insight').textContent=s.interpretation;
 $('provider').textContent=s.provider==='foundry-local'?'MICROSOFT FOUNDRY LOCAL · AI':s.provider==='azure'?'MICROSOFT AZURE · AI':'COMPUTED EXPLANATION';
 $('detail-metrics').textContent=s.metrics?Object.entries(s.metrics).filter(([,v])=>v!==null).map(([k,v])=>`${{advanceM:'Forward gain (m)',passDistanceM:'Pass distance (m)',pressureWindowSeconds:'Pressure window (s)'}[k]}: ${v}`).join(' · '):'';
 $('evidence').innerHTML=s.evidence.map(id=>{const e=demoEvents.find(x=>x.id===id);return `<button class="evidence-card" data-source="${id}" aria-label="Replay evidence ${id}"><span class="card-top"><span>${id} · SOURCE EVENT</span><span>${clock(e.second)} ↗</span></span><strong>${escape(e.player)}</strong><p>${escape(e.team)} · ${escape(translatedType(e))}<br>${escape(e.outcome)} · original record</p></button>`;}).join('');
 $('evidence').querySelectorAll('[data-source]').forEach(b=>b.onclick=()=>seek(demoEvents.findIndex(e=>e.id===b.dataset.source)));
 $('broadcast-preview').hidden=prefs.mode!=='broadcast';$('broadcast-heading').textContent=`${clock(at(index).clock)} · ${s.title}`;$('broadcast-copy').textContent=s.interpretation;$('broadcast-source').textContent=`PRO-VISION · ${s.evidence.join(' / ')} · ${s.provider==='computed'?'COMPUTED':'AI INTERPRETATION'}`;
}
function render(){
 revision++;controller?.abort();controller=null;$('ask').disabled=!aiAvailable;$('ask').textContent='↗';
 const state=at(index);const e=state.latest;ablation=false;
 $('score').innerHTML=`${state.stats[match.home].goals} <span>:</span> ${state.stats[match.away].goals}`;
 $('clock').textContent=clock(state.clock);$('event-kind').textContent=`${translatedType(e)} · ${e.outcome.toUpperCase()}`;
 $('position').textContent=`${String(index+1).padStart(2,'0')} / ${String(demoEvents.length).padStart(2,'0')}`;$('scrub').value=index;
 $('prev').disabled=index===0;$('next').disabled=index===demoEvents.length-1;
 $('focus-tag').textContent=prefs.player==='all'?(visible(e)?'MATCH MOMENT':'OTHER CLUB MOMENT'):(e.player===prefs.player?'YOUR PLAYER':`FOLLOWING ${prefs.player.toUpperCase()}`);
 narrative(story(state,prefs));
 $('notice').textContent=aiAvailable?'AI is available. Ask for an interpretation of this moment. Basic checks validate references; they do not prove every claim.':'Instant explanations and recaps use transparent rules. Live AI is available only with a configured server; this hosted preview is not yet an AI-powered competition entry.';
 $('stats').innerHTML=[['SHOTS','shots',false],['PASS ACCURACY','passAccuracy',true],['PRESSURE ACTIONS','pressures',false]].map(([label,key,percent])=>`<div class="stat"><span>${label}</span><strong>${[match.home,match.away].map(team=>{const v=state.stats[team][key];return v===null?'—':percent?Math.round(v*100)+'%':v;}).join(' / ')}</strong><small>Cedar / Marina</small></div>`).join('');
 $('actions').innerHTML=state.context.map(action=>{
  const active=action.id===e.id;const color=action.team===match.home?'#00cfff':'#ffe200';
  if(action.from){const a=point(action,action.from),b=point(action,action.to);return `<g opacity="${active?1:.28}"><path d="M${a[0]} ${a[1]}L${b[0]} ${b[1]}" stroke="${color}" stroke-width="${active?.8:.45}" fill="none" ${action.team===match.home?'marker-end="url(#arrow)"':''}/><circle cx="${b[0]}" cy="${b[1]}" r="${active?1.3:.7}" fill="${color}"/>${active?`<text x="${Math.max(5,Math.min(85,b[0]-4))}" y="${Math.max(5,b[1]-3)}" font-size="2.5" fill="#fff">${escape(action.player)}</text>`:''}</g>`;}
  const p=point(action,action.ball);return `<g opacity="${active?1:.35}"><circle cx="${p[0]}" cy="${p[1]}" r="${action.type==='pressure'?3:1.8}" fill="none" stroke="${color}" stroke-width=".7"/><text x="${p[0]+4}" y="${p[1]}" font-size="2.5" fill="${color}">${escape(action.id)}</text></g>`;
 }).join('');
 $('timeline').innerHTML=demoEvents.slice(0,index+1).filter(visible).map(e=>`<li><button data-source="${e.id}" class="${e.id===state.latest.id?'current':''}"><time>${clock(e.second)}</time><b>${escape(e.player)}</b><span>${escape(translatedType(e))} · ${escape(e.outcome)}</span></button></li>`).join('')||'<li class="small">No recorded events match these preferences yet.</li>';
 $('timeline').querySelectorAll('[data-source]').forEach(b=>b.onclick=()=>seek(demoEvents.findIndex(e=>e.id===b.dataset.source)));
 $('filter-label').textContent=prefs.player==='all'?prefs.team==='all'?'All players':prefs.team:prefs.player;
 updateLab();$('recap-output').textContent='';$('download-recap').hidden=true;
}
function seek(i){stop();index=i;render();}
function updateLab(){const state=at(index);const pressures=state.context.filter(e=>e.type==='pressure');const candidate=pressures[0];$('ablate').disabled=!candidate;
 const baseline=state.signals.filter(s=>s.kind==='pressure-cluster').length;
 const removed=ablation&&candidate?at(index,candidate.id):null;const next=removed?.signals.filter(s=>s.kind==='pressure-cluster').length;
 $('lab-result').textContent=removed?`Baseline: ${baseline} pressure cluster(s). Without ${candidate.id}: ${next}. Scores and shot records are unchanged. A signal can depend on a single source record.`:candidate?`Baseline: ${baseline} pressure cluster(s), based on at least two same-team pressure actions in a trailing 20-second window.`:'No pressure record in the current 20-second evidence window. Jump to the progressive pass to try this.';
 $('ablate').textContent=ablation?'Restore pressure record':'Remove one pressure record';
}
$('prev').onclick=()=>seek(Math.max(0,index-1));$('next').onclick=()=>seek(Math.min(demoEvents.length-1,index+1));$('scrub').oninput=e=>seek(Number(e.target.value));
$('play').onclick=()=>{if(timer){stop();return;}if(index===demoEvents.length-1){index=0;render();}const baseClock=demoEvents[index].second,baseTime=performance.now();$('play').textContent='Ⅱ Pause';timer=setInterval(()=>{const target=baseClock+(performance.now()-baseTime)/1000;const next=index+1;if(next<demoEvents.length&&demoEvents[next].second<=target){index=next;render();}if(index===demoEvents.length-1)stop();},100);};
document.querySelectorAll('[data-jump]').forEach(b=>b.onclick=()=>seek(Number(b.dataset.jump)));
document.querySelectorAll('[data-mode]').forEach(b=>b.onclick=()=>{prefs.mode=b.dataset.mode;document.querySelectorAll('[data-mode]').forEach(x=>x.setAttribute('aria-pressed',String(x===b)));render();});
for(const key of ['language','team','player'])$(key).onchange=e=>{prefs[key]=e.target.value;render();};
$('ablate').onclick=()=>{ablation=!ablation;updateLab();};
$('export-overlay').onclick=()=>download(`pro-vision-overlay-${demoEvents[index].id}.json`,JSON.stringify(overlay(at(index),prefs,currentStory),null,2));
$('export-data').onclick=()=>download('pro-vision-synthetic-events.json',JSON.stringify({match,events:demoEvents},null,2));
$('recap').onclick=()=>{$('recap-output').textContent=recap(index,prefs);$('download-recap').hidden=false;};
$('download-recap').onclick=()=>download('pro-vision-recap.txt',$('recap-output').textContent,'text/plain');
$('ask-form').onsubmit=async event=>{
 event.preventDefault();if(!aiAvailable)return;stop();controller?.abort();controller=new AbortController();const own=revision;
 $('ask').disabled=true;$('ask').textContent='…';$('notice').textContent='Generating an interpretation from the current evidence…';
 try{const response=await fetch(new URL('./api/story',document.baseURI),{method:'POST',headers:{'content-type':'application/json'},body:JSON.stringify({index,prefs,question:$('question').value}),signal:controller.signal});if(!response.ok)throw new Error('Request failed');const data=await response.json();if(own!==revision)return;narrative(data.story);$('notice').textContent=data.notice;}
 catch(error){if(own===revision&&error.name!=='AbortError')$('notice').textContent='AI request failed. The computed explanation remains available.';}
 finally{if(own===revision){$('ask').disabled=!aiAvailable;$('ask').textContent='↗';}}
};
render();
let memories=[],selectedMemory=null;
const memoryStorage='pro-vision-memories-v1';
try{const saved=JSON.parse(localStorage.getItem(memoryStorage)||'[]');if(Array.isArray(saved))memories=saved.slice(0,6).filter(m=>m.version===1&&demoEvents.some(e=>e.id===m.eventId)&&typeof m.name==='string'&&typeof m.note==='string'&&typeof m.photo==='string').map(m=>createMemory(demoEvents.findIndex(e=>e.id===m.eventId),m.prefs,m,{interpretation:m.interpretation,evidence:m.evidence,provider:m.provider}));}catch{memories=[];}
function showMemory(memory){
 selectedMemory=memory;$('memory-art').innerHTML=memorySVG(memory);$('shirt-art').setAttribute('href','data:image/svg+xml;charset=utf-8,'+encodeURIComponent(memorySVG(memory)));
 for(const key of ['memory-svg','memory-html','memory-link','memory-tap'])$(key).disabled=false;
}
function memoryGallery(){
 $('memory-gallery').innerHTML=memories.map((m,i)=>`<button class="memory-saved" data-memory="${i}"><span>${escape(m.eventId)} · ${clock(m.clock)}</span><strong>${escape(m.name||'My moment')}</strong></button>`).join('');
 $('memory-gallery').querySelectorAll('[data-memory]').forEach(b=>b.onclick=()=>showMemory(memories[Number(b.dataset.memory)]));
}
$('memory-create').onclick=async()=>{
 const selected=index,preferences={...prefs},narrative=structuredClone(currentStory),name=$('memory-name').value,note=$('memory-note').value,file=$('memory-photo').files[0];$('memory-create').disabled=true;
 try{
  let photo='';if(file){if(!['image/png','image/jpeg','image/webp'].includes(file.type)||file.size>1048576)throw new Error('Choose a PNG, JPEG or WebP photo up to 1 MB.');photo=await new Promise((resolve,reject)=>{const reader=new FileReader();reader.onload=()=>resolve(reader.result);reader.onerror=()=>reject(new Error('Photo could not be read.'));reader.readAsDataURL(file);});}
  const memory=createMemory(selected,preferences,{name,note,photo},narrative);memories.unshift(memory);memories=memories.slice(0,6);showMemory(memory);memoryGallery();
  try{localStorage.setItem(memoryStorage,JSON.stringify(memories));$('memory-status').textContent='Your moment is saved in this browser. Download a keepsake to keep a separate copy.';}catch{$('memory-status').textContent='Memory created, but browser storage is unavailable or full. Download your keepsake before closing the page.';}
 }catch(error){$('memory-status').textContent=error.message;}finally{$('memory-create').disabled=false;}
};
$('memory-svg').onclick=()=>selectedMemory&&download(`pro-vision-memory-${selectedMemory.eventId}.svg`,memorySVG(selectedMemory),'image/svg+xml');
$('memory-html').onclick=()=>selectedMemory&&download(`pro-vision-memory-${selectedMemory.eventId}.html`,memoryHTML(selectedMemory),'text/html');
$('memory-link').onclick=async()=>{if(!selectedMemory)return;const link=memoryLink(selectedMemory,location.href);try{await navigator.clipboard.writeText(link);$('memory-status').textContent='Replay link copied. It contains no personal note or photo. It needs a publicly accessible app to work for other fans.';}catch{download('pro-vision-replay-link.txt',link,'text/plain');$('memory-status').textContent='Clipboard unavailable; replay link downloaded.';}};
function followMemory(memory){stop();Object.assign(prefs,memory.prefs);for(const key of ['language','team','player'])$(key).value=prefs[key];document.querySelectorAll('[data-mode]').forEach(b=>b.setAttribute('aria-pressed',String(b.dataset.mode===prefs.mode)));seek(demoEvents.findIndex(e=>e.id===memory.eventId));$('pitch').scrollIntoView({behavior:'smooth',block:'center'});$('memory-status').textContent='Simulated tag opened the saved match moment. No physical tag was scanned.';}
$('memory-tap').onclick=()=>selectedMemory&&followMemory(selectedMemory);
$('memory-clear').onclick=()=>{memories=[];selectedMemory=null;memoryGallery();try{localStorage.removeItem(memoryStorage);}catch{}$('memory-art').innerHTML='<p>Select a moment and create your first keepsake.</p>';$('shirt-art').removeAttribute('href');for(const key of ['memory-svg','memory-html','memory-link','memory-tap'])$(key).disabled=true;$('memory-status').textContent='Saved memories cleared from this browser. Previously downloaded files are unchanged.';};
memoryGallery();if(memories[0])showMemory(memories[0]);
function restoreMoment(){const linked=parseMomentLink(location.hash);if(!linked)return;Object.assign(prefs,linked.prefs);for(const key of ['language','team','player'])$(key).value=prefs[key];document.querySelectorAll('[data-mode]').forEach(b=>b.setAttribute('aria-pressed',String(b.dataset.mode===prefs.mode)));seek(linked.index);}
restoreMoment();window.addEventListener('hashchange',restoreMoment);
fetch(new URL('./api/health',document.baseURI)).then(r=>r.ok?r.json():null).then(data=>{aiAvailable=data?.ai===true;$('ask').disabled=!aiAvailable;if(aiAvailable)$('notice').textContent='Microsoft AI is configured. Ask about this moment. Generation and validation are measured per request.';}).catch(()=>{});
