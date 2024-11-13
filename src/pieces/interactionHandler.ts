import { ButtonInteraction, Client, Message, MessageComponentInteraction, MessageReaction, TextChannel, User, GatewayIntentBits, Collection } from 'discord.js';
import { handleRpsOptionSelect } from '../commands/fun/rockpaperscissors';
import { handlePollOptionSelect } from '../commands/fun/poll';
import { SageInteractionType } from '@lib/types/InteractionType';
import { BOT, CHANNELS, DB, GUILDS } from '@root/config';
import { SageUser } from '../lib/types/SageUser';

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
			console.log(currentUser.personalizeRec);
			if (currentUser.personalizeRec !== undefined) {
				bot.users.cache.get(currentUser.discordId).send(`<@${currentUser.discordId}>`);
				(channel as TextChannel).send(`Sent DM to <@${currentUser.discordId}>`);
			}
		}
	}
	bot.login(BOT.TOKEN);
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
