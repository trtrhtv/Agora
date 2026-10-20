// Presentation helpers shared by the reader pages (SPEC 11, phase 1.5).
import type { CollectionKey } from 'astro:content';
import { loadAll } from './integrity';

export const KIND_LABEL: Record<CollectionKey, string> = {
  thinkers: 'הוגים',
  questions: 'שאלות',
  schools: 'זרמים',
  works: 'יצירות',
  guides: 'מסבירים',
  publishers: 'הוצאות לאור',
};

export const KINDS = Object.keys(KIND_LABEL) as CollectionKey[];

export const LEVEL_LABEL = { full: 'מלא', partial: 'חלקי', qualified: 'בהסתייגות' } as const;

export const SOURCE_TYPE_LABEL: Record<string, string> = {
  primary: 'טקסט ראשוני',
  encyclopedia: 'אנציקלופדיה',
  academic: 'אקדמי',
  official: 'רשמי',
  journalism: 'עיתונות',
  other: 'אחר',
};

export const STATUS_LABEL = { verified: 'מאומת', partial: 'מאומת חלקית', unverified: 'לא מאומת' } as const;
export const STATUS_ICON = { verified: '🟢', partial: '🟡', unverified: '⚪' } as const;

export const href = (kind: CollectionKey, id: string) => `/${kind}/${id}/`;

export const titleOf = (data: Record<string, unknown>) => (data.name_he ?? data.question_he) as string;

export type Ref = { kind: CollectionKey; id: string; title: string };

// id -> where it lives and what it is called, across all collections.
export async function loadIndex() {
  const all = await loadAll();
  const byKind = new Map<string, Ref>();
  for (const kind of KINDS)
    for (const e of all[kind]) byKind.set(`${kind}:${e.data.id}`, { kind, id: e.data.id, title: titleOf(e.data) });
  const ref = (kind: CollectionKey, id: string): Ref => byKind.get(`${kind}:${id}`) ?? { kind, id, title: id };
  return { all, ref };
}

// A year range for an RTL page. Both BCE: "428–347 לפנה״ס". The range sits in an LTR span so the
// numbers keep their order (RTL layout would otherwise show 1469–1527 as 1527–1469).
export const lifeSpan = (born?: number, died?: number) => {
  if (born === undefined || died === undefined) return '';
  if (born < 0 && died < 0) return `${-born}–${-died} לפנה״ס`;
  const y = (n: number) => (n < 0 ? `${-n} לפנה״ס` : `${n}`);
  return `${y(born)}–${y(died)}`;
};
