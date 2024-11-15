import { ButtonInteraction, Client, Message, MessageComponentInteraction, MessageReaction, TextChannel, User, GatewayIntentBits, Collection } from 'discord.js';
import { handleRpsOptionSelect } from '../commands/fun/rockpaperscissors';
import { handlePollOptionSelect } from '../commands/fun/poll';
import { SageInteractionType } from '@lib/types/InteractionType';
import { BOT, CHANNELS, DB, GUILDS } from '@root/config';
import { SageUser } from '../lib/types/SageUser';
import { FUN_RECS, ADMIN_RECS, CONFIG_RECS, REMIND_RECS, INFO_RECS, PARTIALVIS_RECS, QUESTIONTAG_RECS } from './commands'

async function register(bot: Client): Promise<void> {
	const client = new Client({ intents: [GatewayIntentBits.Guilds] });
	client.on('ready', (i) => { recommendationService(bot); });

	bot.on('interactionCreate', i => {
		if (i.isMessageComponent()) routeComponentInteraction(bot, i);
	});
	// When creating a message this portion will run because it see's that message Reactions have been added and will trigger on the initial add of thumbs up and down
	// need an if statement to verify the interaction just how the one above says i.isMessageComponent it could be the same but try different options
	bot.on('messageReactionAdd', (reaction, user) => handleUserReaction(bot, reaction.message.embeds[0].description, reaction.emoji.name, user.id));
	client.login(BOT.TOKEN);
}

async function recommendationService(bot: Client) {
	const channelId = CHANNELS.ANNOUNCEMENTS;
	const channel = bot.channels.cache.get(channelId);
	const usersID = bot.users.cache.map(user => user);
	for (let i = 0; i < usersID.length; i++) {
		const userID = usersID[i];
		const currentUser = await bot.mongo.collection(DB.USERS).findOne({ discordId: userID.id });
		if (currentUser !== null) {
			
			let recommendation = recommendationHelper(bot, currentUser);

			console.log(currentUser.personalizeRec);
			if (currentUser.personalizeRec !== undefined) {
				bot.users.cache.get(currentUser.discordId).send(`<@${currentUser.discordId}>`);
				(channel as TextChannel).send(`Sent DM to <@${currentUser.discordId}>`);
			}
		}
	}
	bot.login(BOT.TOKEN);
}

/* Recommend commands based on the type of most used command, and retrieve commands that are not used 
   within this category type by users to recommend them to users. */

async function recommendationHelper(bot: Client, user) {

	// Determine most used command for user 
	let mostUsed: string = "";
	let mostUsedType: string = "";		
	let highestCount: number = 0; 

	for (const command of user.commandUsage) {
		if (command.commandCount > highestCount) {
			highestCount = command.commandCount;
			mostUsed = command.commandName;
			mostUsedType = command.commandType;
		}
	}

	user.personalizeRec.mostusedCommand = mostUsed;
	bot.mongo.collection(DB.USERS).findOneAndUpdate({ discordId: user }, { $set: { "personalizeRec.mostusedCommand": mostUsed } });

	let randomunusedCommand = recommendUnusedCommand(mostUsedType, user)
	return "Hey, check this command out: " + randomunusedCommand;

}

/* Retrieve commands of the same type of the most used command */
function recommendUnusedCommand(mostUsedType, user) {
	if (!mostUsedType) return null;
	let randomUnusedCommand = "";
	
	// find random unused command based on category
	switch (mostUsedType) {
		case "fun":
			randomUnusedCommand = getRandomUnusedCommand(FUN_RECS, user.commandUsage, mostUsedType);
		case "admin":
			randomUnusedCommand = getRandomUnusedCommand(ADMIN_RECS, user.commandUsage, mostUsedType);
		case "config":
			randomUnusedCommand = getRandomUnusedCommand(CONFIG_RECS, user.commandUsage, mostUsedType);
		case "remind":
			randomUnusedCommand = getRandomUnusedCommand(REMIND_RECS, user.commandUsage, mostUsedType);
		case "info":
			randomUnusedCommand = getRandomUnusedCommand(INFO_RECS, user.commandUsage, mostUsedType);
		case "partialvisibilityquestion":
			randomUnusedCommand = getRandomUnusedCommand(PARTIALVIS_RECS, user.commandUsage, mostUsedType);
		case "questiontagging":
			randomUnusedCommand = getRandomUnusedCommand(PARTIALVIS_RECS, user.commandUsage, mostUsedType);
	}

	return randomUnusedCommand;

  }

  /* Filter through all of the commands of a certain type and remove commands that have already been used
  by user. Return a random unused command of that category */
  function getRandomUnusedCommand(categorycommands, usedCommands, mostUsedType) {
	const usedCommandNames = new Set(
    	usedCommands.filter(command => command.commandType === mostUsedType).map(command => command.commandName)
  	);

	let unusedCommands = categorycommands.filter(command => !usedCommandNames.has(command.commandName));
	if (unusedCommands.length === 0) return null;
  	return unusedCommands[Math.floor(Math.random() * unusedCommands.length)];
  }


async function routeComponentInteraction(bot: Client, i: MessageComponentInteraction) {
	if (i.isButton()) handleBtnPress(bot, i);
}

export default register;
function handleBtnPress(bot: Client, i: ButtonInteraction) {
	console.log('enter maybe');
	switch (i.customId.split('_')[0] as SageInteractionType) {
		case SageInteractionType.POLL:
			handlePollOptionSelect(bot, i);
			break;
		case SageInteractionType.RPS:
			handleRpsOptionSelect(i);
			break;
	}
}
// eslint-disable-next-line @typescript-eslint/no-unused-vars
// 1285236709780619395 is user id of the bot
// collect description, their message choice, and the user id
// just need to send it to the users monog db and stuff
async function handleUserReaction(bot: Client, description: string, choice: string, user: string) {
	if (user !== '1285236709780619395') {
		console.log('enter maybe');
		console.log(description, '   ', choice, '  ', user);
		const userMongo = await bot.mongo.collection(DB.USERS).findOne({ discordId: user });
		const feedbackArray = userMongo.feedbackLog;
		const findExisting = feedbackArray.findIndex(i => i.feedbackQ === description);
		if (findExisting === -1) {
			const newFeedback = {
				feedbackQ: description,
				emojiChoice: choice
			};
			bot.mongo.collection(DB.USERS).findOneAndUpdate({ discordId: user }, { $push: { feedbackLog: newFeedback } });
		} else {
			feedbackArray[findExisting].emojiChoice = choice;
			bot.mongo.collection(DB.USERS).findOneAndUpdate({ discordId: user }, { $set: { feedbackLog: feedbackArray } });
		}
	}
}