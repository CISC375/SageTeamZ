import { Command } from '@lib/types/Command';
import { CHANNELS, MAINTAINERS } from '@root/config';
import { EmbedBuilder, TextChannel, ChatInputCommandInteraction, ApplicationCommandOptionData,
	ApplicationCommandOptionType, InteractionResponse, Message } from 'discord.js';

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
		const file = interaction.options.getAttachment('file');
		const feedbackChannel = await interaction.guild.channels.fetch(CHANNELS.FEEDBACK) as TextChannel;

		// Setup the embed to be send to the desired channel
		const embed = new EmbedBuilder()
			.setAuthor({ name: interaction.user.tag, iconURL: interaction.user.avatarURL() })
			.setTitle('New Feedback')
			.setDescription(feedback)
			.setColor('DarkGreen')
			.setTimestamp();

		if (file) embed.setImage(file.url);
		// react to the sent embed with the thumbs up and thumbs down emojis
		const message = await feedbackChannel.send({ embeds: [embed] }) as Message;
		await message.react('👍');
		await message.react('👎');

		// Response to the user in the channel that the command was used in
		return interaction.reply({ content: `Thanks! I've sent your feedback to ${MAINTAINERS}.`, ephemeral: true });
	}

}
