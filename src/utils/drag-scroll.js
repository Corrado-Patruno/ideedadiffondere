const DRAG_THRESHOLD_PX = 4;

export function enableDragScroll(scroller) {
  let pointerDown = false;
  let hasDragged = false;
  let startClientX = 0;
  let startScrollLeft = 0;

  scroller.addEventListener('pointerdown', (event) => {
    if (event.pointerType !== 'mouse' || event.button !== 0) return;
    pointerDown = true;
    hasDragged = false;
    startClientX = event.clientX;
    startScrollLeft = scroller.scrollLeft;
  });

  scroller.addEventListener('pointermove', (event) => {
    if (!pointerDown) return;
    const travelled = event.clientX - startClientX;

    if (!hasDragged && Math.abs(travelled) > DRAG_THRESHOLD_PX) {
      hasDragged = true;
      scroller.classList.add('is-dragging');
      scroller.setPointerCapture(event.pointerId);
    }

    if (hasDragged) scroller.scrollLeft = startScrollLeft - travelled;
  });

  const endDrag = (event) => {
    if (hasDragged && scroller.hasPointerCapture(event.pointerId)) {
      scroller.releasePointerCapture(event.pointerId);
    }
    pointerDown = false;
    scroller.classList.remove('is-dragging');
  };

  scroller.addEventListener('pointerup', endDrag);
  scroller.addEventListener('pointercancel', endDrag);

  scroller.addEventListener(
    'click',
    (event) => {
      if (!hasDragged) return;
      event.preventDefault();
      event.stopPropagation();
      hasDragged = false;
    },
    true
  );
}
