export interface PublicFeedbackLog {
	id: string;
	feedback: string;
	owner: string;
	reactYes: [users];
	reactNo: [users];
	command: string;
	positiveFeedback: boolean;
	attachment: string;
}
