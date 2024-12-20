import { Command } from '@lib/types/Command';
import { DB, CHANNELS, MAINTAINERS } from '@root/config';
import { EmbedBuilder, TextChannel, ChatInputCommandInteraction, ApplicationCommandOptionData,
	ApplicationCommandOptionType, InteractionResponse, Message } from 'discord.js';
import { updateCommandWeight } from '@root/src/lib/utils/generalUtils';
import { Double } from 'mongodb';

export default class extends Command {

	description = 'Command that allows users to vote on public feedback messages';

	options: ApplicationCommandOptionData[] = [
		{
			name: 'feedback',
			description: 'feedback to be sent to the public feedback review channel',
			type: ApplicationCommandOptionType.String,
			required: true
		},
		{
			name: 'command',
			description: 'The command that you want to give feedback on',
			type: ApplicationCommandOptionType.String,
			required: true
		},
		{
			name: 'feedbacktype',
			description: 'What type of feedback is this? Positive or Negative?',
			type: ApplicationCommandOptionType.String,
			required: true,
			choices: [
				{ name: 'positive', value: 'positive' },
				{ name: 'negative', value: 'negative' }
			]
		},
		{
			name: 'file',
			description: 'A file to be posted with the feedback',
			type: ApplicationCommandOptionType.Attachment,
			required: false
		}
	]

	// need to apply an error if the user uses the command outside of the feedback channels
	async run(interaction:ChatInputCommandInteraction): Promise<InteractionResponse<boolean>> {
		// Gets in the user's inputs for the feedback and file
		const feedback = interaction.options.getString('feedback');
		const command = interaction.options.getString('command');
		const feedbackType = interaction.options.getString('feedbacktype');
		const file = interaction.options.getAttachment('file');
		const feedbackChannel = await interaction.guild.channels.fetch(CHANNELS.FEEDBACK) as TextChannel;

		// Setup the embed to be send to the desired channel
		const embed = new EmbedBuilder()
			.setAuthor({ name: interaction.user.tag, iconURL: interaction.user.avatarURL() })
			.setTitle('New Feedback')
			.setDescription(feedback)
			.setFooter({ text: `Command: ${command}, Feedback Type: ${feedbackType.charAt(0).toUpperCase() + feedbackType.slice(1)}` })
			.setColor(feedbackType === 'positive' ? 'Green' : 'Red')
			.setTimestamp();

		if (file) embed.setImage(file.url);

		const commandDB: any[] = await interaction.client.mongo.collection(DB.CLIENT_DATA).find().toArray();
		const bot = interaction.client;
		const weightChangePositive = new Double(1.2);
		const weightChangeNegative = new Double(0.8);
		if (feedbackType === 'positive') {
			// Weight = Weight * 1.2
			updateCommandWeight(bot, command, weightChangePositive);
		} else {
			// Weight = Weight * 0.8
			updateCommandWeight(bot, command, weightChangeNegative);
		}

		// react to the sent embed with the thumbs up and thumbs down emojis
		const message = await feedbackChannel.send({ embeds: [embed] }) as Message;
		await message.react('👍');
		await message.react('👎');

		return interaction.reply({ content: `Thanks! I've sent your feedback to ${MAINTAINERS}.`, ephemeral: true });
	}

}
