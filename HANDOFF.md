# HANDOFF

Where the work stands, so a new session can start cheaply. Read this, then CLAUDE.md. Update it at the end of every session (in the same commit as the work).

## Current state (2026-10-20)

- Phase 1.5 reader is built (Astro 7, `npm test` = build + invalid fixtures).
- `deepen` (go-deeper) lists are done and independently reviewed for: Hobbes, Locke, Mill, Machiavelli, Rousseau, Kant, Burke, Marx.
- Batch B (Plato, Aristotle, Adam Smith, Proudhon, Nietzsche): cards and deepen lists written and pushed (commit 2d776fa, "pending independent review"). Independent review is running; next: apply its findings, commit, report to the owner per card in Hebrew.

## Next steps

1. Finish batch B (above).
2. `deepen` for the 2 question cards.
3. Pilot of card shortening (~500 words) + "קרא את זה" on 3 cards.
4. The owner's reading week in the reader.

## Owner decisions to remember

- No opinion map of any kind.
- Hebrew first; English when the Hebrew is much weaker.
- Henry Unger: generalist lecturer, not a specialist; YouTube channel only.
- Raef Zreik: public positions reported by the reviewer but not checked in his own words; stated on his card.

## How the batch process works

1. One research agent per thinker with `tools/research-brief.md` (fill in the thinker). Reports come back as text; nothing is written to the repo by agents.
2. Verify the key items with `tools/check-url.sh URL "needle" ...` (Crossref for DOIs: `api.crossref.org/works/<doi>`; YouTube via oembed and the youtubei/v1/next endpoint; podcast durations from RSS: Podoksik `https://anchor.fm/s/25addfc0/podcast/rss`, Philosophy Bites `https://philosophybites.libsyn.com/rss`).
3. Write cards with `tools/gen_lib.py` (`lecture`, `book`, `guide`, `add_works_to_guide`, `set_deepen`).
4. `npm test`, commit "(pending independent review)", push.
5. One independent reviewer agent checks every sentence; apply fixes; commit; report to the owner per card in Hebrew.

## Token budget notes

- Biggest costs: research agents (~200k tokens each) and the reviewer (~300k). Main-session verification is smaller.
- Start a new session per batch; this file plus CLAUDE.md is enough context. Don't continue a compacted session for a new batch.
- Brief agents to cap each layer at 2–3 items and not to re-open sources.
- The independent reviewer can run on Sonnet (batch B did) to save tokens; compare its findings with batch A's before deciding to keep doing so.
- Known-good guides already exist (Podoksik, In Our Time, Philosophy Bites, Runciman, Heyd, Unger, Ifergan, Berlin...); reuse them instead of re-researching.
