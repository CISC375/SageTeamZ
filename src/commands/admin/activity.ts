import { ApplicationCommandOptionData, ApplicationCommandOptionType, ApplicationCommandPermissions, CommandInteraction, CommandInteractionOptionResolver, InteractionResponse } from 'discord.js';
import { BOT, DB } from '@root/config';
import { BOTMASTER_PERMS } from '@lib/permissions';
import { Command } from '@lib/types/Command';

const ACTIVITIES = ['Playing', 'Streaming', 'Listening', 'Watching', 'Competing'***REMOVED***

export default class extends Command {

	description = `Sets ${BOT.NAME}'s activity to the given status and content`;
	permissions: ApplicationCommandPermissions[] = BOTMASTER_PERMS;

	options: ApplicationCommandOptionData[] = [
		{
			name: 'status',
			description: 'The activity status.',
			type: ApplicationCommandOptionType.String,
			required: true,
			choices: ACTIVITIES.map((activity) => ({
				name: activity,
				value: activity
			}))
		},
		{
			name: 'content',
			description: 'The activity itself (ex: /help).',
			type: ApplicationCommandOptionType.String,
			required: true
		}
***REMOVED***

	async run(interaction: CommandInteraction): Promise<InteractionResponse<boolean> | void> {
		const bot = interaction.client;
		const content = (interaction.options as CommandInteractionOptionResolver).getString('category');
		const type = (interaction.options as CommandInteractionOptionResolver).getString('status').toUpperCase();

		// setting Sage's activity status in the guild
		// eslint-disable-next-line @typescript-eslint/ban-ts-comment
		// @ts-ignore - idk why TypeScript is complaining about this when it's literally the correct type
		bot.user.setActivity(content, { type });
		//	updating Sage's activity status in the database (so that it stays upon a restart)
		bot.mongo.collection(DB.CLIENT_DATA).updateOne(
			{ _id: bot.user.id },
			{ $set: { status: { type, content } } },
			{ upsert: true });

		interaction.reply({ content: `Set ${BOT.NAME}'s activity to *${type} ${content}*`, ephemeral: true });
	}

}
