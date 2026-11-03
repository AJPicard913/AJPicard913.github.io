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

// Native dialogs provide modal semantics and Escape dismissal.
(() => {
 const body = document.body;
 const root = document.documentElement;
 let activeStudy = null;

 function restoreStudy(dialog) {
  if (!activeStudy || activeStudy.dialog !== dialog) return;
  const { opener, x, y, bodyStyle } = activeStudy;
  activeStudy = null;
  const behavior = root.style.getPropertyValue('scroll-behavior');
  const priority = root.style.getPropertyPriority('scroll-behavior');
  root.style.setProperty('scroll-behavior', 'auto', 'important');
  if (bodyStyle === null) body.removeAttribute('style');
  else body.setAttribute('style', bodyStyle);
  if (opener.isConnected) opener.focus({ preventScroll: true });
  window.scrollTo(x, y);
  if (behavior) root.style.setProperty('scroll-behavior', behavior, priority);
  else root.style.removeProperty('scroll-behavior');
  requestFrame();
 }

 function openStudy(opener) {
  const dialog = document.getElementById(opener.dataset.openStudy);
  if (activeStudy || opener.disabled || !dialog?.matches('dialog.study-modal') || dialog.open || typeof dialog.showModal !== 'function') return;
  const x = window.scrollX, y = window.scrollY;
  const gap = Math.max(0, window.innerWidth - root.clientWidth);
  const padding = parseFloat(getComputedStyle(body).paddingRight) || 0;
  const bodyStyle = body.getAttribute('style');
  activeStudy = { dialog, opener, x, y, bodyStyle };
  body.style.setProperty('position', 'fixed');
  body.style.setProperty('top', `${-y}px`);
  body.style.setProperty('left', `${-x}px`);
  body.style.setProperty('right', '0');
  body.style.setProperty('width', '100%');
  body.style.setProperty('overflow', 'hidden');
  if (gap) body.style.setProperty('padding-right', `${padding + gap}px`);
  try {
   dialog.showModal();
   dialog.scrollTop = 0;
  } catch (error) {
   restoreStudy(dialog);
   console.error('Unable to open the case study dialog.', error);
  }
 }

 document.addEventListener('click', event => {
  if (!(event.target instanceof Element)) return;
  const target = event.target;
  const closeButton = target.closest('button[data-close-study]');
  if (closeButton) {
   closeButton.closest('dialog.study-modal')?.close();
   return;
  }
  let opener = target.closest('button[data-open-study]');
  if (!opener) {
   const card = target.closest('.study-card');
   if (!card || target.closest('a, button, input, select, textarea, summary, [role="button"], [contenteditable]')) return;
   if (window.getSelection()?.toString()) return;
   opener = card.querySelector('button[data-open-study]');
  }
  if (opener) openStudy(opener);
 });

 document.querySelectorAll('dialog.study-modal').forEach(dialog => {
  let pressedBackdrop = false;
  const outsidePanel = event => {
   const panel = dialog.querySelector('.study-modal-panel');
   if (!panel || event.target !== dialog) return false;
   const rect = panel.getBoundingClientRect();
   return event.clientX < rect.left || event.clientX > rect.right || event.clientY < rect.top || event.clientY > rect.bottom;
  };
  dialog.addEventListener('pointerdown', event => { pressedBackdrop = outsidePanel(event); });
  dialog.addEventListener('click', event => {
   if (pressedBackdrop && outsidePanel(event)) dialog.close();
   pressedBackdrop = false;
  });
  dialog.addEventListener('keydown', event => {
   if (event.key !== 'Tab' || !dialog.open) return;
   const focusable = [...dialog.querySelectorAll('a[href], button, input, select, textarea, summary, [tabindex], [contenteditable="true"]')].filter(element =>
    element.tabIndex >= 0 && !element.matches(':disabled') && !element.closest('[inert]') && element.getClientRects().length > 0 && getComputedStyle(element).visibility === 'visible'
   );
   const first = focusable[0], last = focusable[focusable.length - 1];
   const current = document.activeElement;
   if (!first || !focusable.includes(current) || (event.shiftKey ? current === first : current === last)) {
    event.preventDefault();
    (event.shiftKey ? last : first)?.focus();
   }
  });
  dialog.addEventListener('close', () => restoreStudy(dialog));
 });
})();
