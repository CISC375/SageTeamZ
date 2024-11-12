/* eslint-disable no-mixed-spaces-and-tabs */
// basic modal command
import { Command } from '@lib/types/Command';
import { CHANNELS, MAINTAINERS } from '@root/config';
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
		const modal = new ModalBuilder()
      		.setCustomId('recModal')
      		.setTitle('My Modal');

   		 const favoriteColorInput = new TextInputBuilder()
      		.setCustomId('favoriteColor')
      		.setLabel('What is your favorite color?')
      		.setStyle(TextInputStyle.Short);

    	const firstActionRow = new ActionRowBuilder<TextInputBuilder>().addComponents(favoriteColorInput);

    	modal.addComponents(firstActionRow);

    	await interaction.showModal(modal);
	}

}
