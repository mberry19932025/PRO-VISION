import {fork} from 'node:child_process';
export async function createLocalGenerator({workerURL=new URL('./local-model-worker.mjs',import.meta.url),timeoutMs=25000,startupMs=900000}={}){
 let worker=null,startingWorker=null,loading=null,busy=false,modelId=null,sequence=0,closed=false;
 const start=()=>{
  if(closed)return Promise.reject(new Error('Closed'));
  if(worker)return Promise.resolve(worker);
  if(loading)return loading;
  loading=new Promise((resolve,reject)=>{
   const candidate=fork(workerURL,[],{stdio:['ignore','pipe','pipe','ipc']});
   startingWorker=candidate;
   candidate.stdout.on('data',b=>process.stdout.write(b));candidate.stderr.on('data',b=>process.stderr.write(b));
   const timer=setTimeout(()=>{cleanup();candidate.kill('SIGKILL');reject(new Error('Local model startup deadline'));},startupMs);
   const cleanup=()=>{if(startingWorker===candidate)startingWorker=null;clearTimeout(timer);candidate.off('message',ready);candidate.off('error',fail);candidate.off('exit',fail);};
   const fail=()=>{cleanup();reject(new Error('Local model startup failed'));};
   const ready=message=>{if(message.type==='ready'){cleanup();worker=candidate;modelId=message.modelId;candidate.on('exit',()=>{if(worker===candidate)worker=null;});resolve(candidate);}else if(message.type==='startup-error'){candidate.kill('SIGKILL');fail();}};
   candidate.on('message',ready);candidate.once('error',fail);candidate.once('exit',fail);
  }).finally(()=>{loading=null;});return loading;
 };
 await start();
 return {get modelId(){return modelId;},async generate(messages){
  if(busy)throw new Error('Busy');busy=true;
  try{
   const candidate=await start(),id=++sequence;
   return await new Promise((resolve,reject)=>{
    let timer;
    const cleanup=()=>{clearTimeout(timer);candidate.off('message',receive);candidate.off('exit',exit);candidate.off('error',exit);};
    const exit=()=>{cleanup();reject(new Error('Local model worker stopped'));};
    const receive=message=>{if(message.type!=='result'||message.id!==id)return;cleanup();message.error?reject(new Error('Local generation failed')):resolve(message.output);};
    timer=setTimeout(()=>{cleanup();if(worker===candidate)worker=null;candidate.kill('SIGKILL');reject(new Error('Generation deadline'));},timeoutMs);
    candidate.on('message',receive);candidate.once('exit',exit);candidate.once('error',exit);
    candidate.send({type:'generate',id,messages},error=>{if(error)exit();});
   });
  }finally{busy=false;}
 },async close(){closed=true;const candidate=worker,pending=startingWorker;worker=null;if(candidate)candidate.kill('SIGKILL');if(pending&&pending!==candidate)pending.kill('SIGKILL');}};
}
