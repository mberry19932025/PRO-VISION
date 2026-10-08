import {mkdir} from 'node:fs/promises';
import {FoundryLocalManager} from 'foundry-local-sdk';
let manager,model,client;
process.on('disconnect',()=>process.exit(0));
try{
 const root=new URL('../.provision/',import.meta.url);await mkdir(root,{recursive:true});
 const path=n=>decodeURIComponent(new URL(n,root).pathname);
 manager=FoundryLocalManager.create({appName:'pro-vision',appDataDir:path('data'),modelCacheDir:process.env.PROVISION_MODEL_CACHE||path('models'),logsDir:path('logs'),disableNonessentialTelemetry:true});
 model=await manager.catalog.getModel(process.env.PROVISION_LOCAL_MODEL||'phi-3.5-mini');
 if(!model.isCached){console.log('Downloading Microsoft model…');let last=-1;await model.download(p=>{const step=Math.floor(p/10)*10;if(step>last){last=step;console.log(step+'%');}});}
 await model.load();client=model.createChatClient();client.settings.maxTokens=150;client.settings.temperature=.1;
 process.send({type:'ready',modelId:model.id});
 process.on('message',async message=>{
  if(message.type!=='generate')return;
  try{const output=(await client.completeChat(message.messages)).choices?.[0]?.message?.content??'';process.send({type:'result',id:message.id,output});}catch{process.send({type:'result',id:message.id,error:'Local generation failed'});}
 });
}catch{process.send?.({type:'startup-error'});process.exit(1);}
process.on('SIGTERM',async()=>{try{client?.dispose();await model?.unload();manager?.dispose();}finally{process.exit(0);}});
