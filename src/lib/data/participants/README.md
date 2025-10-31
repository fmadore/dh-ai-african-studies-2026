# Participants Directory

Each participant has their own TypeScript file in this directory.

## Adding a New Participant

1. Create a new file: `firstname-lastname.ts`
2. Copy the structure from `example-participant.ts`
3. Fill in the participant's details
4. Import and add to the array in `index.ts`

## Example File Structure

```typescript
import type { Participant } from '$lib/types/participant';

export const johnDoe: Participant = {
	name: 'Dr. John Doe',
	affiliation: 'University Name',
	role: 'Participant', // or 'Co-organizer' or 'Student Assistant'
	bio: 'Short biography here...',
	researchRegions: ['Region 1', 'Region 2'],
	photoUrl: '/images/participants/john-doe.jpg'
};
```

## Then update index.ts

```typescript
import { johnDoe } from './john-doe';

export const participants: Participant[] = [
	exampleParticipant,
	johnDoe, // Add new participant here
];
```
