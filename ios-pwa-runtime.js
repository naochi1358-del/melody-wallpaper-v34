// iPhoneホーム画面アプリ向け補助（Android版のコードには触れない）
(function(){
 const LS={g(k){try{return localStorage.getItem(k)}catch(e){return null}},s(k,v){try{localStorage.setItem(k,v)}catch(e){}}};
 ['gesturestart','gesturechange','gestureend'].forEach(t=>document.addEventListener(t,e=>e.preventDefault()));
 let silent=null;
 function unlock(){if(silent)return;try{
   const a=document.createElement('audio');a.setAttribute('playsinline','');a.loop=true;a.volume=0.0001;
   const n=44100,b=new Uint8Array(44+n*2),dv=new DataView(b.buffer);
   const w=(o,s)=>{for(let i=0;i<s.length;i++)b[o+i]=s.charCodeAt(i)};
   w(0,'RIFF');dv.setUint32(4,36+n*2,true);w(8,'WAVEfmt ');dv.setUint32(16,16,true);dv.setUint16(20,1,true);dv.setUint16(22,1,true);dv.setUint32(24,44100,true);dv.setUint32(28,88200,true);dv.setUint16(32,2,true);dv.setUint16(34,16,true);w(36,'data');dv.setUint32(40,n*2,true);
   a.src=URL.createObjectURL(new Blob([b],{type:'audio/wav'}));const p=a.play();if(p&&p.catch)p.catch(()=>{});silent=a;
 }catch(e){}}
 ['touchend','click'].forEach(t=>document.addEventListener(t,unlock,{passive:true,once:true}));
 let lock=null;
 async function wake(){try{
   if(!navigator.wakeLock)return;
   if(LS.g('melo_ios_wake')!=='1'){if(lock){try{await lock.release()}catch(e){}lock=null}return}
   if(document.visibilityState==='visible'&&!lock){lock=await navigator.wakeLock.request('screen');lock.addEventListener('release',()=>{lock=null})}
 }catch(e){lock=null}}
 document.addEventListener('visibilitychange',wake);
 function addPanel(){try{
   const panel=document.getElementById('panel');if(!panel||document.getElementById('iosWakeRow'))return;
   const h4=[...panel.querySelectorAll('h4')].find(x=>x.textContent.indexOf('時計・表示')>=0);
   if(!h4)return;
   const row=document.createElement('div');row.id='iosWakeRow';row.className='row';
   const b=document.createElement('button');b.className='pb';b.id='iosWake';b.textContent='画面を自動でオフにしない（iPhone）ON/OFF';
   const note=document.createElement('div');note.className='note';note.id='iosWakeNote';
   const sync=()=>{const on=LS.g('melo_ios_wake')==='1';b.classList.toggle('on',on);note.textContent=navigator.wakeLock?'ONにすると、このアプリを開いている間は画面が暗くならず、壁紙のように出しっぱなしにできます（電池を多く使います）。':'このiPhoneのOS（iOS 16.4より前）では使えません。'};
   b.addEventListener('click',()=>{LS.s('melo_ios_wake',LS.g('melo_ios_wake')==='1'?'0':'1');sync();wake()});
   row.appendChild(b);const anchor=h4.nextElementSibling;(anchor&&anchor.parentNode?anchor.parentNode:h4.parentNode).insertBefore(row,anchor?anchor.nextSibling:null);
   row.parentNode.insertBefore(note,row.nextSibling);sync();
 }catch(e){}}
 const mo=new MutationObserver(addPanel);
 document.addEventListener('DOMContentLoaded',()=>{addPanel();mo.observe(document.getElementById('panel')||document.body,{childList:true,subtree:true})});
 if(document.readyState!=='loading'){addPanel();try{mo.observe(document.getElementById('panel')||document.body,{childList:true,subtree:true})}catch(e){}}
 let swStatus='not-started',swError='';
 async function registerSw(){
   if(!('serviceWorker' in navigator)){swStatus='unsupported';return}
   try{
     const reg=await navigator.serviceWorker.register('./sw.js',{scope:'./'});
     swStatus=reg.active?'active':(reg.installing?'installing':'registered');
     if(reg.installing)reg.installing.addEventListener('statechange',()=>{swStatus=reg.active?'active':reg.installing?.state||'installing'});
   }catch(e){swStatus='error';swError=String(e&&e.message||e)}
 }
 if(document.readyState==='complete')registerSw();else addEventListener('load',registerSw,{once:true});
 wake();
 window.__ios=()=>({ver:'35',wake:LS.g('melo_ios_wake')==='1',hasLock:!!lock,silentAudio:!!silent,swStatus,swError});
})();