import { ApplicationCommandOptionData, CommandInteraction, EmbedField, MessageEmbed, TextChannel, Util } from 'discord.js';
import { getCommand } from '@lib/utils';
import { BOT, CHANNELS, PREFIX } from '@root/config';
import { Command } from '@lib/types/Command';

export default class extends Command {

	description = `Provides info about all ${BOT.NAME} commands`;
	usage = '[command]';
	extendedHelp = 'If given no arguments, a list of all commands you have access to will be sent to your DMs';

	options: ApplicationCommandOptionData[] = [
		{
			name: 'cmd',
			description: 'command you would like to know more about',
			type: 'STRING',
			required: false
		}
***REMOVED***

	async tempRun(interaction: CommandInteraction): Promise<void> {
		const cmd = interaction.options.getString('cmd');
		const { commands } = interaction.client;
		const website = 'https://ud-cis-discord.github.io/pages/commands';
		const channel = await interaction.guild.channels.fetch(CHANNELS.SAGE) as TextChannel;

		if (cmd) {
			const command = getCommand(interaction.client, cmd);
			if (!command) {
				return interaction.reply(`**${cmd}** is not a valid command.`);
			}

			const fields: Array<EmbedField> = [***REMOVED***
			fields.push({
				name: 'Usage',
				value: `${PREFIX}${command.name} ${command.usage ? command.usage : ''}`,
				inline: true
			});

			if (command.extendedHelp) {
				fields.push({
					name: 'Extended Help',
					value: command.extendedHelp,
					inline: false
				});
			}

			fields.push({
				name: 'More commands',
				value: `[Visit our website!](${website})`,
				inline: false
			});

			const embed = new MessageEmbed()
				.setTitle(command.name)
				.setDescription(command.description ? command.description : '')
				.addFields(fields)
				.setThumbnail(interaction.client.user.avatarURL())
				.setTimestamp(Date.now())
				.setColor('RANDOM');

			channel.send({ embeds: [embed] });
			return interaction.reply({ content: 'Help sent!', ephemeral: true });
		} else {
			// if no command given
			let helpStr = `You can do \`/help <command>\` to get more information about any command, or you can visit our website here:\n<${website}>\n`;
			const categories: Array<string> = [***REMOVED***
			commands.forEach(command => {
				if (!categories.includes(command.category)) categories.push(command.category);
			});

			categories.forEach(cat => {
				const useableCmds = commands.filter(command =>
					command.category === cat
					&& (command.enabled !== false));
				const categoryName = cat === 'commands' ? 'General' : `${cat[0].toUpperCase()}${cat.slice(1)}`;
				if (useableCmds.size > 0) {
					helpStr += `\n**${categoryName} Commands**\n`;
					useableCmds.forEach(command => {
						helpStr += `\`${PREFIX}${command.name}\` ⇒ ${command.description ? command.description : 'No description provided'}\n`;
					});
				}
			});

			const splitStr = Util.splitMessage(helpStr, { char: '\n' });

			let part = 1;
			splitStr.forEach(helpMsg => {
				const embed = new MessageEmbed()
					.setTitle(`Commands Part ${part}`)
					.setDescription(helpMsg)
					.setColor('RANDOM');
				interaction.user.send({ embeds: [embed] });
				part++;
				if (part === 3) {
					interaction.reply({ content: 'Help sent!', ephemeral: true });
					return;
				}
			});
		}
	}
	async run(): Promise<void> {
		return;
	}

}
