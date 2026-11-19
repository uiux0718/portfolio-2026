const viewer = document.querySelector('[data-viewer]');
const cards = [...viewer.querySelectorAll('figure')];
const navigation = viewer.querySelector('nav');
const previous = navigation.querySelector('[data-step="-1"]');
const next = navigation.querySelector('[data-step="1"]');
const status = navigation.querySelector('[role="status"]');
let current = 0;

function showCard(index) {
  if (index < 0 || index >= cards.length) return;

  current = index;
  cards.forEach((card, position) => { card.hidden = position !== current; });
  previous.setAttribute('aria-disabled', String(current === 0));
  next.setAttribute('aria-disabled', String(current === cards.length - 1));
  status.textContent = cards[current].querySelector('figcaption').textContent;
}

previous.addEventListener('click', () => showCard(current - 1));
next.addEventListener('click', () => showCard(current + 1));
document.addEventListener('keydown', (event) => {
  if (event.altKey || event.ctrlKey || event.metaKey || event.shiftKey) return;
  if (event.key === 'ArrowLeft') showCard(current - 1);
  if (event.key === 'ArrowRight') showCard(current + 1);
});

showCard(0);
navigation.hidden = false;
