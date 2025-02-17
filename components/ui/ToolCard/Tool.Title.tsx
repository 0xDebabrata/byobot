import mergeTW from '@/utils/mergeTW';
import { ReactNode } from 'react';

export default ({ className, children }: { className?: string; children?: ReactNode }) => (
  <p className={mergeTW(`text-slate-500 text-sm sm:text-base ${className}`)}>{children}</p>
);
