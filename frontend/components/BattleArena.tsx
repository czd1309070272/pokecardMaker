import React from 'react';
import { SwordsIcon } from './Icons';

export const BattleArena: React.FC = () => {
    return (
        <div className="flex-grow flex flex-col items-center justify-center bg-[#020617] text-white p-8 relative overflow-hidden">
             {/* Background Atmosphere */}
             <div className="absolute inset-0 pointer-events-none">
                <div className="absolute top-0 left-0 w-full h-[500px] bg-gradient-to-b from-blue-900/10 to-transparent"></div>
                <div className="absolute inset-0 opacity-10" style={{ backgroundImage: 'linear-gradient(#4b5563 1px, transparent 1px), linear-gradient(90deg, #4b5563 1px, transparent 1px)', backgroundSize: '50px 50px' }}></div>
            </div>

            <div className="relative z-10 max-w-lg bg-[#161b22] border border-gray-800 rounded-3xl p-10 shadow-2xl text-center">
                <div className="w-24 h-24 bg-gray-800 rounded-full flex items-center justify-center mx-auto mb-8 shadow-lg">
                    <SwordsIcon className="w-12 h-12 text-gray-500" />
                </div>
                <h1 className="text-3xl font-black text-white mb-4 italic tracking-tight uppercase">
                    Arena
                </h1>
                <p className="text-gray-400 leading-relaxed">
                    This feature has been removed.
                </p>
            </div>
        </div>
    );
};