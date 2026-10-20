import { getCollection } from 'astro:content';

// List of every page, so the service worker can cache the whole library for offline reading.
export async function GET() {
  const kinds = ['thinkers', 'questions', 'schools', 'works', 'guides', 'publishers'] as const;
  const pages = ['/'];
  for (const kind of kinds) {
    for (const entry of await getCollection(kind)) pages.push(`/${kind}/${entry.id}/`);
  }
  return new Response(JSON.stringify(pages), { headers: { 'Content-Type': 'application/json' } });
}
