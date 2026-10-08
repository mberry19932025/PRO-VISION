import {writeFile} from 'node:fs/promises';
const base=process.env.PROVISION_TEST_URL||'http://127.0.0.1:4180';
const health=await fetch(base+'/api/health',{signal:AbortSignal.timeout(5000)}).then(r=>r.json());
if(!health.ai)throw new Error('Start npm run preview:ai first; no AI backend is configured.');
const cases=[{label:'fan pass',mode:'fan',question:'Why might this moment matter?'},{label:'analyst pass',mode:'analyst',question:'What recorded action should I review?'},{label:'unsupported speed',mode:'fan',question:'How fast was the ball?'}];
const results=[];
for(const c of cases){const started=performance.now();const response=await fetch(base+'/api/story',{method:'POST',headers:{'content-type':'application/json'},body:JSON.stringify({index:3,prefs:{mode:c.mode,language:'en',team:'all',player:'all'},question:c.question}),signal:AbortSignal.timeout(65000)});if(!response.ok)throw new Error('API status '+response.status);const result=await response.json();const clientElapsedMs=Math.round(performance.now()-started);results.push({case:c,clientElapsedMs,result});console.log(`${c.label}: ${(clientElapsedMs/1000).toFixed(2)}s total · ${result.story.provider} · ${result.trace?.length??0} attempt(s)`);}
const report=process.argv[2]||'docs/evaluation/live-timing.json';
await writeFile(report,JSON.stringify({recordedAt:new Date().toISOString(),model:health.modelId,results},null,2)+'\n');
console.log('Saved actual answers and timings to '+report);
