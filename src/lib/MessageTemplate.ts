export function messageTemplate(schedule: string, type: string, recommended: string[], userData: string[]): string {
	const userActivities = userData.reduce((newString: string, str: string): string => newString + str, '');
	const reccomendations = recommended.reduce((newString: string, str: string): string => newString + str, '');

	let message;

	if (type === 'casual') {
		message = `Hello, here is your ${schedule} recommendations list.\n 
			Based on your recent activities: ${userActivities}\n
			We would like you to try using:\n\t${reccomendations}`;
	} else {
		message = `Yo, here is your ${schedule} recommendations list.\n 
			Based on your recent activities: ${userActivities}\n
			Here are some cool commands we think you will enjoy:\n\t${reccomendations}`;
	}

	return message;
}
