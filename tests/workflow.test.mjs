import test from 'node:test';
import assert from 'node:assert/strict';
import {createAnalyzer} from '../src/api.js';
import {explanationAudit} from '../src/workflow.js';
import {at,story} from '../src/stories.js';
const prefs={mode:'fan',language:'en',team:'all',player:'all'},request={index:3,prefs,question:''};
const answer=JSON.stringify({insight:'The pass could help advance the attack.',evidenceIds:['M004']});
test('accepted answers are reused with honest original timing and clone isolation',async()=>{
 let calls=0;const run=createAnalyzer(async()=>{calls++;return answer;},'foundry-local');
 const first=await run(request);assert.equal(first.cacheStatus,'miss');first.story.interpretation='tampered';
 const cached=await run(request);assert.equal(calls,1);assert.equal(cached.cacheStatus,'hit');assert.notEqual(cached.story.interpretation,'tampered');assert.equal(cached.elapsedMs,0);assert.equal(typeof cached.originalGenerationMs,'number');assert.match(cached.notice,/no new inference/);assert.match(cached.audit.stages[2].detail,/reused/);
});
test('cache separates audience, language, club, player, question and moment',async()=>{
 let calls=0;const run=createAnalyzer(async messages=>{calls++;const payload=JSON.parse(messages[1].content);return JSON.stringify({insight:payload.language==='Spanish'?'El pase podría ayudar a avanzar el ataque.':'The recorded action could help tell the story.',evidenceIds:[payload.selectedId||payload.selected.id]});},'foundry-local');
 await run(request);for(const change of [{prefs:{...prefs,mode:'analyst'}},{prefs:{...prefs,language:'es'}},{prefs:{...prefs,team:'Cedar FC'}},{prefs:{...prefs,player:'Jules Reed'}},{question:'What next?'},{index:8}])await run({...request,...change});assert.equal(calls,7);
});
test('cache expires, stays bounded and never stores failed generation',async()=>{
 let time=0,calls=0;const run=createAnalyzer(async()=>{calls++;return answer;},'foundry-local',{now:()=>time,ttlMs:10,maxEntries:1});
 await run(request);time=11;await run(request);assert.equal(calls,2);await run({...request,question:'Another question'});await run(request);assert.equal(calls,4);
 let failures=0;const failed=createAnalyzer(async()=>{failures++;throw new Error('offline');},'foundry-local');await failed(request);await failed(request);assert.equal(failures,2);
});
test('audit reports actual provenance and detects outside-window evidence without asserting truth',()=>{
 const state=at(3);const audit=explanationAudit(state,prefs,story(state,prefs));assert.equal(audit.evidenceBounded,true);assert.deepEqual(audit.stages.map(x=>x.stage),['Ingest','Interpret','Explain','Render','Personalize']);assert.equal(audit.stages[2].status,'computed');assert.equal(explanationAudit(state,prefs,{evidence:['M009'],provider:'azure'}).evidenceBounded,false);
});
