---
name: discover-references
description: Finds new papers for the workshop bibliography in the ACL Anthology and arXiv, has Haiku agents triage them, and adds the relevant ones to the Zotero review subcollection "À valider". Use when asked to look for, discover, harvest or suggest new references, or to run the reference discovery pipeline.
---

# Reference discovery

The pipeline proposes papers; it never publishes them. What it keeps goes to the Zotero
subcollection **À valider** (key `M4YXAI7Y`, created 2026-11-25) under the published collection
**DH & AI in African Studies (VW)** (key `FI8KEUSF`). The site reads only the parent collection
(subcollection items are not included), so nothing reaches the website until the user moves an
item into the parent and `npm run fetch:references` runs.

`scripts/reference-discovery-ledger.json` remembers every paper already triaged (proposed or
rejected), so a paper is never triaged twice. Commit it after every run.

Run files live in `.cache/reference-discovery/run/` (git-ignored); every command below takes
the repository root as working directory. Steps that need the network (harvest) must run
outside the Bash sandbox.

## 1. Check Zotero

1. `zotero_write_capabilities`: writes go through the local API, so Zotero desktop must be
   running. If writes are unavailable, stop and ask the user to open Zotero.
2. `zotero_switch_library` with `library_id: "user"`, `library_type: "user"`. The MCP server's
   active library persists between sessions and is often a group library; the collection is in
   the personal library, and the writer agent writes to whichever library is active.
3. Confirm `M4YXAI7Y` still exists (`zotero_search_collections` for `À valider`). If it is gone,
   recreate it with `zotero_manage_collection` (`action: "create"`, `name: "À valider"`,
   `parent_collection: "FI8KEUSF"`) and use the new key below.

## 2. Harvest

```bash
npm run discover:references -- harvest
```

Run it in the background: it takes several minutes. Options: `--since YEAR` (default 2020),
`--max N` candidates this run (default 150), `--batch-size N` (default 15),
`--sources acl,arxiv`. The ACL dump (47 MB) is cached and downloaded again only when it changes.
arXiv is slow (about 45 s per 500-result page) and throttles hard; the script backs off on 429s,
and if arXiv stays unreachable it keeps the ACL results and lists the problem under `warnings`
in `manifest.json` (the missing arXiv papers come back next run).

The first harvest found about 1,150 new candidates since 2020. Take them in runs of the default
150 rather than raising `--max`, so each review in Zotero stays manageable. If `selected` is 0,
report that nothing new was found and stop.

## 3. Triage (parallel Haiku agents)

Start one `reference-triage` agent per batch in `manifest.json`, all in one message (in waves of
10 if there are more), with `model: "haiku"`. Prompt, with absolute paths:

```text
Batch file: <repo>/.cache/reference-discovery/run/batch-NN.json
Vocabulary file: <repo>/.cache/reference-discovery/run/vocabulary.json
Decisions file to write: <repo>/.cache/reference-discovery/run/decisions-NN.json
```

Triage agents never touch Zotero. Do not triage batches yourself or rewrite their decisions:
the user's review in Zotero is the check on them.

## 4. Queue and write to Zotero (one Haiku agent)

```bash
npm run discover:references -- queue
```

It validates every decisions file and writes `zotero-queue-NN.json` with the inclusions not yet
in Zotero. Exit code 2 names batches without decisions: rerun their triage agents. A validation
error names the file and the problem: delete that decisions file and rerun its agent.

Then start **one** `reference-zotero-writer` agent (`model: "haiku"`), never several at once:
parallel writers collide on Zotero's local API and lose writes.

```text
Queue file: <repo>/.cache/reference-discovery/run/zotero-queue-NN.json
Results file to write: <repo>/.cache/reference-discovery/run/zotero-results-NN.json
Zotero collection key: M4YXAI7Y
```

If it reports failures, run `queue` again and start one more writer on the new queue file. ACL
papers reach Zotero as CSL-JSON files the script generated, never as BibTeX: Zotero's BibTeX
import cuts abstracts at `{\%}` and mangles LaTeX (`\ensuremath`, accents). Never ask an agent to
paste a record into the tool: it passes only the file path or arXiv URL.

## 5. Record

```bash
npm run discover:references -- record
```

It adds decisions and Zotero keys to the ledger and writes `run/report.md`. Inclusions that never
reached Zotero stay out of the ledger, so the next run triages them again.

## Agents not yet loaded

Agent definitions load when a session starts. If `reference-triage` or
`reference-zotero-writer` is not available, use `subagent_type: "general-purpose"` with
`model: "haiku"` and begin the prompt with: "First read
`<repo>/.claude/agents/<agent>.md` and follow its instructions exactly (ignore its YAML front
matter)." For the writer add: "The only Zotero tool you may call is
`mcp__zotero__zotero_add_item`."

## 6. Report

Give the user the counts and the proposed papers from `report.md` (title, year, score, reason),
then the review steps:

1. In Zotero, open **À valider**. For each paper to keep, add it to **DH & AI in African Studies
   (VW)** and remove it from **À valider**; check its tags. Delete the ones to drop: the ledger
   still remembers them, so they will not come back.
2. Then refresh the site: `npm run fetch:references`.
3. Commit `src/lib/data/references.json` and `scripts/reference-discovery-ledger.json`.

Offer to commit the ledger now even if the user reviews later.
