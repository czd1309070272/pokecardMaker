
import React from 'react';
import { ElementType } from '../types';
import { getAttributeLabel, getAttributeTheme } from '../lib/attributes';

export const Logo: React.FC<{ className?: string }> = ({ className }) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className={className}>
    <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" />
  </svg>
);

export const TranslateIcon: React.FC<{ className?: string }> = ({ className }) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <circle cx="12" cy="12" r="10" />
    <line x1="2" y1="12" x2="22" y2="12" />
    <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" />
  </svg>
);

export const UploadIcon: React.FC<{ className?: string }> = ({ className }) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
    <polyline points="17 8 12 3 7 8" />
    <line x1="12" y1="3" x2="12" y2="15" />
  </svg>
);

export const GlobeIcon: React.FC<{ className?: string }> = ({ className }) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <circle cx="12" cy="12" r="10"></circle>
    <line x1="2" y1="12" x2="22" y2="12"></line>
    <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"></path>
  </svg>
);

export const DownloadIcon: React.FC<{ className?: string }> = ({ className }) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
    <polyline points="7 10 12 15 17 10" />
    <line x1="12" y1="15" x2="12" y2="3" />
  </svg>
);

export const SaveIcon: React.FC<{ className?: string }> = ({ className }) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z" />
    <polyline points="17 21 17 13 7 13 7 21" />
    <polyline points="7 3 7 8 15 8" />
  </svg>
);

export const EditIcon: React.FC<{ className?: string }> = ({ className }) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
    <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
  </svg>
);

export const MagicWandIcon: React.FC<{ className?: string }> = ({ className }) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z" />
    <polyline points="14 2 14 8 20 8" />
    <line x1="12" y1="18" x2="12" y2="12" />
    <line x1="9" y1="15" x2="15" y2="15" />
  </svg>
);

export const DiceIcon: React.FC<{ className?: string }> = ({ className }) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <rect x="4" y="4" width="16" height="16" rx="2" />
    <circle cx="9" cy="9" r="1" fill="currentColor" />
    <circle cx="15" cy="15" r="1" fill="currentColor" />
    <circle cx="15" cy="9" r="1" fill="currentColor" />
    <circle cx="9" cy="15" r="1" fill="currentColor" />
    <circle cx="12" cy="12" r="1" fill="currentColor" />
  </svg>
);

export const RobotIcon: React.FC<{ className?: string }> = ({ className }) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <rect x="3" y="11" width="18" height="10" rx="2" />
    <circle cx="12" cy="5" r="2" />
    <path d="M12 7v4" />
    <line x1="8" y1="16" x2="8" y2="16" />
    <line x1="16" y1="16" x2="16" y2="16" />
  </svg>
);

export const BasicsIcon: React.FC<{ className?: string }> = ({ className }) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
    <line x1="3" y1="9" x2="21" y2="9" />
    <line x1="9" y1="21" x2="9" y2="9" />
  </svg>
);

export const ArtworkIcon: React.FC<{ className?: string }> = ({ className }) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
    <circle cx="8.5" cy="8.5" r="1.5" />
    <polyline points="21 15 16 10 5 21" />
  </svg>
);

export const CombatIcon: React.FC<{ className?: string }> = ({ className }) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <path d="M14.5 17.5L3 6V3h3l11.5 11.5" />
    <path d="M13 19l6-6" />
    <path d="M16 13l5 3-3 5-5-3" />
    <path d="M21 21l-3-5" />
  </svg>
);

export const StatsIcon: React.FC<{ className?: string }> = ({ className }) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <path d="M21.21 15.89A10 10 0 1 1 8 2.83" />
    <path d="M22 12A10 10 0 0 0 12 2v10z" />
  </svg>
);

export const DetailIcon: React.FC<{ className?: string }> = ({ className }) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <circle cx="12" cy="12" r="10" />
    <line x1="12" y1="16" x2="12" y2="12" />
    <line x1="12" y1="8" x2="12.01" y2="8" />
  </svg>
);

export const RefreshIcon: React.FC<{ className?: string }> = ({ className }) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <path d="M23 4v6h-6" />
    <path d="M1 20v-6h6" />
    <path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15" />
  </svg>
);

export const ExportIcon: React.FC<{ className?: string }> = ({ className }) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
    <polyline points="7 10 12 15 17 10" />
    <line x1="12" y1="15" x2="12" y2="3" />
  </svg>
);

export const ChevronDownIcon: React.FC<{ className?: string }> = ({ className }) => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
        <polyline points="6 9 12 15 18 9" />
    </svg>
);

export const CartIcon: React.FC<{ className?: string }> = ({ className }) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <circle cx="9" cy="21" r="1" />
    <circle cx="20" cy="21" r="1" />
    <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6" />
  </svg>
);

export const CartPlusIcon: React.FC<{ className?: string }> = ({ className }) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <circle cx="9" cy="21" r="1" />
    <circle cx="20" cy="21" r="1" />
    <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6" />
    <line x1="16" y1="10" x2="22" y2="10" />
    <line x1="19" y1="7" x2="19" y2="13" />
  </svg>
);

export const UserIcon: React.FC<{ className?: string }> = ({ className }) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
    <circle cx="12" cy="7" r="4" />
  </svg>
);

export const TrashIcon: React.FC<{ className?: string }> = ({ className }) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <polyline points="3 6 5 6 21 6" />
    <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
  </svg>
);

export const PlusIcon: React.FC<{ className?: string }> = ({ className }) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <line x1="12" y1="5" x2="12" y2="19" />
    <line x1="5" y1="12" x2="19" y2="12" />
  </svg>
);

export const ArrowUpIcon: React.FC<{ className?: string }> = ({ className }) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <line x1="12" y1="19" x2="12" y2="5" />
    <polyline points="5 12 12 5 19 12" />
  </svg>
);

export const ArrowDownIcon: React.FC<{ className?: string }> = ({ className }) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <line x1="12" y1="5" x2="12" y2="19" />
    <polyline points="19 12 12 19 5 12" />
  </svg>
);

export const XIcon: React.FC<{ className?: string }> = ({ className }) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <line x1="18" y1="6" x2="6" y2="18" />
    <line x1="6" y1="6" x2="18" y2="18" />
  </svg>
);

export const EyeIcon: React.FC<{ className?: string }> = ({ className }) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
    <circle cx="12" cy="12" r="3" />
  </svg>
);

export const FileIcon: React.FC<{ className?: string }> = ({ className }) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
    <polyline points="14 2 14 8 20 8" />
    <line x1="16" y1="13" x2="8" y2="13" />
    <line x1="16" y1="17" x2="8" y2="17" />
    <polyline points="10 9 9 9 8 9" />
  </svg>
);

export const DiscordIcon: React.FC<{ className?: string }> = ({ className }) => (
    <svg viewBox="0 0 24 24" fill="currentColor" className={className}>
        <path d="M20.317 4.37a19.791 19.791 0 0 0-4.885-1.515.074.074 0 0 0-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 0 0-5.487 0 12.64 12.64 0 0 0-.617-1.25.077.077 0 0 0-.079-.037A19.736 19.736 0 0 0 3.677 4.37a.07.07 0 0 0-.032.027C.533 9.046-.32 13.58.099 18.057a.082.082 0 0 0 .031.057 19.9 19.9 0 0 0 5.993 3.03.078.078 0 0 0 .084-.028 14.09 14.09 0 0 0 1.226-1.994.076.076 0 0 0-.041-.106 13.107 13.107 0 0 1-1.872-.892.077.077 0 0 1-.008-.128 10.2 10.2 0 0 0 .372-.292.074.074 0 0 1 .077-.01c3.928 1.793 8.18 1.793 12.062 0a.074.074 0 0 1 .078.01c.12.098.246.198.373.292a.077.077 0 0 1-.006.127 12.299 12.299 0 0 1-1.873.892.077.077 0 0 0-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 0 0 .084.028 19.839 19.839 0 0 0 6.002-3.03.077.077 0 0 0 .032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 0 0-.031-.03zM8.02 15.33c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.956-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.956 2.418-2.157 2.418zm7.975 0c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.955-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.946 2.418-2.157 2.418z" />
    </svg>
);

export const GoogleIcon: React.FC<{ className?: string }> = ({ className }) => (
    <svg viewBox="0 0 24 24" className={className}>
        <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
        <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
        <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
        <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
    </svg>
);

export const GitHubIcon: React.FC<{ className?: string }> = ({ className }) => (
    <svg viewBox="0 0 24 24" fill="currentColor" className={className}>
        <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z" />
    </svg>
);

export const RedditIcon: React.FC<{ className?: string }> = ({ className }) => (
    <svg viewBox="0 0 24 24" fill="currentColor" className={className}>
        <circle cx="12" cy="12" r="12" />
        <path fill="#FFF" d="M16.67 13.44c0-1.32-1.07-2.38-2.38-2.38-1.07 0-1.97.69-2.28 1.64h-3.3c-.31-.95-1.21-1.64-2.28-1.64-1.32 0-2.38 1.07-2.38 2.38 0 1.03.66 1.91 1.58 2.24-.04.22-.06.44-.06.66 0 3.31 2.94 6 6.57 6s6.57-2.69 6.57-6c0-.23-.03-.45-.07-.67.92-.32 1.57-1.2 1.57-2.23zm-10.43-.24c0-.66.54-1.2 1.2-1.2s1.2.54 1.2 1.2-.54 1.2-1.2 1.2-1.2-.54-1.2-1.2zm8.56 5.25c-.77.77-2.2.82-2.82.82-.61 0-2.04-.04-2.81-.82-.23-.23-.23-.61 0-.84.23-.23.61-.23.84 0 .33.33 1.31.47 1.98.47.66 0 1.64-.14 1.97-.47.23-.23.61-.23.84 0 .23.23.23.61 0 .84zm-1.07-4.07c-.66 0-1.2-.54-1.2-1.2s.54-1.2 1.2-1.2 1.2.54 1.2 1.2-.54 1.2-1.2 1.2z" />
        <path fill="#FFF" d="M17.5 7.02l.66 3.09-2.24.47-.56-2.6-4.63 1.01c-.13-1.57-1.44-2.8-3.03-2.8-1.68 0-3.04 1.36-3.04 3.04s1.36 3.04 3.04 3.04c1.37 0 2.52-.91 2.91-2.16l5.72-1.25.79 3.68 2.76-.58-.93-4.32-1.45-6.62z" />
    </svg>
);

export const PrinterIcon: React.FC<{ className?: string }> = ({ className }) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <polyline points="6 9 6 2 18 2 18 9" />
    <path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2" />
    <rect x="6" y="14" width="12" height="8" />
  </svg>
);

export const StickerIcon: React.FC<{ className?: string }> = ({ className }) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
    <path d="M14 2v6h6" />
    <path d="M16 13H8" />
    <path d="M16 17H8" />
    <path d="M10 9H8" />
  </svg>
);

export const SparklesIcon: React.FC<{ className?: string }> = ({ className }) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <path d="m12 3-1.912 5.813a2 2 0 0 1-1.275 1.275L3 12l5.813 1.912a2 2 0 0 1 1.275 1.275L12 21l1.912-5.813a2 2 0 0 1 1.275-1.275L21 12l-5.813-1.912a2 2 0 0 1-1.275-1.275L12 3Z" />
  </svg>
);

export const HeartIcon: React.FC<{ className?: string, filled?: boolean }> = ({ className, filled }) => (
  <svg viewBox="0 0 24 24" fill={filled ? "currentColor" : "none"} stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
  </svg>
);

export const SwordsIcon: React.FC<{ className?: string }> = ({ className }) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <path d="M14.5 17.5L3 6V3h3l11.5 11.5" />
    <path d="M13 19l6-6" />
    <path d="M16 13l5 3-3 5-5-3" />
    <path d="M21 21l-3-5" />
  </svg>
);

export const GridIcon: React.FC<{ className?: string }> = ({ className }) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <rect x="3" y="3" width="7" height="7" />
    <rect x="14" y="3" width="7" height="7" />
    <rect x="14" y="14" width="7" height="7" />
    <rect x="3" y="14" width="7" height="7" />
  </svg>
);

export const CoinIcon: React.FC<{ className?: string }> = ({ className }) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <circle cx="12" cy="12" r="8" />
    <path d="M12 16V8" />
    <path d="M9.5 12h5" />
  </svg>
);

export const GavelIcon: React.FC<{ className?: string }> = ({ className }) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <path d="m13 13 6 6" />
    <path d="M9 7l9 9" />
    <path d="M14 4c.6 0 1.2.2 1.7.7l3.6 3.6c.9.9.9 2.5 0 3.4l-1.4 1.4c-.9.9-2.5.9-3.4 0l-3.6-3.6c-1-1-1-2.6 0-3.6l1.4-1.3c.5-.5 1.1-.7 1.7-.6z" />
    <path d="M3 21h7" />
    <path d="M5 21v-7l1.3-1.3 3.4 3.4L8.4 17.4" />
  </svg>
);

export const WalletIcon: React.FC<{ className?: string }> = ({ className }) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <path d="M20 12V8H6a2 2 0 0 1-2-2c0-1.1.9-2 2-2h12v4" />
    <path d="M4 6v12c0 1.1.9 2 2 2h14v-4" />
    <path d="M18 12a2 2 0 0 0-2 2v4a2 2 0 0 0 2 2h4v-8h-4z" />
  </svg>
);

export const CreditCardIcon: React.FC<{ className?: string }> = ({ className }) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <rect x="1" y="4" width="22" height="16" rx="2" ry="2" />
    <line x1="1" y1="10" x2="23" y2="10" />
  </svg>
);

export const QrCodeIcon: React.FC<{ className?: string }> = ({ className }) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <path d="M3 3h6v6H3z" />
    <path d="M15 3h6v6h-6z" />
    <path d="M3 15h6v6H3z" />
    <path d="M14 14h.01" />
    <path d="M17 17h.01" />
    <path d="M20 20h.01" />
    <path d="M14 20h.01" />
    <path d="M20 14h.01" />
    <path d="M17 14h3" />
    <path d="M14 17h3" />
  </svg>
);

export const WechatIcon: React.FC<{ className?: string }> = ({ className }) => (
  <svg viewBox="0 0 24 24" fill="currentColor" className={className}>
     <path d="M20 14c0 2.2-2.2 4-5 4-.6 0-1.2-.1-1.7-.2-.3.3-1.1.8-1.9.9 0 0-.2 0-.2-.1 0 0 0-.1.1-.2.2-.3.6-.8.7-1.1-.9-.6-1.5-1.5-1.5-2.3 0-2.2 2.2-4 5-4s5 1.8 5 4zM8 3C4.1 3 1 5.7 1 9c0 1.8.9 3.4 2.4 4.5.1.5-.2 1.5-.5 2.1 0 .1 0 .2.2 .3h.3c1.5-.2 3.1-1.1 3.7-1.6 1 .5 2 .7 3 .7 3.9 0 7-2.7 7-6S11.9 3 8 3z"/>
  </svg>
);

export const AlipayIcon: React.FC<{ className?: string }> = ({ className }) => (
  <svg viewBox="0 0 24 24" fill="currentColor" className={className}>
      <path d="M7 6h10v2h-3v3h-2V8H7V6zm5 5.5c2.3 0 4.2.5 5.7 1.4L17 14.5c-1.3-.7-2.9-1.1-4.7-1.1-3 0-5.3 1.3-6.5 3.3l-1.6-1C5.6 13.2 8.5 11.5 12 11.5zM12 2C6.5 2 2 6.5 2 12s4.5 10 10 10 10-4.5 10-10S17.5 2 12 2z"/>
  </svg>
);

// Energy Symbols
export const EnergyIcon: React.FC<{ type: string; size?: number, className?: string, flat?: boolean }> = ({ type, size = 16, className = "", flat = false }) => {
  const getColor = (t: string) => {
    return getAttributeTheme(t as ElementType).color;
  };

  const getPath = (t: string) => {
      switch (t) {
        case ElementType.Grass: return "M12 21c-4.97 0-9-4.03-9-9 0-4.97 4.03-9 9-9 2.2 0 4.2.8 5.8 2.1l-1.5 1.5C14.8 5.4 13.5 5 12 5c-3.87 0-7 3.13-7 7s3.13 7 7 7c1.5 0 2.8-.4 4.3-1.6l1.5 1.5C16.2 20.2 14.2 21 12 21zm1-10c0 .55-.45 1-1 1s-1-.45-1-1 .45-1 1-1 1 .45 1 1z"; // Simplified Leaf
        case ElementType.Fire: return "M12.5 2C12.5 2 12.5 2.5 12.5 3C12.5 4.5 11 6 11 6C11 6 8.5 7.5 8.5 10C8.5 12 10 13 11 13.5C11 13.5 10 16 7.5 16.5C8.5 19 12 21 14 21C17 21 19 18 19 15.5C19 12.5 15.5 11 15.5 8C15.5 6 16.5 4.5 16.5 4.5C16.5 4.5 14.5 4 14.5 2C14.5 2 13.5 1 12.5 2Z"; // Flame
        case ElementType.Water: return "M12 2C12 2 6 9 6 14C6 17.31 8.69 20 12 20C15.31 20 18 17.31 18 14C18 9 12 2 12 2ZM12 18C10.5 18 9 16.5 9 15C9 14.5 9.5 14 9.5 14C9.5 14 10.5 14 10.5 15C10.5 15.8 11.2 16.5 12 16.5C12.5 16.5 13 17 13 17.5C13 18 12.5 18 12 18Z"; // Drop
        case ElementType.Lightning: return "M11 21l1-6H7l6-13-1 6h5l-6 13z"; // Bolt
        case ElementType.Psychic: return "M12 4C7.58 4 4 7.58 4 12C4 16.42 7.58 20 12 20C16.42 20 20 16.42 20 12C20 7.58 16.42 4 12 4ZM12 18C8.69 18 6 15.31 6 12C6 8.69 8.69 6 12 6C15.31 6 18 8.69 18 12C18 15.31 15.31 18 12 18ZM12 8C10 8 8 10 8 12C8 14 10 16 12 16C14 16 16 14 16 12C16 10 14 8 12 8ZM12 10C13.1 10 14 10.9 14 12C14 13.1 13.1 14 12 14C10.9 14 10 13.1 10 12C10 10.9 10.9 10 12 10Z"; // Eyeish
        case ElementType.Fighting: return "M16.5 8C16.5 8 14.5 10 12 10C9.5 10 7.5 8 7.5 8C6 9 5 11 5 13C5 16.5 8 19 12 19C16 19 19 16.5 19 13C19 11 18 9 16.5 8Z M10 14.5C9.2 14.5 8.5 13.8 8.5 13C8.5 12.2 9.2 11.5 10 11.5C10.8 11.5 11.5 12.2 11.5 13C11.5 13.8 10.8 14.5 10 14.5Z M14 14.5C13.2 14.5 12.5 13.8 12.5 13C12.5 12.2 13.2 11.5 14 11.5C14.8 11.5 15.5 12.2 15.5 13C15.5 13.8 14.8 14.5 14 14.5Z"; // Fist shape
        case ElementType.Darkness: return "M12 2C9 2 6.5 3.5 5 5.5C8 5.5 10.5 8 10.5 11C10.5 14 8 16.5 5 16.5C6.5 18.5 9 20 12 20C16.5 20 20 16.5 20 12C20 7.5 16.5 2 12 2ZM14.5 13C13.7 13 13 12.3 13 11.5C13 10.7 13.7 10 14.5 10C15.3 10 16 10.7 16 11.5C16 12.3 15.3 13 14.5 13Z"; // Crescent
        case ElementType.Metal: return "M12 4L4 8L6 18H18L20 8L12 4ZM12 16L8 9H16L12 16Z"; // Triangle Nut
        case ElementType.Fairy: return "M12 2C12 2 14 6 18 6C18 6 15 9 15 12C15 15 18 18 18 18C14 18 12 22 12 22C12 22 10 18 6 18C6 18 9 15 9 12C9 9 6 6 6 6C10 6 12 2 12 2Z"; // Star/Wing
        case ElementType.Dragon: return "M5 4V8H9V12H13V8H17V4H13V8H9V4H5Z"; // Abstract Z/Claw
        case ElementType.Ice: return "M12 2L10 6H14L12 2ZM18 7L15 8L18 9V7ZM6 7L9 8L6 9V7ZM12 22L10 18H14L12 22ZM20 12L16 10V14L20 12ZM4 12L8 10V14L4 12Z M12 8.5L8.5 12L12 15.5L15.5 12L12 8.5Z"; // Snowflake
        case ElementType.Poison: return "M12,2A10,10 0 0,0 2,12A10,10 0 0,0 12,22A10,10 0 0,0 22,12A10,10 0 0,0 12,2M12,4A8,8 0 0,1 20,12A8,8 0 0,1 12,20A8,8 0 0,1 4,12A8,8 0 0,1 12,4M9,9A1,1 0 0,0 8,10A1,1 0 0,0 9,11A1,1 0 0,0 10,10A1,1 0 0,0 9,9M15,9A1,1 0 0,0 14,10A1,1 0 0,0 15,11A1,1 0 0,0 16,10A1,1 0 0,0 15,9M9,14V16H15V14H9Z"; // Skull
        case ElementType.Ground: return "M3 10L6 10L12 4L18 10L21 10L12 1L3 10ZM3 12L3 21L21 21L21 12L12 21L3 12Z"; // Fissure/Mountain
        case ElementType.Flying: return "M20 12c0 4.42-3.58 8-8 8s-8-3.58-8-8c0-4.42 3.58-8 8-8 .09 0 .18 0 .27.01C9.68 6.64 12 10.69 12 12s-2.32 5.36-4.73 7.99c.92.01 1.83 0 2.73 0 4.42 0 8-3.58 8-8z"; // Wing/Wind
        case ElementType.Bug: return "M12 2a10 10 0 00-7.5 16.06l-1.5 1.5 1.42 1.42 1.5-1.5A10 10 0 1012 2zm0 18a8 8 0 110-16 8 8 0 010 16zM8 10h8v2H8zm0 4h8v2H8z"; // Bug head
        case ElementType.Rock: return "M16.42 3.12l-5.65 5.66-2.83-2.83-7.07 7.07L1 13.01l4.24-4.24 2.83 2.83 7.07-7.07L22.21 7.4l-4.24 4.24-1.55-1.55z"; // Jagged Rock
        case ElementType.Ghost: return "M12 2C8.69 2 6 4.69 6 8v8c0 2.21 1.79 4 4 4h4c2.21 0 4-1.79 4-4V8c0-3.31-2.69-6-6-6zm0 18c-1.1 0-2-.9-2-2v-4h4v4c0 1.1-.9 2-2 2zm4-6H8V8c0-2.21 1.79-4 4-4s4 1.79 4 4v6zM10 10h4v2h-4v-2z"; // Sheet ghost
        case ElementType.Colorless: return "M12 2l2.5 7.5L22 12l-7.5 2.5L12 22l-2.5-7.5L2 12l7.5-2.5z"; // Star
        default: return "M12 2l2.5 7.5L22 12l-7.5 2.5L12 22l-2.5-7.5L2 12l7.5-2.5z";
      }
  };

  const color = getColor(type);
  const path = getPath(type);

  // Flat version for editor UI (Silhouette)
  if (flat) {
    return (
       <svg 
         viewBox="0 0 24 24" 
         className={className} 
         style={{ width: size, height: size, fill: 'currentColor' }}
       >
         <path d={path} />
       </svg>
    );
  }

  // Realistic version for Card (Orb)
  return (
    <div 
      className={`rounded-full flex items-center justify-center font-bold text-white shadow-sm border border-black/20 ${className}`}
      style={{ 
        width: size, 
        height: size, 
        background: `radial-gradient(circle at 30% 30%, ${color}, ${type === ElementType.Darkness ? 'black' : '#000'})`,
        boxShadow: '1px 1px 2px rgba(0,0,0,0.5), inset 1px 1px 1px rgba(255,255,255,0.4)'
      }}
      title={getAttributeLabel(type)}
    >
      <svg viewBox="0 0 24 24" style={{ width: size * 0.65, height: size * 0.65, fill: 'white', filter: 'drop-shadow(0px 1px 1px rgba(0,0,0,0.5))' }}>
          <path d={path} />
      </svg>
    </div>
  );
};
