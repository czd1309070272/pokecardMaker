
import React, { CSSProperties } from 'react';
import { CardData, ElementType } from '../../types';
import { useImageLoader } from '../../hooks/useImageLoader';
import { EnergyIcon } from '../Icons';
import { getTypeTheme } from '../../utils/cardStyles';
import { HoloOverlay } from '../card-parts/HoloOverlay';
import { TypeTransitionEffect } from '../card-parts/TypeTransitionEffect';
import { resolveSubtypeCode, getSubtypeLabel } from '../../lib/subtype';
import { useLanguage } from '../../contexts/LanguageContext';
import { getAttributeTheme } from '../../lib/attributes';

export const PokemonLayout: React.FC<{ data: CardData }> = ({ data }) => {
    const { language } = useLanguage();
    const { currentSrc: mainImageSrc } = useImageLoader(data.image);
    const { currentSrc: setSymbolSrc } = useImageLoader(data.setSymbolImage);

    const subtypeCode = resolveSubtypeCode(data.subtype);
    const isStage1 = subtypeCode === 'stage1';
    const isStage2 = subtypeCode === 'stage2';
    const isBasic = subtypeCode === 'basic';
    const isVMAX = subtypeCode === 'vmax';
    const isRadiant = subtypeCode === 'radiant';
    const subtypeLabel = getSubtypeLabel(data.subtype, language);

    const theme = getTypeTheme(data.type);

    const imageStyle: CSSProperties = {
        transform: `scale(${data.zoom}) translate(${data.xOffset}px, ${data.yOffset}px)`,
        transformOrigin: 'center center'
    };

    const hasEvolution = isStage1 || isStage2 || data.evolvesFrom;
    const contentPaddingBottom = isVMAX ? 'pb-12' : 'pb-5';
    const bgGradient = getAttributeTheme(data.type).cardBackground;
    const badgeContainerClass = "absolute left-3 z-30 max-w-[42%]";
    const badgeTextClass = "relative z-10 block truncate";

    return (
        <>
            {/* Card Border/Frame - Enhanced with metallic effect */}
            <div className={`absolute inset-0 p-[12px] z-0 bg-gradient-to-br from-amber-100 via-yellow-200 to-amber-300 shadow-2xl`}>
                <div className="absolute inset-0 opacity-30" style={{
                    filter: 'contrast(120%) brightness(100%)',
                    backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.65' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")`,
                    mixBlendMode: 'overlay'
                }}></div>
                {/* Inner border glow */}
                <div className="absolute inset-[2px] rounded-[14px] shadow-[inset_0_0_20px_rgba(255,255,255,0.5)]"></div>
            </div>
            
            {/* Main Content Area */}
            <div className={`relative w-full h-full ${bgGradient} rounded-[14px] overflow-hidden flex flex-col`}>
                
                {/* Background Art Layer (Full Art) */}
                <div className="absolute inset-0 z-0 bg-black/10">
                    <img 
                        src={mainImageSrc} 
                        crossOrigin="anonymous"
                        loading="lazy"
                        className="w-full h-full object-cover opacity-100 card-art-image"
                        style={imageStyle}
                        alt="Card Main Artwork"
                    />
                </div>

                <HoloOverlay pattern={data.holoPattern} />
                
                {/* Effect Overlay for Element Type Changes */}
                <TypeTransitionEffect type={data.type} isPokemon={true} />

                {/* EVOLUTION & SUBTYPE BADGES - Enhanced and redesigned */}
                {(isStage1 || isStage2) && (
                    <div className={`${badgeContainerClass} top-[21%]`}>
                        <div className="relative">
                            <div className="absolute inset-x-3 -top-1 bottom-0 rounded-[10px] bg-amber-300/40 blur-md"></div>
                            <div className="absolute inset-0 rounded-[12px] border border-yellow-100/60 bg-gradient-to-b from-white/20 to-transparent opacity-80"></div>
                            <div className="relative overflow-hidden rounded-[12px] border-[1.5px] border-[#f7e7a2] bg-gradient-to-br from-[#fff3b8] via-[#dcb24d] to-[#7f5319] px-3 py-1.5 text-[10px] font-black uppercase tracking-[0.22em] text-[#2f1800] shadow-[0_10px_18px_rgba(0,0,0,0.35),inset_0_1px_0_rgba(255,255,255,0.65),inset_0_-2px_4px_rgba(92,53,8,0.35)]">
                                <div className="absolute inset-0 bg-[linear-gradient(135deg,rgba(255,255,255,0.34)_0%,rgba(255,255,255,0)_34%,rgba(80,40,0,0.15)_100%)]"></div>
                                <div className="absolute left-2 right-2 top-[1px] h-[1px] bg-white/80"></div>
                                <div className="absolute bottom-[2px] left-2 right-2 h-[1px] bg-black/20"></div>
                                <span className={`${badgeTextClass} drop-shadow-[0_1px_0_rgba(255,248,214,0.75)]`}>{subtypeLabel}</span>
                            </div>
                        </div>
                    </div>
                )}

                {isVMAX && (
                    <div className="absolute top-[20%] left-2 z-30 max-w-[46%]">
                        <div className="relative">
                            <div className="absolute inset-0 rounded-[14px] bg-[radial-gradient(circle_at_25%_50%,rgba(255,173,84,0.45),transparent_45%),radial-gradient(circle_at_80%_50%,rgba(255,64,129,0.45),transparent_42%)] blur-md opacity-90"></div>
                            <div className="relative overflow-hidden rounded-[14px] border border-[#ffd39f] bg-[linear-gradient(135deg,#5d120f_0%,#a1181b_22%,#f05a28_48%,#f7b34a_62%,#74151d_100%)] px-4 py-2 text-[11px] font-black uppercase tracking-[0.24em] text-[#fff3d6] shadow-[0_12px_24px_rgba(59,0,0,0.45),inset_0_1px_0_rgba(255,255,255,0.35),inset_0_-2px_6px_rgba(45,0,0,0.35)]">
                                <div className="absolute inset-0 bg-[linear-gradient(120deg,rgba(255,255,255,0.24)_0%,rgba(255,255,255,0)_26%,rgba(255,0,98,0.12)_60%,rgba(0,0,0,0.2)_100%)]"></div>
                                <div className="absolute inset-y-0 left-[10px] w-[1px] bg-white/20"></div>
                                <div className="absolute inset-y-0 right-[10px] w-[1px] bg-black/15"></div>
                                <span className={`${badgeTextClass} drop-shadow-[0_2px_4px_rgba(68,0,0,0.55)]`}>{subtypeLabel}</span>
                            </div>
                        </div>
                    </div>
                )}

                {isRadiant && (
                    <div className={`${badgeContainerClass} top-[21%]`}>
                        <div className="relative">
                            <div className="absolute inset-0 rounded-[12px] bg-[conic-gradient(from_160deg,rgba(255,230,120,0.58),rgba(255,148,196,0.45),rgba(107,229,255,0.48),rgba(255,230,120,0.58))] blur-md opacity-70"></div>
                            <div className="relative overflow-hidden rounded-[12px] border border-white/70 bg-[linear-gradient(135deg,rgba(255,248,194,0.96)_0%,rgba(255,217,126,0.96)_24%,rgba(255,179,205,0.92)_55%,rgba(156,241,255,0.92)_100%)] px-3 py-1.5 text-[10px] font-black uppercase tracking-[0.24em] text-[#381600] shadow-[0_10px_18px_rgba(0,0,0,0.3),inset_0_1px_0_rgba(255,255,255,0.7),inset_0_-2px_5px_rgba(118,56,0,0.22)]">
                                <div className="absolute inset-0 bg-[linear-gradient(130deg,rgba(255,255,255,0.42)_0%,rgba(255,255,255,0)_30%,rgba(255,255,255,0.18)_68%,rgba(0,0,0,0.08)_100%)]"></div>
                                <span className={`${badgeTextClass} drop-shadow-[0_1px_0_rgba(255,255,255,0.72)]`}>✦ {subtypeLabel} ✦</span>
                            </div>
                        </div>
                    </div>
                )}

                {/* Basic badge - subtle indicator */}
                {isBasic && !isVMAX && !isRadiant && (
                    <div className="absolute top-[21%] left-3 z-30 max-w-[34%]">
                        <div className="relative overflow-hidden rounded-[11px] border border-[#e5d7a1] bg-[linear-gradient(135deg,rgba(255,246,220,0.95)_0%,rgba(241,220,167,0.95)_100%)] px-2.5 py-1 text-[9px] font-black uppercase tracking-[0.18em] text-[#463000] shadow-[0_6px_14px_rgba(0,0,0,0.22),inset_0_1px_0_rgba(255,255,255,0.65)]">
                            <div className="absolute inset-0 bg-[linear-gradient(120deg,rgba(255,255,255,0.3)_0%,rgba(255,255,255,0)_38%,rgba(0,0,0,0.06)_100%)]"></div>
                            <span className={`${badgeTextClass} text-[9px] drop-shadow-[0_1px_0_rgba(255,255,255,0.7)]`}>{subtypeLabel}</span>
                        </div>
                    </div>
                )}

                {/* Header Section - Enhanced with better shadows */}
                <div className="relative z-10 px-5 pt-3 pb-8 bg-gradient-to-b from-black/70 via-black/50 to-transparent">
                    <div className="flex justify-between items-start">
                        <div className="flex flex-col min-w-0 flex-1 pr-3">
                            <span className="text-[10px] font-bold text-yellow-200 uppercase tracking-wide drop-shadow-[0_2px_4px_rgba(0,0,0,0.8)]">
                                {hasEvolution && data.evolvesFrom ? `前身：${data.evolvesFrom}` : (isBasic ? '' : '')}
                            </span>
                            <h1 className="text-[30px] font-bold text-white drop-shadow-[0_3px_8px_rgba(0,0,0,0.9)] mt-0.5 font-heading tracking-tight leading-[0.9] break-words">
                                {data.name}
                            </h1>
                        </div>

                        <div className="flex items-center gap-1.5 self-start mt-2 bg-black/30 px-2 py-1 rounded-lg backdrop-blur-sm border border-white/20 shrink-0">
                            <span className="text-[11px] font-bold text-yellow-200 drop-shadow-md pt-1">HP</span>
                            <span className="text-[28px] font-bold text-white drop-shadow-lg leading-none mr-0.5">{data.hp}</span>
                            <div className="relative z-20 flex items-center justify-center">
                                <EnergyIcon type={data.type} size={28} />
                            </div>
                        </div>
                    </div>
                </div>

                <div className="flex-grow"></div>

                {/* Species Info Bar - Enhanced with better styling */}
                <div className="relative z-10 mx-2 mb-1">
                    <div className="bg-gradient-to-r from-yellow-300 via-yellow-200 to-yellow-300 py-1.5 px-4 rounded shadow-lg flex justify-between items-center transform -skew-x-12 mx-4 border-y-2 border-yellow-400 relative overflow-hidden">
                        <div className="absolute inset-0 bg-gradient-to-b from-white/30 to-transparent"></div>
                        <span className="transform skew-x-12 text-[9px] font-bold text-gray-800 relative z-10 drop-shadow-sm">{data.dexSpecies}</span>
                        <span className="transform skew-x-12 text-[9px] font-bold text-gray-800 relative z-10 drop-shadow-sm">HT: {data.dexHeight}</span>
                        <span className="transform skew-x-12 text-[9px] font-bold text-gray-800 relative z-10 drop-shadow-sm">WT: {data.dexWeight}</span>
                    </div>
                </div>

                {/* Attacks Section - Enhanced with semi-transparent background */}
<div className={`relative z-10 mx-3 mb-3 rounded-xl shadow-2xl border-2 border-white/30 backdrop-blur-md p-3 ${contentPaddingBottom} overflow-hidden`}>
                    {/* Semi-transparent gradient background */}
                    <div className={`absolute inset-0 ${theme.boxGradient} opacity-60 rounded-xl`}></div>
                    {/* Inner glow effect */}
                    <div className="absolute inset-0 bg-gradient-to-b from-white/10 to-transparent rounded-xl"></div>
                    <div className="absolute inset-0 shadow-[inset_0_2px_10px_rgba(0,0,0,0.3)] rounded-xl"></div>

                    <div className="space-y-4 w-full relative z-10">
                        {data.attacks.map((attack, index) => (
                            <div key={attack.id} className="relative">
                                <div className="flex items-center justify-between min-h-[26px] gap-2">
                                    <div className="flex items-center gap-0.5 flex-shrink-0 justify-start -ml-1 flex-wrap max-w-[90px]">
                                        {attack.cost.map((c, i) => (
                                            <div key={i} className="drop-shadow-md">
                                                <EnergyIcon type={c} size={18} />
                                            </div>
                                        ))}
                                    </div>

                                    <span className={`text-[19px] font-bold flex-grow drop-shadow-[0_2px_4px_rgba(0,0,0,0.5)] font-heading leading-none pt-0.5 ${theme.textColor}`}>
                                        {attack.name}
                                    </span>

                                    <span className={`text-[19px] font-bold flex-shrink-0 pl-2 leading-none pt-0.5 drop-shadow-[0_2px_4px_rgba(0,0,0,0.5)] ${theme.textColor}`}>
                                        {attack.damage}
                                    </span>
                                </div>

                                {attack.description && (
                                    <p className={`text-[11px] font-medium leading-tight mt-1 pl-1 opacity-95 drop-shadow-sm ${theme.subTextColor}`}>
                                        {attack.description}
                                    </p>
                                )}
                            </div>
                        ))}
                    </div>

                    {isVMAX && (
                        <div className="absolute bottom-1 right-1 left-1 bg-gradient-to-r from-gray-900 to-black border-2 border-red-600/50 rounded-md p-1.5 flex gap-2 items-center shadow-xl mt-2 z-20 relative overflow-hidden">
                            <div className="absolute inset-0 bg-gradient-to-t from-red-900/20 to-transparent"></div>
                            <div className="text-white text-[9px] font-black px-1.5 uppercase italic bg-red-600 rounded relative z-10">爆表规条</div>
                            <p className="text-[8px] font-medium text-white leading-tight relative z-10">
                                爆表仔被击倒时，对手额外收 1 张奖赏卡。
                            </p>
                        </div>
                    )}
                </div>

                {/* Footer Section - Enhanced with better styling and wider layout */}
                <div className={`relative z-10 px-3 pb-3 text-xs font-bold pt-4 -mt-6 ${theme.footerGradient}`}>

                    <div className="flex items-center justify-between mb-3 bg-black/20 py-2 px-2 rounded-lg backdrop-blur-sm border border-white/10">
                        <div className="flex items-center gap-2 min-w-[60px]">
                            <span className={`text-[10px] font-bold ${theme.subTextColor}`}>Weakness</span>
                            {data.weakness && (
                                <div className="flex items-center justify-center gap-1 bg-white/10 px-1.5 py-0.5 rounded">
                                    <EnergyIcon type={data.weakness} size={14} />
                                    <span className={`text-[10px] font-bold leading-none pt-[1px] ${theme.textColor}`}>x2</span>
                                </div>
                            )}
                        </div>
                        <div className="flex items-center gap-2">
                            <span className={`text-[10px] font-bold ${theme.subTextColor}`}>Resistance</span>
                            {data.resistance && (
                                <div className="flex items-center justify-center gap-1 bg-white/10 px-1.5 py-0.5 rounded">
                                    <EnergyIcon type={data.resistance} size={14} />
                                    <span className={`text-[10px] font-bold leading-none pt-[1px] ${theme.textColor}`}>-30</span>
                                </div>
                            )}
                        </div>
                        <div className="flex items-center gap-2 min-w-[60px] justify-end">
                            <span className={`text-[10px] font-bold ${theme.subTextColor}`}>Retreat</span>
                            <div className="flex gap-0.5 bg-white/10 px-1.5 py-0.5 rounded">
                                {Array.from({length: data.retreatCost}).map((_, i) => (
                                    <EnergyIcon key={i} type={ElementType.Colorless} size={14} />
                                ))}
                            </div>
                        </div>
                    </div>

                    {data.pokedexEntry && !isVMAX && (
                        <div className={`mb-2 px-2 py-2 bg-white/25 border-2 border-white/20 rounded-lg italic text-[9px] leading-tight shadow-lg backdrop-blur-sm ${theme.textColor} relative overflow-hidden`}>
                            <div className="absolute inset-0 bg-gradient-to-b from-white/10 to-transparent"></div>
                            <p className="relative z-10">{data.pokedexEntry}</p>
                        </div>
                    )}

                    <div className="flex justify-between items-end mt-2 bg-black/20 py-2 px-2 rounded-lg backdrop-blur-sm border border-white/10">
                        <div className="flex items-center gap-2">
                            <div className="bg-gradient-to-r from-yellow-400 via-yellow-300 to-yellow-400 text-black px-2 py-1 text-[8px] font-bold border-2 border-yellow-500 rounded shadow-md relative overflow-hidden">
                                <div className="absolute inset-0 bg-gradient-to-b from-white/30 to-transparent"></div>
                                <span className="relative z-10">Illus. {data.illustrator}</span>
                            </div>
                            <span className="text-[7px] text-white/80 drop-shadow-sm">©2024 Pokecard Studio</span>
                        </div>
                        <div className="flex items-center gap-1.5 bg-white/10 px-2 py-1 rounded-md">
                            {data.setSymbolImage ? (
                                <img
                                    src={setSymbolSrc}
                                    className="w-4 h-4 object-contain filter drop-shadow-md card-art-image"
                                    alt="Set"
                                    crossOrigin="anonymous"
                                />
                            ) : (
                                <div className="w-4 h-4 bg-gradient-to-br from-white to-gray-200 flex items-center justify-center text-[9px] border-2 border-black/30 rounded shadow-sm font-bold text-black">
                                    {data.regulationMark}
                                </div>
                            )}
                            <span className={`font-bold font-mono text-sm ${theme.textColor} drop-shadow-md`}>{data.setNumber}</span>
                            <span className="text-yellow-300 text-base drop-shadow-[0_2px_4px_rgba(0,0,0,0.8)]">★</span>
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
};
