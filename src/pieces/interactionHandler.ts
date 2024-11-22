// eslint-disable-next-line max-len
import { ButtonInteraction, Client, Message, MessageComponentInteraction, MessageReaction, ModalActionRowComponent, ModalSubmitComponent, ModalSubmitInteraction, TextChannel, User, GatewayIntentBits, Collection, ApplicationCommandType } from 'discord.js';
import { handleRpsOptionSelect } from '../commands/fun/rockpaperscissors';
import { handlePollOptionSelect } from '../commands/fun/poll';
import { SageInteractionType } from '@lib/types/InteractionType';
import { BOT, CHANNELS, DB, GUILDS, ROLES } from '@root/config';
import { SageUser } from '../lib/types/SageUser';
import { FUN_RECS, ADMIN_RECS, CONFIG_RECS, REMIND_RECS, INFO_RECS, PARTIALVIS_RECS, QUESTIONTAG_RECS } from '../lib/types/commands';
import { Command } from '../lib/types/Command';

async function register(bot: Client): Promise<void> {
	bot.on('interactionCreate', i => {
		if (i.isMessageComponent()) routeComponentInteraction(bot, i);
	});
	bot.on('messageReactionAdd', (reaction, user) => handleUserReaction(bot, reaction.message.embeds[0].description, reaction.emoji.name, user.id));
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
