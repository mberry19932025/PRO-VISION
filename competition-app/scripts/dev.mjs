import http from 'node:http';
import worker from '../worker/index.js';
import {createUsageGuard} from './usage-guard.mjs';
const port=Number(process.env.PORT||(process.env.WEBSITE_HOSTNAME?8080:4173)),host=process.env.HOST||(process.env.WEBSITE_HOSTNAME?'0.0.0.0':'127.0.0.1');
if(!Number.isInteger(port)||port<0||port>65535)throw new Error('Invalid PORT');
const publicOrigin=process.env.PUBLIC_ORIGIN||(process.env.WEBSITE_HOSTNAME?'https://'+process.env.WEBSITE_HOSTNAME:null);
if(publicOrigin){const url=new URL(publicOrigin);if(url.protocol!=='https:'||url.username||url.password||url.pathname!=='/'||url.search||url.hash)throw new Error('PUBLIC_ORIGIN must be an HTTPS origin');}
if(host!=='127.0.0.1'&&!publicOrigin)throw new Error('Public hosting requires PUBLIC_ORIGIN or WEBSITE_HOSTNAME');
const usagePath=process.env.PROVISION_USAGE_PATH||(process.env.WEBSITE_HOSTNAME?'/home/provision/azure-usage.json':new URL('../.provision/azure-usage.json',import.meta.url).pathname);
const usage=await createUsageGuard(usagePath,{dailyLimit:Number(process.env.PROVISION_AI_DAILY_LIMIT||(process.env.WEBSITE_HOSTNAME?20:10)),monthlyLimit:Number(process.env.PROVISION_AI_MONTHLY_LIMIT||100)});
const runtime=process.argv.includes('--foundry')?await (await import('./foundry.mjs')).startFoundry():null;
const env={...process.env,PROVISION_RESERVE_AI:()=>usage.reserve(),...(runtime?{PROVISION_GENERATE:runtime.generate}:{})};
const server = http.createServer(async (req,res) => {
  try {
    const chunks=[];let size=0;for await (const chunk of req){size+=chunk.length;if(size>16384){res.writeHead(413);res.end('Request too large');return;}chunks.push(chunk);}
    if(req.url==='/api/usage'&&req.method==='GET'){res.writeHead(200,{'content-type':'application/json','cache-control':'no-store'});res.end(JSON.stringify(usage.status()));return;}
    const request=new Request(`${publicOrigin||'http://localhost:'+port}${req.url}`,{method:req.method,headers:req.headers,...(!['GET','HEAD'].includes(req.method)?{body:Buffer.concat(chunks)}:{})});
    const response=await worker.fetch(request,env);
    res.writeHead(response.status,Object.fromEntries(response.headers)); res.end(Buffer.from(await response.arrayBuffer()));
  } catch { res.writeHead(500);res.end('Server error'); }
});
server.listen(port,host,()=>console.log('PRO-VISION AI: '+(publicOrigin||'http://localhost:'+server.address().port)));
server.on('error',error=>{console.error(error.code==='EADDRINUSE'?'PRO-VISION port is already in use.':'PRO-VISION server could not start.');process.exit(1);});
let stopping=false;
async function shutdown(){if(stopping)return;stopping=true;server.close();try{await runtime?.close();}finally{process.exit(0);}}
process.on('SIGINT',shutdown);process.on('SIGTERM',shutdown);
