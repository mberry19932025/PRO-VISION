import {readFile,writeFile,mkdir,rename} from 'node:fs/promises';
import {dirname} from 'node:path';
export async function createUsageGuard(path,{dailyLimit=10,monthlyLimit=100,now=()=>new Date()}={}) {
  for(const limit of [dailyLimit,monthlyLimit])if(!Number.isInteger(limit)||limit<0)throw new Error('AI limits must be nonnegative integers');
  let state={days:{},months:{}};
  try{state=JSON.parse(await readFile(path,'utf8'));if(!state||typeof state!=='object'||!state.days||!state.months)throw new Error('Invalid usage ledger');
    for(const [name,pattern] of [['days',/^\d{4}-\d{2}-\d{2}$/],['months',/^\d{4}-\d{2}$/]]){
      const entries=state[name];
      if(typeof entries!=='object'||Array.isArray(entries)||Object.entries(entries).some(([period,count])=>!pattern.test(period)||!Number.isSafeInteger(count)||count<0))throw new Error('Invalid usage counters');
    }}
  catch(error){if(error.code!=='ENOENT')throw new Error('Cannot safely load AI usage ledger');}
  let queue=Promise.resolve();
  const snapshot=()=>{const date=now().toISOString().slice(0,10),month=date.slice(0,7);return {date,month,today:state.days[date]||0,thisMonth:state.months[month]||0,dailyLimit,monthlyLimit};};
  return {
    status:snapshot,
    reserve(){const task=queue.then(async()=>{
      const usage=snapshot();
      if(usage.today>=dailyLimit||usage.thisMonth>=monthlyLimit)return {allowed:false,...usage};
      const next={days:{...state.days,[usage.date]:usage.today+1},months:{...state.months,[usage.month]:usage.thisMonth+1}};
      await mkdir(dirname(path),{recursive:true});
      await writeFile(path+'.tmp',JSON.stringify(next),{mode:0o600});await rename(path+'.tmp',path);state=next;
      return {allowed:true,...snapshot()};
    });queue=task.catch(()=>{});return task;}
  };
}
