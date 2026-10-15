// Content schemas (SPEC.md section 4). A schema error fails the build.
import { defineCollection } from 'astro:content';
import { glob } from 'astro/loaders';
import { z } from 'astro/zod';

const slug = z.string().regex(/^[a-z0-9]+(-[a-z0-9]+)*$/, 'id must be an English kebab-case slug');
const sourceId = z.string().regex(/^s\d+$/, 'source id must look like s1, s2, ...');
const slugs = z.array(slug).default([]);

const domain = z.enum(['philosophy', 'economics', 'politics', 'lifestyle']);

const verification = z.strictObject({
  status: z.enum(['verified', 'partial', 'unverified']),
  missing: z.array(z.string()).default([]),
  // The 3–5 claims the author would be least able to defend: the owner reviews these first.
  weakest_claims: z.array(z.string()).default([]),
  reviewed_by_me: z.boolean(),
  last_checked: z.coerce.date(),
});

const source = z.strictObject({
  id: sourceId,
  title: z.string().min(1),
  url: z.url(),
  type: z.enum(['primary', 'encyclopedia', 'academic', 'official', 'journalism', 'other']),
});

// Fields shared by every entity (4.1).
const base = {
  id: slug,
  domains: z.array(domain).min(1),
  verification,
  sources: z.array(source).default([]),
};

// A verified quote: exact wording from a primary source, with its location and the translation used.
const quote = z.strictObject({
  text: z.string().min(1),
  location: z.string().min(1), // e.g. "Leviathan, Part I, ch. 13"
  source: sourceId, // must be a primary source (checked in integrity.ts)
  translation: z.string().min(1), // translator and edition, or "original" if not translated
  translated_he: z.string().optional(), // the author's free Hebrew translation
});

// A misattributed or distorted quote, with the source that refutes or corrects it.
const misattributed = z.strictObject({
  text: z.string().min(1),
  verdict_he: z.string().min(1),
  sources: z.array(sourceId).min(1),
});

// A link to another entity that is itself a claim (influence, criticism), so it needs a source.
const sourcedLink = z.strictObject({
  id: slug,
  source: sourceId,
  note_he: z.string().optional(),
});
const sourcedLinks = z.array(sourcedLink).default([]);

const names = {
  name_he: z.string().min(1),
  name_en: z.string().min(1),
};

const thinkers = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './content/thinkers' }),
  schema: z.strictObject({
    ...base,
    ...names,
    born: z.number().int().optional(), // negative = BCE
    died: z.number().int().optional(),
    schools: slugs,
    influenced_by: sourcedLinks,
    influenced: sourcedLinks,
    critics: sourcedLinks,
    key_works: slugs,
    guides: slugs,
    media: slugs, // works of type lecture | podcast | video about this thinker
    quotes: z.array(quote).default([]),
    misattributed: z.array(misattributed).default([]),
  }),
});

const schools = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './content/schools' }),
  schema: z.strictObject({
    ...base,
    ...names,
    parent_schools: slugs,
    key_thinkers: slugs,
    opposed_schools: slugs,
  }),
});

const holder = z.strictObject({
  id: slug,
  level: z.enum(['full', 'partial', 'qualified']),
  source: sourceId,
  period: z.string().optional(),
});

const questions = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './content/questions' }),
  schema: z.strictObject({
    ...base,
    question_he: z.string().min(1),
    question_en: z.string().optional(),
    positions: z
      .array(
        z.strictObject({
          id: slug,
          label_he: z.string().min(1),
          label_en: z.string().optional(),
          holders: z.array(holder).default([]),
        }),
      )
      .min(1),
    related_questions: slugs,
    media: slugs, // works of type lecture | podcast | video on this question
    tensions: z
      .array(
        z
          .strictObject({
            with: z.strictObject({ question: slug, position: slug }),
            my_position: slug,
            note_he: z.string().min(1),
            // sourced: a cited author names the tension. structural: the author's own reasoning,
            // shown to the owner as an assessment, never as a fact.
            basis: z.enum(['sourced', 'structural']).default('sourced'),
            source: sourceId.optional(),
          })
          .refine((t) => t.basis === 'structural' || !!t.source, {
            message: 'a sourced tension needs a source',
            path: ['source'],
          }),
      )
      .default([]),
  }),
});

const works = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './content/works' }),
  schema: z
    .strictObject({
      ...base,
      ...names,
      type: z.enum(['book', 'essay', 'lecture', 'podcast', 'novel', 'video']),
      author: slug, // a thinker, or a guide for lectures and podcasts
      year: z.number().int(),
      language: z.string().min(2),
      availability: z.enum(['public_domain', 'excerpt_only', 'reference_only']),
      full_text_url: z.url().optional(),
      translations: z
        .array(
          z.strictObject({
            language: z.string().min(2),
            title: z.string().min(1),
            translator: z.string().optional(),
            publisher: slug.optional(),
            url: z.url().optional(),
          }),
        )
        .default([]),
    })
    // Copyright rule (4.5): full text only for public domain works.
    .refine((w) => !w.full_text_url || w.availability === 'public_domain', {
      message: 'full_text_url is allowed only when availability is public_domain',
      path: ['full_text_url'],
    }),
});

const guides = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './content/guides' }),
  schema: z.strictObject({
    ...base,
    ...names,
    affiliation: z.string().optional(),
    affiliation_url: z.url().optional(),
    expertise: z.array(z.string()).default([]),
    languages: z.array(z.string()).default([]),
    works: slugs,
  }),
});

const publishers = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './content/publishers' }),
  schema: z.strictObject({
    ...base,
    ...names,
    url: z.url(),
    character_he: z.string().optional(), // known leaning, backed by sources in the body
  }),
});

export const collections = { thinkers, schools, questions, works, guides, publishers };
