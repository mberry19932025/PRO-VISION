import {readFile,writeFile,mkdir} from 'node:fs/promises';
export async function offlineHTML(){
 const exports={};const chunks=[];
 for(const name of ['events','stories','memories','workflow','app']){
  let source=await readFile(new URL('../src/'+name+'.js',import.meta.url),'utf8');
  const names=[...source.matchAll(/^export (?:const|function|class) (\w+)/gm)].map(m=>m[1]);
  source=source.replace(/^import \{([^}]+)\} from '\.\/(\w+)\.js';\n/gm,(_,bindings,dependency)=>`const {${bindings}}=__pv_${dependency};\n`).replace(/^export /gm,'');
  if(/^import |^export /m.test(source))throw new Error('Unsupported offline module syntax');
  exports[name]=names;
  chunks.push(`const __pv_${name}=(()=>{\n${source}\nreturn {${names.join(',')}};\n})();`);
 }
 const code=`(()=>{try{${chunks.join('\n')}document.getElementById('preview-startup').textContent='Offline preview ready · synthetic data · computed explanations';}catch(error){document.getElementById('preview-startup').textContent='Preview could not start: '+error.message;console.error(error);}})();`;
 let html=await readFile(new URL('../index.html',import.meta.url),'utf8');
 html=html.replace('<link rel="stylesheet" href="style.css">','<style>'+await readFile(new URL('../style.css',import.meta.url),'utf8')+'</style>');
 html=html.replace('<main>','<main><p id="preview-startup" role="status">Starting offline preview… If this message remains, enable JavaScript in your browser.</p>');
 html=html.replace('<script type="module" src="src/app.js"></script>','<script>'+code.replace(/<\/script/gi,'<\\/script')+'</script>');
 if(html.includes('src="src/app.js"')||html.includes('href="style.css"'))throw new Error('External preview dependency');
 return html;
}
if(process.argv[1]&&new URL('file://'+process.argv[1]).href===import.meta.url){await mkdir('dist',{recursive:true});await writeFile('dist/PRO-VISION Preview.html',await offlineHTML());console.log('Standalone offline preview built. Open it directly; no server required.');}
