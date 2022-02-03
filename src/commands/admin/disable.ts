import { ApplicationCommandOptionData, ApplicationCommandPermissionData, CommandInteraction, Formatters, Message } from 'discord.js';
import { BOTMASTER_PERMS } from '@lib/permissions';
import { getCommand } from '@lib/utils';
import { SageData } from '@lib/types/SageData';
import { DB } from '@root/config';
import { Command } from '@lib/types/Command';

export default class extends Command {

	description = 'Disable a command';
	tempPermissions: ApplicationCommandPermissionData[] = [BOTMASTER_PERMS***REMOVED***

	options: ApplicationCommandOptionData[] = [{
		name: 'command',
		description: 'The name of the command to be disabled.',
		type: 'STRING',
		required: true
	}]

	async tempRun(interaction: CommandInteraction): Promise<void> {
		const commandInput = interaction.options.getString('command');
		const command = getCommand(interaction.client, commandInput);

		//	check if command exists or is already disabled
		if (!command) return interaction.reply(`I couldn't find a command called \`${command}\``);
		if (command.enabled === false) return interaction.reply(`${command.name} is already disabled.`);

		if (command.name === 'enable' || command.name === 'disable') {
			return interaction.reply('Sorry fam, you can\'t disable that one.');
		}

		command.enabled = false;
		interaction.client.commands.set(command.name, command);

		const { commandSettings } = await interaction.client.mongo.collection(DB.CLIENT_DATA).findOne({ _id: interaction.client.user.id }) as SageData;
		commandSettings[commandSettings.findIndex(cmd => cmd.name === command.name)] = { name: command.name, enabled: false ***REMOVED***
		interaction.client.mongo.collection(DB.CLIENT_DATA).updateOne(
			{ _id: interaction.client.user.id },
			{ $set: { commandSettings } },
			{ upsert: true }
		);

		return interaction.reply(Formatters.codeBlock('diff', `->>> ${command.name} Disabled`));
	}

	run(_msg: Message): Promise<void> { return; }

}
