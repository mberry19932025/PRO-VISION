import {writeFile} from 'node:fs/promises';
const base=process.env.PROVISION_TEST_URL||'http://127.0.0.1:4180';
const health=await fetch(base+'/api/health',{signal:AbortSignal.timeout(5000)}).then(r=>r.json());
const cases=[{label:'fan pass',index:3,mode:'fan',language:'en'},{label:'fan goal',index:8,mode:'fan',language:'en'},{label:'Spanish fan pass',index:3,mode:'fan',language:'es'},{label:'broadcast pass',index:3,mode:'broadcast',language:'en'}];
const results=[];
for(const c of cases){const start=performance.now();try{
 const response=await fetch(base+'/api/story',{method:'POST',headers:{'content-type':'application/json'},body:JSON.stringify({index:c.index,prefs:{mode:c.mode,language:c.language,team:'all',player:'all'},question:''}),signal:AbortSignal.timeout(65000)});
 if(!response.ok)throw new Error('HTTP '+response.status);const result=await response.json();const totalMs=Math.round(performance.now()-start);results.push({case:c,totalMs,result});console.log(`${c.label}: ${totalMs}ms · ${result.story.provider} · ${result.cacheStatus}`);
 }catch(error){results.push({case:c,error:error.name+': '+error.message,totalMs:Math.round(performance.now()-start)});console.log(c.label+': request failed');}
}
const report=process.argv[2]||'docs/evaluation/release-check.json';await writeFile(report,JSON.stringify({recordedAt:new Date().toISOString(),health,results},null,2)+'\n');console.log('Saved '+report);
