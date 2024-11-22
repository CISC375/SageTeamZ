/* eslint-disable no-mixed-spaces-and-tabs */
// basic modal command
import { Command } from '@lib/types/Command';
import { BOT, CHANNELS, DB, MAINTAINERS } from '@root/config';
import { BOTMASTER_PERMS } from '@root/src/lib/permissions';
import { SageUser } from '@root/src/lib/types/SageUser';
import { TextChannel, ApplicationCommandPermissions, ChatInputCommandInteraction, ApplicationCommandOptionData, ModalBuilder, ActionRowBuilder,
	ModalActionRowComponentBuilder, InteractionResponse, TextInputBuilder, TextInputStyle, ApplicationCommandOptionType } from 'discord.js';

export default class extends Command {

	description = `Command that allows users to change their recommendations`;
	// usage = '<messageLink>|<content>';
	// permissions: ApplicationCommandPermissions[] = BOTMASTER_PERMS;

	/* options: ApplicationCommandOptionData[] = [{
		name: 'msg_link',
		description: 'A message link',
		type: ApplicationCommandOptionType.String,
		required: true
	}]*/

	async run(interaction: ChatInputCommandInteraction): Promise<InteractionResponse<boolean> | void> {
		// const link = interaction.options.getString('msg_link');

		//	for discord canary users, links are different
		/* const newLink = link.replace('canary.', '');
		const match = newLink.match(/https:\/\/discord\.com\/channels\/(\d+)\/(\d+)\/(\d+)/);
		if (!match) return interaction.reply('Please provide a valid message link.');

		//	find the message
		const [,, channelID, messageID] = match;
		const message = await interaction.client.channels.fetch(channelID)
			.then((channel: TextChannel) => channel.messages.fetch(messageID))
			.catch(() => { throw 'I can\'t seem to find that message'; });

		// check if the message can be edited
		if (!message.editable) {
			return interaction.reply(
				{ content: `It seems I can't edit that message. You'll need to tag a message that was sent by me, ${BOT.NAME}`,
					ephemeral: true });
		}
		*/
		// const message = await interaction.client.users.fetch(interaction.user.id);
		// console.log(message);
		const sender: SageUser = await interaction.client.mongo.collection(DB.USERS).findOne({ discordId: interaction.user.id });
		const modal = new ModalBuilder()
      		.setCustomId('recommendationchanges')
      		.setTitle('Recommendations Modal');
		const reccTypeInput = new TextInputBuilder()
			.setValue('')
			.setCustomId('reccType')
			.setPlaceholder(`Announcements/Last Channel/DM/None (Current: ${sender.personalizeRec.reccType})`)
			.setLabel('Would you like to change the reccomendations?')
			.setStyle(TextInputStyle.Short)
			.setRequired(false);
		const frequencyInput = new TextInputBuilder()
			.setValue('')
      		.setCustomId('frequency')
			.setPlaceholder(`Aggressive/Passive (Current: ${sender.personalizeRec.frequency})`)
      		.setLabel('Would you like to change the tone?')
      		.setStyle(TextInputStyle.Short)
			.setRequired(false);
   		const toneInput = new TextInputBuilder()
			.setValue('')
      		.setCustomId('tone')
			.setPlaceholder(`casual/formal (Current: ${sender.personalizeRec.tone})`)
      		.setLabel('Would you like to change the tone?')
      		.setStyle(TextInputStyle.Short)
			.setRequired(false);
		const scheduledInput = new TextInputBuilder()
			.setValue('')
			.setCustomId('scheduled')
			.setPlaceholder(`Random/Daily/Weekends (Current: ${sender.personalizeRec.scheduled})`)
			.setLabel('Would you like to change the schedule?')
			.setStyle(TextInputStyle.Short)
			.setRequired(false);

		const modalRows: ActionRowBuilder<ModalActionRowComponentBuilder>[] = [
			new ActionRowBuilder<ModalActionRowComponentBuilder>().addComponents(reccTypeInput),
			new ActionRowBuilder<ModalActionRowComponentBuilder>().addComponents(frequencyInput),
			new ActionRowBuilder<ModalActionRowComponentBuilder>().addComponents(toneInput),
			new ActionRowBuilder<ModalActionRowComponentBuilder>().addComponents(scheduledInput)
		];
		modal.addComponents(...modalRows);

		await interaction.showModal(modal);
	}

}
/*

	description = 'Command that allows users to change their recommendations';
	permissions: ApplicationCommandPermissions[] = BOTMASTER_PERMS;


	// need to apply an error if the user uses the command outside of the feedback channels
	// eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
	async run(interaction: ChatInputCommandInteraction): Promise<InteractionResponse<boolean> | void> {
		console.log('ENTER COMMAND');
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
    	/*const firstActionRow = new ActionRowBuilder<TextInputBuilder>().addComponents(reccTypeInput);
		const secondActionRow = new ActionRowBuilder<TextInputBuilder>().addComponents(frequencyInput);
		const thirdActionRow = new ActionRowBuilder<TextInputBuilder>().addComponents(toneInput);
		const fourthActionRow = new ActionRowBuilder<TextInputBuilder>().addComponents(scheduledInput);*/
/*
		const modalRows: ActionRowBuilder<ModalActionRowComponentBuilder>[] = [
			new ActionRowBuilder<ModalActionRowComponentBuilder>().addComponents(reccTypeInput),
			new ActionRowBuilder<ModalActionRowComponentBuilder>().addComponents(frequencyInput),
			new ActionRowBuilder<ModalActionRowComponentBuilder>().addComponents(toneInput),
			new ActionRowBuilder<ModalActionRowComponentBuilder>().addComponents(scheduledInput)
		];
		modal.addComponents(...modalRows);
    	await interaction.showModal(modal);
		console.log('end moda;');
	}

}*/
