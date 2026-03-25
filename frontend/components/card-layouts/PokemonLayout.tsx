
import React, { CSSProperties } from 'react';
import { CardData, ElementType, Subtype } from '../../types';
import { useImageLoader } from '../../hooks/useImageLoader';
import { EnergyIcon } from '../Icons';
import { getTypeTheme } from '../../utils/cardStyles';
import { HoloOverlay } from '../card-parts/HoloOverlay';
import { TypeTransitionEffect } from '../card-parts/TypeTransitionEffect';

export const PokemonLayout: React.FC<{ data: CardData }> = ({ data }) => {
    const { currentSrc: mainImageSrc } = useImageLoader(data.image);
    const { currentSrc: setSymbolSrc } = useImageLoader(data.setSymbolImage);

    const subtypeStr = (data.subtype || '').toString();
    const isStage1 = subtypeStr.includes('Stage 1');
    const isStage2 = subtypeStr.includes('Stage 2');
    const isBasic = subtypeStr.includes('Basic') || (!isStage1 && !isStage2);
    
    const isVMAX = subtypeStr === Subtype.VMAX;
    const isRadiant = subtypeStr === Subtype.Radiant;

    const theme = getTypeTheme(data.type);

    const imageStyle: CSSProperties = {
        transform: `scale(${data.zoom}) translate(${data.xOffset}px, ${data.yOffset}px)`,
        transformOrigin: 'center center'
    };

    const hasEvolution = isStage1 || isStage2 || data.evolvesFrom;
    const contentPaddingBottom = isVMAX ? 'pb-12' : 'pb-5';

    // Calculate background gradient logic locally since it's specific to Pokemon layout nuances
    const getBgGradient = (): string => {
        switch (data.type) {
          case ElementType.Fire: return 'bg-gradient-to-br from-[#ea580c] via-[#c2410c] to-[#7c2d12]';
          case ElementType.Grass: return 'bg-gradient-to-br from-green-600 to-green-800';
          case ElementType.Water: return 'bg-gradient-to-br from-blue-500 to-blue-800';
          case ElementType.Lightning: return 'bg-gradient-to-br from-yellow-400 to-yellow-600';
          case ElementType.Psychic: return 'bg-gradient-to-br from-purple-500 to-purple-800';
          case ElementType.Fighting: return 'bg-gradient-to-br from-orange-600 to-orange-800';
          case ElementType.Darkness: return 'bg-gradient-to-br from-gray-800 to-black';
          case ElementType.Metal: return 'bg-gradient-to-br from-gray-400 to-gray-600';
          case ElementType.Fairy: return 'bg-gradient-to-br from-pink-400 to-pink-700';
          case ElementType.Dragon: return 'bg-gradient-to-br from-yellow-600 to-green-800';
          case ElementType.Ice: return 'bg-gradient-to-br from-cyan-400 to-cyan-700';
          case ElementType.Poison: return 'bg-gradient-to-br from-fuchsia-500 to-fuchsia-800';
          case ElementType.Ground: return 'bg-gradient-to-br from-yellow-700 to-yellow-900';
          case ElementType.Flying: return 'bg-gradient-to-br from-blue-300 to-blue-500';
          case ElementType.Bug: return 'bg-gradient-to-br from-lime-500 to-lime-700';
          case ElementType.Rock: return 'bg-gradient-to-br from-stone-500 to-stone-700';
          case ElementType.Ghost: return 'bg-gradient-to-br from-indigo-500 to-indigo-800';
          default: return 'bg-gradient-to-br from-gray-300 to-gray-400';
        }
    };

    const bgGradient = getBgGradient();

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
                    <div className="absolute top-[12%] left-3 z-20">
                        <div className="relative">
                            {/* Glow effect */}
                            <div className="absolute inset-0 bg-yellow-400 blur-md opacity-50 rounded"></div>
                            {/* Badge */}
                            <div className="relative bg-gradient-to-br from-yellow-300 via-yellow-400 to-amber-500 text-black font-black uppercase text-[11px] px-3 py-1.5 rounded-md shadow-xl border-2 border-yellow-200 tracking-wider">
                                <div className="absolute inset-0 bg-gradient-to-t from-black/10 to-white/20 rounded-md"></div>
                                <span className="relative z-10 drop-shadow-sm">{isStage1 ? 'STAGE 1' : 'STAGE 2'}</span>
                            </div>
                        </div>
                    </div>
                )}

                {isVMAX && (
                    <div className="absolute top-[10%] left-2 z-20">
                        <div className="relative">
                            {/* Animated glow effect */}
                            <div className="absolute inset-0 bg-gradient-to-r from-red-500 via-pink-500 to-purple-500 blur-lg opacity-60 rounded-md animate-pulse"></div>
                            {/* Badge */}
                            <div className="relative bg-gradient-to-r from-red-600 via-pink-600 to-purple-600 text-white font-black italic text-[14px] px-4 py-2 rounded-lg shadow-2xl border-2 border-white/60 overflow-hidden">
                                <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-white/10"></div>
                                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent animate-shimmer"></div>
                                <span className="relative z-10 drop-shadow-[0_2px_4px_rgba(0,0,0,0.8)]">VMAX</span>
                            </div>
                        </div>
                    </div>
                )}

                {isRadiant && (
                    <div className="absolute top-[12%] left-3 z-20">
                        <div className="relative">
                            {/* Rainbow glow effect */}
                            <div className="absolute inset-0 bg-gradient-to-r from-yellow-300 via-pink-300 to-cyan-300 blur-md opacity-60 rounded animate-pulse"></div>
                            {/* Badge */}
                            <div className="relative bg-gradient-to-r from-yellow-200 via-pink-200 to-cyan-200 text-black font-bold uppercase text-[10px] px-3 py-1.5 rounded-md shadow-xl border-2 border-white tracking-widest overflow-hidden">
                                <div className="absolute inset-0 bg-gradient-to-t from-black/10 to-white/20"></div>
                                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/40 to-transparent animate-shimmer"></div>
                                <span className="relative z-10 drop-shadow-sm">✦ RADIANT ✦</span>
                            </div>
                        </div>
                    </div>
                )}

                {/* Basic badge - subtle indicator */}
                {isBasic && !isVMAX && !isRadiant && (
                    <div className="absolute top-[12%] left-3 z-20">
                        <div className="bg-white/90 text-gray-800 font-bold uppercase text-[9px] px-2.5 py-1 rounded shadow-md border border-gray-300 backdrop-blur-sm">
                            BASIC
                        </div>
                    </div>
                )}

                {/* Header Section - Enhanced with better shadows */}
                <div className="relative z-10 px-5 pt-3 pb-8 bg-gradient-to-b from-black/70 via-black/50 to-transparent">
                    <div className="flex justify-between items-start">
                        <div className="flex flex-col">
                            <span className="text-[10px] font-bold text-yellow-200 uppercase tracking-wide drop-shadow-[0_2px_4px_rgba(0,0,0,0.8)]">
                                {hasEvolution && data.evolvesFrom ? `Evolves from ${data.evolvesFrom}` : (isBasic ? '' : '')}
                            </span>
                            <h1 className="text-3xl font-bold text-white drop-shadow-[0_3px_8px_rgba(0,0,0,0.9)] mt-0.5 font-heading tracking-tight leading-none">
                                {data.name}
                            </h1>
                        </div>

                        <div className="flex items-center gap-1.5 self-center mt-2 bg-black/30 px-2 py-1 rounded-lg backdrop-blur-sm border border-white/20">
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
                            <div className="text-white text-[9px] font-black px-1.5 uppercase italic bg-red-600 rounded relative z-10">VMAX RULE</div>
                            <p className="text-[8px] font-medium text-white leading-tight relative z-10">
                                When your Pokémon VMAX is Knocked Out, your opponent takes 3 Prize cards.
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
                            <span className="text-[7px] text-white/80 drop-shadow-sm">©2024 Pokémon / Nintendo / Creatures / GAME FREAK</span>
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
