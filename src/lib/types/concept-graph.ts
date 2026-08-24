export type ConceptGroup =
	| 'Infrastructure, Governance & Access'
	| 'Cross-cutting'
	| 'Extended'
	| 'Language Technologies, NLP & Corpora'
	| 'The Archive'
	| 'Epistemologies, Decoloniality & Ethical Frameworks';

// The export script also writes a per-node `color`, but the renderer maps
// group → color itself (graph-config.ts), so the loads strip it rather than
// ship six dead hex literals into the prerendered page data.
export interface ConceptNode {
	id: string;
	label: string;
	group: ConceptGroup;
	seed: boolean;
	degree: number;
	// d3 simulation fields
	x?: number;
	y?: number;
	vx?: number;
	vy?: number;
	fx?: number | null;
	fy?: number | null;
	index?: number;
}

export interface ConceptEdge {
	source: string | ConceptNode;
	target: string | ConceptNode;
}

export interface ConceptGraphData {
	nodes: ConceptNode[];
	edges: ConceptEdge[];
}
