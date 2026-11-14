(() => {
  const model = document.querySelector('[data-studio-model]');
  if (!model) return;

  const hoverMotion = window.matchMedia('(hover: hover) and (pointer: fine) and (prefers-reduced-motion: no-preference)');
  const surface = model.closest('.hero') ?? model;
  let frame = 0;
  let point = null;

  function reset() {
    cancelAnimationFrame(frame);
    frame = 0;
    point = null;
    model.style.removeProperty('--model-tilt-x');
    model.style.removeProperty('--model-tilt-y');
    model.style.removeProperty('--model-glint-x');
    model.style.removeProperty('--model-glint-y');
  }

  function updateModel() {
    frame = 0;
    if (!point) return;

    const { left, top, width, height } = surface.getBoundingClientRect();
    if (!width || !height) return;

    const horizontal = Math.max(0, Math.min(1, (point.x - left) / width));
    const vertical = Math.max(0, Math.min(1, (point.y - top) / height));
    model.style.setProperty('--model-tilt-x', ((0.5 - vertical) * 13).toFixed(2) + 'deg');
    model.style.setProperty('--model-tilt-y', ((horizontal - 0.5) * 17).toFixed(2) + 'deg');
    model.style.setProperty('--model-glint-x', (28 + horizontal * 44).toFixed(1) + '%');
    model.style.setProperty('--model-glint-y', (24 + vertical * 42).toFixed(1) + '%');
  }

  surface.addEventListener('pointermove', (event) => {
    if (!hoverMotion.matches || event.pointerType === 'touch') return;
    point = { x: event.clientX, y: event.clientY };
    if (!frame) frame = requestAnimationFrame(updateModel);
  }, { passive: true });

  surface.addEventListener('pointerleave', reset);
  surface.addEventListener('pointercancel', reset);
  hoverMotion.addEventListener('change', reset);
})();
