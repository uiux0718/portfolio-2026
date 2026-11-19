const pointerAllowed = matchMedia('(hover: hover) and (pointer: fine) and (prefers-reduced-motion: no-preference) and (forced-colors: none)');
const page = document.documentElement;
const cursor = document.createElement('div');
const ring = document.createElement('span');
const mark = document.createElement('span');

cursor.className = 'y-pointer';
cursor.setAttribute('aria-hidden', 'true');
ring.className = 'y-pointer-ring';
mark.className = 'y-pointer-mark';
cursor.append(ring, mark);
document.body.append(cursor);
const halo = document.createElement('div');
halo.className = 'pointer-halo';
halo.setAttribute('aria-hidden', 'true');
document.body.append(halo);

let litElement = null;
let clickEffect = null;
let haloFrame = 0;
let haloX = 0;
let haloY = 0;
let targetX = 0;
let targetY = 0;

function followPointer() {
  haloFrame = 0;
  haloX += (targetX - haloX) * .12;
  haloY += (targetY - haloY) * .12;
  halo.style.transform = 'translate3d(' + haloX + 'px,' + haloY + 'px,0) translate(-50%,-50%)';
  if (Math.abs(targetX - haloX) + Math.abs(targetY - haloY) > .5) {
    haloFrame = requestAnimationFrame(followPointer);
  }
}

function clearLight() {
  litElement?.removeAttribute('data-lit');
  litElement?.style.removeProperty('--tilt-x');
  litElement?.style.removeProperty('--tilt-y');
  litElement = null;
}

function hidePointer() {
  clearLight();
  cancelAnimationFrame(haloFrame);
  haloFrame = 0;
  page.classList.remove('y-pointer-visible');
}

function movePointer(event) {
  if (!pointerAllowed.matches || event.pointerType !== 'mouse' || event.target.closest('dialog, input, textarea, select, [contenteditable]')) {
    hidePointer();
    return;
  }

  const nextLight = event.target.closest('.hero, .work-item, .small-card');
  if (nextLight !== litElement) {
    clearLight();
    litElement = nextLight;
    litElement?.setAttribute('data-lit', '');
  }
  if (litElement) {
    const bounds = litElement.getBoundingClientRect();
    litElement.style.setProperty('--light-x', (event.clientX - bounds.left) + 'px');
    litElement.style.setProperty('--light-y', (event.clientY - bounds.top) + 'px');
    litElement.style.setProperty('--tilt-x', ((.5 - (event.clientY - bounds.top) / bounds.height) * 5) + 'deg');
    litElement.style.setProperty('--tilt-y', (((event.clientX - bounds.left) / bounds.width - .5) * 5) + 'deg');
  }

  if (!page.classList.contains('y-pointer-visible')) {
    haloX = event.clientX;
    haloY = event.clientY;
  }
  targetX = event.clientX;
  targetY = event.clientY;
  if (!haloFrame) haloFrame = requestAnimationFrame(followPointer);
  cursor.style.transform = 'translate3d(' + event.clientX + 'px,' + event.clientY + 'px,0)';
  cursor.toggleAttribute('data-link', Boolean(event.target.closest('a, button')));
  page.classList.add('y-pointer-visible');
}

document.addEventListener('pointermove', movePointer, {passive: true});
document.addEventListener('pointerout', event => {
  if (!event.relatedTarget) hidePointer();
});
document.addEventListener('pointerdown', event => {
  if (event.button !== 0 || !pointerAllowed.matches || event.pointerType !== 'mouse' || !page.classList.contains('y-pointer-visible')) return;
  clickEffect?.cancel();
  clickEffect = ring.animate([
    {boxShadow: '0 0 0 0 #dcefa7ab'},
    {boxShadow: '0 0 0 18px #dcefa700'},
  ], {duration: 440, easing: 'ease-out'});
});
document.addEventListener('keydown', hidePointer);
window.addEventListener('blur', hidePointer);
pointerAllowed.addEventListener('change', hidePointer);

const revealMotion = matchMedia('(prefers-reduced-motion: no-preference)');
const revealItems = document.querySelectorAll('.work-item, .small-card, .profile-details section');
if (revealMotion.matches && 'IntersectionObserver' in window) {
  const observer = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (!entry.isIntersecting) return;
      entry.target.classList.remove('reveal-wait');
      entry.target.classList.add('reveal-enter');
      observer.unobserve(entry.target);
    });
  }, {rootMargin: '0px 0px -30px 0px'});
  revealItems.forEach(item => {
    item.classList.add('reveal-wait');
    observer.observe(item);
  });
  revealMotion.addEventListener('change', () => {
    observer.disconnect();
    revealItems.forEach(item => item.classList.remove('reveal-wait', 'reveal-enter'));
  }, {once: true});
}
