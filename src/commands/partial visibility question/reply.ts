import { PVQuestion } from '@lib/types/PVQuestion';
import { BOT, DB } from '@root/config';
import { Command } from '@lib/types/Command';
import { MessageEmbed, TextChannel, CommandInteraction, ApplicationCommandOptionData } from 'discord.js';
import { generateErrorEmbed } from '@lib/utils/generalUtils';


export default class extends Command {

	description = `Reply to a question you previously asked with ${BOT.NAME}.`;
	options: ApplicationCommandOptionData[] = [
		{
			name: 'questionid',
			description: 'The ID of the question you would like to reply to',
			type: ApplicationCommandOptionType.String,
			required: true
		},
		{
			name: 'response',
			description: 'What you would like to reply with',
			type: ApplicationCommandOptionType.String,
			required: true
		},
		{
			name: 'file',
			description: 'A file to be posted with the reply',
			type: 'ATTACHMENT',
			required: false
		}
***REMOVED***

	async run(interaction: CommandInteraction): Promise<InteractionResponse<boolean> | void> {
		const id = (interaction.options as CommandInteractionOptionResolver).getString('questionid');
		const file = (interaction.options as CommandInteractionOptionResolver).getAttachment('file');
		const question: PVQuestion = await interaction.client.mongo.collection(DB.PVQ).findOne({ questionId: id });

		if (!question || question.type === 'private') {
			return interaction.reply({ embeds: [generateErrorEmbed(`Could not find an *anonymous* question with an ID of **${id}**.`)], ephemeral: true });
		}
		if (question.owner !== interaction.user.id) {
			return interaction.reply({ embeds: [generateErrorEmbed(`You are not the owner of question ID ${question.questionId}.`)], ephemeral: true });
		}

		const [, channelId] = question.messageLink.match(/\d\/(\d+)\//);
		const channel = await interaction.client.channels.fetch(channelId) as TextChannel;

		const embed = new MessageEmbed()
			.setAuthor(`Anonymous responded to ${question.questionId}`, interaction.client.user.avatarURL())
			.setDescription(`${(interaction.options as CommandInteractionOptionResolver).getString('response')}\n\n[Jump to question](${question.messageLink})`);

		if (file) embed.setImage(file.url);

		channel.send({ embeds: [embed] });

		interaction.reply({ content: 'I\'ve forwarded your message along.', ephemeral: true });
	}

}
