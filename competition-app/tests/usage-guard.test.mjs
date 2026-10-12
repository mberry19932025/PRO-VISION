import test from 'node:test';
import assert from 'node:assert/strict';
import {mkdtemp,rm,writeFile} from 'node:fs/promises';
import {tmpdir} from 'node:os';
import {join} from 'node:path';
import {createUsageGuard} from '../scripts/usage-guard.mjs';
test('concurrent calls cannot exceed persistent daily or monthly limits',async()=>{
 const dir=await mkdtemp(join(tmpdir(),'provision-usage-'));
 try{
 const path=join(dir,'usage.json');let clock=new Date('2026-10-12T12:00:00Z');
 const options={dailyLimit:2,monthlyLimit:3,now:()=>clock};
 const guard=await createUsageGuard(path,options);
 const results=await Promise.all(Array.from({length:8},()=>guard.reserve()));
 assert.equal(results.filter(r=>r.allowed).length,2);
 const restarted=await createUsageGuard(path,options);assert.equal((await restarted.reserve()).allowed,false);
 clock=new Date('2026-10-13T12:00:00Z');assert.equal((await restarted.reserve()).allowed,true);assert.equal((await restarted.reserve()).allowed,false);
 clock=new Date('2026-11-01T12:00:00Z');assert.equal((await restarted.reserve()).allowed,true);
 }finally{await rm(dir,{recursive:true,force:true});}
});
test('corrupt ledger and invalid limits fail closed',async()=>{
 const dir=await mkdtemp(join(tmpdir(),'provision-usage-'));
 try{const path=join(dir,'usage.json');await writeFile(path,'broken');await assert.rejects(createUsageGuard(path));await assert.rejects(createUsageGuard(path,{dailyLimit:-1}));}finally{await rm(dir,{recursive:true,force:true});}
});

test('valid JSON with unsafe usage counts is rejected',async()=>{
 const dir=await mkdtemp(join(tmpdir(),'provision-usage-'));
 try{const path=join(dir,'usage.json');for(const days of [[],{'2026-10-12':-1},{'2026-10-12':'2'},{'bad':2}]){await writeFile(path,JSON.stringify({days,months:{}}));await assert.rejects(createUsageGuard(path));}}finally{await rm(dir,{recursive:true,force:true});}
});
