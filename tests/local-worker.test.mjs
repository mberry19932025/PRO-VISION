import test from 'node:test';
import assert from 'node:assert/strict';
import {createLocalGenerator} from '../src/local-generator.mjs';
test('blocked inference is terminated while parent stays responsive and next request recovers',{timeout:10000},async()=>{
 const local=await createLocalGenerator({workerURL:new URL('./fixtures/local-worker.mjs',import.meta.url),timeoutMs:150,startupMs:3000});
 try{
  assert.equal(await local.generate([{content:'ok'}]),'checked output');
  let responsive=false;const timer=setTimeout(()=>{responsive=true;},20);
  const started=performance.now();await assert.rejects(local.generate([{content:'hang'}]),/Generation deadline/);clearTimeout(timer);assert.equal(responsive,true);assert.ok(performance.now()-started<3000);
  assert.equal(await local.generate([{content:'ok'}]),'checked output');
 }finally{await local.close();}
});

test('a stalled model startup is terminated within its configured limit',{timeout:5000},async()=>{
 await assert.rejects(createLocalGenerator({workerURL:new URL('./fixtures/startup-worker.mjs',import.meta.url),startupMs:100}),/startup deadline/);
});
