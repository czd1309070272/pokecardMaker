import { Rarity } from '../models/enums';

type AppLanguage = 'en' | 'zh';

const LEGACY_RARITY_TO_CODE: Record<string, Rarity> = {
  common: Rarity.Trash,
  uncommon: Rarity.Defective,
  rare: Rarity.Promising,
  'double rare': Rarity.Unhinged,
  'ultra rare': Rarity.MadKing,
  'secret rare': Rarity.Untouchable,
  'illustration rare': Rarity.Untouchable,
  'trash tier': Rarity.Trash,
  'defective tier': Rarity.Defective,
  'promising tier': Rarity.Promising,
  'unhinged tier': Rarity.Unhinged,
  'mad king tier': Rarity.MadKing,
  'untouchable tier': Rarity.Untouchable,
  '烂胶级': Rarity.Trash,
  '殘次品級': Rarity.Defective,
  '残次品级': Rarity.Defective,
  '有啲料級': Rarity.Promising,
  '有啲料级': Rarity.Promising,
  '黐線級': Rarity.Unhinged,
  '黐线级': Rarity.Unhinged,
  '癲皇級': Rarity.MadKing,
  '癫皇级': Rarity.MadKing,
  '冇人夠膽掂級': Rarity.Untouchable,
  '冇人够胆掂级': Rarity.Untouchable,
};

const RARITY_LABELS: Record<Rarity, { zh: string; en: string; shortZh: string; shortEn: string }> = {
  [Rarity.Trash]: {
    zh: '烂胶级',
    en: 'Trash Tier',
    shortZh: '烂胶',
    shortEn: 'Trash',
  },
  [Rarity.Defective]: {
    zh: '残次品级',
    en: 'Defective Tier',
    shortZh: '残次',
    shortEn: 'Defective',
  },
  [Rarity.Promising]: {
    zh: '有啲料级',
    en: 'Promising Tier',
    shortZh: '有料',
    shortEn: 'Promising',
  },
  [Rarity.Unhinged]: {
    zh: '黐线级',
    en: 'Unhinged Tier',
    shortZh: '黐线',
    shortEn: 'Unhinged',
  },
  [Rarity.MadKing]: {
    zh: '癫皇级',
    en: 'Mad King Tier',
    shortZh: '癫皇',
    shortEn: 'Mad King',
  },
  [Rarity.Untouchable]: {
    zh: '冇人够胆掂级',
    en: 'Untouchable Tier',
    shortZh: '唔敢掂',
    shortEn: 'Untouchable',
  },
};

type RarityBadgeTheme = {
  background: string;
  borderColor: string;
  textColor: string;
  glow: string;
};

type RarityFrameTheme = {
  outerBorderColor: string;
  innerBorderColor: string;
  outerShadow: string;
  innerShadow: string;
};

type RarityAuraTheme = {
  enabled: boolean;
  borderGlow: string;
  borderColor: string;
  pulseDuration: string;
};

const RARITY_BADGE_THEMES: Record<Rarity, RarityBadgeTheme> = {
  [Rarity.Trash]: {
    background: 'linear-gradient(135deg, #27272a 0%, #3f3f46 100%)',
    borderColor: '#71717a',
    textColor: '#e4e4e7',
    glow: '0 0 14px rgba(63, 63, 70, 0.55)',
  },
  [Rarity.Defective]: {
    background: 'linear-gradient(135deg, #7c2d12 0%, #b45309 100%)',
    borderColor: '#f59e0b',
    textColor: '#ffedd5',
    glow: '0 0 14px rgba(217, 119, 6, 0.45)',
  },
  [Rarity.Promising]: {
    background: 'linear-gradient(135deg, #0f172a 0%, #1d4ed8 100%)',
    borderColor: '#60a5fa',
    textColor: '#dbeafe',
    glow: '0 0 14px rgba(59, 130, 246, 0.45)',
  },
  [Rarity.Unhinged]: {
    background: 'linear-gradient(135deg, #3b0764 0%, #be123c 100%)',
    borderColor: '#f472b6',
    textColor: '#fdf2f8',
    glow: '0 0 16px rgba(236, 72, 153, 0.6)',
  },
  [Rarity.MadKing]: {
    background: 'linear-gradient(135deg, #7f1d1d 0%, #f59e0b 100%)',
    borderColor: '#facc15',
    textColor: '#fef9c3',
    glow: '0 0 18px rgba(251, 191, 36, 0.7)',
  },
  [Rarity.Untouchable]: {
    background: 'linear-gradient(135deg, #450a0a 0%, #b91c1c 42%, #f59e0b 100%)',
    borderColor: '#facc15',
    textColor: '#fef3c7',
    glow: '0 0 22px rgba(239, 68, 68, 0.86)',
  },
};

const RARITY_FRAME_THEMES: Record<Rarity, RarityFrameTheme> = {
  [Rarity.Trash]: {
    outerBorderColor: 'rgba(82, 82, 91, 0.92)',
    innerBorderColor: 'rgba(161, 161, 170, 0.5)',
    outerShadow: 'inset 0 0 0 2px rgba(63, 63, 70, 0.68), 0 0 16px rgba(39, 39, 42, 0.4)',
    innerShadow: 'inset 0 0 0 1px rgba(228, 228, 231, 0.18)',
  },
  [Rarity.Defective]: {
    outerBorderColor: 'rgba(245, 158, 11, 0.88)',
    innerBorderColor: 'rgba(254, 215, 170, 0.58)',
    outerShadow: 'inset 0 0 0 2px rgba(180, 83, 9, 0.72), 0 0 18px rgba(245, 158, 11, 0.34)',
    innerShadow: 'inset 0 0 0 1px rgba(255, 237, 213, 0.22)',
  },
  [Rarity.Promising]: {
    outerBorderColor: 'rgba(96, 165, 250, 0.92)',
    innerBorderColor: 'rgba(191, 219, 254, 0.62)',
    outerShadow: 'inset 0 0 0 2px rgba(30, 64, 175, 0.74), 0 0 18px rgba(59, 130, 246, 0.38)',
    innerShadow: 'inset 0 0 0 1px rgba(219, 234, 254, 0.26)',
  },
  [Rarity.Unhinged]: {
    outerBorderColor: 'rgba(244, 114, 182, 0.95)',
    innerBorderColor: 'rgba(251, 207, 232, 0.7)',
    outerShadow: 'inset 0 0 0 2px rgba(157, 23, 77, 0.76), 0 0 22px rgba(236, 72, 153, 0.5)',
    innerShadow: 'inset 0 0 0 1px rgba(253, 242, 248, 0.28)',
  },
  [Rarity.MadKing]: {
    outerBorderColor: 'rgba(250, 204, 21, 0.95)',
    innerBorderColor: 'rgba(254, 249, 195, 0.76)',
    outerShadow: 'inset 0 0 0 2px rgba(153, 27, 27, 0.84), 0 0 24px rgba(251, 191, 36, 0.56)',
    innerShadow: 'inset 0 0 0 1px rgba(254, 249, 195, 0.34)',
  },
  [Rarity.Untouchable]: {
    outerBorderColor: 'rgba(248, 113, 113, 0.98)',
    innerBorderColor: 'rgba(250, 204, 21, 0.9)',
    outerShadow: 'inset 0 0 0 2px rgba(127, 29, 29, 0.92), 0 0 30px rgba(239, 68, 68, 0.82), 0 0 44px rgba(245, 158, 11, 0.46)',
    innerShadow: 'inset 0 0 0 1px rgba(253, 224, 71, 0.46)',
  },
};

const RARITY_AURA_THEMES: Record<Rarity, RarityAuraTheme> = {
  [Rarity.Trash]: {
    enabled: true,
    borderGlow: 'inset 0 0 10px rgba(161, 161, 170, 0.22), inset 0 0 18px rgba(82, 82, 91, 0.2)',
    borderColor: 'rgba(161, 161, 170, 0.5)',
    pulseDuration: '3.8s',
  },
  [Rarity.Defective]: {
    enabled: true,
    borderGlow: 'inset 0 0 12px rgba(245, 158, 11, 0.26), inset 0 0 22px rgba(180, 83, 9, 0.22)',
    borderColor: 'rgba(251, 191, 36, 0.58)',
    pulseDuration: '3.6s',
  },
  [Rarity.Promising]: {
    enabled: true,
    borderGlow: 'inset 0 0 12px rgba(96, 165, 250, 0.3), inset 0 0 24px rgba(37, 99, 235, 0.24)',
    borderColor: 'rgba(147, 197, 253, 0.66)',
    pulseDuration: '3.4s',
  },
  [Rarity.Unhinged]: {
    enabled: true,
    borderGlow: 'inset 0 0 14px rgba(244, 114, 182, 0.36), 0 0 18px rgba(236, 72, 153, 0.55), 0 0 30px rgba(190, 24, 93, 0.32)',
    borderColor: 'rgba(244, 114, 182, 0.78)',
    pulseDuration: '3s',
  },
  [Rarity.MadKing]: {
    enabled: true,
    borderGlow: 'inset 0 0 18px rgba(254, 240, 138, 0.52), 0 0 24px rgba(250, 204, 21, 0.84), 0 0 40px rgba(245, 158, 11, 0.52)',
    borderColor: 'rgba(253, 224, 71, 0.94)',
    pulseDuration: '2.5s',
  },
  [Rarity.Untouchable]: {
    enabled: true,
    borderGlow: 'inset 0 0 22px rgba(251, 191, 36, 0.62), 0 0 30px rgba(239, 68, 68, 0.96), 0 0 54px rgba(245, 158, 11, 0.72)',
    borderColor: 'rgba(248, 113, 113, 0.98)',
    pulseDuration: '1.7s',
  },
};

const RARITY_VALUES = Object.values(Rarity) as Rarity[];

export const normalizeRarity = (value: unknown, fallback: Rarity = Rarity.Defective): Rarity => {
  const normalized = String(value ?? '').trim();
  if (!normalized) return fallback;

  const asCode = normalized as Rarity;
  if (RARITY_VALUES.includes(asCode)) {
    return asCode;
  }

  return LEGACY_RARITY_TO_CODE[normalized.toLowerCase()] || LEGACY_RARITY_TO_CODE[normalized] || fallback;
};

export const getRarityLabel = (
  value: unknown,
  language: AppLanguage,
  options?: { short?: boolean },
): string => {
  const rarity = normalizeRarity(value);
  const labels = RARITY_LABELS[rarity];
  if (language === 'en') {
    return options?.short ? labels.shortEn : labels.en;
  }
  return options?.short ? labels.shortZh : labels.zh;
};

export const getRarityOptions = (language: AppLanguage): Array<{ value: Rarity; label: string }> =>
  RARITY_VALUES.map((rarity) => ({
    value: rarity,
    label: getRarityLabel(rarity, language),
  }));

export const getRarityBadgeTheme = (value: unknown): RarityBadgeTheme => {
  const rarity = normalizeRarity(value);
  return RARITY_BADGE_THEMES[rarity];
};

export const getRarityFrameTheme = (value: unknown): RarityFrameTheme => {
  const rarity = normalizeRarity(value);
  return RARITY_FRAME_THEMES[rarity];
};

export const getRarityAuraTheme = (value: unknown): RarityAuraTheme => {
  const rarity = normalizeRarity(value);
  return RARITY_AURA_THEMES[rarity];
};
