import test from 'node:test';
import assert from 'node:assert/strict';
import {boot} from '../src/bootstrap.js';
function page(){const items=new Map(['loading-screen','loading-status','loading-retry'].map(id=>[id,{hidden:id==='loading-retry',textContent:'',addEventListener(event,fn){this[event]=fn;}}]));return {getElementById:id=>items.get(id)};}
test('loading screen disappears only after application initialization succeeds',async()=>{
 const p=page();let resolve;const pending=boot(()=>new Promise(r=>resolve=r),p);assert.equal(p.getElementById('loading-screen').hidden,false);resolve();assert.equal(await pending,true);assert.equal(p.getElementById('loading-screen').hidden,true);
});
test('startup failure retains a usable retry control without exposing errors',async()=>{
 const p=page();assert.equal(await boot(async()=>{throw new Error('private internals');},p),false);assert.equal(p.getElementById('loading-screen').hidden,false);assert.equal(p.getElementById('loading-retry').hidden,false);assert.doesNotMatch(p.getElementById('loading-status').textContent,/private/);assert.equal(typeof p.getElementById('loading-retry').click,'function');
});
