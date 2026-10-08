import http from 'node:http';
import {readFile} from 'node:fs/promises';
import {createAnalyzer,validateRequest} from './src/api.js';
const port=Number(process.env.PORT||4180),host=process.env.HOST||'127.0.0.1';
if(!Number.isInteger(port)||port<0||port>65535)throw new Error('Invalid PORT');
const publicOrigin=process.env.PUBLIC_ORIGIN?new URL(process.env.PUBLIC_ORIGIN).origin:null;
if(publicOrigin&&!publicOrigin.startsWith('https://'))throw new Error('PUBLIC_ORIGIN must use HTTPS');
const allowedOrigins=new Set(publicOrigin?[publicOrigin]:[`http://localhost:${port}`,`http://127.0.0.1:${port}`]);
let activeRequests=0;const calls=[];
let generate=null,provider=null,modelId=null,close=async()=>{};
if(process.argv.includes('--ai')){
 const {createLocalGenerator}=await import('./src/local-generator.mjs');
 const local=await createLocalGenerator();generate=local.generate;close=local.close;provider='foundry-local';modelId=local.modelId;
 console.log('Microsoft model loaded:',modelId);
}else if(process.env.AZURE_OPENAI_ENDPOINT&&process.env.AZURE_OPENAI_API_KEY&&process.env.AZURE_OPENAI_DEPLOYMENT){
 const endpoint=new URL(process.env.AZURE_OPENAI_ENDPOINT);
 if(endpoint.protocol!=='https:'||!/(^|\.)(openai\.azure\.com|services\.ai\.azure\.com)$/.test(endpoint.hostname))throw new Error('Unsupported Azure endpoint');
 provider='azure';generate=async messages=>{const r=await fetch(endpoint.origin+'/openai/v1/chat/completions',{method:'POST',headers:{'content-type':'application/json','api-key':process.env.AZURE_OPENAI_API_KEY},body:JSON.stringify({model:process.env.AZURE_OPENAI_DEPLOYMENT,messages,max_tokens:220,temperature:.1}),signal:AbortSignal.timeout(20000)});if(!r.ok)throw new Error('Provider failed');return (await r.json()).choices?.[0]?.message?.content??'';};
}
const analyzeRequest=createAnalyzer(generate,provider);
const assets=new Map([['/','index.html'],['/style.css','style.css'],...['events.js','stories.js','memories.js','workflow.js','app.js'].map(f=>['/src/'+f,'src/'+f])]);
const server=http.createServer(async(req,res)=>{
 const json=(status,data)=>{res.writeHead(status,{'content-type':'application/json','cache-control':'no-store'});res.end(JSON.stringify(data));};
 try{
  const pathname=new URL(req.url,'http://localhost:4180').pathname;
  if(pathname==='/api/health'&&req.method==='GET'){json(200,{ai:!!generate,provider,modelId});return;}
  if(pathname==='/api/story'&&req.method==='POST'){
   if(req.headers.origin&&!allowedOrigins.has(req.headers.origin)){json(403,{error:'Origin rejected'});return;}
   let length=0;const chunks=[];for await(const chunk of req){length+=chunk.length;if(length>4096){json(413,{error:'Request too large'});return;}chunks.push(chunk);}
   let data;try{data=JSON.parse(Buffer.concat(chunks).toString());validateRequest(data);}catch{json(400,{error:'Invalid request'});return;}
   if(generate){const now=Date.now();while(calls.length&&calls[0]<now-60000)calls.shift();if(activeRequests>=2||calls.length>=12){res.setHeader('retry-after','60');json(429,{error:'AI is busy; try again shortly'});return;}calls.push(now);}
   activeRequests++;const started=performance.now();try{const result=await analyzeRequest(data);console.log(JSON.stringify({type:'story-response',eventIndex:data.index,mode:data.prefs.mode,language:data.prefs.language,provider:result.story.provider,elapsedMs:Math.round(performance.now()-started),attempts:result.cacheStatus==='hit'?0:result.trace?.length??0,cacheStatus:result.cacheStatus}));json(200,result);}finally{activeRequests--;}return;
  }
  if(req.method!=='GET'||!assets.has(pathname)){json(404,{error:'Not found'});return;}
  const file=assets.get(pathname);const type=file.endsWith('.js')?'application/javascript':file.endsWith('.css')?'text/css':'text/html';
  res.writeHead(200,{'content-type':type+'; charset=utf-8','content-security-policy':"default-src 'self'; script-src 'self'; style-src 'self'; img-src 'self' data:; connect-src 'self'; object-src 'none'; base-uri 'self'; frame-ancestors 'none'",'x-content-type-options':'nosniff'});res.end(await readFile(new URL(file,import.meta.url)));
 }catch{json(500,{error:'Request failed'});}
});
server.listen(port,host,()=>console.log('PRO-VISION listening on port '+server.address().port));
let stopping=false;async function shutdown(){if(stopping)return;stopping=true;server.close();try{await close();}finally{process.exit(0);}}
process.on('SIGINT',shutdown);process.on('SIGTERM',shutdown);
