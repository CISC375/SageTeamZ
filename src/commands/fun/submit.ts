import { ApplicationCommandOptionData, CommandInteraction, MessageEmbed, TextChannel } from 'discord.js';
import { CHANNELS } from '@root/config';
import { Command } from '@lib/types/Command';

export default class extends Command {

	description = 'Submit an image to the current contest. After using this command upload an image in another message'; // lol thanks 100 char limit
	options: ApplicationCommandOptionData[] = [
		{
			name: 'file',
			description: 'A file to be submitted',
			type: 'ATTACHMENT',
			required: true
		},
		{
			name: 'description',
			description: 'Description of your submission',
			type: ApplicationCommandOptionType.String,
			required: false
		}
***REMOVED***

	async run(interaction: CommandInteraction): Promise<InteractionResponse<boolean> | void> {
		const submissionChannel = await interaction.client.channels.fetch(CHANNELS.FEEDBACK) as TextChannel;
		const file = (interaction.options as CommandInteractionOptionResolver).getAttachment('file');
		const description = (interaction.options as CommandInteractionOptionResolver).getString('description');

		const embed = new MessageEmbed()
			.setAuthor(interaction.user.tag, interaction.user.avatarURL({ dynamic: true }))
			.setTitle('New contest submission')
			.addField('URL', file.url)
			.setImage(file.url)
			.setColor('BLUE')
			.setTimestamp();

		if (description) embed.setDescription(description);
		submissionChannel.send({ embeds: [embed] }).then(() => interaction.reply({ content: `Thanks for your submission, ${interaction.user.username}!` }));
	}

}
