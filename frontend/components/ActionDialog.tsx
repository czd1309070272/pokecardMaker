import React from 'react';
import { XIcon } from './Icons';
import { useLanguage } from '../contexts/LanguageContext';

export interface ActionDialogOption {
  label: string;
  onClick: () => void;
  variant?: 'primary' | 'secondary' | 'danger';
}

interface ActionDialogProps {
  isOpen: boolean;
  title: string;
  description: string;
  onClose: () => void;
  options: ActionDialogOption[];
}

const optionClasses: Record<NonNullable<ActionDialogOption['variant']>, string> = {
  primary:
    'border border-blue-400/25 bg-[linear-gradient(180deg,rgba(59,130,246,0.92),rgba(37,99,235,0.82))] text-white shadow-[inset_0_1px_0_rgba(255,255,255,0.18),0_16px_36px_rgba(37,99,235,0.24)] hover:brightness-110',
  secondary:
    'border border-white/10 bg-white/6 text-gray-100 hover:bg-white/10',
  danger:
    'border border-red-400/20 bg-[linear-gradient(180deg,rgba(220,38,38,0.94),rgba(153,27,27,0.84))] text-white shadow-[inset_0_1px_0_rgba(255,255,255,0.14),0_16px_36px_rgba(127,29,29,0.25)] hover:brightness-110',
};

export const ActionDialog: React.FC<ActionDialogProps> = ({
  isOpen,
  title,
  description,
  onClose,
  options,
}) => {
  const { t } = useLanguage();
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[140] flex items-center justify-center bg-black/75 p-4 backdrop-blur-xl animate-in fade-in duration-200">
      <div className="relative w-full max-w-md overflow-hidden rounded-[30px] border border-white/12 bg-[rgba(14,18,25,0.76)] p-7 shadow-[0_30px_120px_rgba(2,6,23,0.7)] backdrop-blur-[28px]">
        <div className="pointer-events-none absolute inset-0 rounded-[30px] bg-[radial-gradient(circle_at_top,rgba(255,255,255,0.16),transparent_34%),radial-gradient(circle_at_16%_20%,rgba(56,189,248,0.14),transparent_30%),radial-gradient(circle_at_88%_0%,rgba(59,130,246,0.16),transparent_28%)]" />
        <div className="pointer-events-none absolute inset-[1px] rounded-[29px] border border-white/8" />
        <div className="pointer-events-none absolute -right-10 top-0 h-36 w-36 rounded-full bg-blue-500/12 blur-3xl" />
        <div className="pointer-events-none absolute -left-10 bottom-0 h-32 w-32 rounded-full bg-cyan-400/10 blur-3xl" />

        <button
          onClick={onClose}
          className="absolute right-4 top-4 z-20 rounded-full border border-white/10 bg-white/6 p-1.5 text-gray-400 transition-all hover:bg-white/12 hover:text-white"
          aria-label="Close dialog"
        >
          <XIcon className="h-5 w-5" />
        </button>

        <div className="relative z-10">
          <div className="mb-6">
            <div className="mb-4 inline-flex rounded-full border border-cyan-300/18 bg-cyan-400/10 px-3 py-1 text-[11px] font-bold uppercase tracking-[0.24em] text-cyan-200/90">
              {t('dialog.brand')}
            </div>
            <h2 className="text-2xl font-bold tracking-tight text-white">{title}</h2>
            <p className="mt-3 text-sm leading-6 text-gray-300">{description}</p>
          </div>

          <div className="space-y-3">
            {options.map((option) => (
              <button
                key={option.label}
                onClick={option.onClick}
                className={`w-full rounded-2xl px-4 py-3 text-sm font-semibold transition-all duration-200 active:scale-[0.98] ${optionClasses[option.variant || 'secondary']}`}
              >
                {option.label}
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
