export interface PublicFeedbackLog {
	id: string;
	feedback: string;
	owner: string;
	reactYes: [users];
	reactNo: [users];
	command: string;
	feedbackType: string;
	attachment: string;
}
