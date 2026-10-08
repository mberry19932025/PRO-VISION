import {spawn} from 'node:child_process';
import {fileURLToPath} from 'node:url';
import {access} from 'node:fs/promises';
const root=fileURLToPath(new URL('../',import.meta.url));
try{await import('foundry-local-sdk');}catch{console.error('Microsoft AI SDK is missing. In the project folder run: npm ci --ignore-scripts, then npm run ai:setup.');process.exit(1);}
const env={...process.env};
if(!env.PROVISION_MODEL_CACHE){const shared=fileURLToPath(new URL('../../.provision/models/',import.meta.url));try{await access(shared);env.PROVISION_MODEL_CACHE=shared;}catch{}}
const child=spawn(process.execPath,['--env-file-if-exists=.env','server.mjs','--ai'],{cwd:root,env,stdio:['inherit','pipe','inherit']});
let opened=false;child.stdout.on('data',chunk=>{const output=chunk.toString();process.stdout.write(output);if(!opened&&output.includes('PRO-VISION listening on port')){opened=true;const port=env.PORT||4180;const url=`http://127.0.0.1:${port}/`;console.log('Keep this Terminal window open. First model loading may take a while.');if(process.platform==='darwin')spawn('open',[url],{stdio:'ignore'});else console.log('Open '+url+' in your browser.');}});
child.on('error',error=>{console.error('Could not start AI server: '+error.message);process.exitCode=1;});
child.on('exit',code=>{process.exitCode=code??1;});
for(const signal of ['SIGINT','SIGTERM'])process.on(signal,()=>child.kill(signal));
