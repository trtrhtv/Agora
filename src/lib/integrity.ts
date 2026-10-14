// Cross-entity checks Zod can't express per file: links by id, source ids, id = filename.
// Called at build time; any problem throws and fails the build.
import { getCollection, type CollectionEntry, type CollectionKey } from 'astro:content';

type Index = Record<CollectionKey, Set<string>>;

export async function loadAll() {
  return {
    thinkers: await getCollection('thinkers'),
    schools: await getCollection('schools'),
    questions: await getCollection('questions'),
    works: await getCollection('works'),
    guides: await getCollection('guides'),
    publishers: await getCollection('publishers'),
  };
}

export async function assertIntegrity() {
  const all = await loadAll();
  const index = Object.fromEntries(
    Object.entries(all).map(([k, entries]) => [k, new Set(entries.map((e) => e.data.id))]),
  ) as Index;
  const errors: string[] = [];

  const ref = (where: string, kind: CollectionKey, ids: string[]) => {
    for (const id of ids) if (!index[kind].has(id)) errors.push(`${where}: unknown ${kind} id "${id}"`);
  };

  const checkCommon = (kind: CollectionKey, e: CollectionEntry<CollectionKey>) => {
    const where = `${kind}/${e.id}`;
    if (e.data.id !== e.id) errors.push(`${where}: frontmatter id "${e.data.id}" must match the file name`);
    const sourceIds = new Set(e.data.sources.map((s) => s.id));
    if (sourceIds.size !== e.data.sources.length) errors.push(`${where}: duplicate source ids`);
    for (const m of (e.body ?? '').matchAll(/\[\^(s\d+)\]/g)) {
      if (!sourceIds.has(m[1])) errors.push(`${where}: body cites [^${m[1]}] but no such source`);
    }
    return { where, sourceIds };
  };

  for (const e of all.thinkers) {
    const { where } = checkCommon('thinkers', e);
    ref(where, 'schools', e.data.schools);
    ref(where, 'thinkers', [...e.data.influenced_by, ...e.data.influenced, ...e.data.critics]);
    ref(where, 'works', e.data.key_works);
    ref(where, 'guides', e.data.guides);
  }

  for (const e of all.schools) {
    const { where } = checkCommon('schools', e);
    ref(where, 'schools', [...e.data.parent_schools, ...e.data.opposed_schools]);
    ref(where, 'thinkers', e.data.key_thinkers);
  }

  const positionsByQuestion = new Map(all.questions.map((q) => [q.data.id, new Set(q.data.positions.map((p) => p.id))]));
  for (const e of all.questions) {
    const { where, sourceIds } = checkCommon('questions', e);
    ref(where, 'questions', e.data.related_questions);
    for (const p of e.data.positions) {
      for (const h of p.holders) {
        ref(`${where} position ${p.id}`, 'thinkers', [h.id]);
        if (!sourceIds.has(h.source)) errors.push(`${where} position ${p.id}: holder ${h.id} cites unknown source ${h.source}`);
      }
    }
    for (const t of e.data.tensions) {
      if (!positionsByQuestion.get(e.data.id)?.has(t.my_position))
        errors.push(`${where}: tension my_position "${t.my_position}" is not a position of this question`);
      const other = positionsByQuestion.get(t.with.question);
      if (!other) errors.push(`${where}: tension refers to unknown question "${t.with.question}"`);
      else if (!other.has(t.with.position))
        errors.push(`${where}: tension refers to unknown position "${t.with.position}" of ${t.with.question}`);
      if (!sourceIds.has(t.source)) errors.push(`${where}: tension cites unknown source ${t.source}`);
    }
  }

  for (const e of all.works) {
    const { where } = checkCommon('works', e);
    ref(where, 'thinkers', [e.data.author]);
    ref(where, 'publishers', e.data.translations.flatMap((t) => (t.publisher ? [t.publisher] : [])));
  }

  for (const e of all.guides) {
    const { where } = checkCommon('guides', e);
    ref(where, 'works', e.data.works);
  }

  for (const e of all.publishers) checkCommon('publishers', e);

  if (errors.length) throw new Error(`Content integrity check failed:\n  - ${errors.join('\n  - ')}`);
  return all;
}
