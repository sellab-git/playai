import { describe, expect, it } from 'vitest';
import { ClockEstimator } from '../src/client/clock';
describe('clock estimation', () => {
  it('requires calibration, rejects spikes/nonfinite samples and uses median offsets', () => {
    const clock = new ClockEstimator();
    expect(clock.ready).toBe(false);
    expect(clock.sample(100, 120, 1110)).toBe(true);
    expect(clock.offset).toBe(1000);
    clock.sample(200, 230, 1215);
    clock.sample(300, 310, 1305);
    expect(clock.sample(400, 1400, 1900)).toBe(false);
    expect(clock.sample(0, Infinity, 0)).toBe(false);
    expect(clock.sample(10, 0, 5)).toBe(false);
    expect(clock.offset).toBe(1000);
    clock.reset();
    expect(clock.ready).toBe(false);
  });
  it('bounds history and tolerates asymmetric latency without claiming exact fairness', () => {
    const clock = new ClockEstimator();
    for (let i = 0; i < 10; i++) clock.sample(i * 100, i * 100 + 20, i * 100 + 1014);
    expect(clock.offset).toBe(1004);
    expect(clock.localTime(2000)).toBe(996);
  });
});
