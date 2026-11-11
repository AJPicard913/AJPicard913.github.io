(() => {
  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
  const root = document.documentElement;

  if ('IntersectionObserver' in window && !reducedMotion.matches) {
    root.classList.add('motion-ready');
    const reveals = new IntersectionObserver((entries, observer) => {
      for (const entry of entries) {
        if (!entry.isIntersecting) continue;
        entry.target.classList.add('is-visible');
        observer.unobserve(entry.target);
      }
    }, { threshold: 0, rootMargin: '0px 0px 32px 0px' });
    document.querySelectorAll('[data-reveal]').forEach(element => reveals.observe(element));
  }

  let scrollPending = false;
  const sections = Array.from(document.querySelectorAll('main > section'));
  const navLinks = Array.from(document.querySelectorAll('.nav-links a'));
  const updateProgress = () => {
    const remaining = root.scrollHeight - window.innerHeight;
    root.style.setProperty('--progress', remaining > 0 ? Math.min(1, Math.max(0, window.scrollY / remaining)) : 0);
    const currentSection = sections.find(section => {
      const bounds = section.getBoundingClientRect();
      return bounds.top <= 120 && bounds.bottom > 120;
    });
    navLinks.forEach(link => {
      if (currentSection && link.hash === `#${currentSection.id}`) link.setAttribute('aria-current', 'location');
      else link.removeAttribute('aria-current');
    });
    scrollPending = false;
  };
  window.addEventListener('scroll', () => {
    if (scrollPending) return;
    scrollPending = true;
    requestAnimationFrame(updateProgress);
  }, { passive: true });
  window.addEventListener('resize', updateProgress);
  window.addEventListener('load', updateProgress);
  updateProgress();

  const steps = {
    create: { image: 'assets/ours-shot-create.webp', caption: 'A place for every detail.', alt: 'The New Chore screen with a title, category, assigned members, due date, and weekly repeat.' },
    invite: { image: 'assets/ours-shot-invite.webp', caption: 'Your people, in one shared space.', alt: 'The Invite People sheet with options to share a private household invite link or copy it.' },
    approve: { image: 'assets/ours-shot-approval.webp', caption: 'A final check before it counts.', alt: 'The Confirm Chore screen with the submitting member, completion time, attached photo, reward, and approval controls.' }
  };
  const tabs = Array.from(document.querySelectorAll('[data-step]'));
  const mobileLayout = window.matchMedia('(max-width: 640px)');
  const updateTabOrientation = () => document.querySelector('.workflow-tabs').setAttribute('aria-orientation', mobileLayout.matches ? 'horizontal' : 'vertical');
  mobileLayout.addEventListener('change', updateTabOrientation);
  updateTabOrientation();
  const workflowImage = document.getElementById('workflow-image');
  const workflowPanel = document.getElementById('workflow-panel');
  let activeStep = 'create';
  let changeSequence = 0;
  let imageAnimation;

  const setStep = async (tab) => {
    const step = steps[tab.dataset.step];
    if (!step || activeStep === tab.dataset.step) return;
    activeStep = tab.dataset.step;
    const sequence = ++changeSequence;
    tabs.forEach(item => {
      const selected = item === tab;
      item.setAttribute('aria-selected', String(selected));
      item.tabIndex = selected ? 0 : -1;
    });
    workflowPanel.setAttribute('aria-labelledby', tab.id);
    workflowPanel.setAttribute('aria-busy', 'true');
    const lightImage = step.image.replace('.webp', '-light.webp');
    const preload = new Image();
    preload.src = window.matchMedia('(prefers-color-scheme: dark)').matches ? step.image : lightImage;
    try { await preload.decode(); } catch { /* The image still provides its accessible description. */ }
    if (sequence !== changeSequence) return;
    imageAnimation?.cancel();
    document.getElementById('workflow-image-dark').srcset = step.image;
    workflowImage.src = lightImage;
    workflowImage.alt = step.alt;
    document.getElementById('workflow-caption').textContent = step.caption;
    document.getElementById('mobile-step-description').textContent = tab.querySelector('.step-description').textContent;
    workflowPanel.removeAttribute('aria-busy');
    if (!reducedMotion.matches) {
      imageAnimation = workflowImage.animate([{ opacity: 0.2 }, { opacity: 1 }], { duration: 280, easing: 'ease-out' });
    }
  };
  tabs.forEach((tab, index) => {
    tab.addEventListener('click', () => setStep(tab));
    tab.addEventListener('keydown', event => {
      let next;
      if (event.key === 'ArrowDown' || event.key === 'ArrowRight') next = (index + 1) % tabs.length;
      if (event.key === 'ArrowUp' || event.key === 'ArrowLeft') next = (index + tabs.length - 1) % tabs.length;
      if (event.key === 'Home') next = 0;
      if (event.key === 'End') next = tabs.length - 1;
      if (next === undefined) return;
      event.preventDefault();
      tabs[next].focus();
      setStep(tabs[next]);
    });
  });

  document.getElementById('share-ours').addEventListener('click', async event => {
    if (!navigator.share) return;
    event.preventDefault();
    const fallback = event.currentTarget.href;
    try {
      await navigator.share({ title: 'Ours: Shared Chores', text: 'A shared chore list for the people we call home.', url: 'https://ajpicard.design/ours/' });
    } catch (error) {
      if (error.name !== 'AbortError') window.location.href = fallback;
    }
  });
})();
