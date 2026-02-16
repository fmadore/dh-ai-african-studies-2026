export type ConceptGroup =
	| 'Infrastructure, Governance & Access'
	| 'Cross-cutting'
	| 'Extended'
	| 'Language Technologies, NLP & Corpora'
	| 'The Archive'
	| 'Epistemologies, Decoloniality & Ethical Frameworks';

export interface ConceptNode {
	id: string;
	label: string;
	group: ConceptGroup;
	color: string;
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
