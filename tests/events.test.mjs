import test from 'node:test';
import assert from 'node:assert/strict';
import {MatchState,demoEvents,validateEvent} from '../src/events.js';

test('authored replay computes exact recorded counts and possession changes',()=>{
 const state=new MatchState();for(const e of demoEvents)assert.equal(state.ingest(e).accepted,true);
 const s=state.snapshot();assert.equal(s.clock,158);
 assert.deepEqual(s.stats['Cedar FC'],{passes:3,completed:3,shots:2,goals:1,pressures:0,tacklesWon:1,passAccuracy:1});
 assert.equal(s.stats['Marina FC'].pressures,2);
 assert.deepEqual(s.changes.map(e=>e.eventId),['M006','M007']);
});
test('moment analysis sees no future goal and uses physical coordinate units',()=>{
 const state=new MatchState();for(const e of demoEvents.slice(0,4))state.ingest(e);
 const s=state.snapshot();assert.equal(s.stats['Cedar FC'].goals,0);
 assert.equal(s.latest.id,'M004');assert.equal(s.signals[0].advanceM,21);
 assert.deepEqual(s.signals.find(e=>e.kind==='pressure-cluster').eventIds,['M002','M003']);
 assert.ok(s.context.every(e=>e.second<=128));
});
test('invalid, duplicate and late events do not silently corrupt state',()=>{
 const state=new MatchState();state.ingest(demoEvents[1]);
 assert.equal(state.ingest(demoEvents[1]).reason,'duplicate');
 assert.equal(state.ingest(demoEvents[0]).reason,'out-of-order');
 assert.throws(()=>state.ingest({...demoEvents[2],ball:[106,0]}),/coordinates/);
 assert.equal(state.snapshot().stats['Marina FC'].pressures,1);
 assert.throws(()=>validateEvent({...demoEvents[0],outcome:'goal'}),/outcome/);
});
test('caller mutation cannot rewrite accepted events or returned state',()=>{
 const state=new MatchState();const input=structuredClone(demoEvents[0]);state.ingest(input);input.to[0]=100;
 const output=state.snapshot();output.latest.to[0]=0;
 assert.equal(state.snapshot().latest.to[0],47);
});

test('shot build-up includes the recovery, measures event-clock interval and stops at opponent possession',()=>{
 const state=new MatchState();for(const e of demoEvents)state.ingest(e);
 const signal=state.snapshot().signals.find(s=>s.kind==='shot-build-up');
 assert.deepEqual(signal.eventIds,['M007','M008','M009']);assert.equal(signal.recoveryToShotSeconds,8);
 state.ingest({id:'M010',second:159,team:'Marina FC',player:'Lee Chen',type:'pass',outcome:'complete',from:[25,40],to:[44,36]});
 state.ingest({id:'M011',second:160,team:'Cedar FC',player:'Noah Silva',type:'shot',outcome:'saved',from:[83,34],to:[105,34]});
 assert.equal(state.snapshot().signals.some(s=>s.kind==='shot-build-up'),false);
});
