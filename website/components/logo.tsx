import { Icon } from '@iconify/react';
import Link from 'next/link';
import { cn } from '@/lib/utils';

interface LogoProps {
  className?: string;
  iconClassName?: string;
  textClassName?: string;
}

export function Logo({ className, iconClassName, textClassName }: LogoProps) {
  return (
    <Link href="/" className={cn("flex items-center space-x-2", className)}>
      <Icon 
        icon="lucide:box" 
        className={cn("h-6 w-6 text-primary", iconClassName)} 
        aria-hidden="true"
      />
      <span className={cn("font-bold text-xl", textClassName)}>Zipt</span>
    </Link>
  );
} 