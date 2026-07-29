"""
Extract a concept graph from the Obsidian vault for the DH & AI in African Studies workshop.

Usage:
    python scripts/extract_concept_graph.py --vault /path/to/vault

The vault path is required as a CLI argument to keep it out of the codebase.
Output goes to src/lib/data/concept-graph.json (relative to repo root).

Strategy:
1. Read the research note to identify seed concepts (wiki-links → Zotero/Concepts/)
2. Read each seed concept note and follow its wiki-links to other concept notes
3. Include 2nd-degree concepts (linked from seeds) to capture the full relevant network
4. Build edges from the actual wiki-links in concept notes
5. Output JSON for the website
"""

import argparse
import re
import json
from pathlib import Path
from collections import defaultdict, Counter

SCRIPT_DIR = Path(__file__).parent
REPO_ROOT = SCRIPT_DIR.parent
OUTPUT_FILE = REPO_ROOT / "src" / "lib" / "data" / "concept-graph.json"

# Paths relative to vault root
CONCEPTS_REL = Path("Zotero") / "Concepts"
RESEARCH_NOTE_REL = (
    Path("Zotero") / "Research Notes"
    / "Conceptual Landscape for DH and AI in African Studies Workshop.md"
)


FRONTMATTER_RE = re.compile(r"\A---\r?\n(.*?)\r?\n---", re.S)

# Vault notes naming a specific AI vendor, product or working practice. They are
# well linked inside the vault, so they otherwise surface as 2nd-degree concepts,
# but they belong to a tooling landscape rather than to the workshop's
# intellectual agenda — and named model versions date badly on a published map.
# Concepts stay in: "Large Language Models" yes, "Gemini 3 Pro" no.
EXCLUDED_CONCEPTS = {
    "ai agent skills",
    "chatgpt",
    "claude (ai)",
    "context engineering",
    "gemini 3 pro",
    "llama",
    "mistral",
    "model context protocol",
    "openai",
}


def normalise_target(target: str) -> str:
    """Reduce a wiki-link target to a bare note name.

    Drops the display alias ([[Note|shown]]), any #heading or ^block anchor,
    and any folder path — the vault links to some notes by full path, e.g.
    [[Zotero/Concepts/Metadata]].
    """
    target = target.split("|")[0]
    target = re.split(r"[#^]", target)[0]
    return target.strip().rstrip("/").split("/")[-1].strip()


def extract_wikilinks(text: str) -> list[str]:
    """Extract all [[wiki-links]] from markdown text as bare note names."""
    return [
        normalise_target(m.group(1)) for m in re.finditer(r"\[\[([^\]]+)\]\]", text)
    ]


def parse_aliases(text: str) -> list[str]:
    """Read the `aliases:` frontmatter field (inline `[a, b]` or block `- a` form)."""
    match = FRONTMATTER_RE.match(text)
    if not match:
        return []
    lines = match.group(1).split("\n")
    aliases: list[str] = []
    for i, line in enumerate(lines):
        if not re.match(r"^aliases\s*:", line):
            continue
        inline = line.split(":", 1)[1].strip()
        if inline.startswith("["):
            aliases += inline.strip("[]").split(",")
        else:
            for follow in lines[i + 1:]:
                item = follow.strip()
                if not item.startswith("- "):
                    break
                aliases.append(item[2:])
        break
    return [a for a in (a.strip().strip("\"'") for a in aliases) if a]


def build_concept_lookup(concepts_dir: Path) -> dict[str, Path]:
    """Build a case-insensitive lookup of concept notes by filename and alias.

    Filenames are registered first so a real note always wins over another
    note's alias; among aliases the alphabetically first note wins, which
    keeps the output stable between runs.

    Excluded notes are left out of the lookup entirely, so nothing resolves to
    them and they contribute neither nodes nor edges.
    """
    notes = sorted(
        f for f in concepts_dir.iterdir()
        if f.suffix == ".md" and f.stem.lower() not in EXCLUDED_CONCEPTS
    )
    lookup: dict[str, Path] = {f.stem.lower(): f for f in notes}
    for f in notes:
        for alias in parse_aliases(f.read_text(encoding="utf-8")):
            if alias.lower() not in EXCLUDED_CONCEPTS:
                lookup.setdefault(alias.lower(), f)
    return lookup


def resolve_concept(name: str, lookup: dict[str, Path]) -> str | None:
    """Check if a wiki-link target corresponds to a concept note."""
    key = normalise_target(name).lower()
    if key in lookup:
        return lookup[key].stem
    return None


def get_concept_links(concept_name: str, lookup: dict[str, Path]) -> list[str]:
    """Read a concept note and return wiki-links pointing to other concept notes."""
    key = concept_name.lower()
    if key not in lookup:
        return []
    content = lookup[key].read_text(encoding="utf-8")
    links = extract_wikilinks(content)
    resolved = set()
    for link in links:
        target = resolve_concept(link, lookup)
        if target and target.lower() != concept_name.lower():
            resolved.add(target)
    return list(resolved)


def parse_group_assignments(research_content: str, lookup: dict[str, Path]) -> dict[str, str]:
    """Parse the Conceptual Map by Workshop Group section for group assignments."""
    assignments = {}
    section_split = research_content.split("## Conceptual Map by Workshop Group")
    if len(section_split) < 2:
        return assignments

    section = section_split[1]
    current_group = None
    for line in section.split("\n"):
        # Stop at the next ## section (e.g. "## Related Concepts")
        if line.startswith("## ") and not line.startswith("### "):
            break
        if line.startswith("### Group 1"):
            current_group = "Language Technologies, NLP & Corpora"
        elif line.startswith("### Group 2"):
            current_group = "The Archive"
        elif line.startswith("### Group 3"):
            current_group = "Infrastructure, Governance & Access"
        elif line.startswith("### Group 4"):
            current_group = "Epistemologies, Decoloniality & Ethical Frameworks"
        elif line.startswith("### Cross-cutting"):
            current_group = "Cross-cutting"
        elif current_group and "[[" in line:
            for link in extract_wikilinks(line):
                resolved = resolve_concept(link, lookup)
                if resolved and resolved not in assignments:
                    assignments[resolved] = current_group

    return assignments


GROUP_COLORS = {
    "Language Technologies, NLP & Corpora": "#e74c3c",
    "The Archive": "#e67e22",
    "Infrastructure, Governance & Access": "#3498db",
    "Epistemologies, Decoloniality & Ethical Frameworks": "#9b59b6",
    "Cross-cutting": "#2ecc71",
    "Extended": "#95a5a6",
}


def main():
    parser = argparse.ArgumentParser(
        description="Extract concept graph from Obsidian vault"
    )
    parser.add_argument(
        "--vault", required=True, type=Path,
        help="Path to the Obsidian vault root"
    )
    args = parser.parse_args()

    vault = args.vault.resolve()
    concepts_dir = vault / CONCEPTS_REL
    research_note_path = vault / RESEARCH_NOTE_REL

    if not concepts_dir.is_dir():
        raise FileNotFoundError(f"Concepts directory not found: {concepts_dir}")
    if not research_note_path.is_file():
        raise FileNotFoundError(f"Research note not found: {research_note_path}")

    lookup = build_concept_lookup(concepts_dir)
    note_count = len({f for f in lookup.values()})
    print(f"Concept notes in vault: {note_count} "
          f"({len(lookup) - note_count} extra alias spellings)")

    # --- Step 1: Identify seed concepts from the research note ---
    research_content = research_note_path.read_text(encoding="utf-8")
    seeds = set()
    for link in extract_wikilinks(research_content):
        resolved = resolve_concept(link, lookup)
        if resolved:
            seeds.add(resolved)

    print(f"Seed concepts: {len(seeds)}")

    # --- Step 2: Read seed concept notes → find 2nd-degree concepts ---
    concept_edges: dict[str, list[str]] = {}
    second_degree = set()

    for seed in seeds:
        links = get_concept_links(seed, lookup)
        concept_edges[seed] = links
        second_degree.update(links)

    new_concepts = second_degree - seeds
    print(f"2nd-degree concepts: {len(new_concepts)}")

    # Read 2nd-degree notes for their links too
    for concept in new_concepts:
        concept_edges[concept] = get_concept_links(concept, lookup)

    # --- Step 3: Filter 2nd-degree to well-connected ones ---
    seed_link_count: dict[str, int] = defaultdict(int)
    for seed in seeds:
        for link in concept_edges.get(seed, []):
            if link in new_concepts:
                seed_link_count[link] += 1
    for concept in new_concepts:
        for link in concept_edges.get(concept, []):
            if link in seeds:
                seed_link_count[concept] += 1

    filtered_new = {c for c, count in seed_link_count.items() if count >= 2}
    relevant_concepts = seeds | filtered_new

    print(f"Relevant concepts: {len(relevant_concepts)} "
          f"({len(seeds)} seeds + {len(filtered_new)} extended)")

    # --- Step 4: Build edges ---
    edges = []
    edge_set: set[tuple[str, str]] = set()
    for concept in relevant_concepts:
        for link in concept_edges.get(concept, []):
            if link in relevant_concepts:
                edge_key = tuple(sorted([concept, link]))
                if edge_key not in edge_set:
                    edge_set.add(edge_key)
                    edges.append({"source": concept, "target": link})

    # --- Step 5: Assign groups ---
    group_assignments = parse_group_assignments(research_content, lookup)

    # --- Step 6: Build nodes with degree ---
    degree: dict[str, int] = defaultdict(int)
    for edge in edges:
        degree[edge["source"]] += 1
        degree[edge["target"]] += 1

    nodes = []
    for concept in sorted(relevant_concepts):
        group = group_assignments.get(concept, "Extended")
        nodes.append({
            "id": concept,
            "label": concept,
            "group": group,
            "color": GROUP_COLORS.get(group, "#95a5a6"),
            "seed": concept in seeds,
            "degree": degree.get(concept, 0),
        })

    # --- Summary ---
    print(f"Edges: {len(edges)}")
    print("\nNodes by group:")
    for g, c in Counter(n["group"] for n in nodes).most_common():
        print(f"  {g}: {c}")
    print(f"\nTop 10 by degree:")
    for n in sorted(nodes, key=lambda x: x["degree"], reverse=True)[:10]:
        print(f"  {n['id']}: {n['degree']} ({n['group']})")

    # --- Step 7: Write output ---
    # newline="\n" + a trailing newline keep the output Prettier-clean, since
    # concept-graph.json is checked by `npm run format:check` in CI.
    OUTPUT_FILE.parent.mkdir(parents=True, exist_ok=True)
    data = {"nodes": nodes, "edges": edges}
    with open(OUTPUT_FILE, "w", encoding="utf-8", newline="\n") as f:
        json.dump(data, f, indent=2, ensure_ascii=False)
        f.write("\n")
    print(f"\nOutput: {OUTPUT_FILE}")


if __name__ == "__main__":
    main()
