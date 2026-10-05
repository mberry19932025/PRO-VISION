import test from 'node:test';
import assert from 'node:assert/strict';
import {createMemory,memorySVG,memoryHTML,memoryLink,parseMomentLink} from '../src/memories.js';
const prefs={mode:'analyst',language:'es',team:'all',player:'all'};
test('keepsake freezes replay evidence and rejects future narrative sources',()=>{
 const m=createMemory(0,prefs,{note:'My personal story'},{provider:'azure',interpretation:'Future goal',evidence:['M001','M009']});
 assert.equal(m.eventId,'M001');assert.equal(m.provider,'computed');assert.ok(!m.evidence.includes('M009'));assert.ok(!m.observed.includes('My personal story'));assert.ok(!m.interpretation.includes('Future goal'));
});
test('replay link round trips preferences without personal information',()=>{
 const m=createMemory(3,prefs,{name:'SECRETNAME',note:'SECRETNOTE',photo:'data:image/png;base64,AAAA'});
 const link=memoryLink(m,'https://example.org/PRO-VISION/');assert.ok(link.startsWith('https://example.org/PRO-VISION/#'));for(const secret of ['SECRETNAME','SECRETNOTE','AAAA'])assert.ok(!link.includes(secret));assert.deepEqual(parseMomentLink(new URL(link).hash),{index:3,prefs});
 assert.equal(parseMomentLink('#moment=unknown'),null);assert.equal(parseMomentLink('#moment=M001&lens=evil').prefs.mode,'fan');
});
test('exports escape fan text and reject remote or oversized photo data',()=>{
 const m=createMemory(8,prefs,{name:'<script>',note:'<img src=x onerror=alert(1)>'});
 for(const output of [memorySVG(m),memoryHTML(m)]){assert.ok(!output.includes('<script>'));assert.ok(!output.includes('<img src=x'));assert.ok(output.includes('&lt;'));}
 assert.throws(()=>createMemory(0,prefs,{photo:'https://example.org/photo.png'}));assert.throws(()=>createMemory(0,prefs,{photo:'data:image/png;base64,'+'A'.repeat(1500001)}));
 const html=memoryHTML(m);assert.ok(html.includes('Analyst lens'));assert.ok(html.includes('Explore the evidence'));assert.ok(html.includes('Synthetic football excerpt'));assert.ok(html.includes('personal additions, not match evidence'));
});
test('restored preferences are normalized and invalid replay indices rejected',()=>{
 const m=createMemory(0,{mode:'bad',team:'bad',language:'bad',player:'bad'},{name:'a'.repeat(80),note:'b'.repeat(300)});assert.deepEqual(m.prefs,{mode:'fan',team:'all',language:'en',player:'all'});assert.equal(m.name.length,32);assert.equal(m.note.length,140);assert.throws(()=>createMemory(100,prefs));
});
