import { ApplicationCommandOptionData, ApplicationCommandPermissionData, CommandInteraction, Formatters, Message } from 'discord.js';
import { BOTMASTER_PERMS } from '@lib/permissions';
import { Command } from '@lib/types/Command';

export default class extends Command {

	aliases = ['ls', 'listcmd'***REMOVED***
	description = 'Show all commands, including disable commands.';
	tempPermissions: ApplicationCommandPermissionData[] = [BOTMASTER_PERMS***REMOVED***

	options: ApplicationCommandOptionData[] = [{
		name: 'restricted',
		description: 'Use this argument to see the list of restricted commands.',
		type: 'BOOLEAN',
		required: false
	}]

	async tempRun(interaction: CommandInteraction): Promise<void> {
		const restricted = interaction.options.getBoolean('restricted');
		if (restricted) {
			/*
			let commands = '[ Restricted ]\n.Unrestricted\n';
			interaction.client.commands.forEach(command => {
				commands += `\n${command.restricted === true ? `[ ${command.name} ]` : `.${command.name}`} `;
			});
			return interaction.reply(Formatters.codeBlock('css', commands));
			*/
			return interaction.reply('restricted works');
		}
		let commands = '+ Enabled\n- Disabled\n';

		interaction.client.commands.forEach(command => {
			commands += `\n${command.enabled === false ? '-' : '+'} ${command.name}`;
		});

		return interaction.reply(Formatters.codeBlock('diff', commands));
	}

	run(msg: Message): Promise<Message> {
		let commands = '+ Enabled\n- Disabled\n';

		msg.client.commands.forEach(command => {
			commands += `\n${command.enabled === false ? '-' : '+'} ${command.name}`;
		});

		return msg.channel.send(Formatters.codeBlock('diff', commands));
	}

}
