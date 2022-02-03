import { ApplicationCommandOptionData, ApplicationCommandPermissionData, CommandInteraction, Message } from 'discord.js';
import { BOTMASTER_PERMS } from '@lib/permissions';
import { getCommand } from '@root/src/lib/utils';
import { Command } from '@lib/types/Command';

export default class extends Command {

	description = 'Allows you always to run other commands.';
	extendedHelp = 'Sudo bypasses permission checks, disabled command checks and command location checks.';
	usage = '<command> [args]';
	tempPermissions: ApplicationCommandPermissionData[] = [BOTMASTER_PERMS***REMOVED***

	options: ApplicationCommandOptionData[] = [{
		name: 'command',
		description: 'The command you would like to sudo run.',
		type: 'STRING',
		required: true
	}]

	async tempRun(interaction: CommandInteraction): Promise<void> {
		const sudoArg = interaction.options.getString('command');
		const commandName = sudoArg.split(' ')[0***REMOVED***
		const command = getCommand(interaction.client, commandName);
		//	const args = sudoArg.slice(commandName.length, sudoArg.length).trim();

		if (!command) {
			throw `Invalid command name: \`${commandName}\``;
		}

		return command.tempRun(interaction);
	}

	async run(msg: Message, [command, unparsedArgs]: [Command, string]): Promise<unknown> {
		let args: Array<unknown>;
		if (command.argParser) {
			try {
				args = await command.argParser(msg, unparsedArgs);
			} catch (error) {
				msg.channel.send(error);
				return;
			}
		} else {
			args = [unparsedArgs***REMOVED***
		}

		return command.run(msg, args);
	}

	argParser(msg: Message, input: string): [Command, string] {
		const commandName = input.split(' ')[0***REMOVED***
		const command = getCommand(msg.client, commandName);
		if (!command) throw `sudo: Invalid command name: \`${commandName}\``;

		const args = input.slice(commandName.length, input.length).trim();

		return [command, args***REMOVED***
	}

}
