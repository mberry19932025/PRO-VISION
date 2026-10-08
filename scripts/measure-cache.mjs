import {writeFile} from 'node:fs/promises';
const base=process.env.PROVISION_TEST_URL||'http://127.0.0.1:4180';
const results=[];
try{for(const mode of ['fan','analyst'])for(const repeat of [false,true]){
 const start=performance.now();const response=await fetch(base+'/api/story',{method:'POST',headers:{'content-type':'application/json'},body:JSON.stringify({index:3,prefs:{mode,language:'en',team:'all',player:'all'},question:mode==='fan'?'Why might this moment matter?':'What recorded action should I review?'}),signal:AbortSignal.timeout(65000)});
 if(!response.ok)throw new Error('HTTP '+response.status);const result=await response.json();const totalMs=Math.round(performance.now()-start);results.push({mode,repeat,totalMs,result});console.log(`${mode} ${repeat?'repeat':'first'}: ${totalMs}ms · ${result.story.provider} · ${result.cacheStatus}`);
}
}catch(error){results.push({error:error.name+': '+error.message});console.error('Measurement failed: '+error.name);process.exitCode=1;}
await writeFile('docs/evaluation/live-cache.json',JSON.stringify({recordedAt:new Date().toISOString(),results},null,2)+'\n');
