'use strict';
const $ = s => document.querySelector(s);
const reduce = matchMedia('(prefers-reduced-motion: reduce)');
let motionOff = reduce.matches;
try { motionOff = motionOff || localStorage.getItem('sc-motion-off') === 'true'; } catch {}
const motionButton = $('#motion-toggle');
const reveals = [...document.querySelectorAll('.reveal')];
let observer;
function showAll(){reveals.forEach(el=>el.classList.add('visible'));observer?.disconnect();}
function setMotion(off){
 motionOff = off;
 document.body.classList.toggle('motion-off',off);
 document.documentElement.style.scrollBehavior = off ? 'auto' : '';
 motionButton.textContent = `Motion: ${off ? 'off' : 'on'}`;
 motionButton.setAttribute('aria-pressed',String(off));
 if(off)showAll();
 requestFrame();
}
if(!motionOff && 'IntersectionObserver' in window){
 observer=new IntersectionObserver(entries=>entries.forEach(entry=>{if(entry.isIntersecting){entry.target.classList.add('visible');observer.unobserve(entry.target);}}),{threshold:.08,rootMargin:'0px 0px -25px 0px'});
 reveals.forEach((el,i)=>{el.classList.add('reveal-pending');el.style.setProperty('--delay',`${i%3*65}ms`);observer.observe(el);});
}
document.addEventListener('focusin',e=>e.target.closest('.reveal-pending')?.classList.add('visible'));
motionButton.addEventListener('click',()=>{setMotion(!motionOff);try{localStorage.setItem('sc-motion-off',String(motionOff));}catch{}});
reduce.addEventListener('change',e=>setMotion(e.matches));
let raf=0;
function requestFrame(){if(!raf)raf=requestAnimationFrame(render);}
function render(){
 raf=0;
 const total=document.documentElement.scrollHeight-innerHeight;
 $('.progress').style.transform=`scaleX(${total>0?Math.min(1,scrollY/total):0})`;
 if(innerWidth>1150&&!motionOff){const p=Math.min(1,scrollY/750);$('.hero-art').style.transform=`translateY(${12+p*35}px) rotate(${p*2}deg)`;}
 else $('.hero-art').style.transform='';
}
addEventListener('scroll',requestFrame,{passive:true});
addEventListener('resize',requestFrame,{passive:true});
setMotion(motionOff);
const toggle=$('.menu-toggle'), nav=$('.nav');
function closeMenu(){nav.classList.remove('is-open');toggle.setAttribute('aria-expanded','false');toggle.setAttribute('aria-label','Open navigation');toggle.textContent='☰';}
toggle.addEventListener('click',()=>{const open=toggle.getAttribute('aria-expanded')!=='true';nav.classList.toggle('is-open',open);toggle.setAttribute('aria-expanded',String(open));toggle.setAttribute('aria-label',open?'Close navigation':'Open navigation');toggle.textContent=open?'×':'☰';});
nav.querySelectorAll('a').forEach(a=>a.addEventListener('click',closeMenu));
document.addEventListener('keydown',e=>{if(e.key==='Escape'&&nav.classList.contains('is-open')){closeMenu();toggle.focus();}});
const demoBody=$('#demo-body');
const demos={map:demoBody.innerHTML,follow:`<p class="eyebrow">YOUR FOLLOWED PROSPECTS</p><h3 class="activity-heading">See the next opening.</h3><p class="activity-sub">Keep the accounts you care about in view.</p><div class="activity-item"><small>TEAM CHANGE</small><b>A new face on the buying team.</b><p>Follow updates about the people behind your target accounts.</p></div><div class="activity-item"><small>ACCOUNT MOVE</small><b>A new agency relationship.</b><p>Understand how the team around a prospect is changing.</p></div><div class="activity-item"><small>NEW OPPORTUNITY</small><b>A reason to start a conversation.</b><p>Get context on upcoming spend and RFPs shared by the crowd.</p></div>`,ask:`<p class="eyebrow">ASK THE CROWD</p><h3 class="activity-heading">Someone’s been in that room.</h3><p class="activity-sub">A better question can open a better conversation.</p><div class="question-card">“Who’s the right person to speak with about streaming at Atlas Athletics?”</div><div class="answer-card"><b>ILLUSTRATIVE COMMUNITY RESPONSE</b>Start with the media strategy team. Check the org chart for the current contacts and agency relationships.</div><div class="demo-insight"><span>✧</span><p>Experience gets more useful when it’s shared.<br><b>Bring your questions. Add your perspective.</b></p></div>`};
const tabs=[...document.querySelectorAll('[role="tab"]')];
function selectTab(tab){tabs.forEach(t=>{const active=t===tab;t.classList.toggle('active',active);t.setAttribute('aria-selected',String(active));t.tabIndex=active?0:-1;});$('#product-panel').setAttribute('aria-labelledby',tab.id);demoBody.innerHTML=demos[tab.dataset.feature];demoBody.classList.remove('changing');requestAnimationFrame(()=>demoBody.classList.add('changing'));}
tabs.forEach((tab,i)=>{tab.addEventListener('click',()=>selectTab(tab));tab.addEventListener('keydown',e=>{let next;if(e.key==='ArrowDown'||e.key==='ArrowRight')next=(i+1)%tabs.length;if(e.key==='ArrowUp'||e.key==='ArrowLeft')next=(i+tabs.length-1)%tabs.length;if(e.key==='Home')next=0;if(e.key==='End')next=tabs.length-1;if(next!==undefined){e.preventDefault();tabs[next].focus();selectTab(tabs[next]);}});});
