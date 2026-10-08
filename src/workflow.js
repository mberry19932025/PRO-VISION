import {clock} from './stories.js';
export function explanationAudit(state,prefs,narrative,meta={}){
 const ids=narrative.evidence||[];const allowed=new Set(state.context.map(e=>e.id));
 const evidenceBounded=ids.length>0&&ids.every(id=>allowed.has(id));
 const generated=['foundry-local','azure'].includes(narrative.provider);
 return {clockSeconds:state.clock,evidenceBounded,evidenceIds:[...ids],stages:[
  {stage:'Ingest',status:'complete',detail:`${state.context.length} source records in the trailing window through ${clock(state.clock)}.`},
  {stage:'Interpret',status:'complete',detail:state.signals.length?state.signals.map(s=>s.kind).join(' · '):'No configured pattern threshold met.'},
  {stage:'Explain',status:generated?'ai':'computed',detail:meta.cacheStatus==='hit'?'Previously checked AI answer reused; no new inference.':generated?(narrative.evidenceOrigin==='computed-input'?'AI wording checked; source IDs come from supplied computed context. Meaning still needs review.':'AI answer passed formatting and source checks; meaning is not independently verified.'):'Computed explanation; no successful AI generation is claimed.'},
  {stage:'Render',status:'ready',detail:'Replay and eight-second lower-third export.'},
  {stage:'Personalize',status:'complete',detail:`${prefs.mode} · ${prefs.language} · ${prefs.team||'all'} · ${prefs.player||'all'}`}
 ],checks:meta.trace||[],cacheStatus:meta.cacheStatus||'none'};
}
