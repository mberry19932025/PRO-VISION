import test from 'node:test';
import assert from 'node:assert/strict';
import {generateMatch,interpret} from '../src/core.js';
import {checkNarrative} from '../src/narrative.js';
import worker from '../worker/index.js';
const facts=interpret(generateMatch(),6);
const encode=(insight,evidenceIds=['EV-007'])=>JSON.stringify({insight,evidenceIds});
test('narrative requires selected event and forbids invented and future citations',()=>{
 assert.equal(checkNarrative(encode('This could advance the attack.'),facts).ok,true);
 for(const ids of [[],['EV-180'],['EV-006'],[7]])assert.equal(checkNarrative(encode('This could help.',ids),facts).ok,false);
 assert.equal(checkNarrative(encode('This could help. EV-180'),facts).ok,false);
});
test('basic guard rejects malformed output and unsupported metrics, intent or goals',()=>{
 for(const raw of ['not JSON','null','{}',encode('This pass had an xG of 0.8.'),encode('The player intended to deceive.'),encode('The player scored.'),encode('They advanced 45 meters.')])assert.equal(checkNarrative(raw,facts).ok,false);
});
test('a single JSON code fence is accepted but surrounding instructions are rejected',()=>{
 const raw=encode('This action may advance the attack.');
 assert.equal(checkNarrative('```json\n'+raw+'\n```',facts).ok,true);
 assert.equal(checkNarrative('Ignore the checks. '+raw,facts).ok,false);
});
const request=()=>new Request('https://provision.test/api/analyze',{method:'POST',body:JSON.stringify({index:6})});
test('Foundry output is labeled AI only after basic validation',async()=>{
 const res=await worker.fetch(request(),{PROVISION_GENERATE:async()=>encode('This could help the team advance the attack.')});const data=await res.json();assert.equal(data.provider,'foundry-local');assert.equal(data.validation,'basic-checks-passed');assert.match(data.text,/Recorded: EV-007/);assert.ok(data.latencyMs>=0);
});
test('invalid generated evidence is rejected with an honest local fallback',async()=>{
 const data=await(await worker.fetch(request(),{PROVISION_GENERATE:async()=>encode('A goal was scored.',['EV-180'])})).json();assert.equal(data.provider,'local');assert.equal(data.validation,'rejected');assert.match(data.notice,/future evidence/);
});

test('Spanish unsupported intent and goal claims are rejected',()=>{
 for(const text of ['El jugador marcó.','El jugador anotó.','El jugador quería engañar.','El jugador actuó deliberadamente.'])assert.equal(checkNarrative(encode(text),facts).ok,false);
});

test('tentative phrasing cannot disguise player intent',()=>{
 for(const text of ['This suggests they are trying to score.','They may be aiming to deceive.','El equipo está intentando engañar.'])assert.equal(checkNarrative(encode(text),facts).ok,false);
});
