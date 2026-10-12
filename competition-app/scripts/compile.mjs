import {readFile,writeFile} from 'node:fs/promises';
const read=p=>readFile(new URL('../'+p,import.meta.url),'utf8');
const [core,client,html,css,backend,narrative,bootstrap,brand]=await Promise.all(['src/core.js','src/client.js','src/index.html','src/styles.css','src/backend.js','src/narrative.js','src/bootstrap.js','src/brand.svg'].map(read));
await writeFile(new URL('../worker/index.js',import.meta.url),core+'\n'+narrative+'\nconst HTML='+JSON.stringify(html)+';\nconst CSS='+JSON.stringify(css)+';\nconst CLIENT='+JSON.stringify(core.replaceAll('export ','')+'\n'+client)+';\nconst BOOTSTRAP='+JSON.stringify(bootstrap)+';\nconst BRAND='+JSON.stringify(brand)+';\n'+backend);
console.log('Compiled PRO-VISION worker');
