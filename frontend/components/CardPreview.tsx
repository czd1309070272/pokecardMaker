
import React, { CSSProperties } from 'react';
import { CardData, Supertype } from '../types';
import { EnergyLayout } from './card-layouts/EnergyLayout';
import { TrainerLayout } from './card-layouts/TrainerLayout';
import { PokemonLayout } from './card-layouts/PokemonLayout';
import { useLanguage } from '../contexts/LanguageContext';
import { getRarityAuraTheme, getRarityBadgeTheme, getRarityFrameTheme, getRarityLabel } from '../lib/rarity';

interface CardPreviewProps {
  data: CardData;
  isGeneratingImage?: boolean;
}

// Pre-defined styles for root elements
const ROOT_STYLE: CSSProperties = {
    transform: 'translateZ(0)',
    imageRendering: 'auto', // Changed to auto for smooth text/vectors
    perspective: '1000px',
    width: '420px',
    height: '588px',
};

export const CardPreview: React.FC<CardPreviewProps> = ({ data, isGeneratingImage }) => {
  const { language } = useLanguage();
  const enableRarityVisual = data.supertype === Supertype.Pokemon;
  const rarityAura = getRarityAuraTheme(data.rarity);
  const rarityBadge = getRarityBadgeTheme(data.rarity);
  const rarityFrame = getRarityFrameTheme(data.rarity);
  const rarityLabel = getRarityLabel(data.rarity, language, { short: true });
  const rarityBadgePositionClass =
    data.supertype === Supertype.Pokemon ? 'top-[84px] right-3' : 'top-3 right-3';

  const renderLayout = () => {
      switch (data.supertype) {
          case Supertype.Energy:
              return <EnergyLayout data={data} />;
          case Supertype.Trainer:
              return <TrainerLayout data={data} />;
          case Supertype.Pokemon:
          default:
              return <PokemonLayout data={data} />;
      }
  };

  return (
    <div 
        id="capture-card-node" 
        className="relative rounded-[24px] select-none font-sans text-gray-900 leading-none group antialiased" 
        style={ROOT_STYLE}
    >
        <div className="relative w-full h-full transition-all duration-500" style={{ transformStyle: 'preserve-3d' }}>
            
            {/* === FRONT FACE === */}
            <div className="absolute inset-0 rounded-[24px] overflow-hidden bg-[#1a1a1a]" style={{ backfaceVisibility: 'hidden' }}>
                
                {isGeneratingImage && (
                  <div className="absolute inset-0 z-50 bg-black/80 backdrop-blur-sm rounded-[24px] flex flex-col items-center justify-center text-white overflow-hidden">
                    <div className="absolute top-0 left-0 w-full h-1 bg-cyan-400 shadow-[0_0_15px_theme(colors.cyan.400)] animate-scan"></div>
                    <style>{`
                      @keyframes scan {
                        0% { transform: translateY(-10px); opacity: 0; }
                        10% { opacity: 1; }
                        90% { opacity: 1; }
                        100% { transform: translateY(588px); opacity: 0; }
                      }
                      .animate-scan { animation: scan 2s cubic-bezier(0.5, 0, 0.5, 1) infinite; }
                    `}</style>
                    <div className="w-12 h-12 border-4 border-white/20 border-t-white rounded-full animate-spin mb-4"></div>
                    <p className="font-bold text-lg uppercase tracking-widest animate-pulse">Generating...</p>
                  </div>
                )}
                
                {renderLayout()}

                {enableRarityVisual && rarityAura.enabled && (
                  <>
                    <div
                      className="absolute inset-0 rounded-[24px] pointer-events-none z-[23]"
                      style={{
                        border: `2px solid ${rarityAura.borderColor}`,
                        boxShadow: `${rarityAura.borderGlow}, inset 0 0 26px ${rarityAura.borderColor}`,
                        opacity: 0.95,
                      }}
                    />
                    <div
                      className="absolute inset-0 rounded-[24px] pointer-events-none z-[24]"
                      style={{
                        border: `2px solid ${rarityAura.borderColor}`,
                        boxShadow: `${rarityAura.borderGlow}, inset 0 0 34px ${rarityAura.borderColor}`,
                        animation: `rarityAuraPulse ${rarityAura.pulseDuration} ease-in-out infinite`,
                      }}
                    />
                  </>
                )}

                {enableRarityVisual && (
                  <>
                    <div
                      className="absolute inset-0 rounded-[24px] pointer-events-none z-20"
                      style={{
                        border: `2px solid ${rarityFrame.outerBorderColor}`,
                        boxShadow: rarityFrame.outerShadow,
                      }}
                    />
                    <div
                      className="absolute inset-[6px] rounded-[18px] pointer-events-none z-20"
                      style={{
                        border: `1px solid ${rarityFrame.innerBorderColor}`,
                        boxShadow: rarityFrame.innerShadow,
                      }}
                    />
                  </>
                )}

                {enableRarityVisual && (
                  <div
                    className={`absolute ${rarityBadgePositionClass} z-30 inline-flex min-h-[28px] items-center justify-center rounded-full border px-3 py-1 shadow-xl whitespace-nowrap`}
                    style={{
                      background: rarityBadge.background,
                      color: rarityBadge.textColor,
                      borderColor: rarityBadge.borderColor,
                      boxShadow: rarityBadge.glow,
                      textShadow: '0 1px 2px rgba(0, 0, 0, 0.45)',
                      fontSize: '10px',
                      fontWeight: 900,
                      letterSpacing: language === 'en' ? '0.08em' : '0.02em',
                      lineHeight: 1,
                    }}
                  >
                    {rarityLabel}
                  </div>
                )}

                {enableRarityVisual && rarityAura.enabled && (
                  <style>{`
                    @keyframes rarityAuraPulse {
                      0%, 100% { opacity: 0.72; transform: scale(0.999); filter: brightness(1.05) saturate(1.1); }
                      50% { opacity: 1; transform: scale(1.004); filter: brightness(1.38) saturate(1.45); }
                    }
                  `}</style>
                )}
                
            </div>
        </div>
    </div>
  );
};
