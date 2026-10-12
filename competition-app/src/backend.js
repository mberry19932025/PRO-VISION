const azureCache=new Map();
let azureBusy=false;
async function readJSON(request) {
  if(Number(request.headers.get('content-length'))>16384)throw new Error('Request too large');
  const text=await request.text();if(text.length>16384)throw new Error('Request too large');return JSON.parse(text);
}
const json=(body,status=200)=>new Response(JSON.stringify(body),{status,headers:{'content-type':'application/json','cache-control':'no-store'}});
export default {async fetch(request,env={}) {
  const url=new URL(request.url);
  if(url.pathname==='/api/health')return json({ok:true,provider:typeof env.PROVISION_GENERATE==='function'?'foundry-local':env.AZURE_OPENAI_API_KEY&&env.AZURE_OPENAI_ENDPOINT&&env.AZURE_OPENAI_DEPLOYMENT?'azure':'local',dataset:'synthetic',events:180});
  if(url.pathname==='/api/analyze') {
    if(request.method!=='POST')return json({error:'Use POST'},405);
    if(request.headers.get('origin')&&request.headers.get('origin')!==url.origin)return json({error:'Origin not allowed'},403);
    let body;try{body=await readJSON(request);}catch{return json({error:'Invalid JSON or oversized request'},400);}
    if(!body||typeof body!=='object'||Array.isArray(body))return json({error:'Expected a JSON object'},400);
    const {index=0,mode='fan',question='',language='en',history=[],team='all',player='all'}=body;
    if(!Number.isInteger(index)||index<0||index>=180||!['fan','coach'].includes(mode)||!['en','es'].includes(language)||typeof question!=='string'||question.length>500)return json({error:'Invalid analysis parameters'},400);
    if(!Array.isArray(history)||history.length>4||history.some(m=>!m||!['user','assistant'].includes(m.role)||typeof m.content!=='string'||m.content.length>2000))return json({error:'Invalid conversation history'},400);
    if(!['all',...teams].includes(team)||!['all',...generateMatch().map(e=>e.player)].includes(player))return json({error:'Invalid viewing preferences'},400);
    const viewer={team,player};
    const facts=interpret(generateMatch(),index),fallback=explain(facts,mode,question,language);
    const direct=recordedAnswer(facts,question,language);
    if(direct)return json({...direct,provider:'local',notice:language==='es'?'Respuesta de los datos registrados; sin solicitud al modelo.':'Answered from recorded data; no model request.'});
    if(typeof env.PROVISION_GENERATE==='function') {
      const started=performance.now();
      try {
        const raw=await env.PROVISION_GENERATE(narrativeMessages(facts,mode,question,language,history,viewer));
        const checked=checkNarrative(raw,facts);
        if(!checked.ok)return json({text:fallback,provider:'local',notice:checked.reason+' Showing the local explanation.',evidence:facts.evidence,validation:'rejected',latencyMs:Math.round(performance.now()-started)});
        const e=facts.event;
        const observed=observedLead(e,language);
        return json({text:observed+checked.insight,provider:'foundry-local',evidence:checked.evidence,validation:'basic-checks-passed',latencyMs:Math.round(performance.now()-started),notice:'Evidence IDs and selected unsupported claims checked; this is not full factual verification.'});
      }catch{return json({text:fallback,provider:'local',notice:'Local AI unavailable or busy. Showing the rule-based explanation.',evidence:facts.evidence});}
    }
    if(!env.AZURE_OPENAI_API_KEY||!env.AZURE_OPENAI_ENDPOINT||!env.AZURE_OPENAI_DEPLOYMENT)return json({text:fallback,provider:'local',evidence:facts.evidence});
    const cacheKey=JSON.stringify([env.AZURE_OPENAI_ENDPOINT,env.AZURE_OPENAI_DEPLOYMENT,index,mode,language,question,history,viewer]);
    if(azureCache.has(cacheKey))return json({...azureCache.get(cacheKey),cached:true,notice:'Saved AI interpretation. No new model request.'});
    if(azureBusy)return json({text:fallback,provider:'local',notice:'An AI request is already running. Try again shortly.',evidence:facts.evidence});
    azureBusy=true;
    const started=performance.now();
    try {
      const endpoint=new URL(env.AZURE_OPENAI_ENDPOINT);
      if(endpoint.protocol!=='https:'||endpoint.username||endpoint.password||endpoint.port||!/(\.openai\.azure\.com|\.services\.ai\.azure\.com)$/.test(endpoint.hostname))throw new Error('Invalid Azure endpoint');
      if(typeof env.PROVISION_RESERVE_AI!=='function')return json({text:fallback,provider:'local',notice:'AI usage controls are unavailable. Showing the local explanation.',evidence:facts.evidence});
      const allowance=await env.PROVISION_RESERVE_AI();
      if(!allowance.allowed)return json({text:fallback,provider:'local',notice:'AI request limit reached. Replay and local explanations remain available.',evidence:facts.evidence});
      const result=await fetch(endpoint.origin+'/openai/v1/chat/completions',{method:'POST',headers:{'content-type':'application/json','api-key':env.AZURE_OPENAI_API_KEY},signal:AbortSignal.timeout(60000),body:JSON.stringify({model:env.AZURE_OPENAI_DEPLOYMENT,max_completion_tokens:1024,...(/^gpt-5/.test(env.AZURE_OPENAI_DEPLOYMENT)?{reasoning_effort:'low'}:{}),messages:narrativeMessages(facts,mode,question,language,history,viewer)})});
      if(!result.ok){const error=new Error('Provider unavailable');error.providerStatus=result.status;throw error;}
      const data=await result.json(),checked=checkNarrative(data.choices?.[0]?.message?.content,facts);
      if(!checked.ok)return json({text:fallback,provider:'local',notice:checked.reason+' Showing the local explanation.',evidence:facts.evidence,validation:'rejected'});
      const e=facts.event;
      const observed=observedLead(e,language);
      const response={text:observed+checked.insight,provider:'azure',evidence:checked.evidence,validation:'basic-checks-passed',latencyMs:Math.round(performance.now()-started),notice:'Basic evidence checks passed. Tactical interpretation may still be incorrect.'};
      if(azureCache.size>=100)azureCache.delete(azureCache.keys().next().value);
      azureCache.set(cacheKey,response);return json(response);
    }catch(error){const notice=error.providerStatus===429?'Azure rate limit reached. Wait briefly before trying again.':error.providerStatus===401||error.providerStatus===403?'Azure authentication failed. Check the server configuration.':error.name==='TimeoutError'?'Azure took too long to respond.': 'Azure analysis unavailable.';return json({text:fallback,provider:'local',notice:notice+' Showing the local evidence-based explanation.',evidence:facts.evidence});}
    finally{azureBusy=false;}
  }
  if(url.pathname==='/app.js')return new Response(CLIENT,{headers:{'content-type':'text/javascript'}});
  if(url.pathname==='/styles.css')return new Response(CSS,{headers:{'content-type':'text/css'}});
  if(url.pathname==='/dataset.json')return json({provenance:'Original fictional football events generated by PRO-VISION AI. Seed 26. Not real match data.',pitch:{length:105,width:68},events:generateMatch()});
  if(url.pathname!=='/')return new Response('Not found',{status:404});
  return new Response(HTML,{headers:{'content-type':'text/html; charset=utf-8','x-content-type-options':'nosniff','referrer-policy':'same-origin','content-security-policy':"default-src 'self'; script-src 'self'; style-src 'self'; img-src 'self' data:; connect-src 'self'; object-src 'none'; base-uri 'none'; frame-ancestors 'self'"}});
}};
