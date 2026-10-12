// Hosted inference only. Secrets stay in server-side environment variables.
export function createAzureGenerator(env,{fetchImpl=fetch,now=()=>Date.now()}={}){
 const values=[env.AZURE_OPENAI_ENDPOINT,env.AZURE_OPENAI_API_KEY,env.AZURE_OPENAI_DEPLOYMENT];
 if(!values.some(Boolean))return null;
 if(!values.every(Boolean))throw new Error('Azure configuration is incomplete');
 const endpoint=new URL(env.AZURE_OPENAI_ENDPOINT);
 if(endpoint.protocol!=='https:'||endpoint.username||endpoint.password||endpoint.port||!/(^|\.)(openai\.azure\.com|services\.ai\.azure\.com)$/.test(endpoint.hostname))throw new Error('Unsupported Azure endpoint');
 const limit=Number(env.PROVISION_AI_DAILY_LIMIT||100);
 if(!Number.isInteger(limit)||limit<1||limit>1000)throw new Error('Invalid daily AI request limit');
 let day='',calls=0;
 const reset=()=>{const current=new Date(now()).toISOString().slice(0,10);if(day!==current){day=current;calls=0;}};
 return {get usage(){reset();return {day,attempts:calls,limit,scope:'this process; resets on restart'};},async generate(messages){
  reset();if(calls>=limit){const error=new Error('Daily AI request limit reached');error.code='DAILY_LIMIT';throw error;}
  calls++;
  const response=await fetchImpl(endpoint.origin+'/openai/v1/chat/completions',{method:'POST',headers:{'content-type':'application/json','api-key':env.AZURE_OPENAI_API_KEY},body:JSON.stringify({model:env.AZURE_OPENAI_DEPLOYMENT,messages,max_tokens:220,temperature:.1}),signal:AbortSignal.timeout(20000)});
  if(!response.ok)throw new Error('Provider failed');
  const output=(await response.json()).choices?.[0]?.message?.content;
  if(typeof output!=='string')throw new Error('Provider returned no text');
  return output;
 }};
}
