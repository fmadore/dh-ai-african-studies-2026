import type { Participant } from '$lib/types/participant';

// Import all participant files
import { exampleParticipant } from './example-participant';

// Export all participants as an array
export const participants: Participant[] = [
	exampleParticipant,
	// Add more participants here as you create their files
];

// Export individual participants for direct access if needed
export { exampleParticipant };
