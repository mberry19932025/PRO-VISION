import {readFile,writeFile,mkdir} from 'node:fs/promises';
const root=new URL('../',import.meta.url);
const read=name=>readFile(new URL('src/'+name,root),'utf8');
const [html,css,core,client]=await Promise.all(['index.html','styles.css','core.js','client.js'].map(read));
const page=html.replace('<link rel="stylesheet" href="/styles.css">','<style>'+css+'</style>').replace('<script type="module" src="/app.js"></script>','<script type="module">'+core.replaceAll('export ','')+'\n'+client+'</script>').replace('href="/" aria-label="PRO-VISION AI home"','href="#match" aria-label="PRO-VISION AI home"');
await mkdir(new URL('output/',root),{recursive:true});await writeFile(new URL('output/PRO-VISION-AI-Demo.html',root),page);
console.log('Created output/PRO-VISION-AI-Demo.html');
