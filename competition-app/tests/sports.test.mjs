import test from 'node:test';
import assert from 'node:assert/strict';
import {generateMatch,interpret,recordedAnswer,createTradingMemory,tradingCardSVG} from '../src/core.js';
import {matchReport,comparePlayers,footballAnswer} from '../src/sports.js';
import worker from '../worker/index.js';
const events=generateMatch();
test('replay cursor rejects strings, fractions and out-of-range values',()=>{
 for(const index of ['9',-1,180,1.5,NaN,null,undefined])assert.throws(()=>interpret(events,index),/Invalid replay cursor/);
});
test('match report and comparisons never count future actions across the full replay',()=>{
 for(let i=0;i<events.length;i++){
  const r=matchReport(events,i),past=events.slice(0,i+1);
  assert.equal(r.through,events[i].id);assert.equal(r.goals.length,past.filter(e=>e.outcome==='goal').length);
  for(const team of r.teams){const own=past.filter(e=>e.team===team.team);assert.equal(team.shotsOnTarget,own.filter(e=>e.type==='shot'&&['saved','goal'].includes(e.outcome)).length);assert.equal(team.completed,own.filter(e=>e.type==='pass'&&e.outcome==='complete').length);}
  const comparison=comparePlayers(interpret(events,i),'Vale','Silva');assert.ok(comparison);assert.ok(comparison.evidence.every(id=>Number(id.slice(3))<=i+1));
 }
 assert.equal(comparePlayers(interpret(events,3),'Vale','Vale'),null);
 assert.equal(comparePlayers(interpret(events,3),'unknown','Vale'),null);
});
test('football conversation answers comparisons, recaps, help and unavailable live data locally',async()=>{
 let calls=0;const env={PROVISION_GENERATE:async()=>{calls++;throw new Error('must not run');}};
 for(const question of ['Compare Vale and Silva','Give me a match recap','What can you do?','How do I create a memory card?','Premier League scores today','Show me NFL games today']){
  const r=await worker.fetch(new Request('https://demo.test/api/analyze',{method:'POST',body:JSON.stringify({index:60,question})}),env);const data=await r.json();assert.equal(data.provider,'local');assert.ok(data.text);
 }
 assert.equal(calls,0);assert.match(footballAnswer(interpret(events,10),'What is a progressive pass?').text,/15 coordinate/);
 assert.match(recordedAnswer(interpret(events,60),'How many shots does Northbridge have?').text,/Northbridge FC/);
 assert.match(recordedAnswer(interpret(events,60),'¿Cuántos pases tiene Vale?','es').text,/Vale/);
 assert.equal(recordedAnswer(interpret(events,60),'What is your status?'),null);
});
test('card exports tolerate invalid UTF-16, controls and multiline notes without losing the final words',()=>{
 const memory=createTradingMemory(20,{name:'Name\uD800\u0001',note:'\n'.repeat(10)+'A long memory '+ 'word '.repeat(20)+'THE END'});
 assert.doesNotThrow(()=>encodeURIComponent(tradingCardSVG(memory)));
 assert.doesNotThrow(()=>encodeURIComponent(tradingCardSVG(memory,true)));
 assert.doesNotMatch(memory.name,/\uD800|\u0001/);assert.match(tradingCardSVG(memory,true),/THE END/);
});
test('static routes reject unsupported mutation methods',async()=>{
 for(const path of ['/','/app.js','/styles.css','/dataset.json'])assert.equal((await worker.fetch(new Request('https://demo.test'+path,{method:'POST'}))).status,405);
});
