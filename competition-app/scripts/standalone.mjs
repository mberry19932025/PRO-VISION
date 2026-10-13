import {readFile,writeFile,mkdir} from 'node:fs/promises';
const root=new URL('../',import.meta.url);
const read=name=>readFile(new URL('src/'+name,root),'utf8');
const [html,css,core,client,brand]=await Promise.all(['index.html','styles.css','core.js','client.js','brand.svg'].map(read));
const page=html.replaceAll('/brand.svg','data:image/svg+xml;charset=utf-8,'+encodeURIComponent(brand)).replace('<link rel="stylesheet" href="/styles.css">','<style>'+css+'</style>').replace('<script type="module" src="/bootstrap.js"></script>','<script type="module">const bootStarted=Date.now();try{'+core.replaceAll('export ','')+'\n'+client+"\nawait new Promise(resolve=>setTimeout(resolve,Math.max(0,1500-(Date.now()-bootStarted))));document.getElementById('loading-screen').hidden=true;}catch{document.getElementById('loading-status').textContent='This preview could not start. Refresh to try again.';}"+'</script>').replace('href="/" aria-label="PRO-VISION AI home"','href="#match" aria-label="PRO-VISION AI home"');
await mkdir(new URL('output/',root),{recursive:true});await writeFile(new URL('output/PRO-VISION-AI-Demo.html',root),page);
console.log('Created output/PRO-VISION-AI-Demo.html');
