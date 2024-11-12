/* eslint-disable no-mixed-spaces-and-tabs */
// basic modal command
import { Command } from '@lib/types/Command';
import { CHANNELS, DB, MAINTAINERS } from '@root/config';
import { SageUser } from '@root/src/lib/types/SageUser';
import { EmbedBuilder, TextChannel, ChatInputCommandInteraction, ApplicationCommandOptionData,
	ApplicationCommandOptionType, InteractionResponse, Message,
	ModalBuilder,
	ActionRowBuilder,
	TextInputBuilder,
	TextInputStyle } from 'discord.js';

export default class extends Command {

	description = 'Command that allows users to change their recommendations';


	// need to apply an error if the user uses the command outside of the feedback channels
	// eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
	async run(interaction:ChatInputCommandInteraction) {
		const sender: SageUser = await interaction.client.mongo.collection(DB.USERS).findOne({ discordId: interaction.user.id });
		const modal = new ModalBuilder()
      		.setCustomId('recModal')
      		.setTitle('Recommendations Modal');
		const reccTypeInput = new TextInputBuilder()
			.setValue('')
			.setCustomId('reccType')
			.setPlaceholder(`Announcements/Last Channel/DM/None (Current: ${sender.personalizeRec.reccType})`)
			.setLabel('Would you like to change the reccomendations?')
			.setStyle(TextInputStyle.Short);
		const frequencyInput = new TextInputBuilder()
			.setValue('')
      		.setCustomId('frequency')
			.setPlaceholder(`Aggressive/Passive (Current: ${sender.personalizeRec.frequency})`)
      		.setLabel('Would you like to change the tone?')
      		.setStyle(TextInputStyle.Short);
   		const toneInput = new TextInputBuilder()
			.setValue('')
      		.setCustomId('tone')
			.setPlaceholder(`casual/formal (Current: ${sender.personalizeRec.tone})`)
      		.setLabel('Would you like to change the tone?')
      		.setStyle(TextInputStyle.Short);
		const scheduledInput = new TextInputBuilder()
			.setValue('')
			.setCustomId('scheduled')
			.setPlaceholder(`Random/Daily/Weekends (Current: ${sender.personalizeRec.scheduled})`)
			.setLabel('Would you like to change the schedule?')
			.setStyle(TextInputStyle.Short);
    	const firstActionRow = new ActionRowBuilder<TextInputBuilder>().addComponents(reccTypeInput);
		const secondActionRow = new ActionRowBuilder<TextInputBuilder>().addComponents(frequencyInput);
		const thirdActionRow = new ActionRowBuilder<TextInputBuilder>().addComponents(toneInput);
		const fourthActionRow = new ActionRowBuilder<TextInputBuilder>().addComponents(scheduledInput);


    	modal.addComponents(firstActionRow, secondActionRow, thirdActionRow, fourthActionRow);

    	await interaction.showModal(modal);
	}

}

