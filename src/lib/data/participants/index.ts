import type { Participant } from '$lib/types/participant';

// Automatically import all participant files
const participantModules = import.meta.glob('./*.ts', { eager: true });

// Extract and export all participants
export const participants: Participant[] = Object.entries(participantModules)
	.filter(([path]) => !path.includes('index.ts') && !path.includes('README') && !path.includes('example-participant'))
	.map(([, module]: [string, any]) => {
		// Get the first exported value that is a Participant object
		const participantKey = Object.keys(module).find(key => key !== 'default');
		return participantKey ? module[participantKey] : null;
	})
	.filter((participant): participant is Participant => participant !== null);
