import { cn } from '../../lib/cn';
import { Button, type ButtonProps, type ButtonSize, type ButtonVariant } from '../button';

export interface IconButtonProps extends Omit<
  ButtonProps,
  'leftIcon' | 'rightIcon' | 'fullWidth' | 'variant' | 'aria-label'
> {
  variant?: Exclude<ButtonVariant, 'link'>;
  /** Faqat ikonkali tugma — ekran o'quvchi uchun nom majburiy */
  'aria-label': string;
}

const sizes: Record<ButtonSize, string> = {
  sm: 'size-8 px-0 before:inset-x-auto before:left-1/2 before:w-10 before:-translate-x-1/2 [&_svg]:size-4',
  md: 'size-10 px-0 [&_svg]:size-[18px]',
  lg: 'size-12 px-0 [&_svg]:size-5',
};

export function IconButton({ size = 'md', className, ...props }: IconButtonProps) {
  return <Button size={size} className={cn(sizes[size], className)} {...props} />;
}
