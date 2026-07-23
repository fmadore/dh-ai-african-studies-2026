import type { Participant } from '$lib/types/participant';

type ParticipantModule = Record<string, Participant | undefined>;

// Automatically import all participant files. Exclusions live in the glob
// itself so index.ts (circular self-import) and the template never even load.
const participantModules = import.meta.glob<ParticipantModule>(
	['./*.ts', '!./index.ts', '!./example-participant.ts'],
	{ eager: true }
);

function isParticipant(value: unknown): value is Participant {
	return (
		typeof value === 'object' &&
		value !== null &&
		'name' in value &&
		'affiliation' in value &&
		'role' in value
	);
}

// Extract and export all participants, sorted by name for stable ordering
export const participants: Participant[] = Object.values(participantModules)
	.map((module) => {
		// Get the first named export that looks like a Participant
		const entry = Object.entries(module).find(
			([key, value]) => key !== 'default' && isParticipant(value)
		);
		return entry?.[1] ?? null;
	})
	.filter((participant): participant is Participant => participant !== null);
