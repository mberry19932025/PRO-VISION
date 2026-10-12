import test from 'node:test';
import assert from 'node:assert/strict';
import vm from 'node:vm';
import {readFile} from 'node:fs/promises';
import * as core from '../src/core.js';
const html=await readFile(new URL('../src/index.html',import.meta.url),'utf8');
const pageIds=new Set([...html.matchAll(/\bid="([^"]+)"/g)].map(m=>m[1]));
const source=await readFile(new URL('../src/client.js',import.meta.url),'utf8');
function harness(fetch,extras={}){
 const elements=new Map();
 function element(){return {click(){this.clicked=true;},textContent:'',value:'',disabled:false,attrs:{},listeners:{},classList:{toggle(){}},setAttribute(k,v){this.attrs[k]=v;},replaceChildren(...children){this.children=children;},append(...items){this.children=[...(this.children||[]),...items];},addEventListener(k,f){this.listeners[k]=f;},querySelector(){return this.button||(this.button=element());}};}
 const get=id=>{assert.ok(pageIds.has(id),'Missing page control: '+id);if(!elements.has(id))elements.set(id,element());return elements.get(id);};
 get('language').value='en';get('favorite').value='all';get('filter').value='all';
 const context=vm.createContext({...core,document:{getElementById:get,createElement:tag=>tag==='canvas'&&extras.testCanvas?extras.testCanvas:element(),createElementNS:element,querySelectorAll:()=>[]},location:{protocol:'http:'},fetch,AbortController,URL,Blob,setTimeout,clearInterval,setInterval,...extras});
 vm.runInContext(source,context);
 return {context,get,run:code=>vm.runInContext(code,context)};
}
test('client makes no AI call on page load or event navigation and prevents double submission',async()=>{
 let calls=0,resolve;
 const h=harness(async url=>{if(url==='/api/usage')return {ok:false};calls++;return await new Promise(r=>resolve=r);});
 h.get('next').listeners.click();assert.equal(calls,0);
 const first=h.run('analyze()');await h.run('analyze()');assert.equal(calls,1);assert.equal(h.get('send-question').disabled,true);
 resolve({ok:true,json:async()=>({provider:'azure',text:'Interpretation',evidence:['EV-002']})});await first;
 assert.equal(h.get('suggestion').disabled,false);assert.match(h.get('provider').textContent,/AZURE AI/);
});
test('client replaces stale AI label on network failure and discards responses after navigation',async()=>{
 let fail=true,resolve;
 const h=harness(async url=>{if(url==='/api/usage')return {ok:false};if(fail)throw new Error('offline');return await new Promise(r=>resolve=r);});
 h.get('provider').textContent='AZURE AI';await h.run('analyze()');assert.match(h.get('provider').textContent,/LOCAL EXPLANATION/);
 fail=false;const pending=h.run('analyze()');h.get('next').listeners.click();const local=h.get('insight').textContent;
 resolve({ok:true,json:async()=>({provider:'azure',text:'Old event response',evidence:['EV-001']})});await pending;
 assert.equal(h.get('insight').textContent,local);assert.equal(h.get('suggestion').disabled,false);
});

test('asking during replay pauses the clock and replay boundary controls are correct',async()=>{
 const h=harness(async url=>url==='/api/usage'?{ok:false}:{ok:true,json:async()=>({provider:'local',text:'Local insight',evidence:['EV-001']})});
 assert.equal(h.get('prev').disabled,true);assert.equal(h.get('next').disabled,false);
 h.run("playing=true;$('clock').textContent='0:30 · REPLAYING'");
 h.get('ask-form').listeners.submit({preventDefault(){}});
 assert.equal(h.get('clock').textContent,'0:30 · REPLAY');
 h.get('scrub').value='179';h.get('scrub').listeners.input();assert.equal(h.get('next').disabled,true);assert.equal(h.get('prev').disabled,false);
 h.get('reset').listeners.click();assert.equal(h.get('prev').disabled,true);
});
test('Spanish recap follows the selected language',()=>{
 const h=harness(async()=>({ok:false}));h.get('language').value='es';h.get('language').listeners.change();
 const text=h.run('makeRecap()');assert.match(text,/eventos sintéticos/);assert.doesNotMatch(text,/selected replay point/);
});

test('fan highlights respect selected team, stop at the end and make no AI calls',()=>{
 let calls=0;const h=harness(async url=>{if(url!=='/api/usage')calls++;return {ok:false};});
 h.get('favorite').value='Harbour United';h.get('favorite').listeners.change();h.get('next-shot').listeners.click();
 const selected=h.run('events[index]');assert.equal(selected.team,'Harbour United');assert.equal(selected.type,'shot');
 h.get('next-goal').listeners.click();assert.equal(h.run('events[index].outcome'),'goal');assert.equal(h.run('events[index].team'),'Harbour United');
 h.get('scrub').value='179';h.get('scrub').listeners.input();assert.equal(h.get('next-shot').disabled,true);assert.equal(h.get('next-goal').disabled,true);assert.equal(calls,0);
});
test('goals-only list contains only goals for the chosen team',()=>{
 const h=harness(async()=>({ok:false}));h.get('favorite').value='Northbridge FC';h.get('filter').value='goal';h.get('filter').listeners.change();
 const expected=core.generateMatch().filter(e=>e.team==='Northbridge FC'&&e.outcome==='goal').length;
 assert.equal(h.get('events').children.length,expected);
});

test('fan recorded-fact shortcuts are free and evidence links navigate correctly',async()=>{
 let calls=0;const h=harness(async url=>{if(url!=='/api/usage')calls++;return {ok:false};});
 h.get('ask-score').listeners.click();assert.match(h.get('insight').textContent,/Recorded score/);assert.match(h.get('provider').textContent,/NO AI REQUEST/);
 h.get('ask-distance').listeners.click();assert.match(h.get('insight').textContent,/13.1 m/);assert.equal(calls,0);
 h.get('scrub').value='9';h.get('scrub').listeners.input();const evidence=h.get('evidence').children;assert.ok(evidence.length>1);
 evidence[0].listeners.click();assert.equal(h.run('events[index].id'),evidence[0].textContent);assert.equal(calls,0);
});

test('commentary is opt-in, narrates recorded events and cancels on pause/navigation',()=>{
 const spoken=[];let cancels=0,delay;
 const h=harness(async()=>({ok:false}),{speechSynthesis:{cancel(){cancels++;},speak(u){spoken.push(u);}},SpeechSynthesisUtterance:class{constructor(text){this.text=text;}},setInterval(fn,ms){delay=ms;return 1;},clearInterval(){}});
 assert.equal(spoken.length,0);assert.equal(h.get('commentary-toggle').attrs['aria-pressed'],'false');
 h.get('commentary-toggle').listeners.click();assert.equal(spoken.length,0);
 h.get('play').listeners.click();assert.equal(spoken.length,1);assert.equal(spoken[0].text,core.commentaryLine(core.generateMatch()[0]));assert.equal(delay,5000);
 const before=cancels;h.get('play').listeners.click();assert.ok(cancels>before);assert.equal(spoken.length,1);
 h.get('next').listeners.click();assert.equal(spoken.length,1);
 h.get('language').value='es';h.get('play').listeners.click();assert.equal(spoken.at(-1).lang,'es-ES');
 h.get('commentary-toggle').listeners.click();assert.equal(delay,1200);assert.equal(h.get('commentary-toggle').attrs['aria-pressed'],'false');
});
test('unsupported browsers disable commentary gracefully',()=>{const h=harness(async()=>({ok:false}));assert.equal(h.get('commentary-toggle').disabled,true);assert.match(h.get('commentary-status').textContent,/unavailable/);});

test('conversation retains follow-ups and resets model context when the event changes',async()=>{
 const requests=[];const h=harness(async(url,options)=>{if(url==='/api/usage')return {ok:false};requests.push(JSON.parse(options.body));return {ok:true,json:async()=>({provider:'azure',text:'This may help progress play.',evidence:['EV-001']})};});
 await h.run("analyze('Why does this matter?')");await h.run("analyze('Explain that more simply')");assert.equal(requests[1].history.length,2);assert.equal(requests[1].history[0].content,'Why does this matter?');assert.equal(h.get('chat-messages').children.length,4);
 h.get('next').listeners.click();await h.run("analyze('Explain this moment')");assert.equal(requests[2].history.length,0);
 h.get('chat-clear').listeners.click();assert.equal(h.get('chat-messages').children.length,0);
});

test('player-following filters highlights and preferences reach AI requests',async()=>{
 let sent;const h=harness(async(url,options)=>{if(url==='/api/usage')return {ok:false};sent=JSON.parse(options.body);return {ok:true,json:async()=>({provider:'local',text:'Local',evidence:[]})};});
 const shooter=core.generateMatch().find(e=>e.type==='shot').player;h.get('favorite-player').value=shooter;h.get('favorite-player').listeners.change();h.get('next-shot').listeners.click();assert.equal(h.run('events[index].player'),shooter);
 await h.run("analyze('Why does this matter?')");assert.equal(sent.player,shooter);assert.equal(sent.team,'all');
});
test('two-lens comparison uses identical event context without model requests',()=>{
 let calls=0;const h=harness(async url=>{if(url!=='/api/usage')calls++;return {ok:false};});
 h.get('compare-lenses').listeners.click();assert.equal(h.get('lens-results').hidden,false);assert.notEqual(h.get('fan-lens').textContent,h.get('coach-lens').textContent);assert.ok(h.get('fan-lens').textContent.includes('Vale'));assert.ok(h.get('coach-lens').textContent.includes('Vale'));assert.equal(calls,0);
 h.get('next').listeners.click();assert.equal(h.get('lens-results').hidden,true);
});

test('recap download contains only the selected replay point and chosen language',async()=>{
 const blobs=[];const urls=[];class FakeURL extends URL{static createObjectURL(blob){blobs.push(blob);return 'blob:demo';}static revokeObjectURL(url){urls.push(url);}}
 const h=harness(async()=>({ok:false}),{URL:FakeURL,setTimeout(fn){fn();}});
 h.get('language').value='es';h.get('export').listeners.click();assert.equal(blobs.length,1);const text=await blobs[0].text();assert.match(text,/eventos sintéticos/);assert.match(text,/Replay time: 0:30/);assert.equal(urls[0],'blob:demo');
});

test('memory card creation, flip, shirt color and simulated replay work without AI',()=>{
 let calls=0;const h=harness(async url=>{if(url!=='/api/usage')calls++;return {ok:false};});h.get('scrub').value='9';h.get('scrub').listeners.input();h.get('card-name').value='My moment';h.get('card-note').value='I loved this save';h.get('card-create').listeners.click();assert.match(h.get('card-art').innerHTML,/My moment/);assert.equal(h.get('card-replay').disabled,false);
 h.get('card-flip').listeners.click();assert.match(h.get('card-art').innerHTML,/I loved this save/);h.get('next').listeners.click();h.get('card-replay').listeners.click();assert.equal(h.run('index'),9);assert.match(h.get('card-status').textContent,/No physical tag/);
 h.get('card-shirt-color').value='#f1f5f9';h.get('card-shirt-color').listeners.change();assert.equal(h.get('card-shirt-body').attrs.fill,'#f1f5f9');assert.equal(calls,0);
});

test('chat replies label AI and local answers independently',async()=>{
 const h=harness(async url=>url==='/api/usage'?{ok:false}:{ok:true,json:async()=>({provider:'azure',text:'This may help.',evidence:['EV-001']})});
 await h.run("analyze('Why does this matter?')");assert.match(h.get('chat-messages').children.at(-1).children[0].textContent,/AZURE AI/);
 h.get('ask-score').listeners.click();assert.match(h.get('chat-messages').children.at(-1).children[0].textContent,/RECORDED/);
});
test('video card requires a chosen frame and download freezes the selected card',async()=>{
 const blobs=[];class FakeURL extends URL{static createObjectURL(b){blobs.push(b);return 'blob:demo';}static revokeObjectURL(){}}
 const h=harness(async()=>({ok:false}),{URL:FakeURL,setTimeout(fn){fn();}});h.run("cardVideoURL='blob:video'");h.get('card-create').listeners.click();assert.match(h.get('card-status').textContent,/video frame/);assert.equal(h.run('selectedCard'),null);
 h.run('cardVideoURL=null');h.get('card-create').listeners.click();h.get('next').listeners.click();h.get('card-download').listeners.click();assert.match(await blobs[0].text(),/EV-001/);
});

test('photo loading and video capture populate card artwork without uploads',async()=>{
 const canvas={getContext:()=>({drawImage(){}}),toDataURL:()=> 'data:image/jpeg;base64,AAAA'};
 class Reader{readAsDataURL(){this.result='data:image/png;base64,AAAA';this.onload();}}
 class Photo{naturalWidth=1200;naturalHeight=800;set src(v){this.onload();}}
 let calls=0;const h=harness(async url=>{if(url!=='/api/usage')calls++;return {ok:false};},{testCanvas:canvas,FileReader:Reader,Image:Photo});
 h.get('card-media').files=[{type:'image/png',size:100}];await h.get('card-media').listeners.change();assert.equal(h.get('card-create').disabled,false);h.get('card-create').listeners.click();assert.match(h.get('card-art').innerHTML,/data:image\/jpeg;base64,AAAA/);
 Object.assign(h.get('card-video'),{readyState:2,videoWidth:1280,videoHeight:720,pause(){}});h.get('card-capture').listeners.click();h.get('card-create').listeners.click();assert.equal(h.run('selectedCard.mediaKind'),'video-frame');assert.equal(calls,0);
 h.get('card-media').files=[{type:'text/html',size:100}];await h.get('card-media').listeners.change();assert.match(h.get('card-status').textContent,/Choose a PNG/);
});

test('speech input fills editable text and never sends automatically',()=>{
 let speech,calls=0;class Recognition{constructor(){speech=this;}start(){}stop(){this.onend();}abort(){this.aborted=true;}}
 const h=harness(async url=>{if(url!=='/api/usage')calls++;return {ok:false};},{SpeechRecognition:Recognition});
 assert.equal(h.get('dictate').disabled,false);h.get('dictate').listeners.click();assert.equal(speech.lang,'en-US');assert.equal(h.get('dictate').attrs['aria-pressed'],'true');
 speech.onresult({results:[[{transcript:'What is the score?'}]]});assert.equal(h.get('question').value,'What is the score?');assert.equal(calls,0);speech.onend();assert.equal(h.get('dictate').attrs['aria-pressed'],'false');
 h.get('dictate').listeners.click();const old=speech;h.get('next').listeners.click();assert.equal(old.aborted,true);old.onresult({results:[[{transcript:'Stale speech'}]]});assert.notEqual(h.get('question').value,'Stale speech');
});
test('speech permission errors and unsupported browsers retain typing fallback',()=>{
 let speech;class Recognition{constructor(){speech=this;}start(){}abort(){}}
 const h=harness(async()=>({ok:false}),{SpeechRecognition:Recognition});h.get('dictate').listeners.click();speech.onerror({error:'not-allowed'});assert.match(h.get('dictation-status').textContent,/permission was denied/);speech.onend();assert.equal(h.get('dictate').attrs['aria-pressed'],'false');
 const unsupported=harness(async()=>({ok:false}));assert.equal(unsupported.get('dictate').disabled,true);assert.match(unsupported.get('dictation-status').textContent,/Type your question/);
});
test('first-visit guide and question suggestions help without automatic model calls',()=>{
 let calls=0;const h=harness(async url=>{if(url!=='/api/usage')calls++;return {ok:false};});
 h.get('start-experience').listeners.click();assert.equal(h.run('events[index].type'),'shot');assert.match(h.get('question').value,/shot/);assert.equal(calls,0);
 h.get('question').value='score';h.get('question').listeners.input();const chips=h.get('question-suggestions').children;assert.equal(chips.length,1);chips[0].listeners.click();assert.equal(h.get('question').value,'What is the score?');assert.equal(calls,0);
});
