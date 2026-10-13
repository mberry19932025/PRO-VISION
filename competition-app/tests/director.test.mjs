import test from 'node:test';
import assert from 'node:assert/strict';
import {generateMatch} from '../src/core.js';
import {selectDirectorMoment,runMatchDirector} from '../src/director.js';
import worker from '../worker/index.js';
const events=generateMatch(),input={index:179,mode:'fan',language:'en',question:'Find a goal',team:'all',player:'all'};
const request=body=>new Request('https://demo.test/api/director',{method:'POST',body:JSON.stringify(body)});
const env={AZURE_OPENAI_ENDPOINT:'https://director-test.openai.azure.com',AZURE_OPENAI_API_KEY:'private-test',AZURE_OPENAI_DEPLOYMENT:'test',PROVISION_RESERVE_AI:async()=>({allowed:true})};
test('Director rejects future evidence and does not call cloud in local mode',async()=>{
 const original=globalThis.fetch;let calls=0;
 globalThis.fetch=async()=>{calls++;return Response.json({choices:[{message:calls===1?{tool_calls:[{id:'x',type:'function',function:{name:'find_key_moment',arguments:'{"kind":"latest"}'}}]}:{content:JSON.stringify({insight:'This could matter.',evidenceIds:['EV-180']})}}]});};
 try{
  const result=await runMatchDirector({...input,index:10},env);assert.equal(calls,2);assert.equal(result.provider,'local');assert.match(result.notice,/failed evidence/);assert.ok(result.evidence.every(id=>Number(id.slice(3))<=11));
  calls=0;const local=await runMatchDirector(input,{...env,PROVISION_GENERATE:async()=>''});assert.equal(local.provider,'local');assert.equal(calls,0);
 }finally{globalThis.fetch=original;}
});
test('director selection enforces temporal and player/team boundaries',()=>{
 for(let i=0;i<events.length;i++)for(const kind of ['goal','shot','turnover','progressive_pass','latest']){
  const selected=selectDirectorMoment(events,i,{team:'Northbridge FC',player:'Vale'},kind);
  assert.ok(selected.index<=i);assert.ok(selected.facts.evidence.every(id=>Number(id.slice(3))<=selected.index+1));
  if(events.slice(0,i+1).some(e=>e.team==='Northbridge FC'&&e.player==='Vale')){assert.equal(selected.facts.event.team,'Northbridge FC');assert.equal(selected.facts.event.player,'Vale');}
 }
});
test('director performs a validated Azure tool call then evidence-checked explanation and caches it',async()=>{
 const original=globalThis.fetch;let calls=0,reserved=0;const configuration={...env,PROVISION_RESERVE_AI:async()=>{reserved++;return {allowed:true};}};
 globalThis.fetch=async(url,options)=>{calls++;const payload=JSON.parse(options.body);
  if(calls===1){assert.equal(payload.tool_choice,'required');assert.equal(payload.parallel_tool_calls,false);return Response.json({choices:[{message:{tool_calls:[{id:'call_demo',type:'function',function:{name:'find_key_moment',arguments:'{"kind":"goal"}'}}]}}]});}
  const tool=payload.messages.find(m=>m.role==='tool');const facts=JSON.parse(tool.content);assert.ok(Number(facts.selectedEvent.id.slice(3))<=180);return Response.json({choices:[{message:{content:JSON.stringify({insight:'This could change the balance of the match.',evidenceIds:[facts.selectedEvent.id]})}}]});
 };
 try{const first=await(await worker.fetch(request(input),configuration)).json();assert.equal(first.provider,'azure');assert.equal(first.workflow,'tool-using');assert.equal(first.trace.length,3);assert.equal(calls,2);assert.equal(reserved,2);
  const cached=await(await worker.fetch(request(input),configuration)).json();assert.equal(cached.cached,true);assert.equal(calls,2);
 }finally{globalThis.fetch=original;}
});
test('unsafe tool calls, unavailable limits and future citations fail to a labeled local response',async()=>{
 const original=globalThis.fetch;
 try{for(const call of [{name:'shell',arguments:'{"kind":"goal"}'},{name:'find_key_moment',arguments:'{"kind":"goal","index":999}'},{name:'find_key_moment',arguments:'null'}]){
  let calls=0;globalThis.fetch=async()=>{calls++;return Response.json({choices:[{message:{tool_calls:[{id:'x',type:'function',function:call}]}}]});};
  const d=await runMatchDirector(input,env);assert.equal(d.provider,'local');assert.equal(d.workflow,'rule-based');assert.equal(calls,1);
 }
 let calls=0;globalThis.fetch=async()=>{calls++;throw new Error('must not call');};const d=await runMatchDirector(input,{...env,PROVISION_RESERVE_AI:async()=>({allowed:false})});assert.equal(d.provider,'local');assert.match(d.notice,/limit reached/);assert.equal(calls,0);
  for(const body of [null,{index:180},{team:'unknown'},{player:'unknown'},{question:'x'.repeat(501)}])assert.equal((await worker.fetch(request(body))).status,400);
  const r=await worker.fetch(new Request('https://demo.test/api/director',{method:'POST',headers:{origin:'https://other.test'},body:'{}'}));assert.equal(r.status,403);
 }finally{globalThis.fetch=original;}
});
