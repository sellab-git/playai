import { useEffect, useState } from 'react';

/** Only the deadline display subscribes to time; room snapshots do not tick. */
export function useDeadline(localDeadline: number | null, enabled: boolean): number {
  const read = () =>
    localDeadline === null
      ? 0
      : Math.max(0, Math.ceil((localDeadline - performance.now()) / 1000));
  const [seconds, setSeconds] = useState(read);
  useEffect(() => {
    if (!enabled || localDeadline === null) return;
    const update = () =>
      setSeconds(Math.max(0, Math.ceil((localDeadline - performance.now()) / 1000)));
    update();
    const timer = setInterval(update, 100);
    return () => clearInterval(timer);
  }, [localDeadline, enabled]);
  return seconds;
}
