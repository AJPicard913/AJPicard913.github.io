'use strict';
const preference = matchMedia('(prefers-reduced-motion: reduce)');
const root = document.documentElement;
const motion = document.getElementById('motion');
const heroPhoto = document.querySelector('.hero-photo');
const heroImage = heroPhoto.querySelector('img');
const bean = document.querySelector('.gather-bean');
const gather = document.querySelector('.gather');
const progress = document.querySelector('.progress');
let off = preference.matches, observer, frame = 0;
// Animate the individual parts, rather than hiding an entire section at once.
document.querySelector('.location-list').classList.remove('reveal');
const groups = ['.hero-copy > *', '.location-list > a', '.footer-top > *'];
groups.forEach(selector => document.querySelectorAll(selector).forEach((el, i) => {
  el.classList.add('reveal');
  el.style.setProperty('--delay', `${Math.min(i * 90, 360)}ms`);
}));
heroPhoto.classList.add('reveal');
heroPhoto.style.setProperty('--delay', '160ms');
document.querySelectorAll('.food-card').forEach((el,i) => el.style.setProperty('--delay', `${i * 120}ms`));
const reveals = [...document.querySelectorAll('.reveal')];
const seen = new WeakSet();
function show(el) { el.classList.remove('pending'); seen.add(el); observer?.unobserve(el); }
function configureReveals() {
  observer?.disconnect();
  if(off || !('IntersectionObserver' in window)) {
    reveals.forEach(el => el.classList.remove('pending'));
    return;
  }
  observer = new IntersectionObserver(entries => entries.forEach(entry => {
    if(entry.isIntersecting) show(entry.target);
  }), {threshold: .08, rootMargin: '0px 0px -18px 0px'});
  reveals.forEach(el => {
    if(seen.has(el) || el.getBoundingClientRect().bottom < 0) { show(el); return; }
    el.classList.add('pending');
    observer.observe(el);
  });
}
const clamp = (value,min,max) => Math.min(max,Math.max(min,value));
function update() {
  frame = 0;
  const total = root.scrollHeight - innerHeight;
  progress.style.transform = `scaleX(${total > 0 ? clamp(scrollY / total,0,1) : 0})`;
  if(off) {
    heroImage.style.removeProperty('--image-y');
    bean.style.removeProperty('--bean-y');
    bean.style.removeProperty('--bean-rotation');
    return;
  }
  const heroRect = heroPhoto.getBoundingClientRect();
  heroImage.style.setProperty('--image-y', `${clamp(-heroRect.top * .07,-20,24)}px`);
  const rect = gather.getBoundingClientRect();
  const travel = clamp((innerHeight - rect.top) / (innerHeight + rect.height),0,1);
  bean.style.setProperty('--bean-y', `${(travel - .5) * 50}px`);
  bean.style.setProperty('--bean-rotation', `${-26 + travel * 12}deg`);
}
function requestUpdate() { if(!frame) frame = requestAnimationFrame(update); }
function setMotion(value) {
  off = value;
  root.classList.toggle('motion-off', off);
  motion.textContent = off ? 'Enable motion' : 'Pause motion';
  motion.setAttribute('aria-pressed', String(off));
  configureReveals();
  requestUpdate();
}
motion.addEventListener('click', () => setMotion(!off));
preference.addEventListener('change', event => setMotion(event.matches));
document.addEventListener('focusin', event => {
  const target = event.target.closest('.pending');
  if(target) show(target);
});
addEventListener('scroll', requestUpdate, {passive:true});
addEventListener('resize', requestUpdate);
setMotion(off);
