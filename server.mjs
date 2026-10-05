import http from 'node:http';
import {readFile,mkdir} from 'node:fs/promises';
import {analyze,validateRequest} from './src/api.js';
let generate=null,provider=null,modelId=null,close=async()=>{};
if(process.argv.includes('--ai')){
 const {FoundryLocalManager}=await import('foundry-local-sdk');const root=new URL('.provision/',import.meta.url);await mkdir(root,{recursive:true});
 const path=n=>decodeURIComponent(new URL(n,root).pathname);
 const manager=FoundryLocalManager.create({appName:'pro-vision',appDataDir:path('data'),modelCacheDir:process.env.PROVISION_MODEL_CACHE||path('models'),logsDir:path('logs'),disableNonessentialTelemetry:true});
 try{
  const model=await manager.catalog.getModel(process.env.PROVISION_LOCAL_MODEL||'phi-3.5-mini');
  if(!model.isCached){console.log('Downloading Microsoft model…');let last=-1;await model.download(p=>{const step=Math.floor(p/10)*10;if(step>last){last=step;console.log(step+'%');}});}
  await model.load();const client=model.createChatClient();client.settings.maxTokens=150;client.settings.temperature=.1;
  let busy=false;generate=async messages=>{if(busy)throw new Error('Busy');busy=true;try{return (await client.completeChat(messages)).choices?.[0]?.message?.content??'';}finally{busy=false;}};
  provider='foundry-local';modelId=model.id;close=async()=>{client.dispose();await model.unload();manager.dispose();};console.log('Microsoft model loaded:',model.id);
 }catch(error){manager.dispose();throw error;}
}else if(process.env.AZURE_OPENAI_ENDPOINT&&process.env.AZURE_OPENAI_API_KEY&&process.env.AZURE_OPENAI_DEPLOYMENT){
 const endpoint=new URL(process.env.AZURE_OPENAI_ENDPOINT);
 if(endpoint.protocol!=='https:'||!/(^|\.)(openai\.azure\.com|services\.ai\.azure\.com)$/.test(endpoint.hostname))throw new Error('Unsupported Azure endpoint');
 provider='azure';generate=async messages=>{const r=await fetch(endpoint.origin+'/openai/v1/chat/completions',{method:'POST',headers:{'content-type':'application/json','api-key':process.env.AZURE_OPENAI_API_KEY},body:JSON.stringify({model:process.env.AZURE_OPENAI_DEPLOYMENT,messages,max_tokens:220,temperature:.1}),signal:AbortSignal.timeout(20000)});if(!r.ok)throw new Error('Provider failed');return (await r.json()).choices?.[0]?.message?.content??'';};
}
const assets=new Map([['/','index.html'],['/style.css','style.css'],...['events.js','stories.js','memories.js','app.js'].map(f=>['/src/'+f,'src/'+f])]);
const server=http.createServer(async(req,res)=>{
 const json=(status,data)=>{res.writeHead(status,{'content-type':'application/json','cache-control':'no-store'});res.end(JSON.stringify(data));};
 try{
  const pathname=new URL(req.url,'http://localhost:4180').pathname;
  if(pathname==='/api/health'&&req.method==='GET'){json(200,{ai:!!generate,provider,modelId});return;}
  if(pathname==='/api/story'&&req.method==='POST'){
   if(req.headers.origin&&!['http://localhost:4180','http://127.0.0.1:4180'].includes(req.headers.origin)){json(403,{error:'Origin rejected'});return;}
   let length=0;const chunks=[];for await(const chunk of req){length+=chunk.length;if(length>4096){json(413,{error:'Request too large'});return;}chunks.push(chunk);}
   let data;try{data=JSON.parse(Buffer.concat(chunks).toString());validateRequest(data);}catch{json(400,{error:'Invalid request'});return;}
   json(200,await analyze(data,generate,provider));return;
  }
  if(req.method!=='GET'||!assets.has(pathname)){json(404,{error:'Not found'});return;}
  const file=assets.get(pathname);const type=file.endsWith('.js')?'application/javascript':file.endsWith('.css')?'text/css':'text/html';
  res.writeHead(200,{'content-type':type+'; charset=utf-8','content-security-policy':"default-src 'self'; script-src 'self'; style-src 'self'; img-src 'self' data:; connect-src 'self'; object-src 'none'; base-uri 'self'; frame-ancestors 'none'",'x-content-type-options':'nosniff'});res.end(await readFile(new URL(file,import.meta.url)));
 }catch{json(500,{error:'Request failed'});}
});
server.listen(4180,'127.0.0.1',()=>console.log('PRO-VISION: http://localhost:4180'));
let stopping=false;async function shutdown(){if(stopping)return;stopping=true;server.close();try{await close();}finally{process.exit(0);}}
process.on('SIGINT',shutdown);process.on('SIGTERM',shutdown);
