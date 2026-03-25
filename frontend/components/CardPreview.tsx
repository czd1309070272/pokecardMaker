
import React, { CSSProperties } from 'react';
import { CardData, Supertype } from '../types';
import { EnergyLayout } from './card-layouts/EnergyLayout';
import { TrainerLayout } from './card-layouts/TrainerLayout';
import { PokemonLayout } from './card-layouts/PokemonLayout';

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
                
            </div>
        </div>
    </div>
  );
};
