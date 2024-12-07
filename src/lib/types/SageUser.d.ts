export interface SageUser {
	email: string;
	hash: string;
	discordId: string;
	pii: boolean;
	count: number;
	levelExp: number;
	curExp: number;
	level: number;
	levelPings: boolean;
	isVerified: boolean;
	isStaff: boolean;
	roles: Array<string>;
	courses: Array<string>;
	activityLevel: string;
	isNewUser: boolean;
	messageCount: number
	commandUsage: Array<{ commandName: string; commandCount: number; commandType: string; commandCategory: string;}>;
	responseTime: number;
	lastMessage: number;
	timestampArray: Array<Array<Record<string, number>>>;
	activityLog: Array<Record<string, unknown>>;
	feedbackLog: Array<Record<string, unknown>>;
	personalizeRec: {
		usertype: string; // 'active' | 'inactive' | 'new';
		mostusedCommand: string | null;
		reccType: string; // 'announcements' | 'dm' | 'none';
		frequency: string; // 'aggressive' | 'moderate' | 'low';
		tone: string; // 'formal' | 'casual';
		scheduled: string; // 'random' | 'daily' | 'weekly';
		recommendedCommands: Array<string>;
	};
}
