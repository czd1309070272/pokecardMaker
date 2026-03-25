
import React from 'react';
import { CardData } from '../../types';
import { EnergyIcon } from '../Icons';
import { getEnergyColor } from '../../utils/cardStyles';
import { HoloOverlay } from '../card-parts/HoloOverlay';
import { TypeTransitionEffect } from '../card-parts/TypeTransitionEffect';

export const EnergyLayout: React.FC<{ data: CardData }> = ({ data }) => {
    return (
        <div className="absolute inset-0 flex flex-col" style={{ backgroundColor: getEnergyColor(data.type) }}>
            {/* Background Gradient Overlay */}
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_transparent_0%,_rgba(0,0,0,0.15)_100%)]"></div>

            {/* Top Metal Bar */}
            <div className="relative z-20 h-[13%] bg-gradient-to-b from-[#d1d5db] via-[#f3f4f6] to-[#9ca3af] flex items-center justify-between px-5 border-b-2 border-white/50 shadow-md">
                <span className="font-bold text-black text-xl tracking-tight leading-none pt-1">
                    {data.name}
                </span>
                <span className="font-bold text-gray-600 text-sm uppercase tracking-wider leading-none pt-1">
                    Energy
                </span>
            </div>

            {/* Main Body */}
            <div className="relative flex-grow flex items-center justify-center overflow-hidden">
                    {/* Abstract Swooshes (Background Decoration) */}
                    <div className="absolute w-[180%] h-[180%] border-[25px] border-white/10 rounded-full transform -rotate-45 scale-y-50 blur-[1px]"></div>
                    <div className="absolute w-[140%] h-[140%] border-[15px] border-white/15 rounded-full transform rotate-12 scale-x-75 blur-[2px]"></div>
                    
                    {/* Central Energy Orb */}
                    <div className="relative z-10 drop-shadow-[0_15px_30px_rgba(0,0,0,0.4)] transform scale-110">
                        <EnergyIcon type={data.type} size={220} />
                    </div>
            </div>

                {/* Holo Overlay (Consistent with other cards) */}
            <HoloOverlay pattern={data.holoPattern} />

            {/* Transition Effect - Enabled for Energy cards as well */}
            <TypeTransitionEffect type={data.type} isPokemon={true} />

            {/* Bottom Metal Bar */}
            <div className="relative z-20 h-[8%] bg-gradient-to-t from-[#d1d5db] via-[#f3f4f6] to-[#9ca3af] flex items-center justify-between px-4 border-t-2 border-white/50">
                    <span className="text-[9px] font-bold text-gray-500">
                        ©2024 Pokémon / Nintendo / Creatures / GAME FREAK
                    </span>
                    <div className="opacity-90 drop-shadow-sm">
                        <EnergyIcon type={data.type} size={22} />
                    </div>
            </div>
        </div>
    );
};
