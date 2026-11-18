const secret = document.querySelector('.secret');
const status = document.querySelector('.announcement');
const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
let statusTimer;

secret.addEventListener('click', () => {
  status.textContent = 'You found it. Say hello to AJ in your email app.';
  clearTimeout(statusTimer);
  statusTimer = setTimeout(() => { status.textContent = ''; }, 7000);
  if (reducedMotion.matches) return;
  const bounds = secret.getBoundingClientRect();
  for (let i = 0; i < 14; i++) {
    const piece = document.createElement('span');
    piece.className = 'confetti';
    piece.setAttribute('aria-hidden', 'true');
    piece.style.cssText = `left:${bounds.x + bounds.width / 2}px;top:${bounds.y + bounds.height / 2}px;background:${['#a7c2ad', '#d5c5a5', '#b7c7ce'][i % 3]};--x:${Math.cos(i * 2.4) * 75}px;--y:${-30 - Math.random() * 95}px;--r:${i * 47}deg`;
    document.body.append(piece);
    piece.addEventListener('animationend', () => piece.remove(), { once: true });
  }
  // Keep the anchor's native mailto behavior; no message is sent by this page.
});
