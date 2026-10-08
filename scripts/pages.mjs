import {writeFile,readFile,access} from 'node:fs/promises';
for(const file of ['dist/index.html','dist/style.css','dist/src/app.js','dist/src/events.js','dist/src/stories.js','dist/src/memories.js','dist/src/workflow.js'])await access(file);
await writeFile('dist/.nojekyll','');
const html=await readFile('dist/index.html','utf8');
if(!html.includes('href="style.css"')||!html.includes('src="src/app.js"'))throw new Error('Pages assets must use relative paths');
console.log('GitHub Pages bundle ready in dist/. Publish these static files to the gh-pages branch; live AI requires the local test build.');
