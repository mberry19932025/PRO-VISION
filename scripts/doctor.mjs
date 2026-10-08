import {readFile,access} from 'node:fs/promises';
import os from 'node:os';
const root=new URL('../',import.meta.url);
const exists=async path=>{try{await access(new URL(path,root));return true;}catch{return false;}};
let sdk=null;try{sdk=JSON.parse(await readFile(new URL('node_modules/foundry-local-sdk/package.json',root),'utf8')).version;}catch{}
const major=Number(process.versions.node.split('.')[0]);
const tested=process.platform==='darwin'&&process.arch==='arm64'&&major===24;
const memoryGiB=(os.totalmem()/1024**3).toFixed(1);
console.log('PRO-VISION installation check');
console.log(`Node: ${process.version} · Platform: ${process.platform}/${process.arch} · RAM: ${memoryGiB} GiB`);
console.log(tested?'Matches the tested Node/OS/architecture. This check does not prove model compatibility.':'This combination has not been verified. The tested target is Node 24 on Apple Silicon macOS.');
console.log(sdk?`Foundry Local SDK: ${sdk}`:'Foundry Local SDK missing: run npm ci --ignore-scripts');
if(sdk)console.log(await exists(`node_modules/foundry-local-sdk/prebuilds/${process.platform}-${process.arch}`)?'Native runtime directory present. Loading and inference still require a live check.':'Native runtime directory missing: run npm run ai:setup');
console.log('First AI launch may download about 2.2 GB of model weights. Allow up to 15 minutes for startup; keep Terminal open.');
console.log('Then run npm run preview:ai. No Azure account or API key is required for this local route.');
console.log('Static preview and computed fallback do not establish working AI. Confirm the AI provider label on a generated answer.');
console.log('This check does not download models, start AI, or contact a cloud service.');
if(major<24){console.log('Use Node 24 for the documented installation.');process.exitCode=1;}
