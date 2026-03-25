
import React, { useState, useEffect, useRef } from 'react';
import { ElementType } from '../../types';
import { EnergyIcon } from '../Icons';
import { getTypeColorHex } from '../../utils/cardStyles';

interface TypeTransitionEffectProps {
    type: ElementType;
    isPokemon: boolean;
}

export const TypeTransitionEffect: React.FC<TypeTransitionEffectProps> = ({ type, isPokemon }) => {
    const [key, setKey] = useState(0);
    const prevType = useRef(type);
    const [visible, setVisible] = useState(false);

    useEffect(() => {
        // Trigger only if type changes AND it's a Pokemon card (or enabled via isPokemon=true)
        if (prevType.current !== type) {
            if (isPokemon) {
                setKey(k => k + 1);
                setVisible(true);
                const t = setTimeout(() => setVisible(false), 1000);
                prevType.current = type;
                return () => clearTimeout(t);
            }
        }
        prevType.current = type;
    }, [type, isPokemon]);

    if (!isPokemon || !visible) return null;
    
    return (
         <div key={key} className="absolute inset-0 z-50 pointer-events-none rounded-[24px] overflow-hidden flex items-center justify-center">
            <style>{`
                @keyframes type-flash { 0% { opacity: 0.5; background: white; } 100% { opacity: 0; } }
                @keyframes type-ripple { 0% { transform: scale(0.2); opacity: 0.9; border-width: 30px; } 100% { transform: scale(2.5); opacity: 0; border-width: 0px; } }
                @keyframes type-icon-zoom { 0% { transform: scale(0.4) rotate(-20deg); opacity: 0; } 40% { opacity: 1; transform: scale(1.1) rotate(5deg); } 100% { transform: scale(1.4) rotate(0deg); opacity: 0; } }
            `}</style>
            
            {/* Flash Background */}
            <div className="absolute inset-0 animate-[type-flash_0.6s_ease-out_forwards] mix-blend-overlay" />
            
            {/* Colored Ripple */}
            <div 
                className="absolute w-32 h-32 rounded-full border-solid animate-[type-ripple_0.8s_ease-out_forwards]"
                style={{ borderColor: getTypeColorHex(type) }}
            />
            
            {/* Large Icon Pop */}
            <div className="relative animate-[type-icon-zoom_0.8s_ease-out_forwards] drop-shadow-[0_0_20px_rgba(255,255,255,0.8)] filter brightness-110">
                <EnergyIcon type={type} size={180} />
            </div>
        </div>
    );
};
