import {mkdir} from 'node:fs/promises';
export async function startFoundry() {
  const {FoundryLocalManager}=await import('foundry-local-sdk');
  const root=new URL('../.provision/',import.meta.url);
  await mkdir(root,{recursive:true});
  const path=name=>decodeURIComponent(new URL(name,root).pathname);
  const manager=FoundryLocalManager.create({appName:'provision-ai',appDataDir:path('data'),modelCacheDir:path('models'),logsDir:path('logs'),disableNonessentialTelemetry:true});
  try {
    const model=await manager.catalog.getModel(process.env.PROVISION_LOCAL_MODEL||'qwen2.5-0.5b');
    if(!model.isCached){console.log('Downloading local model into the project cache…');let reported=-1;await model.download(progress=>{const step=Math.floor(progress/10)*10;if(step>reported){reported=step;console.log('Model download:',step+'%');}});}
    await model.load();const client=model.createChatClient();client.settings.maxTokens=220;client.settings.temperature=.2;
    let busy=false;
    console.log('Foundry Local model loaded:',model.id);
    return {generate:async messages=>{if(busy)throw new Error('Model busy');busy=true;try{const response=await client.completeChat(messages);return response.choices?.[0]?.message?.content;}finally{busy=false;}},close:async()=>{client.dispose();await model.unload();manager.dispose();}};
  }catch(error){manager.dispose();throw error;}
}
