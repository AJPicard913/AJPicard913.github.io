'use strict';
const $ = s => document.querySelector(s);
const hero = $('.hero');
const stage = $('.hero-sticky');
const intro = $('.hero-intro');
const next = $('.hero-next');
const orbit = $('.app-orbit');
const icons = [...document.querySelectorAll('.orbit-app')];
const reduce = matchMedia('(prefers-reduced-motion: reduce)');
let motionOff = reduce.matches, raf = 0;
const clamp = (v,min=0,max=1)=>Math.min(max,Math.max(min,v));
const ease = t=>t*t*(3-2*t);
// Enhance only successfully initialized targets; the document is readable without JS.
document.querySelectorAll('.section-label, .results > div, .experience-heading h2, .skill-heading, .toolbox, .education, .also-built, .contact-title, .contact-bottom > *, .keyboard-heading, .keyboard-preview, footer > *').forEach(el=>el.classList.add('reveal'));
$('.results')?.classList.remove('reveal');
const reveals = [...document.querySelectorAll('.reveal')].filter(el=>!el.parentElement.closest('.reveal'));
let revealObserver = null;
function showReveal(el){
 el.classList.add('is-visible');
 el.classList.remove('reveal-pending');
 revealObserver?.unobserve(el);
}
function finishReveals(){
 reveals.forEach(showReveal);
 revealObserver?.disconnect();
 document.body.classList.remove('hero-entering');
}
function staggerRows(){
 document.querySelectorAll('.results, .study-grid, .web-grid, .skills-grid, .app-grid, .keyboard-previews').forEach(group=>{
  let rowTop = null, column = 0;
  [...group.children].forEach(el=>{
   const top = el.getBoundingClientRect().top;
   if(rowTop===null || Math.abs(top-rowTop)>12){rowTop=top;column=0;}
   el.style.setProperty('--reveal-delay',`${Math.min(column++*85,255)}ms`);
  });
 });
}
if(!motionOff && 'IntersectionObserver' in window){
 staggerRows();
 revealObserver = new IntersectionObserver(entries=>{
  entries.forEach(entry=>{if(entry.isIntersecting)showReveal(entry.target);});
 },{threshold:.08,rootMargin:'0px 0px -32px 0px'});
 reveals.forEach(el=>{
  if(el.getBoundingClientRect().bottom<=0)showReveal(el);
  else {el.classList.add('reveal-pending');revealObserver.observe(el);}
 });
}
document.body.classList.add('motion-ready');
if(!motionOff && scrollY<24 && (!location.hash || location.hash==='#top')){
 document.body.classList.add('hero-entering');
 icons.at(-1)?.querySelector('img')?.addEventListener('animationend',event=>{
  if(event.animationName==='hero-icon-rise')document.body.classList.remove('hero-entering');
 });
}
document.addEventListener('focusin',event=>{
 if(!(event.target instanceof Element))return;
 const target=event.target.closest('.reveal-pending');
 if(target){target.style.setProperty('--reveal-delay','0ms');showReveal(target);}
 if(event.target.closest('.hero, .header'))document.body.classList.remove('hero-entering');
});
function setMotion(off){motionOff=off;document.body.classList.toggle('motion-off',off);if(off)finishReveals();requestFrame();}
function render(){
 raf=0;
 if(scrollY>24)document.body.classList.remove('hero-entering');
 const total=document.documentElement.scrollHeight-innerHeight;
 $('.reading-progress').style.transform=`scaleX(${total>0?clamp(scrollY/total):0})`;
 const staticHero = motionOff || (innerWidth<=760 ? innerHeight<=700 : innerHeight<=759);
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
 // Reserve room for the outer icons' rotation and sideways travel on tablets too.
 const spread = mobile ? 0 : up * 44;
 const available = stage.clientWidth - (mobile ? 32 : 64) - 24;
 const maxScale = Math.max(1, available / (orbit.offsetWidth + spread));
 const scale = Math.min(1 + up * (mobile ? .25 : .64), maxScale);
 orbit.style.transform=`translateX(-50%) translateY(${-up*(mobile?70:75)}px) scale(${scale})`;
 icons.forEach((el,i)=>{const n=i-2;const rot=parseFloat(el.style.getPropertyValue('--r'));el.style.transform=`translateX(${n*up*(mobile?0:11)}px) translateY(${Math.abs(n)*up*(mobile?12:22)}px) rotate(${rot*(1-up*.7)}deg)`;});
}
function requestFrame(){if(!raf)raf=requestAnimationFrame(render);}
addEventListener('scroll',requestFrame,{passive:true});
addEventListener('resize',requestFrame,{passive:true});
document.addEventListener('visibilitychange',()=>{if(!document.hidden)requestFrame();});
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
   if (event.target !== dialog) return false;
   const rect = dialog.getBoundingClientRect();
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

// The reward is fulfilled personally by email; no codes or form data are sent here.
(() => {
 const sheet = $('#surprise-sheet');
 if (!sheet) return;
 function updatePrize(){
  const selected = sheet.querySelector('input[name="prize-app"]:checked');
  if (!selected) return;
  $('#prize-selected-name').textContent = selected.value;
  $('#prize-app-link').href = selected.dataset.appUrl;
  $('#prize-app-link').setAttribute('aria-label', `View ${selected.value} on the App Store (opens in a new tab)`);
  const message = `Hi AJ,\n\nI found the hidden surprise on ajpicard.design!\n\nI would love a free lifetime code for ${selected.value}.\nApp: ${selected.dataset.appUrl}\n\nThank you!`;
  $('#prize-claim').href = `mailto:ajpicard25@icloud.com?subject=${encodeURIComponent('prize winner')}&body=${encodeURIComponent(message)}`;
 }
 sheet.addEventListener('change', event => {
  if (event.target.matches('input[name="prize-app"]')) updatePrize();
 });
 updatePrize();
})();

// The reward visits the app orbit, the title's period, then the app shelf.
(() => {
 const heroSurprise = $('.orbit-surprise');
 const titleSurprise = $('.title-surprise');
 const period = $('.period');
 const shelfSurprise = $('.shelf-surprise');
 const shelfHeading = $('.shelf-heading');
 const sheet = $('#surprise-sheet');
 if (!heroSurprise || !titleSurprise || !period || !shelfSurprise || !shelfHeading || !sheet) return;
 const stops = [heroSurprise, titleSurprise];
 let stop = 0, started = false, leaving = false, arrived = false, hovered = null;
 let remaining = 5000, clockStarted = null, clockTimer = 0, poofTimer = 0;
 const activeButton = () => stops[stop];
 const inViewport = element => {
  const rect = element.getBoundingClientRect();
  return rect.bottom > 0 && rect.top < innerHeight && rect.right > 0 && rect.left < innerWidth;
 };
 const interactionPaused = () => document.hidden || hovered === activeButton() || activeButton()?.contains(document.activeElement) || sheet.open;
 const canShowTitle = () => {
  const style = getComputedStyle(intro);
  return hero.getBoundingClientRect().bottom > 0 && inViewport(period) && style.visibility !== 'hidden' && Number(style.opacity) > .25;
 };

 function pauseClock(){
  if (clockStarted !== null) remaining = Math.max(0, remaining - (performance.now() - clockStarted));
  clockStarted = null;
  clearTimeout(clockTimer);
  clockTimer = 0;
 }
 function revealShelf(){
  if (stop !== stops.length || arrived || document.hidden || !inViewport(shelfSurprise)) return;
  arrived = true;
  if (!motionOff) shelfSurprise.classList.add('surprise-arriving');
  observer?.disconnect();
 }
 function showShelf(){
  pauseClock();
  clearTimeout(poofTimer);
  stops.forEach(button => {
   button.hidden = true;
   button.classList.remove('surprise-leaving', 'surprise-arriving');
  });
  period.classList.remove('is-surprise-active');
  stop = stops.length;
  leaving = false;
  hovered = null;
  shelfSurprise.hidden = false;
  revealShelf();
 }
 function finishMove(){
  if (interactionPaused()) { syncSurprise(); return; }
  pauseClock();
  clearTimeout(poofTimer);
  const previous = activeButton();
  previous.hidden = true;
  previous.classList.remove('surprise-leaving', 'surprise-arriving');
  leaving = false;
  hovered = null;
  // Skip the title if scrolling has already carried it out of view.
  if (stop === 0 && canShowTitle()) {
   stop = 1;
   started = true;
   remaining = 5000;
   period.classList.add('is-surprise-active');
   titleSurprise.hidden = false;
   if (!motionOff) titleSurprise.classList.add('surprise-arriving');
   syncSurprise();
  } else showShelf();
 }
 function beginPoof(){
  pauseClock();
  if (interactionPaused()) return;
  if (motionOff || !inViewport(activeButton()) || (stop === 1 && !canShowTitle())) { finishMove(); return; }
  leaving = true;
  activeButton().classList.remove('surprise-arriving');
  activeButton().classList.add('surprise-leaving');
  poofTimer = setTimeout(finishMove, 600);
 }
 function syncSurprise(){
  if (stop === stops.length) { revealShelf(); return; }
  if (interactionPaused()) {
   pauseClock();
   if (leaving) {
    clearTimeout(poofTimer);
    leaving = false;
    activeButton().classList.remove('surprise-leaving');
   }
   return;
  }
  // Direct links below the hero still lead to a discoverable reward.
  if (!started && hero.getBoundingClientRect().bottom <= 0) { showShelf(); return; }
  if (!started) {
   if (!inViewport(heroSurprise) || document.body.classList.contains('hero-entering')) return;
   started = true;
  }
  if (leaving) {
   if (motionOff) finishMove();
   return;
  }
  if (clockStarted !== null) return;
  if (remaining <= 0) { beginPoof(); return; }
  clockStarted = performance.now();
  clockTimer = setTimeout(beginPoof, remaining);
 }

 const observer = 'IntersectionObserver' in window ? new IntersectionObserver(syncSurprise, {threshold:.1}) : null;
 observer?.observe(heroSurprise);
 observer?.observe(period);
 observer?.observe(shelfHeading);
 stops.forEach(button => {
  button.addEventListener('pointerenter', event => {
   if (event.pointerType === 'touch') return;
   hovered = button;
   syncSurprise();
  });
  button.addEventListener('pointerleave', () => { if (hovered === button) hovered = null; syncSurprise(); });
  button.addEventListener('focus', syncSurprise);
  button.addEventListener('blur', () => queueMicrotask(syncSurprise));
 });
 sheet.addEventListener('close', syncSurprise);
 // Dialog opening moves focus; pause before its opener can disappear.
 sheet.addEventListener('focusin', syncSurprise);
 document.addEventListener('visibilitychange', syncSurprise);
 document.addEventListener('animationend', event => {
  if (event.animationName === 'hero-icon-rise' || event.animationName === 'surprise-appear') syncSurprise();
 });
 addEventListener('scroll', syncSurprise, {passive:true});
 addEventListener('resize', syncSurprise, {passive:true});
 addEventListener('pageshow', syncSurprise);
 addEventListener('hashchange', syncSurprise);
 addEventListener('load', syncSurprise, {once:true});
 reduce.addEventListener('change', syncSurprise);
 syncSurprise();
})();
