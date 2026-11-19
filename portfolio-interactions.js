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

let litElement = null;
let clickEffect = null;

function clearLight() {
  litElement?.removeAttribute('data-lit');
  litElement = null;
}

function hidePointer() {
  clearLight();
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
  }

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
