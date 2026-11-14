'use strict';
const preference=matchMedia('(prefers-reduced-motion: reduce)');
const motion=document.getElementById('motion');
let off=preference.matches;
const reveals=[...document.querySelectorAll('.reveal')];
let observer;
function setMotion(value){off=value;document.documentElement.classList.toggle('motion-off',off);motion.textContent=off?'Enable motion':'Pause motion';motion.setAttribute('aria-pressed',String(off));if(off){reveals.forEach(el=>el.classList.remove('pending'));observer?.disconnect();}}
if(!off && 'IntersectionObserver' in window){observer=new IntersectionObserver(entries=>entries.forEach(entry=>{if(entry.isIntersecting){entry.target.classList.remove('pending');observer.unobserve(entry.target);}}),{threshold:.08});reveals.forEach(el=>{el.classList.add('pending');observer.observe(el);});document.querySelectorAll('.food-card').forEach((el,i)=>el.style.setProperty('--delay',`${i*85}ms`));}
setMotion(off);motion.addEventListener('click',()=>setMotion(!off));preference.addEventListener('change',e=>setMotion(e.matches));document.addEventListener('focusin',e=>e.target.closest('.pending')?.classList.remove('pending'));
let frame=0;function update(){frame=0;const total=document.documentElement.scrollHeight-innerHeight;document.querySelector('.progress').style.transform=`scaleX(${total>0?scrollY/total:0})`;}
addEventListener('scroll',()=>{if(!frame)frame=requestAnimationFrame(update);},{passive:true});addEventListener('resize',update);update();
