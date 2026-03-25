
import React, { useRef, useState, useEffect } from 'react';

interface TiltCardProps {
    children: React.ReactNode;
    className?: string;
    onClick?: () => void;
    maxAngle?: number;
    disabled?: boolean;
}

export const TiltCard: React.FC<TiltCardProps> = ({ 
    children, 
    className = "", 
    onClick, 
    maxAngle = 20,
    disabled = false
}) => {
    const ref = useRef<HTMLDivElement>(null);
    const [rotate, setRotate] = useState({ x: 0, y: 0 });
    const [glare, setGlare] = useState({ x: 50, y: 50, opacity: 0 });
    const [isHovering, setIsHovering] = useState(false);
    const [usingGyro, setUsingGyro] = useState(false);

    // Track normalized mouse position for child components (like Holo effects)
    const [mousePos, setMousePos] = useState({ x: 0.5, y: 0.5 });

    // Gyroscope Effect for Mobile
    useEffect(() => {
        if (typeof window === 'undefined' || !window.DeviceOrientationEvent || disabled) return;

        const handleOrientation = (e: DeviceOrientationEvent) => {
            const beta = e.beta;   // X-axis (front/back) -180 to 180
            const gamma = e.gamma; // Y-axis (left/right) -90 to 90

            if (beta === null || gamma === null) return;

            setUsingGyro(true);
            setIsHovering(true); // Treat as "hovering" to show effects

            // Calibration: Assume holding phone at ~45 degrees tilt
            const baseBeta = 45; 
            
            // Map tilt to rotation angles
            // Limit range to avoid extreme flipping
            const clampedBeta = Math.max(-45, Math.min(45, beta - baseBeta));
            const clampedGamma = Math.max(-45, Math.min(45, gamma));

            // Map clamped range to maxAngle
            // Invert beta so tilting top away (positive beta change) tilts card top back (negative rotateX)
            const rX = -(clampedBeta / 45) * maxAngle;
            const rY = (clampedGamma / 45) * maxAngle;

            setRotate({ x: rX, y: rY });

            // Map to glare/mouse position (0-100%)
            // 0 deg -> 50%
            const xPct = 0.5 + (clampedGamma / 90);
            const yPct = 0.5 + (clampedBeta / 90);

            setMousePos({ x: xPct, y: yPct });
            setGlare({ x: xPct * 100, y: yPct * 100, opacity: 1 });
        };

        window.addEventListener('deviceorientation', handleOrientation);
        return () => window.removeEventListener('deviceorientation', handleOrientation);
    }, [disabled, maxAngle]);

    const updateTilt = (clientX: number, clientY: number) => {
        if (disabled || !ref.current || usingGyro) return;

        const rect = ref.current.getBoundingClientRect();
        const x = clientX - rect.left;
        const y = clientY - rect.top;
        
        // Clamp percentages to 0-1 range to prevent flip-over if dragging outside
        const xPct = Math.max(0, Math.min(1, x / rect.width));
        const yPct = Math.max(0, Math.min(1, y / rect.height));

        setMousePos({ x: xPct, y: yPct });

        // Calculate rotation based on center
        const rX = (0.5 - yPct) * (maxAngle * 2); 
        const rY = (xPct - 0.5) * (maxAngle * 2); 

        setRotate({ x: rX, y: rY });
        setGlare({ x: xPct * 100, y: yPct * 100, opacity: 1 });
    };

    const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
        if (!usingGyro) updateTilt(e.clientX, e.clientY);
    };

    const handleTouchStart = (e: React.TouchEvent<HTMLDivElement>) => {
        if (disabled || usingGyro) return;
        setIsHovering(true);
        updateTilt(e.touches[0].clientX, e.touches[0].clientY);
    };

    const handleTouchMove = (e: React.TouchEvent<HTMLDivElement>) => {
        if (disabled || usingGyro) return;
        updateTilt(e.touches[0].clientX, e.touches[0].clientY);
    };

    const handleTouchEnd = () => {
        if (usingGyro) return;
        setIsHovering(false);
        setRotate({ x: 0, y: 0 });
        setGlare(prev => ({ ...prev, opacity: 0 }));
        setMousePos({ x: 0.5, y: 0.5 });
    };

    const handleMouseLeave = () => {
        if (usingGyro) return;
        setIsHovering(false);
        setRotate({ x: 0, y: 0 });
        setGlare(prev => ({ ...prev, opacity: 0 }));
        setMousePos({ x: 0.5, y: 0.5 });
    };

    const handleMouseEnter = () => {
        if (!disabled && !usingGyro) setIsHovering(true);
    };

    const handleClick = () => {
        if (disabled) return;
        if (onClick) onClick();
    };

    // Combined transform logic - Removed Flip Logic
    const transform = `
        rotateX(${rotate.x}deg) 
        rotateY(${rotate.y}deg) 
        ${isHovering && !disabled ? 'translateZ(25px)' : 'translateZ(0px)'}
    `;
    
    // Shadow logic
    const shadowX = -rotate.y * 1.5;
    const shadowY = rotate.x * 1.5;
    const thicknessShadow = `${shadowX}px ${shadowY}px 12px rgba(0,0,0,0.4)`;

    const shadowStyle = isHovering && !disabled
        ? `${thicknessShadow}, 0 35px 60px -15px rgba(0,0,0,0.7)`
        : '0 10px 15px -3px rgba(0,0,0,0.3)';

    return (
        <div
            className={`relative ${className}`}
            onMouseMove={handleMouseMove}
            onMouseLeave={handleMouseLeave}
            onMouseEnter={handleMouseEnter}
            onTouchStart={handleTouchStart}
            onTouchMove={handleTouchMove}
            onTouchEnd={handleTouchEnd}
            onClick={handleClick}
            style={{ 
                perspective: '1200px',
                '--mouse-x': mousePos.x,
                '--mouse-y': mousePos.y,
                cursor: disabled ? 'default' : 'pointer',
                WebkitTapHighlightColor: 'transparent'
            } as React.CSSProperties} 
        >
            <div
                ref={ref}
                className="transition-all duration-300 ease-out will-change-transform rounded-[inherit] overflow-hidden" 
                style={{
                    transformStyle: 'preserve-3d',
                    transform: transform,
                    boxShadow: shadowStyle,
                }}
            >
                {children}

                {/* Glare/Sheen Effect */}
                {!disabled && (
                    <div
                        className="absolute inset-0 pointer-events-none z-10 mix-blend-overlay rounded-[inherit] transition-opacity duration-300"
                        style={{
                            background: `radial-gradient(circle at ${glare.x}% ${glare.y}%, rgba(255,255,255,0.7) 0%, rgba(255,255,255,0) 60%)`,
                            opacity: glare.opacity,
                            backfaceVisibility: 'hidden'
                        }}
                    />
                )}
            </div>
        </div>
    );
};
