'use client';

import { Switch as SwitchPrimitive } from '@base-ui/react/switch';
import { cn } from 'cn';

function Switch({ className, ...props }: SwitchPrimitive.Root.Props) {
  return (
    <SwitchPrimitive.Root
      data-slot="switch"
      className={cn('playai-switch', className)}
      {...props}
    >
      <SwitchPrimitive.Thumb data-slot="switch-thumb" className="playai-switch-thumb" />
    </SwitchPrimitive.Root>
  );
}

export { Switch };
