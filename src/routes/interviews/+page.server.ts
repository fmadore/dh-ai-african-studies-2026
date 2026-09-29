import type { PageServerLoad } from './$types';
import { interviews } from '$lib/data/interviews';
import { interviewPosters } from '$lib/server/interview-posters';

export const load: PageServerLoad = () => ({
	posters: interviewPosters(interviews.map((interview) => interview.youtubeId))
});
