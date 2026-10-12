const $=id=>document.getElementById(id);
const events=generateMatch();let index=0,mode='fan',playing=false,timer,revision=0,controller,analyzing=false,commentaryEnabled=false;
for(const player of [...new Set(events.map(e=>e.player))]){const option=document.createElement('option');option.value=player;option.textContent=player;$('favorite-player').append(option);}
const matchesPreference=e=>($('favorite').value==='all'||e.team===$('favorite').value)&&(!$('favorite-player').value||$('favorite-player').value==='all'||e.player===$('favorite-player').value);
let chatHistory=[],chatScope='';
function chatMessage(role,text){const item=document.createElement('div');item.className='chat-message '+role;const label=document.createElement('strong'),body=document.createElement('p');label.textContent=(role==='user'?'You':'PRO-VISION')+' · '+events[index].id;body.sourceLabel=label;body.textContent=text;item.append(label,body);$('chat-messages').append(item);$('chat-messages').scrollTop=$('chat-messages').scrollHeight;return body;}
$('chat-clear').addEventListener('click',()=>{chatHistory=[];$('chat-messages').replaceChildren();});
const time=second=>Math.floor(second/60)+':'+String(second%60).padStart(2,'0');
const symbols={pass:'↗',shot:'◎',tackle:'⇄',pressure:'◇'};
function render() {
  $('lens-results').hidden=true;
  cancelCommentary();
  const facts=interpret(events,index),e=facts.event,stats=facts.stats;
  $('score').textContent=stats[0].goals+' : '+stats[1].goals;$('clock').textContent=time(e.second)+' · '+(playing?'REPLAYING':'REPLAY');
  $('pattern').textContent=facts.pattern;$('event-id').textContent=e.id+' / '+time(e.second);$('event-title').textContent=e.player+' · '+e.type.charAt(0).toUpperCase()+e.type.slice(1);$('event-detail').textContent=e.team+' / '+e.outcome;$('event-symbol').textContent=symbols[e.type];
  $('scrub').value=index;$('event-count').textContent=(index+1)+' / '+events.length;
  $('prev').disabled=index===0;$('next').disabled=index===events.length-1;
  for(const [id,type] of [['next-shot','shot'],['next-goal','goal']])$(id).disabled=findNextHighlight(type)<0;
  $('highlight-status').textContent=$('favorite-player').value&&$('favorite-player').value!=='all'?`Highlights for ${$('favorite-player').value}.`:$('favorite').value==='all'?'Highlights from both teams.':`Highlights for ${$('favorite').value}.`;
  const sx=e.start.x*10.5,sy=e.start.y*6.8,ex=e.end.x*10.5,ey=e.end.y*6.8;
  for(const [attr,value] of Object.entries({x1:sx,y1:sy,x2:ex,y2:ey}))$('action-line').setAttribute(attr,value);
  for(const [id,x,y] of [['start-dot',sx,sy],['ball',ex,ey]]){$(id).setAttribute('cx',x);$(id).setAttribute('cy',y);}
  $('player-label').setAttribute('x',ex>850?ex-16:ex+16);$('player-label').setAttribute('text-anchor',ex>850?'end':'start');$('player-label').setAttribute('y',Math.max(ey-18,30));$('player-label').textContent=e.player;
  $('trails').replaceChildren(...facts.context.slice(0,-1).map(a=>{const line=document.createElementNS('http://www.w3.org/2000/svg','line');for(const [k,v]of Object.entries({x1:a.start.x*10.5,y1:a.start.y*6.8,x2:a.end.x*10.5,y2:a.end.y*6.8,stroke:'#67d9ff','stroke-opacity':'.25','stroke-width':3}))line.setAttribute(k,v);return line;}));
  const own=events.slice(0,index+1);const values=[['Shots',stats.map(s=>s.shots).join(' / ')],['Pass accuracy',stats.map(s=>s.accuracy+'%').join(' / ')],['Pressure events',stats.map(s=>s.pressure).join(' / ')],['Events ingested',own.length]];
  $('stats').replaceChildren(...values.map(([label,value])=>{const div=document.createElement('div');div.className='stat';const strong=document.createElement('strong'),span=document.createElement('span');strong.textContent=value;span.textContent=label;div.append(strong,span);return div;}));
  $('insight-title').textContent=facts.pattern;$('insight').textContent=explain(facts,mode,'',$('language').value);$('provider').textContent='LOCAL EXPLANATION · RULE-BASED';$('notice').textContent='';showEvidence(facts.evidence);renderEvents();$('recap').textContent=$('language').value==='es'?'Crea un resumen de este momento de la repetición.':'Create a recap for this replay position.';
  revision++;controller?.abort();setAnalyzing(analyzing);
  $('notice').textContent='Instant local explanation. Choose Generate AI insight for a model interpretation.';
  if(playing) speakCommentary();
}
function findNextHighlight(type){return events.findIndex((e,i)=>i>index&&matchesPreference(e)&&(type==='goal'?e.outcome==='goal':e.type===type));}
function jumpToHighlight(type){const next=findNextHighlight(type);if(next<0)return;stop();index=next;render();$('highlight-status').textContent=`Selected ${type}: ${events[index].id} at ${time(events[index].second)}.`;}
$('next-shot').addEventListener('click',()=>jumpToHighlight('shot'));
$('next-goal').addEventListener('click',()=>jumpToHighlight('goal'));
function showEvidence(ids){$('evidence').replaceChildren(...ids.map(id=>{const button=document.createElement('button');button.className='evidence-link';button.textContent=id;button.setAttribute('aria-label','Inspect recorded event '+id);button.addEventListener('click',()=>{const target=events.findIndex(e=>e.id===id);if(target<0)return;stop();index=target;render();});return button;}));}
function renderEvents(){const filter=$('filter').value,favorite=$('favorite').value;const filtered=events.map((e,i)=>({e,i})).filter(({e})=>matchesPreference(e)&&(filter==='all'||(filter==='key'?['shot','tackle'].includes(e.type):filter==='goal'?e.outcome==='goal':e.type===filter)));
  $('events').replaceChildren(...filtered.map(({e,i})=>{const button=document.createElement('button');button.setAttribute('aria-pressed',String(i===index));button.className='event-row'+(i===index?' current':'');const stamp=document.createElement('span'),details=document.createElement('span'),strong=document.createElement('strong'),small=document.createElement('small'),symbol=document.createElement('b');stamp.textContent=time(e.second);strong.textContent=e.player+' · '+e.type;small.textContent=e.team+' / '+e.outcome;symbol.textContent=symbols[e.type];details.append(strong,small);button.append(stamp,details,symbol);button.addEventListener('click',()=>{stop();index=i;render();});return button;}));
  if(!filtered.length)$('events').textContent='No events match these filters.';
}
function setAnalyzing(busy){analyzing=busy;$('chat-clear').disabled=busy;$('suggestion').disabled=busy;$('suggestion').textContent=busy?'Generating…':'Generate AI insight ↗';$('ask-form').querySelector('button').disabled=busy;$('insight').setAttribute('aria-busy',String(busy));}
async function analyze(question=''){
  if(analyzing)return;
  const scope=JSON.stringify([index,mode,$('language').value,$('favorite').value,$('favorite-player').value]);if(chatScope!==scope){chatHistory=[];chatScope=scope;}
  const userQuestion=question.trim()||'Why might this moment matter?';
  chatMessage('user',userQuestion);const reply=chatMessage('assistant','Thinking…');$('question').value='';
  const remember=(text,provider='local')=>{reply.textContent=text;reply.sourceLabel.textContent='PRO-VISION · '+events[index].id+' · '+(provider==='azure'?'AZURE AI':provider==='foundry-local'?'LOCAL AI':'RECORDED / RULE-BASED');chatHistory.push({role:'user',content:userQuestion},{role:'assistant',content:text});chatHistory=chatHistory.slice(-4);};
  const direct=recordedAnswer(interpret(events,index),question,$('language').value);
  if(direct){remember(direct.text);$('insight').textContent=direct.text;$('provider').textContent='RECORDED FACTS · NO AI REQUEST';showEvidence(direct.evidence);$('notice').textContent='Answered directly from the event record.';return;}
  const token=++revision;controller?.abort();controller=new AbortController();const ownController=controller;
  if(location.protocol==='file:'){$('insight').textContent=explain(interpret(events,index),mode,question,$('language').value);remember($('insight').textContent);$('notice').textContent='Standalone demo: local explanations. Run the server to connect Azure AI.';return;}
  $('notice').textContent='Generating an evidence-linked interpretation…';
  setAnalyzing(true);
  try{const response=await fetch('/api/analyze',{method:'POST',headers:{'content-type':'application/json'},signal:ownController.signal,body:JSON.stringify({index,mode,question,history:chatHistory,team:$('favorite').value,player:$('favorite-player').value||'all',language:$('language').value})});if(!response.ok)throw new Error('Request failed');const result=await response.json();if(token!==revision){reply.textContent='Moment changed. Ask about the newly selected event.';return;}remember(result.text,result.provider);$('insight').textContent=result.text;$('provider').textContent=result.provider==='foundry-local'?'FOUNDRY LOCAL AI · GENERATED INTERPRETATION':result.provider==='azure'?'AZURE AI · GENERATED INTERPRETATION':'LOCAL EXPLANATION · RULE-BASED';$('notice').textContent=(result.notice||'')+(result.latencyMs!==undefined?' Response: '+(result.latencyMs/1000).toFixed(1)+' s.':'');showEvidence(result.evidence);updateUsage();}catch(error){if(error.name==='AbortError'||token!==revision){reply.textContent='Moment changed. Ask about the newly selected event.';return;}$('insight').textContent=explain(interpret(events,index),mode,question,$('language').value);$('provider').textContent='LOCAL EXPLANATION · RULE-BASED';showEvidence(interpret(events,index).evidence);remember($('insight').textContent);$('notice').textContent='Narrative service unavailable. Showing the local explanation.';}finally{setAnalyzing(false);updateUsage();}
}
const speechAvailable=typeof speechSynthesis!=='undefined'&&typeof SpeechSynthesisUtterance!=='undefined';
function cancelCommentary(){if(typeof speechSynthesis!=='undefined')speechSynthesis.cancel();}
function speakCommentary(){if(!commentaryEnabled||!speechAvailable)return;const text=commentaryLine(events[index],$('language').value);$('commentary-status').textContent='Simulated commentary · '+text;const utterance=new SpeechSynthesisUtterance(text);utterance.lang=$('language').value==='es'?'es-ES':'en-US';utterance.rate=1.1;utterance.onerror=event=>{if(['canceled','interrupted'].includes(event?.error))return;$('commentary-status').textContent='Voice unavailable. Commentary text remains available.';};speechSynthesis.speak(utterance);}
function scheduleReplay(){clearInterval(timer);timer=setInterval(()=>{if(index<events.length-1){index++;render();}else{stop();render();}},commentaryEnabled?5000:1200);}
$('commentary-toggle').setAttribute('aria-pressed','false');
$('commentary-toggle').disabled=!speechAvailable;
if(!speechAvailable)$('commentary-status').textContent='Voice commentary is unavailable in this browser.';
$('commentary-toggle').addEventListener('click',()=>{if(!speechAvailable)return;commentaryEnabled=!commentaryEnabled;cancelCommentary();$('commentary-toggle').textContent=commentaryEnabled?'Commentary on':'Commentary off';$('commentary-toggle').setAttribute('aria-pressed',String(commentaryEnabled));$('commentary-status').textContent=commentaryEnabled?'Simulated commentary · press Play to hear the fictional match. Replay slows for narration.':'Simulated commentary · fictional match · no Azure calls';if(playing){scheduleReplay();speakCommentary();}});
function stop(){playing=false;clearInterval(timer);cancelCommentary();$('play').textContent='▶ Play replay';$('clock').textContent=time(events[index].second)+' · REPLAY';}
$('play').addEventListener('click',()=>{if(playing){stop();render();return;}if(index===events.length-1)index=0;playing=true;$('play').textContent='Ⅱ Pause replay';render();scheduleReplay();});
$('prev').addEventListener('click',()=>{stop();index=Math.max(0,index-1);render();});$('next').addEventListener('click',()=>{stop();index=Math.min(events.length-1,index+1);render();});$('reset').addEventListener('click',()=>{stop();index=0;render();});$('scrub').addEventListener('input',()=>{stop();index=Number($('scrub').value);render();});
document.querySelectorAll('[data-mode]').forEach(button=>button.addEventListener('click',()=>{mode=button.dataset.mode;document.querySelectorAll('[data-mode]').forEach(b=>{b.classList.toggle('selected',b===button);b.setAttribute('aria-pressed',b===button?'true':'false');});render();}));
$('language').addEventListener('change',render);$('favorite').addEventListener('change',()=>{$('favorite-player').value='all';render();});$('favorite-player').addEventListener('change',render);$('filter').addEventListener('change',renderEvents);
$('ask-score').addEventListener('click',()=>{stop();analyze($('language').value==='es'?'¿Cuál es el marcador?':'What is the score?');});
$('ask-distance').addEventListener('click',()=>{stop();analyze($('language').value==='es'?'¿Cuál es la distancia del pase?':'How far was the pass?');});
$('ask-form').addEventListener('submit',event=>{event.preventDefault();stop();analyze($('question').value.trim());});$('suggestion').addEventListener('click',()=>{stop();analyze($('question').value.trim());});
function makeRecap(){const text=recap(events.slice(0,index+1),mode,$('favorite').value,$('language').value);$('recap').textContent=text;return text;}
$('generate').addEventListener('click',makeRecap);$('export').addEventListener('click',()=>{const text=makeRecap();const blob=new Blob(['PRO-VISION AI / '+mode+' perspective\n\n'+text+'\n\nOriginal synthetic data. Replay time: '+time(events[index].second)],{type:'text/plain'});const url=URL.createObjectURL(blob);const link=document.createElement('a');link.href=url;link.download='provision-match-recap.txt';link.click();setTimeout(()=>URL.revokeObjectURL(url),1000);});
if(location.protocol==='file:'){
  const link=document.querySelector('a[download="provision-synthetic-match.json"]');
  link.href=URL.createObjectURL(new Blob([JSON.stringify({provenance:'Original synthetic PRO-VISION football events, seed 26. Not real match data.',pitch:{length:105,width:68},events},null,2)],{type:'application/json'}));
}
render();

async function updateUsage(){if(location.protocol==='file:')return;try{const r=await fetch('/api/usage');if(!r.ok)return;const u=await r.json();$('usage-status').textContent=`AI requests: ${u.today}/${u.dailyLimit} today · ${u.thisMonth}/${u.monthlyLimit} this month. Cached responses use no new request.`;}catch{}}
updateUsage();

$('compare-lenses').addEventListener('click',()=>{const facts=interpret(events,index),language=$('language').value;$('fan-lens').textContent=explain(facts,'fan','',language);$('coach-lens').textContent=explain(facts,'coach','',language);$('lens-results').hidden=false;});

let selectedCard=null,cardBack=false,cardPhoto='',cardMediaKind='none',cardVideoURL=null,mediaRevision=0;
function renderCard(){if(!selectedCard)return;const svg=tradingCardSVG(selectedCard,cardBack);$('card-art').innerHTML=svg;$('card-shirt-art').setAttribute('href','data:image/svg+xml;charset=utf-8,'+encodeURIComponent(tradingCardSVG(selectedCard)));$('card-flip').textContent=cardBack?'View front':'View back';for(const id of ['card-flip','card-download','card-replay'])$(id).disabled=false;}
function frameImage(source,width,height){const canvas=document.createElement('canvas'),scale=Math.min(1,1024/Math.max(width,height));canvas.width=Math.round(width*scale);canvas.height=Math.round(height*scale);canvas.getContext('2d').drawImage(source,0,0,canvas.width,canvas.height);return canvas.toDataURL('image/jpeg',.85);}
$('card-media').addEventListener('change',async()=>{
 const revision=++mediaRevision,file=$('card-media').files?.[0];cardPhoto='';cardMediaKind='none';$('card-capture').disabled=true;$('card-video').pause?.();$('card-video').hidden=true;$('card-video').removeAttribute?.('src');if(cardVideoURL){URL.revokeObjectURL(cardVideoURL);cardVideoURL=null;}
 $('card-create').disabled=false;
 if(!file)return;
 $('card-create').disabled=true;
 try{
  if(['image/png','image/jpeg','image/webp'].includes(file.type)){
   if(file.size>5*1024*1024)throw new Error('Choose a photo up to 5 MB.');
   const data=await new Promise((resolve,reject)=>{const reader=new FileReader();reader.onload=()=>resolve(reader.result);reader.onerror=()=>reject(new Error('Photo could not be read.'));reader.readAsDataURL(file);});
   const image=await new Promise((resolve,reject)=>{const img=new Image();img.onload=()=>resolve(img);img.onerror=()=>reject(new Error('Photo could not be decoded.'));img.src=data;});
   if(revision!==mediaRevision)return;cardPhoto=frameImage(image,image.naturalWidth,image.naturalHeight);cardMediaKind='photo';$('card-status').textContent='Photo ready. Create your card to attach it.';
  }else if(['video/mp4','video/webm','video/quicktime'].includes(file.type)){
   if(file.size>30*1024*1024)throw new Error('Choose a video up to 30 MB.');
   cardVideoURL=URL.createObjectURL(file);$('card-video').src=cardVideoURL;$('card-video').hidden=false;$('card-status').textContent='Play or scrub your video, pause on a frame, then select Use this video frame.';
  }else throw new Error('Choose a PNG, JPEG, WebP, MP4, WebM or MOV file.');
 }catch(error){if(revision===mediaRevision)$('card-status').textContent=error.message;}finally{if(revision===mediaRevision)$('card-create').disabled=false;}
});
$('card-video').addEventListener('loadeddata',()=>{$('card-capture').disabled=$('card-video').hidden;});
$('card-video').addEventListener('error',()=>{$('card-capture').disabled=true;$('card-status').textContent='This browser cannot play that video. Try an MP4 or a photo.';});
$('card-capture').addEventListener('click',()=>{try{const video=$('card-video');if(video.readyState<2||!video.videoWidth)throw new Error('Wait for a playable video frame.');video.pause();cardPhoto=frameImage(video,video.videoWidth,video.videoHeight);cardMediaKind='video-frame';$('card-status').textContent='Video frame selected. Create your card to keep this still image.';}catch(error){$('card-status').textContent=error.message;}});
$('card-create').addEventListener('click',()=>{try{if(cardVideoURL&&!cardPhoto)throw new Error('Choose Use this video frame before creating your card.');selectedCard=createTradingMemory(index,{name:$('card-name').value,note:$('card-note').value,photo:cardPhoto,mediaKind:cardMediaKind});cardBack=false;renderCard();$('card-status').textContent=`Card created for ${selectedCard.eventId}. Download to keep it; this page does not save your personal media.`;}catch(error){$('card-status').textContent=error.message;}});
$('card-flip').addEventListener('click',()=>{if(selectedCard){cardBack=!cardBack;renderCard();}});
$('card-download').addEventListener('click',()=>{if(!selectedCard)return;const url=URL.createObjectURL(new Blob([tradingCardSVG(selectedCard,cardBack)],{type:'image/svg+xml'}));const link=document.createElement('a');link.href=url;link.download=`pro-vision-card-${selectedCard.eventId}-${cardBack?'back':'front'}.svg`;link.click();setTimeout(()=>URL.revokeObjectURL(url),1000);});
$('card-replay').addEventListener('click',()=>{if(!selectedCard)return;stop();index=selectedCard.index;render();$('pitch').scrollIntoView?.({behavior:'smooth',block:'center'});$('card-status').textContent='Simulated tap reopened '+selectedCard.eventId+'. No physical tag was scanned.';});
$('card-shirt-color').addEventListener('change',()=>{const color=$('card-shirt-color').value;$('card-shirt-body').setAttribute('fill',['#061225','#f1f5f9','#e8a28b'].includes(color)?color:'#061225');});
