import { Button as ButtonPrimitive } from '@base-ui/react/button';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from 'cn';

// Playai adaptation: shared token-based sizes, stationary press, no colored/link variants.
const buttonVariants = cva('button', {
  variants: {
    variant: {
      default: 'primary',
      outline: 'secondary',
      secondary: 'secondary',
      ghost: 'plain',
    },
    size: {
      default: '',
      sm: 'compact',
      'icon-sm': 'close-button',
      icon: 'nav-button',
    },
  },
  defaultVariants: { variant: 'default', size: 'default' },
});

function Button({
  className,
  variant = 'default',
  size = 'default',
  ...props
}: ButtonPrimitive.Props & VariantProps<typeof buttonVariants>) {
  return (
    <ButtonPrimitive
      data-slot="button"
      className={cn(buttonVariants({ variant, size, className }))}
      {...props}
    />
  );
}

export { Button, buttonVariants };
