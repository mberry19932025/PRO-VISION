import test from 'node:test';
import assert from 'node:assert/strict';
import {spawn} from 'node:child_process';
import net from 'node:net';
import {once} from 'node:events';
test('hosted HTTP serves assets, rejects foreign origins and validates requests',{timeout:15000},async()=>{
 const child=spawn(process.execPath,['server.mjs'],{env:{...process.env,PORT:'0',HOST:'127.0.0.1',PUBLIC_ORIGIN:'https://provision.example',AZURE_OPENAI_ENDPOINT:'',AZURE_OPENAI_API_KEY:'',AZURE_OPENAI_DEPLOYMENT:''},stdio:['ignore','pipe','pipe']});
 try{
  const port=await new Promise((resolve,reject)=>{let output='';child.stdout.on('data',b=>{output+=b;const m=output.match(/listening on port (\d+)/);if(m)resolve(m[1]);});child.once('error',reject);child.once('exit',()=>reject(new Error('Server exited before startup')));});
  const base='http://127.0.0.1:'+port;
  assert.equal((await fetch(base+'/api/health').then(r=>r.json())).ai,false);
  const page=await fetch(base);assert.equal(page.status,200);assert.ok(page.headers.get('content-security-policy').includes("frame-ancestors 'none'"));
  assert.equal((await fetch(base+'/src/memories.js')).status,200);assert.equal((await fetch(base+'/.env')).status,404);
  const payload={index:0,prefs:{mode:'fan',language:'en',team:'all',player:'all'},question:''};
  const send=(origin,body)=>fetch(base+'/api/story',{method:'POST',headers:{origin,'content-type':'application/json'},body});
  assert.equal((await send('https://attacker.example',JSON.stringify(payload))).status,403);
  assert.equal((await send('https://provision.example','{}')).status,400);
  assert.equal((await send('https://provision.example','x'.repeat(5000))).status,413);
  const result=await send('https://provision.example',JSON.stringify(payload));assert.equal(result.status,200);assert.equal((await result.json()).story.provider,'computed');
 }finally{if(child.exitCode===null&&child.signalCode===null){const exited=once(child,'exit');child.kill('SIGTERM');const [code]=await exited;assert.equal(code,0);}}
});

test('occupied ports produce an actionable error and exit cleanly',{timeout:10000},async()=>{
 const occupied=net.createServer();occupied.listen(0,'127.0.0.1');await once(occupied,'listening');
 const child=spawn(process.execPath,['server.mjs'],{env:{...process.env,PORT:String(occupied.address().port),HOST:'127.0.0.1',AZURE_OPENAI_ENDPOINT:'',AZURE_OPENAI_API_KEY:'',AZURE_OPENAI_DEPLOYMENT:''},stdio:['ignore','ignore','pipe']});
 let errors='';child.stderr.on('data',chunk=>{errors+=chunk;});
 try{const [code]=await once(child,'exit');assert.equal(code,1);assert.match(errors,/already in use/);assert.match(errors,/choose another PORT/);}finally{occupied.close();if(child.exitCode===null)child.kill('SIGTERM');}
});
