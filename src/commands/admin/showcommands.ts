import { ApplicationCommandPermissionData, CommandInteraction, Formatters } from 'discord.js';
import { BOTMASTER_PERMS } from '@lib/permissions';
import { Command } from '@lib/types/Command';

export default class extends Command {

	description = 'Show all commands, including disable commands.';
	permissions: ApplicationCommandPermissionData[] = BOTMASTER_PERMS;

	async run(interaction: CommandInteraction): Promise<void> {
		let commands = '+ Enabled\n- Disabled\n';

		interaction.client.commands.forEach(command => {
			commands += `\n${command.enabled === false ? '-' : '+'} ${command.name}`;
		});

		return interaction.reply(Formatters.codeBlock('diff', commands));
	}

}
