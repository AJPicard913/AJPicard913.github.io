const secret = document.querySelector('.secret');
const prizeSheet = document.querySelector('#prize-sheet');
const closePrize = document.querySelector('.sheet-close');

// Start a fresh discovery delay on each visit, without stealing keyboard focus.
setTimeout(() => { secret.hidden = false; }, 30_000);

secret.addEventListener('click', () => {
  prizeSheet.showModal();
  document.body.classList.add('sheet-open');
});

closePrize.addEventListener('click', () => prizeSheet.close());
prizeSheet.addEventListener('click', (event) => {
  if (event.target !== prizeSheet) return;
  const bounds = prizeSheet.getBoundingClientRect();
  if (event.clientX < bounds.left || event.clientX > bounds.right ||
      event.clientY < bounds.top || event.clientY > bounds.bottom) {
    prizeSheet.close();
  }
});

// Also handles the native Escape-key dismissal and restores focus to the gift.
prizeSheet.addEventListener('close', () => {
  document.body.classList.remove('sheet-open');
  secret.focus({ preventScroll: true });
});
