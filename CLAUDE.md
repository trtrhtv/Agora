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

## Product decisions (owner, SPEC v0.3)

- No map of the owner's opinions: no stance recording, no proximity to thinkers, no tracking of opinion changes. The app is a library for reading and understanding.
- Phase 1 content is paused after batch 3. Phase 1.5 (minimal reader) comes first; card shortening (~500 words) and the "קרא את זה" section are piloted on three cards before rolling out.

## Source and format rules (after the self-review of batches 1–3)

The build enforces the starred rules (`src/lib/integrity.ts`).

- **Beyond one encyclopedia.** \* Every checked thinker card cites at least one secondary source that is not the Stanford Encyclopedia (SEP). Keep SEP under 60% of a card's citations; the build warns above that. Source titles name the entry's author, so "according to SEP" reads as "according to Kraut".
- **Quotes are data.** \* Verified quotes live only in the `quotes` field, with `location`, a `source` that is a primary text, and `translation` (translator and edition, or "original"). \* No block quotes in a thinker's body. In the body, quotation marks are allowed only for wording read directly in the primary text; anything read through a secondary source is paraphrased without quotation marks.
- **Misattributions are data.** \* `misattributed` entries need a source that refutes or corrects them. "Not checked" goes in `verification.missing`, not in the card.
- **Links are claims.** \* `influenced_by`, `influenced` and `critics` each carry a `source`.
- **Weakest claims first.** \* Every checked card lists 3–5 `verification.weakest_claims`: the sentences the author would be least able to defend. The owner reviews these first.
- **What `:::assessment` may hold.** Only: a reading recommendation ("המלצה של כותב הכרטיס"), an open question ("שאלה פתוחה" / "שאלה לקריאה"), or a note on the state of the sources ("הערה על המקורות"). Never a verdict on which position or critique is right or strongest.
- **Tensions.** `basis: sourced` needs a source. `basis: structural` is the author's own reasoning and is shown to the owner as an assessment.
- **Independent review.** After writing a batch and before handing it over, a separate agent that did not write the cards checks every cited sentence against its source and looks for second sources. Report its findings and what was fixed.
- **Go deeper.** Every thinker and question gets a `deepen` list: the primary text (with its Hebrew translation), something to listen to or watch, an intro article, and deeper scholarship including a serious critic. Hebrew first; English when there is no Hebrew or the Hebrew is significantly weaker. Pick for depth, not for existence: prefer what independent experts recommend (a Five Books pick, a syllabus, an encyclopedia's reading list, a serious review), record it in `endorsement` with a link, and say in `note_he` what angle or question the item opens.
- **Lectures and podcasts.** They are `works` of type `lecture`, `podcast` or `video`, whose `author` is a guide card, linked from thinkers and questions through `deepen` (layer `listen`). Before adding one: open the episode page, confirm it exists and who speaks, confirm it covers the topic claimed, and give the guide card the same scrutiny as any guide (affiliation, expertise, known leanings, all with links). Audio is another interpreter, not a substitute for the primary text.

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
- People with similar names: confirm identity (institution, field, dates) before attributing anything. Example: Henry Unger's identity is confirmed (TAU page core.tau.ac.il/story/12, and his own YouTube channel). His listed expertise is 20th-century analytic philosophy, aesthetics and world literature, so present him as a generalist lecturer, not a specialist in the thinkers he covers. Link only his YouTube channel, not the unofficial fan site.

**After writing (self-review before handing over)**
- Re-read the card as a skeptic: which sentence would I be least able to defend? Verify it or remove it.
- Check balance: is the strongest critique as strong as the strongest case?
- List in `verification.missing` everything you looked for and didn't find. "Not found" is a valid, useful answer.
- In your reply to me, state per card what is verified, what is your assessment, and what is missing. Never say "verified" unless you opened the source.

**When unsure:** stop and ask, or mark it unverified. A gap is always better than a confident error.
