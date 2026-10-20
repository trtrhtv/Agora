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
  const warnings: string[] = [];
  const workType = new Map(all.works.map((w) => [w.data.id, w.data.type]));
  const MEDIA_TYPES = new Set(['lecture', 'podcast', 'video']);
  const SEP = 'plato.stanford.edu';

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

  type Src = { id: string; url: string; type: string };
  const sourceById = (e: { data: { sources: Src[] } }) => new Map(e.data.sources.map((s) => [s.id, s]));
  const citedIds = (body: string | undefined) => [...(body ?? '').matchAll(/\[\^(s\d+)\]/g)].map((m) => m[1]);

  // Checked cards must name their weakest claims, so the owner knows where to look first.
  const checkWeakest = (where: string, v: { status: string; weakest_claims: string[] }) => {
    if (v.status !== 'unverified' && v.weakest_claims.length === 0)
      errors.push(`${where}: verification.weakest_claims is required once a card is checked`);
  };

  // Go-deeper items: the work must exist and fit its layer.
  const workAuthor = new Map(all.works.map((w) => [w.data.id, w.data.author]));
  const checkDeepen = (where: string, all: ({ layer: string } & ({ work: string } | { url: string }))[]) => {
    const items = all.filter((i): i is { work: string; layer: string } => 'work' in i);
    ref(`${where} deepen`, 'works', items.map((i) => i.work));
    for (const { work, layer } of items) {
      const t = workType.get(work);
      if (!t) continue;
      if (layer === 'listen' && !MEDIA_TYPES.has(t))
        errors.push(`${where} deepen: "${work}" is a ${t}, not a lecture, podcast or video`);
      if (layer !== 'listen' && MEDIA_TYPES.has(t))
        errors.push(`${where} deepen: "${work}" is a ${t}, so its layer must be listen`);
      if (layer === 'text' && !index.thinkers.has(workAuthor.get(work) ?? ''))
        errors.push(`${where} deepen: "${work}" is in the text layer but its author is not a thinker`);
    }
  };

  // Source concentration: warn when one encyclopedia carries most of a card.
  const checkConcentration = (where: string, srcs: Map<string, Src>, body: string | undefined) => {
    const cites = citedIds(body);
    if (cites.length < 10) return;
    const sep = cites.filter((c) => srcs.get(c)?.url.includes(SEP)).length;
    const share = Math.round((100 * sep) / cites.length);
    if (share > 60) warnings.push(`${where}: ${share}% of citations point to the Stanford Encyclopedia`);
  };

  for (const e of all.thinkers) {
    const { where, sourceIds } = checkCommon('thinkers', e);
    const srcs = sourceById(e);
    ref(where, 'schools', e.data.schools);
    for (const [field, links] of Object.entries({
      influenced_by: e.data.influenced_by,
      influenced: e.data.influenced,
      critics: e.data.critics,
    })) {
      ref(`${where} ${field}`, 'thinkers', links.map((l) => l.id));
      for (const l of links)
        if (!sourceIds.has(l.source)) errors.push(`${where} ${field}: link to ${l.id} cites unknown source ${l.source}`);
    }
    ref(where, 'works', e.data.key_works);
    ref(where, 'guides', e.data.guides);
    checkDeepen(where, e.data.deepen);

    // Quotes must come from a primary text, never through a secondary source.
    for (const q of e.data.quotes) {
      const src = srcs.get(q.source);
      if (!src) errors.push(`${where}: quote cites unknown source ${q.source}`);
      else if (src.type !== 'primary') errors.push(`${where}: quote cites ${q.source}, which is not a primary source`);
    }
    for (const m of e.data.misattributed)
      for (const sid of m.sources) if (!sourceIds.has(sid)) errors.push(`${where}: misattributed quote cites unknown source ${sid}`);
    // Quotes live in the structured field, so the body has no block quotes.
    if (/^>/m.test(e.body ?? '')) errors.push(`${where}: block quote in body; move it to the quotes field`);

    if (e.data.verification.status !== 'unverified') {
      checkWeakest(where, e.data.verification);
      // At least one cited secondary source that is not the Stanford Encyclopedia.
      const other = citedIds(e.body).some((c) => {
        const s = srcs.get(c);
        return s && s.type !== 'primary' && !s.url.includes(SEP);
      });
      if (!other) errors.push(`${where}: cites no secondary source other than the Stanford Encyclopedia`);
      checkConcentration(where, srcs, e.body);
    }
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
    checkDeepen(where, e.data.deepen);
    if (e.data.verification.status !== 'unverified') {
      checkWeakest(where, e.data.verification);
      checkConcentration(where, sourceById(e), e.body);
    }
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
      if (t.source && !sourceIds.has(t.source)) errors.push(`${where}: tension cites unknown source ${t.source}`);
    }
  }

  for (const e of all.works) {
    const { where } = checkCommon('works', e);
    if (!index.thinkers.has(e.data.author) && !index.guides.has(e.data.author))
      errors.push(`${where}: author "${e.data.author}" is neither a thinker nor a guide`);
    ref(where, 'publishers', e.data.translations.flatMap((t) => (t.publisher ? [t.publisher] : [])));
  }

  for (const e of all.guides) {
    const { where } = checkCommon('guides', e);
    ref(where, 'works', e.data.works);
  }

  for (const e of all.publishers) checkCommon('publishers', e);

  if (warnings.length) console.warn(`Content warnings:\n  - ${warnings.join('\n  - ')}`);
  if (errors.length) throw new Error(`Content integrity check failed:\n  - ${errors.join('\n  - ')}`);
  return all;
}
