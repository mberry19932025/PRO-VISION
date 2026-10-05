import {at,story,prompts,validateNarrative,unsupportedQuestion} from './stories.js';
import {demoEvents,match} from './events.js';
export function validateRequest(data){
 if(!data||!Number.isInteger(data.index)||data.index<0||data.index>=demoEvents.length||!data.prefs||!['fan','analyst','broadcast'].includes(data.prefs.mode)||!['en','es'].includes(data.prefs.language)||!['all',match.home,match.away].includes(data.prefs.team)||!['all',...demoEvents.map(e=>e.player)].includes(data.prefs.player)||typeof data.question!=='string'||data.question.length>300)throw new Error('Invalid request');
 return data;
}
export async function analyze(data,generate,provider){
 validateRequest(data);const state=at(data.index);const base=story(state,data.prefs);const start=performance.now();
 const unsupported=unsupportedQuestion(data.question,data.prefs.language);
 if(unsupported)return {story:{...base,interpretation:unsupported,evidence:[state.latest.id]},notice:'The requested information is not present in the event contract. No AI claim was generated.',elapsedMs:Math.round(performance.now()-start)};
 if(!generate)return {story:base,notice:'AI is not configured. Showing the computed explanation.'};
 try{
  // Each attempt receives the same bounded event window. It cannot retrieve future events.
  let result=null;const trace=[];
  for(let attempt=0;attempt<2;attempt++){
   const messages=prompts(state,data.prefs,data.question);
   if(attempt)messages[1].content+='\nYour last response failed validation. Return only valid JSON with insight and evidenceIds, citing the selected event.';
   let deadline;
   try{result=validateNarrative(await Promise.race([generate(messages),new Promise((_,reject)=>{deadline=setTimeout(()=>reject(new Error('Generation deadline')),30000);})]),state);}finally{clearTimeout(deadline);}
   trace.push({attempt:attempt+1,accepted:result.ok,reason:result.reason??null});
   if(result.ok)break;
  }
  const elapsedMs=Math.round(performance.now()-start);
  return result.ok?{story:{...base,interpretation:result.insight,evidence:result.evidence,provider},notice:`AI interpretation · ${(elapsedMs/1000).toFixed(1)}s · references passed basic checks. Interpretations still need human review.`,elapsedMs,trace}:{story:base,notice:`AI output failed basic checks after ${trace.length} attempts. Showing the computed explanation.`,elapsedMs,trace};
 }catch(error){return {story:base,notice:error?.message==='Generation deadline'?'AI generation exceeded its response deadline. Showing the computed explanation.':'Microsoft AI is unavailable or busy. Showing the computed explanation.',elapsedMs:Math.round(performance.now()-start)};}
}
