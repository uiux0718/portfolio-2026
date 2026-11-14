const progressBar = document.querySelector('.scroll-progress');
const reducedMotion = matchMedia('(prefers-reduced-motion: reduce)');
const finePointer = matchMedia('(hover: hover) and (pointer: fine)');

let progressFrame;
function updateProgress() {
  const page = document.documentElement;
  const distance = page.scrollHeight - page.clientHeight;
  const progress = distance > 0 ? Math.min(1, Math.max(0, window.scrollY / distance)) : 0;
  progressBar.style.setProperty('--scroll-progress', progress);
  progressFrame = undefined;
}

function scheduleProgress() {
  if (progressFrame === undefined) progressFrame = requestAnimationFrame(updateProgress);
}

window.addEventListener('scroll', scheduleProgress, { passive: true });
window.addEventListener('resize', scheduleProgress);
window.addEventListener('load', scheduleProgress);
scheduleProgress();

const cards = document.querySelectorAll('.work-item, .small-card');

if ('IntersectionObserver' in window) {
  const reveal = new IntersectionObserver((entries) => {
    let order = 0;
    for (const entry of entries) {
      if (!entry.isIntersecting) continue;

      reveal.unobserve(entry.target);
      if (reducedMotion.matches) continue;

      entry.target.style.setProperty('--reveal-delay', Math.min(order * 50, 150) + 'ms');
      entry.target.classList.add('is-revealing');
      order += 1;
    }
  }, { threshold: .12 });

  cards.forEach((card) => reveal.observe(card));
}

function moveLight(element, prefix) {
  element.addEventListener('pointermove', (event) => {
    if (!finePointer.matches || reducedMotion.matches || event.pointerType === 'touch') return;

    const bounds = element.getBoundingClientRect();
    element.style.setProperty(prefix + '-x', (event.clientX - bounds.left) / bounds.width * 100 + '%');
    element.style.setProperty(prefix + '-y', (event.clientY - bounds.top) / bounds.height * 100 + '%');
  }, { passive: true });
}

document.querySelectorAll('.work-visual, .card-thumb').forEach((artwork) => moveLight(artwork, '--card'));
