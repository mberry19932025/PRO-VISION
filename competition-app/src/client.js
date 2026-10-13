const $=id=>document.getElementById(id);
function downloadFile(blob,filename){const url=URL.createObjectURL(blob),link=document.createElement('a');link.href=url;link.download=filename;document.body.append(link);link.click();link.remove();setTimeout(()=>URL.revokeObjectURL(url),30000);}
const events=generateMatch();let index=0,mode='fan',playing=false,timer,revision=0,controller,analyzing=false,commentaryEnabled=false;
for(const player of [...new Set(events.map(e=>e.player))]){const option=document.createElement('option');option.value=player;option.textContent=player;$('favorite-player').append(option);for(const id of ['compare-first','compare-second']){const pick=document.createElement('option');pick.value=player;pick.textContent=player;$(id).append(pick);}}
$('compare-first').value=events[0].player;$('compare-second').value=events.find(e=>e.player!==events[0].player).player;
const matchesPreference=e=>($('favorite').value==='all'||e.team===$('favorite').value)&&(!$('favorite-player').value||$('favorite-player').value==='all'||e.player===$('favorite-player').value);
let chatHistory=[],chatScope='',lastReplyText='',comparisonActive=false;
function chatMessage(role,text){$('app-shell').setAttribute('data-chat-start','false');const item=document.createElement('div');item.className='chat-message '+role;const label=document.createElement('strong'),body=document.createElement('p');label.textContent=(role==='user'?'You':'PRO-VISION')+' · '+events[index].id;body.sourceLabel=label;body.textContent=text;item.append(label,body);$('chat-messages').append(item);$('chat-messages').scrollTop=$('chat-messages').scrollHeight;return body;}
$('chat-clear').addEventListener('click',()=>{stopDictation();chatHistory=[];$('chat-messages').replaceChildren();$('followup-suggestions').replaceChildren();$('app-shell').setAttribute('data-chat-start','true');render();});
let activeEvidence=[],evidenceTour=null;
const time=second=>Math.floor(second/60)+':'+String(second%60).padStart(2,'0');
const Recognition=globalThis.SpeechRecognition||globalThis.webkitSpeechRecognition;
let dictation=null,dictationActive=false,dictationRevision=0;
const symbols={pass:'↗',shot:'◎',tackle:'⇄',pressure:'◇'};
function render(keepEvidenceTour=false) {
  if(keepEvidenceTour!==true){evidenceTour=null;$('evidence-tour').hidden=true;}
  stopDictation();
  updateQuestionSuggestions();$('followup-suggestions').replaceChildren();
  $('lens-results').hidden=true;$('director-trace').hidden=true;
  cancelCommentary();lastReplyText='';$('read-answer').disabled=true;
  const facts=interpret(events,index),e=facts.event,stats=facts.stats;
  $('score').textContent=stats[0].goals+' : '+stats[1].goals;$('clock').textContent=time(e.second)+' · '+(playing?'REPLAYING':'REPLAY');
  $('pattern').textContent=facts.pattern;$('event-id').textContent=e.id+' / '+time(e.second);$('event-title').textContent=e.player+' · '+e.type.charAt(0).toUpperCase()+e.type.slice(1);$('event-detail').textContent=e.team+' / '+e.outcome;$('chat-context').textContent=`Fictional match · ${e.player} · ${e.type} · ${time(e.second)} (${e.id})`;$('card-moment').textContent=`Selected moment: ${e.id} · ${time(e.second)} · ${e.player} · ${e.type} (${e.outcome}).`;$('event-symbol').textContent=symbols[e.type];
  $('scrub').value=index;$('event-count').textContent=(index+1)+' / '+events.length;
  $('chat-start-shot').disabled=!events.some(e=>e.type==='shot'&&matchesPreference(e));$('prev').disabled=index===0;$('next').disabled=index===events.length-1;
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
  renderMatchReport();revision++;controller?.abort();setAnalyzing(analyzing);
  $('notice').textContent='Instant local explanation. Choose Generate AI insight for a model interpretation.';
  if(playing) speakCommentary();
}
function findNextHighlight(type){return events.findIndex((e,i)=>i>index&&matchesPreference(e)&&(type==='goal'?e.outcome==='goal':e.type===type));}
function jumpToHighlight(type){const next=findNextHighlight(type);if(next<0)return;stop();index=next;render();$('highlight-status').textContent=`Selected ${type}: ${events[index].id} at ${time(events[index].second)}.`;}
$('next-shot').addEventListener('click',()=>jumpToHighlight('shot'));
$('next-goal').addEventListener('click',()=>jumpToHighlight('goal'));
function showEvidence(ids){activeEvidence=ids.filter(id=>events.some(e=>e.id===id&&e.second<=events[index].second));$('show-why').disabled=analyzing||!activeEvidence.length;$('evidence').replaceChildren(...ids.map(id=>{const button=document.createElement('button');button.className='evidence-link';button.textContent=id;button.setAttribute('aria-label','Inspect recorded event '+id);button.addEventListener('click',()=>{const target=events.findIndex(e=>e.id===id);if(target<0)return;stop();index=target;render();});return button;}));}
function renderEvents(){const filter=$('filter').value,favorite=$('favorite').value;const filtered=events.map((e,i)=>({e,i})).filter(({e})=>matchesPreference(e)&&(filter==='all'||(filter==='key'?['shot','tackle'].includes(e.type):filter==='goal'?e.outcome==='goal':e.type===filter)));
  $('events').replaceChildren(...filtered.map(({e,i})=>{const button=document.createElement('button');button.setAttribute('aria-pressed',String(i===index));button.className='event-row'+(i===index?' current':'');const stamp=document.createElement('span'),details=document.createElement('span'),strong=document.createElement('strong'),small=document.createElement('small'),symbol=document.createElement('b');stamp.textContent=time(e.second);strong.textContent=e.player+' · '+e.type;small.textContent=e.team+' / '+e.outcome;symbol.textContent=symbols[e.type];details.append(strong,small);button.append(stamp,details,symbol);button.addEventListener('click',()=>{stop();index=i;render();});return button;}));
  if(!filtered.length)$('events').textContent='No events match these filters.';
}
function setAnalyzing(busy){analyzing=busy;$('director').disabled=busy;$('show-why').disabled=busy||!activeEvidence.length;$('chat-clear').disabled=busy;$('suggestion').disabled=busy;$('suggestion').textContent=busy?'Generating…':'Generate AI insight ↗';$('send-question').disabled=busy;$('dictate').disabled=busy||!Recognition||location.protocol==='file:';$('insight').setAttribute('aria-busy',String(busy));}
async function analyze(question='',useDirector=false){
  if(analyzing)return;
  stopDictation();
  const scope=JSON.stringify([index,mode,$('language').value,$('favorite').value,$('favorite-player').value]);if(chatScope!==scope){chatHistory=[];chatScope=scope;}
  const userQuestion=question.trim()||'Why might this moment matter?';
  $('chat-messages').querySelector('.chat-welcome')?.remove();chatMessage('user',userQuestion);const reply=chatMessage('assistant','Thinking…');$('question').value='';updateQuestionSuggestions();
  const remember=(text,provider='local')=>{reply.textContent=text;lastReplyText=text;$('read-answer').disabled=!speechAvailable;reply.sourceLabel.textContent='PRO-VISION · '+events[index].id+' · '+(provider==='azure'?'AZURE AI':provider==='foundry-local'?'LOCAL AI':'RECORDED / RULE-BASED');chatHistory.push({role:'user',content:userQuestion.slice(0,2000)},{role:'assistant',content:text.slice(0,2000)});chatHistory=chatHistory.slice(-4);showFollowups();};
  if(!useDirector){
  const schedule=fixtureAnswer(question);if(schedule){remember(schedule.text);$('insight').textContent=schedule.text;$('provider').textContent='DEMO FIXTURES · NO AI REQUEST';showEvidence([]);$('notice').textContent='Open Matchday to browse these fictional fixtures.';return;}
  const direct=footballAnswer(interpret(events,index),question,mode,{team:$('favorite').value},$('language').value)||recordedAnswer(interpret(events,index),question,$('language').value);
  if(direct){remember(direct.text);$('insight').textContent=direct.text;$('provider').textContent='RECORDED FACTS · NO AI REQUEST';showEvidence(direct.evidence);$('notice').textContent='Answered directly from the event record.';return;}
  }
  const token=++revision;controller?.abort();controller=new AbortController();const ownController=controller;
  if(location.protocol==='file:'){$('insight').textContent=explain(interpret(events,index),mode,question,$('language').value);remember($('insight').textContent);$('provider').textContent='LOCAL EXPLANATION · RULE-BASED';showEvidence(interpret(events,index).evidence);$('notice').textContent='Standalone demo: local explanations. Run the server to connect Azure AI.';return;}
  $('notice').textContent='Generating an evidence-linked interpretation…';
  setAnalyzing(true);let timedOut=false;const deadline=setTimeout(()=>{timedOut=true;ownController.abort();},75000);
  try{const response=await fetch(useDirector?'/api/director':'/api/analyze',{method:'POST',headers:{'content-type':'application/json'},signal:ownController.signal,body:JSON.stringify({index,mode,question,history:chatHistory,team:$('favorite').value,player:$('favorite-player').value||'all',language:$('language').value})});if(!response.ok)throw new Error('Request failed');const result=await response.json();if(token!==revision){reply.textContent='Moment changed. Ask about the newly selected event.';return;}const responseIndex=useDirector?result.index:index;if(typeof result.text!=='string'||result.text.length>20000||!Array.isArray(result.evidence)||result.evidence.some(id=>!events.slice(0,responseIndex+1).some(e=>e.id===id))||(useDirector&&(!Number.isInteger(responseIndex)||responseIndex<0||responseIndex>index||!Array.isArray(result.trace)||result.trace.some(step=>typeof step?.step!=='string'))))throw new Error('Invalid narrative response');if(useDirector&&Number.isInteger(result.index)&&result.index>=0&&result.index<=index){index=result.index;render();chatScope=JSON.stringify([index,mode,$('language').value,$('favorite').value,$('favorite-player').value]);$('director-trace').hidden=false;$('director-trace').textContent=(result.workflow==='tool-using'?'Azure tool workflow':'Recorded rule-based workflow')+' · '+(result.trace||[]).map(step=>step.step.replaceAll('_',' ')).join(' → ')+(result.cached?' · saved result':'');}remember(result.text,result.provider);$('insight').textContent=result.text;$('provider').textContent=result.provider==='foundry-local'?'FOUNDRY LOCAL AI · GENERATED INTERPRETATION':result.provider==='azure'?'AZURE AI · GENERATED INTERPRETATION':'LOCAL EXPLANATION · RULE-BASED';$('notice').textContent=(result.notice||'')+(result.latencyMs!==undefined?' Response: '+(result.latencyMs/1000).toFixed(1)+' s.':'');showEvidence(result.evidence);updateUsage();}catch(error){if((error.name==='AbortError'&&!timedOut)||token!==revision){reply.textContent='Moment changed. Ask about the newly selected event.';return;}$('insight').textContent=explain(interpret(events,index),mode,question,$('language').value);$('provider').textContent='LOCAL EXPLANATION · RULE-BASED';showEvidence(interpret(events,index).evidence);remember($('insight').textContent);$('notice').textContent=(timedOut?'The response took too long. ':'Narrative service unavailable. ')+'Showing the local explanation.';}finally{clearTimeout(deadline);setAnalyzing(false);updateUsage();}
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
$('ask-form').addEventListener('submit',event=>{event.preventDefault();stop();const question=$('question').value.trim();if(!question){$('notice').textContent='Type a question or choose a suggested prompt.';$('question').focus?.();return;}analyze(question);});$('suggestion').addEventListener('click',()=>{stop();analyze($('question').value.trim());});
function makeRecap(){const text=recap(events.slice(0,index+1),mode,$('favorite').value,$('language').value);$('recap').textContent=text;return text;}
$('generate').addEventListener('click',makeRecap);$('export').addEventListener('click',()=>{const text=makeRecap();const blob=new Blob(['PRO-VISION AI / '+mode+' perspective\n\n'+text+'\n\nOriginal synthetic data. Replay time: '+time(events[index].second)],{type:'text/plain'});downloadFile(blob,'provision-match-recap.txt');});
if(location.protocol==='file:'){
  const link=document.querySelector('a[download="provision-synthetic-match.json"]');
  link.href=URL.createObjectURL(new Blob([JSON.stringify({provenance:'Original synthetic PRO-VISION football events, seed 26. Not real match data.',pitch:{length:105,width:68},events},null,2)],{type:'application/json'}));
}
render();

async function updateUsage(){if(location.protocol==='file:')return;try{const r=await fetch('/api/usage');if(!r.ok)return;const u=await r.json();if(u.available===false){$('usage-status').textContent='Cloud AI is disabled while usage controls are unavailable. Recorded facts and local explanations still work.';return;}$('usage-status').textContent=`AI requests: ${u.today}/${u.dailyLimit} today · ${u.thisMonth}/${u.monthlyLimit} this month. Cached responses use no new request.`;}catch{}}
updateUsage();

$('compare-lenses').addEventListener('click',()=>{const facts=interpret(events,index),language=$('language').value;$('fan-lens').textContent=explain(facts,'fan','',language);$('coach-lens').textContent=explain(facts,'coach','',language);$('lens-results').hidden=false;});

let selectedCard=null,cardBack=false,cardPhoto='',cardMediaKind='none',cardVideoURL=null,mediaRevision=0,pngExporting=false;
function renderCard(){if(!selectedCard)return;const svg=tradingCardSVG(selectedCard,cardBack);$('card-art').innerHTML=svg;$('card-shirt-art').setAttribute('href','data:image/svg+xml;charset=utf-8,'+encodeURIComponent(tradingCardSVG(selectedCard)));$('card-flip').textContent=cardBack?'View front':'View back';for(const id of ['card-flip','card-download','card-replay'])$(id).disabled=false;$('card-png').disabled=pngExporting;}
function mediaReady(start,message){return new Promise((resolve,reject)=>{const timeout=setTimeout(()=>reject(new Error(message)),15000);const fail=error=>{clearTimeout(timeout);reject(error);};try{start(value=>{clearTimeout(timeout);resolve(value);},fail);}catch(error){fail(error);}});}
function cardFeedback(message){$('card-status').textContent=message;$('card-status').scrollIntoView?.({behavior:'smooth',block:'center'});}
function frameImage(source,width,height){if(!width||!height)throw new Error('This photo or frame could not be decoded. Try a JPEG or PNG photo.');const canvas=document.createElement('canvas'),scale=Math.min(1,1024/Math.max(width,height));canvas.width=Math.round(width*scale);canvas.height=Math.round(height*scale);canvas.getContext('2d').drawImage(source,0,0,canvas.width,canvas.height);return canvas.toDataURL('image/jpeg',.85);}
$('card-media').addEventListener('change',async()=>{
 const revision=++mediaRevision,file=$('card-media').files?.[0];cardPhoto='';cardMediaKind='none';$('card-capture').disabled=true;$('card-video').pause?.();$('card-video').hidden=true;$('card-video').removeAttribute?.('src');if(cardVideoURL){URL.revokeObjectURL(cardVideoURL);cardVideoURL=null;}
 $('card-create').disabled=false;
 if(!file){$('card-status').textContent='No media selected. You can still create a match memory card.';return;}
 $('card-status').textContent='Preparing your media…';
 $('card-create').disabled=true;
 try{
  const mediaType=file.type||({png:'image/png',jpg:'image/jpeg',jpeg:'image/jpeg',webp:'image/webp',mp4:'video/mp4',webm:'video/webm',mov:'video/quicktime'}[file.name?.split('.').pop().toLowerCase()]||'');
  if(['image/png','image/jpeg','image/webp'].includes(mediaType)){
   if(file.size>5*1024*1024)throw new Error('Choose a photo up to 5 MB.');
   const data=await mediaReady((resolve,reject)=>{const reader=new FileReader();reader.onload=()=>resolve(reader.result);reader.onerror=reader.onabort=()=>reject(new Error('Photo could not be read. Choose it again.'));reader.readAsDataURL(file);},'Photo loading timed out. Choose a JPEG or PNG again.');
   const image=await mediaReady((resolve,reject)=>{const img=new Image();img.onload=()=>resolve(img);img.onerror=()=>reject(new Error('Photo could not be decoded.'));img.src=data;},'Photo decoding timed out. Choose a JPEG or PNG again.');
   if(revision!==mediaRevision)return;cardPhoto=frameImage(image,image.naturalWidth,image.naturalHeight);cardMediaKind='photo';$('card-status').textContent='Photo ready. Create your card to attach it.';
  }else if(['video/mp4','video/webm','video/quicktime'].includes(mediaType)){
   if(file.size>30*1024*1024)throw new Error('Choose a video up to 30 MB.');
   cardVideoURL=URL.createObjectURL(file);$('card-video').src=cardVideoURL;$('card-video').hidden=false;$('card-status').textContent='Play or scrub your video, pause on a frame, then select Use this video frame.';
  }else throw new Error('Choose a PNG, JPEG, WebP, MP4, WebM or MOV file. For an iPhone HEIC photo, export it as JPEG first.');
 }catch(error){if(revision===mediaRevision)cardFeedback(error.message);}finally{if(revision===mediaRevision)$('card-create').disabled=false;}
});
$('card-video').addEventListener('loadeddata',()=>{const video=$('card-video');if(video.currentSrc&&video.currentSrc!==cardVideoURL)return;$('card-capture').disabled=video.hidden;});
$('card-video').addEventListener('error',()=>{if(!cardVideoURL||($('card-video').currentSrc&&$('card-video').currentSrc!==cardVideoURL))return;URL.revokeObjectURL(cardVideoURL);cardVideoURL=null;cardPhoto='';cardMediaKind='none';$('card-video').hidden=true;$('card-capture').disabled=true;$('card-create').disabled=false;cardFeedback('This browser cannot play that video. Try an MP4 or a photo, or create a card without media.');});
$('card-capture').addEventListener('click',()=>{try{const video=$('card-video');if(video.readyState<2||!video.videoWidth)throw new Error('Wait for a playable video frame.');video.pause();cardPhoto=frameImage(video,video.videoWidth,video.videoHeight);cardMediaKind='video-frame';$('card-status').textContent='Video frame selected. Create your card to keep this still image.';}catch(error){cardFeedback(error.message);}});
$('card-create').addEventListener('click',()=>{try{if(cardVideoURL&&!cardPhoto)throw new Error('Choose Use this video frame before creating your card.');const memory=createTradingMemory(index,{name:$('card-name').value,note:$('card-note').value,photo:cardPhoto,mediaKind:cardMediaKind});selectedCard=memory;cardBack=false;renderCard();$('card-art').focus?.({preventScroll:true});$('card-art').scrollIntoView?.({behavior:'smooth',block:'start'});$('card-status').textContent=`Card created for ${selectedCard.eventId}. Download to keep it; this page does not save your personal media.`;}catch(error){cardFeedback(error.message);}});
$('card-flip').addEventListener('click',()=>{if(selectedCard){cardBack=!cardBack;renderCard();}});
$('card-download').addEventListener('click',()=>{if(!selectedCard)return;downloadFile(new Blob([tradingCardSVG(selectedCard,cardBack)],{type:'image/svg+xml'}),`pro-vision-card-${selectedCard.eventId}-${cardBack?'back':'front'}.svg`);});
$('card-png').addEventListener('click',async()=>{
 if(!selectedCard||pngExporting)return;pngExporting=true;
 const memory=selectedCard,back=cardBack,button=$('card-png');button.disabled=true;button.textContent='Preparing PNG…';
 try{
  const svg=tradingCardSVG(memory,back);
  const image=await mediaReady((resolve,reject)=>{const img=new Image();img.onload=()=>resolve(img);img.onerror=()=>reject(new Error('PNG export could not load. Use Download SVG instead.'));img.src='data:image/svg+xml;charset=utf-8,'+encodeURIComponent(svg);},'PNG export timed out. Use Download SVG instead.');
  const canvas=document.createElement('canvas');canvas.width=1200;canvas.height=1680;canvas.getContext('2d').drawImage(image,0,0,1200,1680);
  const blob=await new Promise((resolve,reject)=>canvas.toBlob(b=>b?resolve(b):reject(new Error('PNG export unavailable. Use Download SVG instead.')),'image/png'));
  downloadFile(blob,`pro-vision-card-${memory.eventId}-${back?'back':'front'}.png`);
  cardFeedback('PNG download started. On a phone, find it in Downloads or Files; your browser may show a save prompt.');
 }catch(error){cardFeedback(error.message);}finally{pngExporting=false;button.disabled=false;button.textContent='Download PNG';}
});
$('card-replay').addEventListener('click',()=>{if(!selectedCard)return;stop();index=selectedCard.index;selectScreen('match');render();$('pitch').scrollIntoView?.({behavior:'smooth',block:'center'});$('card-status').textContent='Simulated tap reopened '+selectedCard.eventId+'. No physical tag was scanned.';});
$('card-shirt-color').addEventListener('change',()=>{const color=$('card-shirt-color').value;$('card-shirt-body').setAttribute('fill',['#061225','#f1f5f9','#e8a28b'].includes(color)?color:'#061225');});

function suggestedQuestions(){const es=$('language').value==='es',type=events[index].type;return es?['¿Qué ocurrió en este momento?','¿Por qué importa este '+({pass:'pase',shot:'tiro',tackle:'cambio de posesión',pressure:'evento de presión'}[type])+'?','¿Cuál es el marcador?','Explica eso de forma más sencilla.']:['What happened in this moment?','Why does this '+({pass:'pass',shot:'shot',tackle:'turnover',pressure:'pressure event'}[type])+' matter?','What is the score?',`How is ${events[index].player} doing so far?`,'Explain that more simply.'];}
function updateQuestionSuggestions(){const typed=$('question').value.trim().toLowerCase(),suggestions=suggestedQuestions();const matching=typed?suggestions.filter(q=>q.toLowerCase().includes(typed)):suggestions.slice(0,4);$('question-suggestions').replaceChildren(...matching.map(q=>{const button=document.createElement('button');button.type='button';button.textContent=q;button.addEventListener('click',()=>{$('question').value=q;$('question').focus?.();updateQuestionSuggestions();});return button;}));}
function showFollowups(){
 const es=$('language').value==='es',player=events[index].player;
 const questions=es?['Explica eso de forma más sencilla.',`Estadísticas de ${player}`]:['Explain that more simply.',`How is ${player} doing so far?`];
 $('followup-suggestions').replaceChildren(...questions.map(question=>{const button=document.createElement('button');button.type='button';button.textContent=question;button.addEventListener('click',()=>{$('question').value=question;updateQuestionSuggestions();$('ask-form').scrollIntoView?.({behavior:'smooth',block:'center'});$('question').focus?.();});return button;}));
}
$('explore-moment').addEventListener('click',()=>{selectScreen('match');chooseShot();$('pitch').scrollIntoView?.({behavior:'smooth',block:'center'});});
for(const id of ['make-memory','keep-moment'])$(id).addEventListener('click',()=>selectScreen('studio'));
$('question').addEventListener('input',updateQuestionSuggestions);
$('start-experience').addEventListener('click',()=>{selectScreen('chat');if(!chooseShot())return;$('question').value=$('language').value==='es'?'¿Por qué importa este tiro?':'Why does this shot matter?';updateQuestionSuggestions();$('ask-form').scrollIntoView?.({behavior:'smooth',block:'center'});$('question').focus?.();});
function stopDictation(){dictationRevision++;if(dictationActive&&dictation){dictationActive=false;dictation.abort();$('dictation-status').textContent='Speech input stopped. Review your text or type a question.';$('dictate').textContent='🎙';$('dictate').setAttribute('aria-pressed','false');}}
$('dictate').disabled=!Recognition||location.protocol==='file:';
if(!Recognition||location.protocol==='file:')$('dictation-status').textContent='Speech input is unavailable in this browser. Type your question instead.';
else $('dictation-status').textContent='Microphone uses your browser’s speech service, which may process audio remotely. Review text before Send; no Azure transcription call.';
$('dictate').addEventListener('click',()=>{
 if(!Recognition||analyzing)return;
 if(dictationActive){dictation.stop();return;}
 stop();cancelCommentary();const token=++dictationRevision,baseText=$('question').value.trim();dictation=new Recognition();dictation.lang=$('language').value==='es'?'es-ES':'en-US';dictation.continuous=false;dictation.interimResults=false;
 dictation.onresult=event=>{if(token!==dictationRevision)return;const transcript=Array.from(event.results).map(result=>result[0].transcript).join(' ').trim();$('question').value=(baseText+(baseText?' ':'')+transcript).slice(0,500);$('dictation-status').textContent='Voice added to your question. Review it, then select Send.';updateQuestionSuggestions();};
 dictation.onerror=event=>{if(token!==dictationRevision)return;const messages={'not-allowed':'Microphone permission was denied. Allow it in browser settings or type instead.','audio-capture':'No microphone is available. Type your question instead.','no-speech':'No speech detected. Try again or type your question.','network':'The browser speech service is unavailable. Type your question instead.'};$('dictation-status').textContent=messages[event.error]||'Speech input stopped. You can type your question.';};
 dictation.onend=()=>{if(token!==dictationRevision)return;dictationActive=false;$('dictate').textContent='🎙';$('dictate').setAttribute('aria-pressed','false');if($('dictation-status').textContent.startsWith('Listening'))$('dictation-status').textContent='Listening ended. Review the question or try again.';};
 try{dictationActive=true;$('dictate').textContent='Stop';$('dictate').setAttribute('aria-pressed','true');$('dictation-status').textContent='Listening… Speak your question. It will not send automatically.';dictation.start();}catch{dictationActive=false;$('dictate').textContent='🎙';$('dictate').setAttribute('aria-pressed','false');$('dictation-status').textContent='Could not start speech input. Try typing your question.';}
});

function drawEvidenceTour(){if(!evidenceTour)return;const event=events.find(e=>e.id===evidenceTour.ids[evidenceTour.step]);if(!event)return;$('evidence-tour').hidden=false;$('tour-original').textContent=`Explanation for ${evidenceTour.eventId} · ${evidenceTour.provider}`;$('tour-explanation').textContent=evidenceTour.text;$('tour-step').textContent=`RECORD ${evidenceTour.step+1} OF ${evidenceTour.ids.length}`;$('tour-title').textContent=`${event.id} · ${time(event.second)} · ${event.player}`;$('tour-facts').textContent=`${event.team}: ${event.type}, ${event.outcome}. Recorded ball coordinates: (${event.start.x}, ${event.start.y}) → (${event.end.x}, ${event.end.y}) on the 0–100 coordinate scale.`;$('tour-prev').disabled=evidenceTour.step===0;$('tour-next').disabled=evidenceTour.step===evidenceTour.ids.length-1;}
$('show-why').addEventListener('click',()=>{if(analyzing||!activeEvidence.length)return;stop();evidenceTour={ids:[...activeEvidence],step:0,eventId:events[index].id,text:$('insight').textContent,provider:$('provider').textContent};drawEvidenceTour();$('evidence-tour').scrollIntoView?.({behavior:'smooth',block:'nearest'});});
$('tour-prev').addEventListener('click',()=>{if(evidenceTour){evidenceTour.step=Math.max(0,evidenceTour.step-1);drawEvidenceTour();}});
$('tour-next').addEventListener('click',()=>{if(evidenceTour){evidenceTour.step=Math.min(evidenceTour.ids.length-1,evidenceTour.step+1);drawEvidenceTour();}});
$('tour-replay').addEventListener('click',()=>{if(!evidenceTour)return;const target=events.findIndex(e=>e.id===evidenceTour.ids[evidenceTour.step]);if(target<0)return;stop();index=target;selectScreen('match');render(true);drawEvidenceTour();$('pitch').scrollIntoView?.({behavior:'smooth',block:'center'});});
$('tour-close').addEventListener('click',()=>{evidenceTour=null;$('evidence-tour').hidden=true;});

let currentScreen='chat';
function selectScreen(screen){if(!['matchday','match','chat','studio','about'].includes(screen))return;stop();stopDictation();currentScreen=screen;$('chat-preferences').open=screen==='match';$('app-shell').setAttribute('data-screen',screen);$('match-view').hidden=!['match','chat'].includes(screen);$('memory-studio').hidden=screen!=='studio';$('about').hidden=screen!=='about';$('matchday-view').hidden=screen!=='matchday';const titles={matchday:['Matchday','Fictional fixtures. Your teams. A match you can explore.'],match:['Match room','Understand the play. Ask why. Keep the memory.'],chat:['What would you like to know?','Ask about the match. Understand the play. Keep your story.'],studio:['Memory studio','Your photo. Your story. A card connected to the match.'],about:['How PRO-VISION works','Recorded facts, tentative AI interpretations, and personal memories.']};$('screen-title').textContent=titles[screen][0];$('screen-description').textContent=titles[screen][1];globalThis.scrollTo?.({top:0,behavior:'smooth'});for(const key of ['matchday','match','chat','studio','about'])$('nav-'+key).setAttribute('aria-pressed',String(key===screen));}
for(const key of ['matchday','match','chat','studio','about'])$('nav-'+key).addEventListener('click',()=>selectScreen(key));

$('brand-home').addEventListener('click',event=>{event.preventDefault();selectScreen('chat');});
$('skip-to-match').addEventListener('click',event=>{event.preventDefault();selectScreen('match');$('match').scrollIntoView?.({block:'start'});});

for(const team of demoFixtures.flatMap(f=>[f.home,f.away])){const option=document.createElement('option');option.value=team;option.textContent=team;$('fixture-team').append(option);}
function renderFixtures(){const league=$('fixture-league').value||'all',team=$('fixture-team').value||'all';const fixtures=demoFixtures.filter(f=>(league==='all'||league===f.league)&&(team==='all'||[f.home,f.away].includes(team)));$('fixture-list').replaceChildren(...fixtures.map(f=>{const card=document.createElement('article');card.className='fixture-card';const heading=document.createElement('h3'),meta=document.createElement('p'),button=document.createElement('button');heading.textContent=f.home+' vs '+f.away;meta.textContent=f.league+' · '+f.kickoff+' · '+f.status+(f.score?' · '+f.score:'');button.textContent=f.playable?'Open replay ↗':'View summary';button.addEventListener('click',()=>{if(f.playable){stop();index=0;selectScreen('match');render();}else{$('fixture-details').hidden=false;$('fixture-details').textContent=f.summary;}});card.append(heading,meta,button);return card;}));if(!fixtures.length)$('fixture-list').textContent='No demo fixtures match these filters.';}
function askFixtures(question){const answer=fixtureAnswer(question);$('fixture-answer').textContent=answer?.text||'Try “Show me today’s matches” or name a demo team, such as “When does Northbridge play?” Real fixtures and additional player data are not connected.';}
for(const id of ['fixture-league','fixture-team'])$(id).addEventListener('change',()=>{$('fixture-details').hidden=true;renderFixtures();});
$('fixture-form').addEventListener('submit',event=>{event.preventDefault();askFixtures($('fixture-question').value);});
$('fixture-today').addEventListener('click',()=>askFixtures('Show me today’s matches'));
$('fixture-northbridge').addEventListener('click',()=>askFixtures('When does Northbridge play?'));
renderFixtures();

$('open-current-match').addEventListener('click',()=>selectScreen('match'));
function chooseShot(){const next=findNextHighlight('shot'),target=events[index].type==='shot'&&matchesPreference(events[index])?index:next>=0?next:events.findIndex(e=>e.type==='shot'&&matchesPreference(e));if(target<0){$('notice').textContent='No recorded shots match your team/player filters.';return false;}stop();index=target;render();return true;}
$('chat-start-shot').addEventListener('click',()=>{if(!chooseShot())return;selectScreen('chat');$('question').value=$('language').value==='es'?'¿Por qué importa este tiro?':'Why does this shot matter?';updateQuestionSuggestions();$('question').focus?.();});
selectScreen('chat');

function renderMatchReport(){
 const report=matchReport(events,index,mode,$('favorite').value,$('language').value);
 $('report-through').textContent=`Fictional match · through ${time(report.second)} (${report.through}). No future events.`;
 $('report-teams').replaceChildren(...report.teams.map(team=>{const row=document.createElement('tr');for(const value of [team.team,team.goals,team.shots,team.shotsOnTarget,`${team.completed}/${team.passes}`,team.passes?team.accuracy+'%':'No passes',team.pressure]){const cell=document.createElement('td');cell.textContent=value;row.append(cell);}return row;}));
 $('report-goals').replaceChildren(...report.goals.map(goal=>{const button=document.createElement('button');button.textContent=`${time(goal.second)} · ${goal.player} · ${goal.team}`;button.addEventListener('click',()=>{stop();index=goal.index;render();$('pitch').scrollIntoView?.({behavior:'smooth',block:'center'});});return button;}));
 if(!report.goals.length)$('report-goals').textContent='No goals recorded through this moment.';
 if(comparisonActive)renderPlayerComparison();
}
function renderPlayerComparison(){const comparison=comparePlayers(interpret(events,index),$('compare-first').value,$('compare-second').value,$('language').value);$('player-comparison').textContent=comparison?.text||'Choose two different recorded players.';}
$('compare-players').addEventListener('click',()=>{comparisonActive=true;renderPlayerComparison();});
for(const id of ['compare-first','compare-second'])$(id).addEventListener('change',()=>{if(comparisonActive)renderPlayerComparison();});
$('open-report').addEventListener('click',()=>{selectScreen('match');$('match-report').scrollIntoView?.({behavior:'smooth',block:'start'});});
$('review-full-match').addEventListener('click',()=>{stop();index=events.length-1;render();$('match-report').scrollIntoView?.({behavior:'smooth',block:'start'});});
$('download-report').addEventListener('click',()=>downloadFile(new Blob([JSON.stringify(matchReport(events,index,mode,$('favorite').value,$('language').value),null,2)],{type:'application/json'}),`pro-vision-report-${events[index].id}.json`));
$('read-answer').disabled=true;
$('read-answer').addEventListener('click',()=>{if(!speechAvailable||!lastReplyText)return;cancelCommentary();const utterance=new SpeechSynthesisUtterance(lastReplyText);utterance.lang=$('language').value==='es'?'es-ES':'en-US';utterance.onerror=e=>{if(!['canceled','interrupted'].includes(e?.error))$('notice').textContent='Voice playback is unavailable. Your answer remains visible.';};speechSynthesis.speak(utterance);});

$('director').addEventListener('click',()=>{stop();analyze($('language').value==='es'?'Encuentra un momento importante hasta ahora.':'Find a key moment so far.',true);});
