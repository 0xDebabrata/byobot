import { ReactNode } from 'react';
import BlurBackground from '../BlurBackground/BlurBackground';
import mergeTW from '@/utils/mergeTW';

type Props = {
  title?: string;
  description?: string;
  icon?: ReactNode;
  children: ReactNode;
  isActive: boolean;
  variant?: 'default' | 'custom';
  className?: string;
  classNameContainer?: string;
  onCancel?: () => void;
};

export default ({
  children,
  title,
  description,
  icon,
  isActive,
  variant = 'default',
  className = '',
  classNameContainer,
  onCancel,
}: Props) => {
  return isActive ? (
    <div className="fixed w-full h-full inset-0 z-40 overflow-y-auto">
      <BlurBackground isActive={true} setActive={onCancel} />
      <div className={mergeTW(`flex items-center min-h-screen px-4 py-8 ${classNameContainer}`)}>
        <div className={mergeTW(`relative z-10 w-full max-w-lg p-4 mx-auto bg-white rounded border border-slate-600 shadow-lg ${className}`)}>
          {variant == 'default' ? (
            <div className="py-3 sm:flex">
              <div className="flex items-center justify-center flex-none w-12 h-12 mx-auto bg-slate-900 rounded-full">{icon}</div>
              <div className="mt-2 text-center sm:ml-4 sm:text-left">
                <h4 className="font-medium text-slate-50 text-lg">{title}</h4>
                <p className="mt-2 text-sm leading-relaxed text-slate-300">{description}</p>
                <div className="items-center gap-2 mt-3 sm:flex">{children}</div>
              </div>
            </div>
          ) : (
            ''
          )}
          {variant == 'custom' ? children : ''}
        </div>
      </div>
    </div>
  ) : (
    <></>
  );
};
