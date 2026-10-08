import test from 'node:test';
import assert from 'node:assert/strict';
import vm from 'node:vm';
import {offlineHTML} from '../scripts/offline.mjs';
test('standalone preview boots without server and handles replay, recap and memory creation',async()=>{
 const html=await offlineHTML();assert.ok(!html.includes('type="module"'));assert.ok(!html.includes('data:text/javascript'));assert.ok(!html.includes('href="style.css"'));
 const elements=new Map([...html.matchAll(/\bid="([^"]+)"/g)].map(m=>[m[1],{textContent:'',innerHTML:'',value:'',files:[],disabled:false,hidden:false,dataset:{},querySelectorAll:()=>[],setAttribute(){},removeAttribute(){},scrollIntoView(){}}]));
 const storage=new Map();let fetches=0;
 const context=vm.createContext({document:{getElementById:id=>elements.get(id),querySelectorAll:()=>[]},location:{protocol:'file:',hash:'',href:'file:///preview.html'},window:{addEventListener(){}},localStorage:{getItem:k=>storage.get(k)||null,setItem:(k,v)=>storage.set(k,v),removeItem:k=>storage.delete(k)},console,URL,URLSearchParams,Blob,structuredClone,AbortController,setTimeout,clearTimeout,setInterval,clearInterval,performance,fetch:()=>{fetches++;throw new Error('Offline network access');}});
 const script=html.match(/<script>([\s\S]*)<\/script>/)[1];new vm.Script(script).runInContext(context);
 assert.equal(elements.get('preview-startup').textContent,'Offline preview ready · synthetic data · computed explanations');assert.equal(fetches,0);assert.ok(elements.get('observed').textContent.includes('Alex Vale'));
 elements.get('next').onclick();assert.ok(elements.get('observed').textContent.includes('Sam Torres'));
 elements.get('scrub').oninput({target:{value:'8'}});assert.ok(elements.get('score').innerHTML.startsWith('1 '));elements.get('recap').onclick();assert.ok(elements.get('recap-output').textContent.length>20);
 elements.get('memory-name').value='Test fan';elements.get('memory-note').value='My own memory';await elements.get('memory-create').onclick();assert.ok(elements.get('memory-art').innerHTML.includes('Test fan'));assert.equal(elements.get('memory-html').disabled,false);assert.ok(storage.size===1);
 elements.get('scrub').oninput({target:{value:'0'}});elements.get('memory-tap').onclick();assert.ok(elements.get('score').innerHTML.startsWith('1 '));assert.ok(elements.get('memory-status').textContent.includes('No physical tag'));
 elements.get('memory-clear').onclick();assert.equal(storage.size,0);assert.equal(elements.get('memory-html').disabled,true);
});
