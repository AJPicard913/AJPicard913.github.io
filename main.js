'use strict';
const $ = s => document.querySelector(s);
const hero = $('.hero');
const stage = $('.hero-sticky');
const intro = $('.hero-intro');
const next = $('.hero-next');
const orbit = $('.app-orbit');
const icons = [...document.querySelectorAll('.orbit-app')];
const reduce = matchMedia('(prefers-reduced-motion: reduce)');
const toggle = $('#motion-toggle');
let motionOff = reduce.matches, raf = 0;
const clamp = (v,min=0,max=1)=>Math.min(max,Math.max(min,v));
const ease = t=>t*t*(3-2*t);
const observer = new IntersectionObserver(entries=>entries.forEach(entry=>{if(entry.isIntersecting){entry.target.classList.add('is-visible');observer.unobserve(entry.target);}}),{threshold:.08});
document.querySelectorAll('.reveal').forEach(el=>observer.observe(el));
document.body.classList.add('motion-ready');
function setMotion(off){motionOff=off;document.body.classList.toggle('motion-off',off);toggle.textContent=off?'Motion off':'Motion on';toggle.setAttribute('aria-pressed',String(off));toggle.setAttribute('aria-label',off?'Enable scroll animations':'Disable scroll animations');requestFrame();}
function render(){
 raf=0;
 const total=document.documentElement.scrollHeight-innerHeight;
 $('.reading-progress').style.transform=`scaleX(${total>0?clamp(scrollY/total):0})`;
 const staticHero = motionOff || (innerWidth<=760 && innerHeight<=700);
 const p=staticHero?0:clamp(-hero.getBoundingClientRect().top/Math.max(1,hero.offsetHeight-stage.offsetHeight));
 const fade=1-ease(clamp(p/.42));
 intro.style.opacity=fade;
 intro.style.transform=`translateY(${-p*85}px) scale(${1-p*.035})`;
 intro.style.visibility=fade<.01?'hidden':'visible';
 const text=ease(clamp((p-.28)/.25));
 next.style.opacity=text;
 next.style.transform=`translateY(${(1-text)*35}px)`;
 const mobile=innerWidth<=760;
 const up=ease(clamp(p/.8));
 const maxScale = mobile ? Math.max(1, (stage.clientWidth - 42) / orbit.offsetWidth) : 1.64;
 const scale = 1 + up * Math.min(mobile ? .25 : .64, maxScale - 1);
 orbit.style.transform=`translateX(-50%) translateY(${-up*(mobile?70:75)}px) scale(${scale})`;
 icons.forEach((el,i)=>{const n=i-2;const rot=parseFloat(el.style.getPropertyValue('--r'));el.style.transform=`translateX(${n*up*(mobile?0:11)}px) translateY(${Math.abs(n)*up*(mobile?12:22)}px) rotate(${rot*(1-up*.7)}deg)`;});
}
function requestFrame(){if(!raf)raf=requestAnimationFrame(render);}
addEventListener('scroll',requestFrame,{passive:true});
addEventListener('resize',requestFrame,{passive:true});
document.addEventListener('visibilitychange',()=>{if(!document.hidden)requestFrame();});
toggle.addEventListener('click',()=>setMotion(!motionOff));
reduce.addEventListener('change',e=>setMotion(e.matches));
setMotion(motionOff);
