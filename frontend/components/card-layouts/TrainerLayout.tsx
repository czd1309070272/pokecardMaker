
import React, { CSSProperties } from 'react';
import { CardData, TrainerType } from '../../types';
import { useImageLoader } from '../../hooks/useImageLoader';
import { HoloOverlay } from '../card-parts/HoloOverlay';

export const TrainerLayout: React.FC<{ data: CardData }> = ({ data }) => {
    const { currentSrc: mainImageSrc } = useImageLoader(data.image);

    const imageStyle: CSSProperties = {
        transform: `scale(${data.zoom}) translate(${data.xOffset}px, ${data.yOffset}px)`,
        transformOrigin: 'center center'
    };

    return (
        <div className="absolute inset-0 flex flex-col bg-gray-200">
            {/* Full Background Art */}
            <div className="absolute inset-0 z-0">
                <img 
                    src={mainImageSrc} 
                    crossOrigin="anonymous"
                    loading="lazy"
                    className="w-full h-full object-cover card-art-image"
                    style={imageStyle}
                    alt="Trainer Art"
                />
            </div>
            
            {/* Silver Header Bar */}
            <div className="relative z-20 h-[10%] bg-gradient-to-b from-[#e5e7eb]/50 via-[#f3f4f6]/50 to-[#d1d5db]/50 backdrop-blur-md flex items-center justify-between px-4 border-b border-gray-400/30 shadow-sm">
                    <span className="font-black italic text-2xl tracking-tighter text-gray-700" style={{WebkitTextStroke: '0.5px #9ca3af', textShadow: '1px 1px 0px rgba(255,255,255,0.8)'}}>
                        TRAINER
                    </span>
                    <div className="bg-white/80 backdrop-blur-sm px-3 py-0.5 rounded-sm shadow-sm border border-white/50">
                        <span className={`font-bold uppercase text-xs tracking-wider ${data.trainerType === TrainerType.Supporter ? 'text-orange-600' : data.trainerType === TrainerType.Stadium ? 'text-green-600' : 'text-blue-600'}`}>
                        {data.trainerType}
                        </span>
                    </div>
            </div>

            {/* Name Overlay */}
            <div className="relative z-10 px-5 pt-1">
                    <h1 className="text-3xl font-bold text-black drop-shadow-[0_2px_0_rgba(255,255,255,0.8)] font-heading tracking-tight">
                        {data.name}
                    </h1>
            </div>

            <HoloOverlay pattern={data.holoPattern} />

            <div className="flex-grow"></div>

            {/* Effect Text Box (Frosted Glass) */}
            <div className="relative z-10 mx-4 mb-3 p-4 bg-white/30 backdrop-blur-md rounded-xl border border-white/30 shadow-lg min-h-[100px] flex items-center justify-center text-center">
                    <p className="text-xs sm:text-sm font-medium text-gray-900 leading-relaxed font-serif">
                        {data.rules?.[0] || "Select an effect in the editor."}
                    </p>
            </div>

            {/* Supporter Rule Box */}
            {data.trainerType === TrainerType.Supporter && (
                    <div className="relative z-10 mx-6 mb-3 bg-[#fde047] border border-[#eab308] rounded-full py-1 px-4 shadow-sm transform -rotate-1">
                        <p className="text-[9px] text-yellow-900 font-bold text-center uppercase tracking-tight leading-tight">
                            You can play only 1 Supporter card during your turn.
                        </p>
                    </div>
            )}

            {/* Footer */}
            <div className="relative z-20 h-[8%] bg-gradient-to-t from-gray-300/90 to-transparent flex items-end justify-between px-4 pb-2">
                    <div className="flex items-center gap-2">
                        <div className="bg-white/80 px-1.5 py-0.5 text-[8px] font-bold rounded-sm text-gray-600 shadow-sm">
                            Illus. {data.illustrator}
                        </div>
                        <span className="text-[8px] text-black/70 font-bold">©2024 Pokémon</span>
                    </div>
                    <div className="flex items-center gap-1">
                        <div className="bg-white text-black text-[9px] font-bold px-1 rounded border border-gray-400">{data.regulationMark || 'G'}</div>
                        <span className="text-[10px] font-bold font-mono text-black">{data.setNumber}</span>
                        <span className="text-white text-sm drop-shadow-md">★</span>
                    </div>
            </div>
        </div>
    );
};
