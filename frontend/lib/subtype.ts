type AppLanguage = 'en' | 'zh';

type SubtypeCode = 'basic' | 'stage1' | 'stage2' | 'vmax' | 'radiant';

const SUBTYPE_ALIASES: Record<string, SubtypeCode> = {
  basic: 'basic',
  '烂胶仔': 'basic',
  '爛膠仔': 'basic',
  'stage 1': 'stage1',
  stage1: 'stage1',
  '黐线仔': 'stage1',
  '黐線仔': 'stage1',
  'stage 2': 'stage2',
  stage2: 'stage2',
  '癫皇仔': 'stage2',
  '癲皇仔': 'stage2',
  vmax: 'vmax',
  '爆表仔': 'vmax',
  radiant: 'radiant',
  '神台仔': 'radiant',
};

const SUBTYPE_LABELS: Record<SubtypeCode, { zh: string; en: string }> = {
  basic: { zh: '烂胶仔', en: 'Trash Kid' },
  stage1: { zh: '黐线仔', en: 'Unhinged Kid' },
  stage2: { zh: '癫皇仔', en: 'Mad King Kid' },
  vmax: { zh: '爆表仔', en: 'Overclock Kid' },
  radiant: { zh: '神台仔', en: 'Altar Kid' },
};

export const resolveSubtypeCode = (value: unknown): SubtypeCode => {
  const raw = String(value ?? '').trim().toLowerCase();
  if (!raw) return 'basic';
  return SUBTYPE_ALIASES[raw] || 'basic';
};

export const getSubtypeLabel = (value: unknown, language: AppLanguage): string => {
  const code = resolveSubtypeCode(value);
  return language === 'en' ? SUBTYPE_LABELS[code].en : SUBTYPE_LABELS[code].zh;
};

