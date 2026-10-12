export async function boot(importApp=()=>import('./app.js'),page=globalThis.document){
 const screen=page.getElementById('loading-screen'),status=page.getElementById('loading-status'),retry=page.getElementById('loading-retry');
 retry.addEventListener('click',()=>globalThis.location.reload());
 const deadline=setTimeout(()=>{status.textContent='Taking longer than expected. You can retry.';retry.hidden=false;},15000);
 try{await importApp();screen.hidden=true;return true;}
 catch{status.textContent='We couldn’t open your match. Check your connection and try again.';retry.hidden=false;return false;}
 finally{clearTimeout(deadline);}
}
if(typeof document!=='undefined')boot();
