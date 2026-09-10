const median = (values: number[]): number => {
  const sorted = [...values].sort((a, b) => a - b);
  const middle = Math.floor(sorted.length / 2);
  return sorted.length % 2 ? sorted[middle] : (sorted[middle - 1] + sorted[middle]) / 2;
};
export class ClockEstimator {
  private samples: { rtt: number; offset: number }[] = [];
  get ready(): boolean { return this.samples.length > 0; }
  get offset(): number { return this.ready ? median(this.samples.map(s => s.offset)) : 0; }
  localTime(serverTime: number): number { return serverTime - this.offset; }
  reset(): void { this.samples = []; }
  sample(t0: number, t1: number, serverNow: number): boolean {
    if (![t0, t1, serverNow].every(Number.isFinite) || t1 < t0) return false;
    const rtt = t1 - t0;
    if (this.ready && rtt > Math.max(1, median(this.samples.map(s => s.rtt))) * 2) return false;
    this.samples.push({ rtt, offset: serverNow - (t0 + t1) / 2 });
    this.samples = this.samples.slice(-5);
    return true;
  }
}
