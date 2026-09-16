const MIN_UNDO_TOUCHES = 3

function preventIpadUndoGesture(event: TouchEvent) {
  if (event.touches.length >= MIN_UNDO_TOUCHES) {
    event.preventDefault()
  }
}

/** 拦截 iPadOS 三指撤销/重做浮层。单指滚动与点击不受影响。 */
export function installIpadUndoGestureGuard() {
  const options: AddEventListenerOptions = { passive: false, capture: true }
  window.addEventListener('touchstart', preventIpadUndoGesture, options)
  window.addEventListener('touchmove', preventIpadUndoGesture, options)
}
