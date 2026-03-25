
import { useState, useEffect } from 'react';

// A self-contained, inline SVG placeholder to prevent 404 errors.
const FALLBACK_IMAGE = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='100' height='100' viewBox='0 0 100 100'%3E%3Crect width='100' height='100' fill='%232d3748'/%3E%3Ctext x='50' y='55' font-family='Arial' font-size='12' fill='white' text-anchor='middle'%3EError%3C/text%3E%3C/svg%3E";

interface UseImageLoaderResult {
    currentSrc: string;
    isLoading: boolean;
    error: boolean;
}

/**
 * Custom hook to manage image loading states, proxying, and fallbacks.
 * @param src Source URL of the image
 */
export const useImageLoader = (src?: string): UseImageLoaderResult => {
    const [currentSrc, setCurrentSrc] = useState<string>(FALLBACK_IMAGE);
    const [isLoading, setIsLoading] = useState<boolean>(true);
    const [error, setError] = useState<boolean>(false);

    useEffect(() => {
        if (!src) {
            setCurrentSrc(FALLBACK_IMAGE);
            setIsLoading(false);
            return;
        }

        setIsLoading(true);
        setError(false);

        const img = new Image();
        img.crossOrigin = 'anonymous';
        
        // SECURITY FIX: Do not force all images through a public proxy.
        // Rely on crossOrigin attribute for display. The download function
        // has its own robust, on-demand proxying for capture.
        img.src = src;

        img.onload = () => {
            setCurrentSrc(src);
            setIsLoading(false);
        };

        img.onerror = () => {
            console.warn(`Failed to load image: ${src}. Using fallback.`);
            setCurrentSrc(FALLBACK_IMAGE);
            setError(true);
            setIsLoading(false);
        };

    }, [src]);

    return { currentSrc, isLoading, error };
};
