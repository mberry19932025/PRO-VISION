import {mkdir,cp,readFile,writeFile} from 'node:fs/promises';
await mkdir('dist/src',{recursive:true});
for(const file of ['index.html','style.css'])await cp(file,'dist/'+file);
for(const file of ['events.js','stories.js','app.js'])await cp('src/'+file,'dist/src/'+file);
const path='.openai/hosting.json';try{const hosting=JSON.parse(await readFile(path,'utf8'));hosting.static={directory:'dist'};await writeFile(path,JSON.stringify(hosting,null,2)+'\n');}catch(error){if(error.code!=='ENOENT')throw error;}
console.log('Built PRO-VISION static preview. AI requires the local server or a configured cloud backend.');
