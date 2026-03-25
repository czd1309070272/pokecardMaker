
import { useState } from 'react';
import { domToPng } from 'modern-screenshot';

/**
 * [Backend API Specification for Server-Side Image Generation]
 *
 * Switched from html2canvas to modern-screenshot for better rendering quality.
 * modern-screenshot provides more accurate text positioning and CSS rendering.
 *
 * 1. Endpoint
 *    POST /api/card/render
 *
 * 2. Request Parameters (Payload)
 *    The backend needs the full card state to reconstruct the UI.
 *    {
 *      "data": {
 *        "name": "Charizard",
 *        "hp": "330",
 *        "supertype": "Pokémon",
 *        "subtype": "Stage 2",
 *        "type": "Fire",
 *        "evolvesFrom": "Charmeleon",
 *        "image": "https://...", // Original user image URL
 *        "attacks": [
 *          {
 *            "name": "Flamethrower",
 *            "cost": ["Fire", "Colorless"],
 *            "damage": "100",
 *            "description": "..."
 *          }
 *        ],
 *        "weakness": "Water",
 *        "resistance": "None",
 *        "retreatCost": 2,
 *        "illustrator": "5ban Graphics",
 *        "setNumber": "006/165",
 *        "rarity": "Double Rare",
 *        "pokedexEntry": "...",
 *        "holoPattern": "Sheen",
 *        // ... include all other properties from CardData
 *        "styles": {
 *           "zoom": 1.2,
 *           "xOffset": 0,
 *           "yOffset": 0
 *        }
 *      },
 *      "config": {
 *        "scale": 4,          // High resolution factor
 *        "format": "png",     // Output format
 *        "quality": 1.0       // Image quality
 *      }
 *    }
 *
 * 3. Response Structure
 *    {
 *      "success": true,
 *      "data": {
 *        "downloadUrl": "https://api.example.com/generated/card_uuid.png",
 *        "contentType": "image/png",
 *        "expiresAt": "2024-12-31T23:59:59Z"
 *      }
 *    }
 * 
 * 4. Implementation Strategy
 *    - Frontend: Serialize `cardData` -> POST to API -> Wait -> Trigger download from returned `downloadUrl`.
 *    - Backend: Receive JSON -> Render HTML template -> Screenshot (Puppeteer) -> Upload to S3 -> Return URL.
 */

// A helper to inline images to Base64 to bypass CORS issues during capture
const toBase64 = async (url: string): Promise<string> => {
    if (!url) return '';
    if (url.startsWith('data:')) return url;
    
    // Attempt direct fetch first (for CORS-enabled sources like Unsplash)
    // This avoids using public proxies which can be flaky
    try {
        const response = await fetch(url, { mode: 'cors', credentials: 'omit' });
        if (response.ok) {
            const blob = await response.blob();
            return await new Promise((resolve) => {
                const reader = new FileReader();
                reader.onloadend = () => resolve(reader.result as string);
                reader.onerror = () => resolve(url);
                reader.readAsDataURL(blob);
            });
        }
    } catch (e) {
        // Direct fetch failed (likely CORS), fall back to returning URL 
        // and letting html2canvas handle it with useCORS: true
    }

    return url; 
};

export const useCardDownload = (
    addNotification: (type: 'success' | 'error' | 'info', message: string) => void,
    t: (key: string) => string,
    cardName: string
) => {
    const [isDownloading, setIsDownloading] = useState(false);

    const handleDownload = async () => {
        if (isDownloading) return;

        const element = document.getElementById('capture-card-node');
        if (!element) {
            addNotification('error', 'Card element not found.');
            return;
        }

        setIsDownloading(true);
        addNotification('info', t('msg.download_start'));

        const safetyTimeout = setTimeout(() => {
            if (isDownloading) {
                setIsDownloading(false);
                addNotification('error', 'Download timed out. Please try again.');
            }
        }, 30000);

        try {
            // Wait for fonts to be ready
            await document.fonts.ready;

            // Wait for all images to load
            const images = Array.from(element.querySelectorAll('img'));
            await Promise.all(images.map(img => {
                if (img.complete) return Promise.resolve();
                return new Promise((resolve) => {
                    img.onload = () => resolve(true);
                    img.onerror = () => resolve(true);
                    setTimeout(() => resolve(true), 3000);
                });
            }));

            // Hide Holo Overlay temporarily
            const holoOverlays = element.querySelectorAll('.card-holo-overlay');
            holoOverlays.forEach((el: any) => {
                el.style.display = 'none';
            });

            // Small delay to ensure rendering
            await new Promise(resolve => setTimeout(resolve, 100));

            // Detect mobile to adjust scale
            const isMobile = window.innerWidth < 768;
            const scale = isMobile ? 2 : 4;

            // Use modern-screenshot for better quality
            const dataUrl = await domToPng(element, {
                quality: 1.0,
                scale: scale,
                width: 420,
                height: 588,
                style: {
                    transform: 'none',
                    perspective: 'none',
                },
                filter: (node) => {
                    // Filter out elements we don't want
                    if (node instanceof HTMLElement) {
                        // Skip holo overlays
                        if (node.classList?.contains('card-holo-overlay')) {
                            return false;
                        }
                    }
                    return true;
                },
            });

            // Restore holo overlays
            holoOverlays.forEach((el: any) => {
                el.style.display = '';
            });

            // Download the image
            const link = document.createElement('a');
            link.download = `${cardName.replace(/\s+/g, '_')}_Card.png`;
            link.href = dataUrl;
            link.click();

            clearTimeout(safetyTimeout);
            addNotification('success', t('msg.download_complete'));
        } catch (e) {
            console.error(e);
            clearTimeout(safetyTimeout);
            addNotification('error', 'Download failed. Please try again.');

            // Restore holo overlays in case of error
            const holoOverlays = element.querySelectorAll('.card-holo-overlay');
            holoOverlays.forEach((el: any) => {
                el.style.display = '';
            });
        } finally {
            setIsDownloading(false);
        }
    };

    return { isDownloading, handleDownload };
};
