process.send({type:'ready',modelId:'test-worker'});
process.on('message',message=>{
 if(message.messages[0]?.content==='hang'){while(true){/* Simulate a native operation blocking the worker event loop. */}}
 else process.send({type:'result',id:message.id,output:'checked output'});
});
