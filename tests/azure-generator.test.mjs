import test from 'node:test';
import assert from 'node:assert/strict';
import {createAzureGenerator} from '../src/azure-generator.mjs';
const config={AZURE_OPENAI_ENDPOINT:'https://example.openai.azure.com/',AZURE_OPENAI_API_KEY:'test-secret',AZURE_OPENAI_DEPLOYMENT:'test-deployment'};
test('Azure setup requires complete configuration and a safe Microsoft endpoint',()=>{
 assert.equal(createAzureGenerator({}),null);
 assert.throws(()=>createAzureGenerator({AZURE_OPENAI_API_KEY:'test-secret'}),/incomplete/);
 for(const endpoint of ['http://example.openai.azure.com','https://example.openai.azure.com.attacker.test','https://user:pass@example.openai.azure.com','https://example.openai.azure.com:444'])assert.throws(()=>createAzureGenerator({...config,AZURE_OPENAI_ENDPOINT:endpoint}),/endpoint/);
 assert.throws(()=>createAzureGenerator({...config,PROVISION_AI_DAILY_LIMIT:'0'}),/daily/);
});
test('Azure adapter sends bounded requests to the configured deployment',async()=>{
 let request;const cloud=createAzureGenerator(config,{fetchImpl:async(url,options)=>{request={url,options};return {ok:true,json:async()=>({choices:[{message:{content:'Grounded output'}}]})};}});
 assert.equal(await cloud.generate([{role:'user',content:'Synthetic facts'}]),'Grounded output');
 assert.equal(request.url,'https://example.openai.azure.com/openai/v1/chat/completions');
 assert.equal(request.options.headers['api-key'],'test-secret');
 const body=JSON.parse(request.options.body);assert.equal(body.model,'test-deployment');assert.equal(body.max_tokens,220);
 assert.ok(!JSON.stringify(cloud.usage).includes('test-secret'));
});
test('daily Azure allowance counts failures and resets by UTC day',async()=>{
 let time=Date.UTC(2026,9,11),calls=0;
 const cloud=createAzureGenerator({...config,PROVISION_AI_DAILY_LIMIT:'2'},{now:()=>time,fetchImpl:async()=>{calls++;return {ok:false};}});
 await assert.rejects(cloud.generate([]),/Provider failed/);await assert.rejects(cloud.generate([]),/Provider failed/);
 await assert.rejects(cloud.generate([]),error=>error.code==='DAILY_LIMIT');assert.equal(calls,2);
 time+=86400000;await assert.rejects(cloud.generate([]),/Provider failed/);assert.equal(calls,3);assert.equal(cloud.usage.attempts,1);
});
test('malformed Azure responses fail without exposing response content',async()=>{
 const cloud=createAzureGenerator(config,{fetchImpl:async()=>({ok:true,json:async()=>({private:'secret provider error'})})});
 await assert.rejects(cloud.generate([]),error=>error.message==='Provider returned no text');
});
