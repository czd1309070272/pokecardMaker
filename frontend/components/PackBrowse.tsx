import React, { useMemo, useState } from 'react';
import { PackItem, User } from '../types';
import { CartIcon, XIcon } from './Icons';
import { useLanguage } from '../contexts/LanguageContext';
import { getPackGradient, PackCard } from './PackCard';

interface PackBrowseProps {
  packs: PackItem[];
  user: User | null;
  onLoginRequired: () => void;
  onOpenPack: (pack: PackItem) => void;
}

export const PackBrowse: React.FC<PackBrowseProps> = ({ packs, user, onLoginRequired, onOpenPack }) => {
  const { t } = useLanguage();
  const [selectedPack, setSelectedPack] = useState<PackItem | null>(null);
  const [activeTheme, setActiveTheme] = useState<string>('all');

  const themes = useMemo(() => ['all', ...Array.from(new Set(packs.map((pack) => pack.theme)))], [packs]);
  const visiblePacks = activeTheme === 'all' ? packs : packs.filter((pack) => pack.theme === activeTheme);

  const handleBuyPack = (pack: PackItem) => {
    if (!user) {
      onLoginRequired();
      return;
    }
    onOpenPack(pack);
  };

  return (
    <div className="relative flex-grow overflow-y-auto bg-[#090b10] p-3 md:p-8">
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute left-[-8%] top-[-4%] h-72 w-72 rounded-full bg-orange-500/10 blur-3xl" />
        <div className="absolute right-[-10%] top-[15%] h-80 w-80 rounded-full bg-cyan-500/10 blur-3xl" />
        <div className="absolute bottom-[-10%] left-[24%] h-96 w-96 rounded-full bg-rose-500/10 blur-3xl" />
      </div>

      <div className="relative mx-auto max-w-[1400px]">
        <div className="mb-5 overflow-hidden rounded-[28px] border border-white/10 bg-[radial-gradient(circle_at_top_left,rgba(255,255,255,0.18),transparent_32%),linear-gradient(135deg,#101828_0%,#1f2937_48%,#111827_100%)] p-5 shadow-[0_20px_80px_rgba(0,0,0,0.45)] md:mb-8 md:p-8">
          <div className="grid gap-8 lg:grid-cols-[1.4fr_0.9fr] lg:items-end">
            <div className="space-y-5">
              <div className="space-y-3">
                <h1 className="max-w-3xl text-3xl font-black tracking-tight text-white md:text-5xl">{t('packs.title')}</h1>
                <p className="max-w-2xl text-sm leading-7 text-slate-300 md:text-lg">{t('packs.subtitle')}</p>
              </div>
              <div className="flex flex-wrap gap-3">
                {themes.map((theme) => (
                  <button
                    key={theme}
                    onClick={() => setActiveTheme(theme)}
                    className={`rounded-full border px-4 py-2 text-xs font-bold uppercase tracking-[0.16em] transition-all ${
                      activeTheme === theme
                        ? 'border-orange-300/40 bg-orange-400/15 text-orange-100 shadow-[0_0_20px_rgba(251,146,60,0.18)]'
                        : 'border-white/10 bg-white/5 text-slate-300 hover:border-white/20 hover:text-white'
                    }`}
                  >
                    {theme === 'all' ? t('packs.filter_all') : theme}
                  </button>
                ))}
              </div>
            </div>

            <div className="grid gap-3 sm:grid-cols-3 lg:grid-cols-1 xl:grid-cols-3">
              <div className="rounded-2xl border border-white/10 bg-black/25 p-4 backdrop-blur-md">
                <p className="text-[11px] uppercase tracking-[0.18em] text-slate-400">{t('packs.metric_live')}</p>
                <p className="mt-2 text-3xl font-black text-white">{visiblePacks.length}</p>
              </div>
              <div className="rounded-2xl border border-white/10 bg-black/25 p-4 backdrop-blur-md">
                <p className="text-[11px] uppercase tracking-[0.18em] text-slate-400">{t('packs.metric_stock')}</p>
                <p className="mt-2 text-3xl font-black text-white">{visiblePacks.reduce((sum, pack) => sum + pack.packCount, 0)}</p>
              </div>
              <div className="rounded-2xl border border-white/10 bg-black/25 p-4 backdrop-blur-md">
                <p className="text-[11px] uppercase tracking-[0.18em] text-slate-400">{t('packs.metric_price')}</p>
                <p className="mt-2 text-3xl font-black text-white">{packs.length ? `${Math.min(...packs.map((pack) => pack.price))}+` : '0'}</p>
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-3.5 pb-20 sm:grid-cols-2 xl:grid-cols-4">
          {visiblePacks.map((pack) => (
            <PackCard
              key={pack.id}
              pack={pack}
              meta={[
                { label: t('packs.cards_count'), value: pack.packCount },
                { label: t('packs.market_status'), value: t('packs.market_available') },
                { label: t('packs.tier_count'), value: pack.tiers.length },
              ]}
              secondaryActionLabel={t('packs.view_pack')}
              onSecondaryAction={(item) => setSelectedPack(item as PackItem)}
              primaryActionLabel={t('packs.buy_pack')}
              onPrimaryAction={(item) => handleBuyPack(item as PackItem)}
            />
          ))}
        </div>
      </div>

      {selectedPack && (
        <div className="fixed inset-0 z-[100] overflow-y-auto bg-black/90 backdrop-blur-md" onClick={() => setSelectedPack(null)}>
          <div className="flex min-h-full items-center justify-center p-4 md:p-8" onClick={(event) => event.stopPropagation()}>
            <div className="relative w-full max-w-5xl overflow-hidden rounded-[32px] border border-white/10 bg-[#08101d] shadow-[0_24px_100px_rgba(0,0,0,0.55)]">
              <button
                onClick={() => setSelectedPack(null)}
                className="absolute right-4 top-4 z-10 rounded-full border border-white/10 bg-black/30 p-2 text-white transition-colors hover:bg-white/10"
              >
                <XIcon className="h-5 w-5" />
              </button>

              <div className="grid gap-0 lg:grid-cols-[1.1fr_0.9fr]">
                <div className="min-h-[320px] p-6 md:p-10" style={{ background: getPackGradient(selectedPack) }}>
                  <div className="flex h-full flex-col justify-between rounded-[28px] border border-white/15 bg-black/20 p-6 backdrop-blur-md">
                    <div>
                      <p className="text-[11px] uppercase tracking-[0.22em] text-white/70">{selectedPack.theme}</p>
                      <h2 className="mt-3 max-w-sm text-4xl font-black leading-tight text-white md:text-5xl">{selectedPack.name}</h2>
                      <p className="mt-4 max-w-md text-sm leading-7 text-white/80">{selectedPack.description}</p>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {selectedPack.tiers.map((tier) => (
                        <span key={tier} className="rounded-full border border-white/15 bg-white/10 px-3 py-1 text-[11px] font-bold uppercase tracking-[0.18em] text-white/85">
                          {tier}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="space-y-6 p-6 md:p-10">
                  <div>
                    <p className="text-[11px] uppercase tracking-[0.22em] text-slate-400">{t('packs.detail_title')}</p>
                    <div className="mt-4 grid gap-3">
                      <div className="flex items-center justify-between rounded-2xl border border-white/10 bg-white/5 px-4 py-3">
                        <span className="text-sm text-slate-400">{t('card.creator')}</span>
                        <span className="font-bold text-white">{selectedPack.creator}</span>
                      </div>
                      <div className="flex items-center justify-between rounded-2xl border border-white/10 bg-white/5 px-4 py-3">
                        <span className="text-sm text-slate-400">{t('packs.detail_price')}</span>
                        <span className="font-bold text-yellow-300">{selectedPack.price} {t('packs.price_unit')}</span>
                      </div>
                      <div className="flex items-center justify-between rounded-2xl border border-white/10 bg-white/5 px-4 py-3">
                        <span className="text-sm text-slate-400">{t('packs.market_status')}</span>
                        <span className="font-bold text-emerald-300">{t('packs.market_available')}</span>
                      </div>
                    </div>
                  </div>

                  <div>
                    <p className="text-[11px] uppercase tracking-[0.22em] text-slate-400">{t('packs.preview_cards')}</p>
                    <div className="mt-4 space-y-3">
                      {selectedPack.cards.map((card) => (
                        <div key={card.id} className="flex items-center justify-between rounded-2xl border border-white/10 bg-white/5 px-4 py-3">
                          <div>
                            <p className="font-bold text-white">{card.name}</p>
                            <p className="text-[11px] uppercase tracking-[0.16em] text-slate-400">{selectedPack.theme}</p>
                          </div>
                          <span className="rounded-full border border-white/15 bg-white/10 px-2.5 py-1 text-[10px] font-bold uppercase tracking-[0.16em] text-white/85">
                            {card.tier}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>

                  <button
                    onClick={() => handleBuyPack(selectedPack)}
                    className="w-full rounded-2xl bg-gradient-to-r from-orange-500 via-rose-500 to-cyan-500 px-5 py-4 text-base font-black text-white shadow-[0_14px_36px_rgba(249,115,22,0.3)] transition-transform hover:scale-[1.01]"
                  >
                    <span className="flex items-center justify-center gap-2">
                      <CartIcon className="h-5 w-5" />
                      {t('packs.buy_pack')}
                    </span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
