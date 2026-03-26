import React from 'react';
import { PackItem, PurchasedPack } from '../types';
import { CartIcon, CoinIcon, EyeIcon, SparklesIcon } from './Icons';
import { useLanguage } from '../contexts/LanguageContext';

type PackCardData = PackItem | PurchasedPack;

interface PackCardProps {
  pack: PackCardData;
  primaryActionLabel: string;
  onPrimaryAction: (pack: PackCardData) => void;
  showPrimaryIcon?: boolean;
  compact?: boolean;
  secondaryActionLabel?: string;
  onSecondaryAction?: (pack: PackCardData) => void;
  meta?: Array<{ label: string; value: string | number }>;
}

const tierPriority: Record<'C' | 'R' | 'SR' | 'SSR', number> = {
  C: 1,
  R: 2,
  SR: 3,
  SSR: 4,
};

const tierClassName: Record<'C' | 'R' | 'SR' | 'SSR', string> = {
  C: 'border-white/15 bg-white/10 text-white/75',
  R: 'border-emerald-300/35 bg-emerald-400/12 text-emerald-100',
  SR: 'border-amber-300/35 bg-amber-400/12 text-amber-100',
  SSR: 'border-rose-300/35 bg-rose-400/12 text-rose-100',
};

const tierGradient: Record<'C' | 'R' | 'SR' | 'SSR', string> = {
  C: 'linear-gradient(135deg, rgba(71,85,105,0.92) 0%, rgba(30,41,59,0.9) 54%, rgba(15,23,42,0.98) 100%)',
  R: 'linear-gradient(135deg, rgba(16,185,129,0.92) 0%, rgba(22,101,52,0.9) 54%, rgba(6,78,59,0.96) 100%)',
  SR: 'linear-gradient(135deg, rgba(249,115,22,0.95) 0%, rgba(190,24,93,0.88) 58%, rgba(23,23,23,0.95) 100%)',
  SSR: 'linear-gradient(135deg, rgba(251,113,133,0.96) 0%, rgba(168,85,247,0.9) 46%, rgba(30,41,59,0.98) 100%)',
};

export const getHighestTier = (pack: PackCardData): 'C' | 'R' | 'SR' | 'SSR' => {
  const cardTiers = pack.cards.map((card) => card.tier);
  const tiers = [...pack.tiers, ...cardTiers].filter(Boolean) as Array<'C' | 'R' | 'SR' | 'SSR'>;
  return tiers.sort((left, right) => tierPriority[right] - tierPriority[left])[0] || 'C';
};

export const getPackGradient = (pack: PackCardData) => tierGradient[getHighestTier(pack)];

const formatMetaValue = (value: string | number) => value;

const MetaStat = ({
  label,
  value,
  compact,
  fullWidth = false,
}: {
  label: string;
  value: string | number;
  compact: boolean;
  fullWidth?: boolean;
}) => (
  <div className={`rounded-xl border border-white/10 bg-white/5 p-2 ${fullWidth ? 'col-span-full' : ''}`}>
    <p className="text-[9px] uppercase tracking-[0.14em] text-slate-400">{label}</p>
    <p className={`mt-1 font-black text-white ${compact ? 'text-sm leading-4' : 'text-base'}`}>{formatMetaValue(value)}</p>
  </div>
);

export const PackCard: React.FC<PackCardProps> = ({
  pack,
  primaryActionLabel,
  onPrimaryAction,
  showPrimaryIcon = true,
  compact = false,
  secondaryActionLabel,
  onSecondaryAction,
  meta = [],
}) => {
  const { t } = useLanguage();
  const gradient = getPackGradient(pack);
  const cardClassName = compact
    ? 'rounded-[20px] p-2.5 shadow-[0_14px_36px_rgba(0,0,0,0.3)]'
    : 'rounded-[22px] p-3 shadow-[0_16px_44px_rgba(0,0,0,0.34)]';
  const topHeightClassName = compact ? 'h-24' : 'h-28';
  const bodyMinHeightClassName = compact ? 'min-h-[304px]' : 'min-h-[332px]';
  const titleClassName = compact ? 'max-w-[11rem] text-[1.05rem]' : 'max-w-[12rem] text-[1.15rem]';
  const metaMarginClassName = compact ? 'mt-14' : 'mt-16';

  return (
    <article className={`group relative overflow-hidden border border-white/10 bg-[#0f172a]/92 transition-transform duration-300 hover:-translate-y-1 ${cardClassName}`}>
      <div className={`absolute inset-x-0 top-0 opacity-95 transition-transform duration-500 group-hover:scale-105 ${topHeightClassName}`} style={{ background: gradient }} />
      <div className="absolute inset-0 bg-[linear-gradient(180deg,transparent_0%,rgba(2,6,23,0.28)_42%,rgba(2,6,23,0.98)_100%)]" />

      <div className={`relative flex flex-col ${bodyMinHeightClassName}`}>
        <div className="flex items-start justify-between">
          <div className="space-y-1.5">
            <span className="inline-flex rounded-full border border-white/15 bg-black/20 px-2.5 py-1 text-[9px] font-bold uppercase tracking-[0.16em] text-white/80 backdrop-blur-md">
              {pack.mood}
            </span>
            <div>
              <h3 className={`font-black leading-tight text-white ${titleClassName}`}>{pack.name}</h3>
              <p className="mt-0.5 text-[11px] text-white/70">{pack.creator}</p>
            </div>
          </div>
          <div className="rounded-xl border border-white/10 bg-black/30 px-2.5 py-1.5 text-right backdrop-blur-md">
            <div className="flex items-center justify-end gap-1 text-yellow-300">
              <CoinIcon className="h-3 w-3" />
              <span className="text-base font-black">{pack.price}</span>
            </div>
            <p className="text-[9px] uppercase tracking-[0.16em] text-white/60">{t('packs.price_unit')}</p>
          </div>
        </div>

        {compact && meta.length === 3 ? (
          <div className={`${metaMarginClassName} grid grid-cols-2 gap-2`}>
            <MetaStat label={meta[0].label} value={meta[0].value} compact={compact} />
            <MetaStat label={meta[1].label} value={meta[1].value} compact={compact} />
            <MetaStat label={meta[2].label} value={meta[2].value} compact={compact} fullWidth />
          </div>
        ) : (
          <div className={`${metaMarginClassName} grid gap-2 ${meta.length >= 3 ? 'grid-cols-3' : meta.length === 2 ? 'grid-cols-2' : 'grid-cols-1'}`}>
            {meta.map((item) => (
              <MetaStat key={item.label} label={item.label} value={item.value} compact={compact} />
            ))}
          </div>
        )}

        <p className="mt-3 text-[12px] leading-5 text-slate-300">{pack.description}</p>

        <div className="mt-3 flex flex-wrap gap-1.5">
          <span className="rounded-full border border-cyan-300/15 bg-cyan-300/10 px-2.5 py-1 text-[10px] font-bold uppercase tracking-[0.16em] text-cyan-100">
            {pack.theme}
          </span>
          {[...new Set(pack.tiers)].map((tier) => (
            <span key={tier} className={`rounded-full border px-2.5 py-1 text-[10px] font-bold uppercase tracking-[0.16em] ${tierClassName[tier as keyof typeof tierClassName]}`}>
              {tier}
            </span>
          ))}
        </div>

        <div className="mt-3 grid gap-2">
          {pack.cards.slice(0, 2).map((card) => (
            <div key={card.id} className="flex items-center justify-between rounded-xl border border-white/10 bg-black/20 px-3 py-2">
              <div className="flex items-center gap-2.5">
                <div className="flex h-7 w-7 items-center justify-center rounded-lg border border-white/10 bg-white/5">
                  <SparklesIcon className="h-3.5 w-3.5 text-white/80" />
                </div>
                <div>
                  <p className="text-[12px] font-bold text-white">{card.name}</p>
                  <p className="text-[10px] uppercase tracking-[0.14em] text-slate-400">{card.tier}</p>
                </div>
              </div>
              <span className={`rounded-full border px-2 py-1 text-[9px] font-bold uppercase tracking-[0.14em] ${tierClassName[card.tier]}`}>{card.tier}</span>
            </div>
          ))}
        </div>

        <div className="mt-auto flex gap-2 pt-4">
          {secondaryActionLabel && onSecondaryAction && (
            <button
              onClick={() => onSecondaryAction(pack)}
              className="flex-1 rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-[12px] font-bold text-white transition-colors hover:bg-white/10"
            >
              <span className="flex items-center justify-center gap-2">
                <EyeIcon className="h-3.5 w-3.5" />
                {secondaryActionLabel}
              </span>
            </button>
          )}
          <button
            onClick={() => onPrimaryAction(pack)}
            className="flex-1 rounded-xl bg-gradient-to-r from-orange-500 via-rose-500 to-cyan-500 px-3 py-2 text-[12px] font-black text-white shadow-[0_10px_30px_rgba(249,115,22,0.28)] transition-transform hover:scale-[1.02]"
          >
            <span className="flex items-center justify-center gap-2">
              {showPrimaryIcon && <CartIcon className="h-3.5 w-3.5" />}
              {primaryActionLabel}
            </span>
          </button>
        </div>
      </div>
    </article>
  );
};
