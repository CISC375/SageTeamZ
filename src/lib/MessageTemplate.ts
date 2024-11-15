export function messageTemplate(recommended: string[], userData: string[]): string {
	const userActivities = userData.reduce((newString: string, str: string): string => newString + str, '');
	const reccomendations = userData.reduce((newString: string, str: string): string => newString + str, '');

	const message = `Based on your activities: ${userActivities}\n
	we would like you to try using:${reccomendations}`;

	return message;
}
