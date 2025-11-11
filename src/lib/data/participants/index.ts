import type { Participant } from '$lib/types/participant';

type ParticipantModule = Record<string, Participant | undefined>;

// Automatically import all participant files
const participantModules = import.meta.glob<ParticipantModule>('./*.ts', { eager: true });

// Extract and export all participants
export const participants: Participant[] = Object.entries(participantModules)
	.filter(([path]) => !path.includes('index.ts') && !path.includes('README') && !path.includes('example-participant'))
	.map(([, module]) => {
		// Get the first exported value that is a Participant object
		const entry = Object.entries(module).find(([key, value]) => key !== 'default' && Boolean(value));
		return entry?.[1] ?? null;
	})
	.filter((participant): participant is Participant => participant !== null);
