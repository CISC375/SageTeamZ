/* eslint-disable quotes */
import { BOT, CHANNELS, DB } from '@root/config';
import { ChatInputCommandInteraction, Client, TextChannel, User } from 'discord.js';
import { SageUser } from './SageUser';

export const FUN_RECS = [
	'coinflip',
	'8ball',
	'blindfoldedroosen',
	'catfacts',
	'diceroll',
	'define',
	'doubt',
	'f',
	'latex',
	'poll',
	'quote',
	'rockpaperscissors',
	'submit',
	'thisisfine',
	'xkcd'
];

export const ADMIN_RECS = [
	'activity',
	'addbutton',
	'addcourse',
	'announce',
	'count',
	'disable',
	'edit',
	'enable',
	'issue',
	'prune',
	'refresh',
	'removecourse',
	'resetlevels',
	'restart',
	'setassign',
	'showcommands',
	'status',
	'groupab'
];

export const CONFIG_RECS = [
	'togglelevelpings',
	'togglepii'
];

export const REMIND_RECS = [
	'cancelreminder',
	'remind',
	'viewreminders'
];

export const INFO_RECS = [
	'commit',
	'discordstatus',
	'feedback',
	'help',
	'info',
	'leaderboard',
	'ping',
	'publicfeedbackvote',
	'serverinfo',
	'statreport',
	'stats'
];

export const PARTIALVIS_RECS = [
	'anonymous',
	'archive',
	'private',
	'reply'
];

export const QUESTIONTAG_RECS = [
	'question',
	'tagquestion'
];

export const REMINDERS = [
	'cancelreminder',
	'remind',
	'viewreminders'
];

export const STAFF = [
	'addassignment',
	'blockpy',
	'google',
	'lookup',
	'mute',
	'resetlevel',
	'roleinfo',
	'sudoreply',
	'warn',
	'whois'
];

const FUN_COMMAND_STRINGS = [
	"I think you might enjoy trying \"{command}\"!",
	"Here’s something fun: \"{command}\".",
	"Feeling adventurous? \"{command}\" could be entertaining!",
	"\"{command}\" is a great pick for a bit of fun.",
	"You’re going to love \"{command}\". Give it a shot!",
	"Take a look at \"{command}\"—perfect for some excitement."
];

const NORMAL_COMMAND_STRINGS = [
	"I think \"{command}\" might be helpful for you.",
	"Here’s something useful: \"{command}\".",
	"\"{command}\" could be a good option to explore.",
	"Consider checking out \"{command}\"—it’s worth your time.",
	"\"{command}\" is a practical choice to consider.",
	"This could be a helpful next step: \"{command}\"."
];


/* Recommend commands based on the type of most used command, and retrieve commands that are not used
   within this category type by users to recommend them to users. */
export async function getMostUsed(bot: Client, user: SageUser) {
	// Determine most used command for user
	let mostUsed = '';
	let mostUsedType = '';
	let highestCount = 0;

	for (const command of user.commandUsage) {
		// console.log(command.commandCount);
		if (command.commandCount > highestCount) {
			highestCount = command.commandCount;
			mostUsed = command.commandName;
			mostUsedType = command.commandCategory;
		}
	}
	return `${mostUsed}.${mostUsedType}`;
}

export async function recommendationHelper(bot: Client, user: SageUser) {
	const objectUser = user.personalizeRec;
	const spliced = (await getMostUsed(bot, user)).split('.');
	// eslint-disable-next-line prefer-destructuring
	objectUser.mostusedCommand = spliced[0];
	const randomunusedCommand = recommendUnusedCommand(spliced[1], user);

	// console.log('Before Mongo Update:', objectUser.recommendedCommands);
	// console.log('Before update:', objectUser);

	if (!objectUser.recommendedCommands) {
		objectUser.recommendedCommands = [];
	}

	// makes sure user has a slot for most used and the type since originally it was null
	if (randomunusedCommand) {
		if (!objectUser.recommendedCommands.includes(randomunusedCommand)) {
			objectUser.recommendedCommands.push(randomunusedCommand);
		} //
		// console.log('user id: ', user.discordId)
		const updateResult = await bot.mongo.collection(DB.USERS).findOneAndUpdate({ discordId: user.discordId }, { $set: { personalizeRec: objectUser } });
		// console.log('Mongo Update Result:', updateResult);

		const messages = objectUser.tone === 'casual' ? FUN_COMMAND_STRINGS : NORMAL_COMMAND_STRINGS;
		const randomMessage = messages[Math.floor(Math.random() * messages.length)];
		return randomMessage.replace('{command}', randomunusedCommand);
	}
}

/* Retrieve commands of the same type of the most used command */
export function recommendUnusedCommand(mostUsedType: string, user: { commandUsage: any[]; }) {
	if (!mostUsedType) return null;
	let randomUnusedCommand = '';
	// find random unused command based on category
	switch (mostUsedType) {
		case 'fun':
			randomUnusedCommand = getRandomUnusedCommand(FUN_RECS, user.commandUsage, mostUsedType);
			break;
		case 'admin':
			randomUnusedCommand = getRandomUnusedCommand(ADMIN_RECS, user.commandUsage, mostUsedType);
			break;
		case 'config':
			randomUnusedCommand = getRandomUnusedCommand(CONFIG_RECS, user.commandUsage, mostUsedType);
			break;
		case 'remind':
			randomUnusedCommand = getRandomUnusedCommand(REMIND_RECS, user.commandUsage, mostUsedType);
			break;
		case 'info':
			randomUnusedCommand = getRandomUnusedCommand(INFO_RECS, user.commandUsage, mostUsedType);
			break;
		case 'partialvisibilityquestion':
			randomUnusedCommand = getRandomUnusedCommand(PARTIALVIS_RECS, user.commandUsage, mostUsedType);
			break;
		case 'questiontagging':
			randomUnusedCommand = getRandomUnusedCommand(QUESTIONTAG_RECS, user.commandUsage, mostUsedType);
			break;
		case 'reminders':
			randomUnusedCommand = getRandomUnusedCommand(REMINDERS, user.commandUsage, mostUsedType);
			break;
		case 'staff':
			randomUnusedCommand = getRandomUnusedCommand(STAFF, user.commandUsage, mostUsedType);
			break;
	}
	// console.log(randomUnusedCommand);
	return randomUnusedCommand;
}

/* Filter through all of the commands of a certain type and remove commands that have already been used
  by user. Return a random unused command of that category */
export function getRandomUnusedCommand(categorycommands: any[], usedCommands: any[], mostUsedType: any) {
	const usedCommandNames = new Set(usedCommands.filter(command => command.commandType === mostUsedType).map(command => command.commandName));

	const unusedCommands = categorycommands.filter(command => !usedCommandNames.has(command.commandName));
	if (unusedCommands.length === 0) return null;
	return unusedCommands[Math.floor(Math.random() * unusedCommands.length)];
}

// Logic Rec makes sure that the logic is correct and sends the correct information
// eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
export async function logicRec(user_ : SageUser, interaction : ChatInputCommandInteraction, bot: Client) {
	let randNum = Math.floor(Math.random() * (20 - 1 + 1)) + 1; // The math to make it random (Between 1 and 20)
	if (user_.personalizeRec.scheduled === 'random' || randNum >= 15) {
		switch (user_.personalizeRec.frequency) {
			case 'aggressive' : {
				randNum += 10;
				break;
			}
			case 'low' : {
				randNum -= 10;
				break;
			}
		}
		if (randNum > 18) {
			const recommendation = await recommendationHelper(bot, user_);
			const splicedMost = (await getMostUsed(bot, user_)).split('.');
			if (user_.personalizeRec.reccType === 'dm') { // Sends User a DM (Not currently recommendations, just a lil Howdy)
				// eslint-disable-next-line max-depth
				try {
					console.log(recommendation);
					await interaction.user.send(`Since you've used ${splicedMost[0]} the most.\n${recommendation}`);
				} catch (error) {
					console.error('Failed to send DM:', error);
				}
			} else if (user_.personalizeRec.reccType === 'announcements') { // Does a followUp if the User has their reccType set to anything else
				try {
					console.log(recommendation);
					// Does not currently display as ephemeral due to the the bot doing a followUp to its own reply
					await interaction.followUp({ content: `Since you've used ${splicedMost[0]} the most.\n${recommendation}`, ephemeral: false });
				} catch (error) {
					console.error('Failed to send reply or follow-up:', error);
				}
			}
		}
	}
}
