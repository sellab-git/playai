import { describe, expect, it, vi } from 'vitest';
import { bindIntentionalClick } from '../src/client/activation.ts';
function click(target: EventTarget, detail = 1): void {
  const event = new Event('click'); Object.defineProperty(event, 'detail', { value: detail }); target.dispatchEvent(event);
}
describe('result action activation', () => {
  it('does not turn the release of a game tap into Next, but accepts a new press', () => {
    const next = new EventTarget(), advance = vi.fn();
    bindIntentionalClick(next, 'round-1:result', advance);
    click(next); expect(advance).not.toHaveBeenCalled();
    next.dispatchEvent(new Event('pointerdown')); click(next); expect(advance).toHaveBeenCalledTimes(1);
    click(next); expect(advance).toHaveBeenCalledTimes(1);
  });
  it('retains a press across countdown redraws without carrying it to another round', () => {
    const first = new EventTarget(), redraw = new EventTarget(), other = new EventTarget(), advance = vi.fn();
    bindIntentionalClick(first, 'round-2:result', advance); first.dispatchEvent(new Event('pointerdown'));
    bindIntentionalClick(redraw, 'round-2:result', advance); click(redraw); expect(advance).toHaveBeenCalledTimes(1);
    first.dispatchEvent(new Event('pointerdown')); bindIntentionalClick(other, 'round-3:result', advance);
    click(other); expect(advance).toHaveBeenCalledTimes(1);
    click(other, 0); expect(advance).toHaveBeenCalledTimes(2);
  });
});
