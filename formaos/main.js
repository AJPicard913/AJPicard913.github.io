(() => {
  'use strict';
  const samples = {
    photo: { name: 'Weekend.heic', icon: '▧', formats: ['JPG', 'PNG', 'PDF'] },
    document: { name: 'Good ideas.txt', icon: '▤', formats: ['PDF', 'RTF', 'HTML'] },
    video: { name: 'One good day.mov', icon: '▷', formats: ['MP4', 'M4A', 'WAV'] }
  };
  let current = 'photo', selected = 'JPG', timer = null;
  const $ = id => document.getElementById(id);
  const go = $('demo-go'), status = $('demo-status'), result = $('demo-result');
  function reset() {
    clearInterval(timer);
    timer = null;
    go.disabled = false;
    go.hidden = false;
    go.innerHTML = 'Preview conversion <span>↗</span>';
    result.hidden = true;
    $('progress-fill').style.width = '0%';
    status.textContent = 'Sample preview only. Your files stay untouched.';
  }
  function render() {
    reset();
    const sample = samples[current];
    $('demo-name').textContent = sample.name;
    $('demo-icon').textContent = sample.icon;
    $('formats').replaceChildren(...sample.formats.map(format => {
      const button = document.createElement('button');
      button.textContent = format;
      button.setAttribute('aria-pressed', String(format === selected));
      button.addEventListener('click', () => { selected = format; render(); });
      return button;
    }));
  }
  document.querySelectorAll('[data-type]').forEach(button => {
    button.addEventListener('click', () => {
      current = button.dataset.type;
      selected = samples[current].formats[0];
      document.querySelectorAll('[data-type]').forEach(tab => tab.setAttribute('aria-pressed', String(tab === button)));
      render();
    });
  });
  $('compress-toggle').addEventListener('change', reset);
  $('demo-reset').addEventListener('click', () => {
    reset();
    document.querySelector('[data-type="photo"]').focus();
  });
  go.addEventListener('click', () => {
    reset();
    go.disabled = true;
    go.textContent = 'Previewing conversion…';
    let progress = 0;
    status.textContent = 'Showing how conversion works in FormaOS…';
    timer = setInterval(() => {
      progress += 20;
      $('progress-fill').style.width = progress + '%';
      if (progress < 100) return;
      clearInterval(timer);
      timer = null;
      const compressed = $('compress-toggle').checked;
      const zipped = compressed && ['PDF', 'RTF', 'HTML', 'WAV'].includes(selected);
      const output = samples[current].name.replace(/\.[^.]+$/, '') + '.' + selected.toLowerCase() + (zipped ? '.zip' : '');
      $('demo-output').textContent = output;
      go.hidden = true;
      result.hidden = false;
      status.textContent = 'Preview complete. ' + output + '. This is a sample demonstration; no file was created.';
      result.querySelector('a').focus({ preventScroll: true });
    }, 240);
  });
  render();
})();
