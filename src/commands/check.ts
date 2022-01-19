import { MessageEmbed, CommandInteraction, ApplicationCommandOptionData } from 'discord.js';
import { SageUser } from '@lib/types/SageUser';
import { DB, MAINTAINERS } from '@root/config';
import { Command } from '@lib/types/Command';

export default class extends Command {

	description = `Displays the users current message count. Use \`/check here\` to send in the current channel`;
	usage = '[here]';

	options: ApplicationCommandOptionData[] = [
		{
			name: 'here',
			description: 'determines if you want stats sent here or in DMs',
			type: 'BOOLEAN',
			required: false
		}
***REMOVED***

	async tempRun(interaction: CommandInteraction): Promise<void> {
		const user: SageUser = await interaction.user.client.mongo.collection(DB.USERS).findOne({ discordId: interaction.user.id });

		if (!user) {
			interaction.reply(`I couldn't find you in the database, if you think this is an error please contact ${MAINTAINERS}.`);
			return;
		}

		const embed = new MessageEmbed()
			.setTitle(`${interaction.user.username}'s Progress`)
			.setThumbnail(interaction.user.avatarURL())
			.addField('Message Count', `You have sent **${user.count}** message${user.count === 1 ? '' : 's'} this week in academic course channels.`, true)
			.addField('Level Progress', `You're **${user.curExp}** message${user.curExp === 1 ? '' : 's'} away from **Level ${user.level + 1}**
			${this.progressBar(user.levelExp - user.curExp, user.levelExp, 18)}`, false);
		if (interaction.options.getBoolean('here') === true) {
			interaction.reply({ embeds: [embed] });
		} else {
			interaction.user.send({ embeds: [embed] })
				.then(() => { if (interaction.channel.type !== 'DM') interaction.reply({ content: 'Your message count has been sent to your DMs.', ephemeral: true }); })
				.catch(() => interaction.reply({ content: 'I couldn\'t send you a DM. Please enable DMs and try again.', ephemeral: true }));
		}
		return;
	}

	async run(): Promise<void> {
		return;
	}

	progressBar(value: number, maxValue: number, size: number): string {
		const percentage = value / maxValue; // Calculate the percentage of the bar
		const progress = Math.round(size * percentage); // Calculate the number of square caracters to fill the progress side.
		const emptyProgress = size - progress; // Calculate the number of dash caracters to fill the empty progress side.

		const progressText = `${'🟩'.repeat(Math.max(progress - 1, 0))}✅`; // Repeat is creating a string with progress * caracters in it
		const emptyProgressText = '⚫'.repeat(emptyProgress); // Repeat is creating a string with empty progress * caracters in it
		const percentageText = `${Math.round(percentage * 100)}%`; // Displaying the percentage of the bar

		return `${progressText}${emptyProgressText} **${percentageText}**`;
	}

}
