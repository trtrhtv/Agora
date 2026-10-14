# CLAUDE.md

Personal worldview app. The full spec is in `SPEC.md`. Read it before any task.

## Working rules

- Build in the phase order of SPEC.md section 11. Don't start a phase before the previous one's acceptance criteria pass.
- UI language is Hebrew (RTL). Code, ids, commits and comments in English.
- Content lives in `content/` as Markdown + YAML frontmatter, validated by Zod. Never bypass the schema.

## Content rules (non-negotiable)

- Every factual claim cites a source `[^sN]` with a working URL. If you can't find a source, write it in `verification.missing` instead of guessing.
- Steelman every position, and give the strongest critique of every position. Same treatment for all schools.
- Never attribute a view to a living person without a link to their own words. Researching or translating a thinker is not endorsing them.
- No quote without an exact location in the source. Unverified quotes stay out.
- Full text only for `availability: public_domain`. For copyrighted works: own-words summary, short quotes only, and a reference.
- New or edited cards always get `reviewed_by_me: false`. Only the owner sets it to true.
- Write content in batches of 5–10 cards, then stop for review.

## Format decisions (owner, after phase 1 batch 1)

- Quotes: exact original (English) with its location, then a Hebrew free translation marked as such.
- Positions with no holder in the library stay in the question, fully written, with a note that no holder exists yet.
- Living scholars known only through a secondary source (e.g. an SEP summary): describe the argument and cite the secondary source, without attributing it by name.
- Pace: batches of 5–10 cards, then stop for review.

## Research & verification protocol

Your memory is not a source. Check before you state anything.

**Before writing**
- Search first, write second. Never draft a card from memory and add links afterwards.
- Source priority: primary text → SEP / IEP / academic presses → official faculty pages → reputable journalism. Avoid blogs, quote sites, and AI-generated pages.
- For each key claim, look for at least 2 independent sources. If only one exists, say so in `verification.missing`.
- Search in both Hebrew and English when the person or topic has an Israeli side.

**While writing**
- Open every link you cite and confirm it actually supports the specific claim. A link on the right topic is not enough.
- Quotes: find them in the primary text (Gutenberg, Wikisource, the book itself). Quote sites and Wikiquote are only leads. Check Wikiquote's "Misattributed" / "Disputed" sections.
- Separate fact from interpretation. Interpretation goes in an `:::assessment` block and names whose interpretation it is.
- Actively search for the opposite: critics of the thinker, critics of the guide, evidence against your summary. If you only found supporting sources, you haven't searched enough.
- People with similar names: confirm identity (institution, field, dates) before attributing anything. Example from planning: a "Henry Unger at TAU" exists, but in the Faculty of Arts, and his Wittgenstein expertise was not confirmed.

**After writing (self-review before handing over)**
- Re-read the card as a skeptic: which sentence would I be least able to defend? Verify it or remove it.
- Check balance: is the strongest critique as strong as the strongest case?
- List in `verification.missing` everything you looked for and didn't find. "Not found" is a valid, useful answer.
- In your reply to me, state per card what is verified, what is your assessment, and what is missing. Never say "verified" unless you opened the source.

**When unsure:** stop and ask, or mark it unverified. A gap is always better than a confident error.
