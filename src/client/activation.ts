// Preserve a deliberate press across redraws, but never transfer a tap to a new action.
let pressedAction: string | null = null;
export function bindIntentionalClick(target: EventTarget, key: string, run: () => void): void {
  target.addEventListener('pointerdown', () => { pressedAction = key; });
  target.addEventListener('pointercancel', () => { pressedAction = null; });
  target.addEventListener('keydown', event => { if ((event as KeyboardEvent).repeat) event.preventDefault(); });
  target.addEventListener('click', event => {
    const deliberate = (event as MouseEvent).detail === 0 || pressedAction === key;
    pressedAction = null;
    if (deliberate) run();
  });
}
