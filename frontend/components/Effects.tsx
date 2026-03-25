import React, { useRef, useState, useEffect } from 'react';

// === SPARKLE BURST EFFECT ===
// Creates a burst of particles. Useful for "Add to Cart" or "Like" buttons.

interface SparkleBurstProps {
  active: boolean;
  count?: number;
  color?: string | string[]; // Single color or array of colors
}

export const SparkleBurst: React.FC<SparkleBurstProps> = ({ active, count = 12, color = '#60a5fa' }) => {
  if (!active) return null;

  const particles = Array.from({ length: count }).map((_, i) => {
    const angle = (i / count) * 360;
    const velocity = 20 + Math.random() * 40; // Random distance
    const tx = Math.cos((angle * Math.PI) / 180) * velocity;
    const ty = Math.sin((angle * Math.PI) / 180) * velocity;
    const delay = Math.random() * 0.1;
    
    // Pick random color if array provided
    const particleColor = Array.isArray(color) 
        ? color[Math.floor(Math.random() * color.length)] 
        : color;

    return (
      <div
        key={i}
        className="absolute top-1/2 left-1/2 w-1.5 h-1.5 rounded-full animate-particle pointer-events-none z-50"
        style={{
          backgroundColor: particleColor,
          // @ts-ignore
          '--tx': `${tx}px`,
          '--ty': `${ty}px`,
          animationDelay: `${delay}s`
        }}
      />
    );
  });

  return <>{particles}</>;
};

// === SPOTLIGHT CARD ===
// Creates a glowing gradient that follows the mouse. Used for Nav Items.

interface SpotlightCardProps {
    children: React.ReactNode;
    className?: string;
    onClick?: () => void;
}

export const SpotlightCard: React.FC<SpotlightCardProps> = ({ children, className = "", onClick }) => {
    const divRef = useRef<HTMLDivElement>(null);
    const [position, setPosition] = useState({ x: 0, y: 0 });
    const [opacity, setOpacity] = useState(0);

    const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
        if (!divRef.current) return;
        const rect = divRef.current.getBoundingClientRect();
        setPosition({ x: e.clientX - rect.left, y: e.clientY - rect.top });
        setOpacity(1);
    };

    const handleMouseLeave = () => {
        setOpacity(0);
    };

    return (
        <div
            ref={divRef}
            onMouseMove={handleMouseMove}
            onMouseLeave={handleMouseLeave}
            onClick={onClick}
            className={`relative overflow-hidden ${className}`}
        >
            <div
                className="pointer-events-none absolute -inset-px opacity-0 transition duration-300"
                style={{
                    opacity,
                    background: `radial-gradient(600px circle at ${position.x}px ${position.y}px, rgba(255,255,255,0.1), transparent 40%)`
                }}
            />
            {children}
        </div>
    );
};