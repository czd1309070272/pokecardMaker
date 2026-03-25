
import React from 'react';
import { HoloPattern } from '../../types';

export const HoloOverlay: React.FC<{ pattern: HoloPattern }> = ({ pattern }) => {
    if (pattern === HoloPattern.None) return null;

    const commonStyle: React.CSSProperties = {
        position: 'absolute',
        inset: 0,
        pointerEvents: 'none',
        backgroundPosition: 'calc(var(--mouse-x, 0.5) * 60px) calc(var(--mouse-y, 0.5) * 60px)',
        zIndex: 5
    };

    // Inline SVG Data URIs for stability
    const getSvgPattern = (pat: HoloPattern): string => {
        if (pat === HoloPattern.Starlight) {
            return `url("data:image/svg+xml,%3Csvg width='100' height='100' viewBox='0 0 100 100' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='%23ffffff' fill-opacity='0.6'%3E%3Cpath d='M50 0L52 15L67 17L52 19L50 34L48 19L33 17L48 15Z'/%3E%3Cpath d='M20 50L21 55L26 56L21 57L20 62L19 57L14 56L19 55Z'/%3E%3Cpath d='M80 80L81 85L86 86L81 87L80 92L79 87L74 86L79 85Z'/%3E%3Ccircle cx='10' cy='10' r='1'/%3E%3Ccircle cx='90' cy='20' r='1.5'/%3E%3Ccircle cx='30' cy='80' r='1'/%3E%3C/g%3E%3C/svg%3E")`;
        }
        if (pat === HoloPattern.Cosmos) {
            return `url("data:image/svg+xml,%3Csvg width='120' height='120' viewBox='0 0 120 120' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='%23ffffff' fill-opacity='0.5'%3E%3Ccircle cx='10' cy='10' r='3'/%3E%3Ccircle cx='40' cy='30' r='1.5'/%3E%3Ccircle cx='80' cy='20' r='2'/%3E%3Ccircle cx='20' cy='80' r='1'/%3E%3Ccircle cx='90' cy='90' r='3.5'/%3E%3Ccircle cx='50' cy='60' r='1'/%3E%3Cpath d='M60 20C70 20 70 30 60 30C50 30 50 40 60 40' stroke='white' stroke-width='1.5' fill='none'/%3E%3Cpath d='M20 90C30 90 30 100 20 100' stroke='white' stroke-width='1.5' fill='none'/%3E%3Cpath d='M50 50L53 58L61 61L53 64L50 72L47 64L39 61L47 58Z'/%3E%3C/g%3E%3C/svg%3E")`;
        }
        if (pat === HoloPattern.CrackedIce) {
             return `url("data:image/svg+xml,%3Csvg width='150' height='150' viewBox='0 0 150 150' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M0 0L30 20L60 0L80 30L120 10L150 0L140 40L150 80L120 100L150 150L100 130L80 150L50 120L0 150L20 100L0 70L40 50Z M40 50L80 30L120 100L50 120Z' fill='none' stroke='white' stroke-width='1' stroke-opacity='0.6'/%3E%3C/svg%3E")`;
        }
        if (pat === HoloPattern.WaterWeb) {
            return `url("data:image/svg+xml,%3Csvg width='40' height='40' viewBox='0 0 40 40' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M0 20 Q10 0 20 20 T40 20' stroke='white' stroke-width='1.5' fill='none' stroke-opacity='0.4'/%3E%3C/svg%3E")`;
        }
        if (pat === HoloPattern.Pixel) {
            return `url("data:image/svg+xml,%3Csvg width='8' height='8' viewBox='0 0 8 8' xmlns='http://www.w3.org/2000/svg'%3E%3Crect x='0' y='0' width='3' height='3' fill='white' fill-opacity='0.4'/%3E%3Crect x='4' y='4' width='3' height='3' fill='white' fill-opacity='0.4'/%3E%3C/svg%3E")`;
        }
        if (pat === HoloPattern.VerticalBars) {
            return `linear-gradient(90deg, transparent 50%, rgba(255,255,255,0.4) 50%, rgba(255,255,255,0.4) 55%, transparent 55%)`;
        }
         if (pat === HoloPattern.Crosshatch) {
            return `repeating-linear-gradient(45deg, rgba(255,255,255,0.2) 0px, rgba(255,255,255,0.2) 2px, transparent 2px, transparent 8px), repeating-linear-gradient(-45deg, rgba(255,255,255,0.2) 0px, rgba(255,255,255,0.2) 2px, transparent 2px, transparent 8px)`;
        }
        if (pat === HoloPattern.Tinsel) {
            return `repeating-linear-gradient(15deg, transparent 0px, transparent 4px, rgba(255,255,255,0.5) 4px, rgba(255,255,255,0.5) 6px)`;
        }
        if (pat === HoloPattern.Sequin) {
            return `radial-gradient(circle, rgba(255,255,255,0.6) 2px, transparent 2.5px)`;
        }
        return 'none';
    };

    const maskImage = getSvgPattern(pattern);
    const backgroundSize = pattern === HoloPattern.VerticalBars || pattern === HoloPattern.Tinsel ? '200% 100%' : '150px 150px';

    const rainbowGradient = `
        linear-gradient(
            115deg, 
            transparent 10%, 
            rgba(255,0,0,0.6) 25%, 
            rgba(255,255,0,0.6) 35%, 
            rgba(0,255,255,0.6) 50%, 
            rgba(255,0,255,0.6) 65%, 
            rgba(255,0,0,0.6) 75%,
            transparent 90%
        )
    `;

    // Apply class 'card-holo-overlay' for easy removal during download
    const className = "card-holo-overlay";

    switch (pattern) {
        case HoloPattern.Sheen:
            return (
                <div className={className} style={{...commonStyle, mixBlendMode: 'overlay', opacity: 0.5}}>
                    <div className="absolute inset-0" style={{
                         background: `linear-gradient(135deg, rgba(255,255,255,0) 30%, rgba(255,255,255,0.7) 50%, rgba(255,255,255,0) 70%)`,
                         backgroundPosition: 'calc(var(--mouse-x, 0.5) * 200%) calc(var(--mouse-y, 0.5) * 200%)',
                         backgroundSize: '200% 200%',
                         filter: 'blur(8px)'
                    }} />
                     <div className="absolute inset-0" style={{
                         background: rainbowGradient,
                         backgroundPosition: 'calc(var(--mouse-x, 0.5) * 100%) calc(var(--mouse-y, 0.5) * 100%)',
                         backgroundSize: '150% 150%',
                    }} />
                </div>
            );
        case HoloPattern.BorderGlow:
            return (
                 <div className={className} style={{...commonStyle, mixBlendMode: 'screen', opacity: 0.6}}>
                    <div className="absolute inset-0 border-[10px] border-white/60 blur-md rounded-[inherit]" />
                    <div className="absolute inset-0 border-[3px] border-white/90 rounded-[inherit]" />
                    <div className="absolute inset-0 bg-gradient-to-t from-white/10 to-transparent" />
                </div>
            );
        case HoloPattern.Cosmos:
        case HoloPattern.Starlight:
        case HoloPattern.CrackedIce:
        case HoloPattern.WaterWeb:
        case HoloPattern.Pixel:
        case HoloPattern.Sequin:
        case HoloPattern.Crosshatch:
        case HoloPattern.Tinsel:
        case HoloPattern.VerticalBars:
            return (
                <div className={className}>
                    <div style={{
                        ...commonStyle,
                        backgroundImage: maskImage,
                        backgroundSize: backgroundSize,
                        mixBlendMode: 'overlay', 
                        opacity: 0.3,
                        filter: 'brightness(1.5)'
                    }} />
                    
                    <div style={{
                        ...commonStyle,
                        background: rainbowGradient,
                        backgroundPosition: 'calc(var(--mouse-x, 0.5) * 130%) calc(var(--mouse-y, 0.5) * 130%)',
                        backgroundSize: '200% 200%',
                        mixBlendMode: 'color-dodge',
                        opacity: 0.35,
                        maskImage: maskImage,
                        WebkitMaskImage: maskImage,
                        maskSize: backgroundSize,
                        WebkitMaskSize: backgroundSize
                    }} />
                </div>
            );
        default:
            return null;
    }
};
