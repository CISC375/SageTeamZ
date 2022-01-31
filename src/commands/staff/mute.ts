import { ADMIN_PERMS, staffPerms, STAFF_PERMS } from '@lib/permissions';
import { MAINTAINERS, ROLES } from '@root/config';
import { Message, ApplicationCommandPermissionData, CommandInteraction, ApplicationCommandOptionData } from 'discord.js';
import { Command } from '@lib/types/Command';

export default class extends Command {

	description = 'Gives the muted role to the given user.';
	usage = '<user>';
	runInDM = false;

	tempPermissions: ApplicationCommandPermissionData[] = [STAFF_PERMS, ADMIN_PERMS***REMOVED***

	options: ApplicationCommandOptionData[] = [
		{
			name: 'user',
			description: 'The user to mute',
			type: 'USER',
			required: true
		}
***REMOVED***

	async tempRun(interaction: CommandInteraction): Promise<void> {
		const user = interaction.options.getUser('user');
		const member = await interaction.guild.members.fetch(user.id);

		if (!member) {
			interaction.reply({ content: `Something went wrong. Please contact ${MAINTAINERS} for help.`, ephemeral: true });
			throw new Error('Could not find member based on passed in user');
		}

		if (member.roles.cache.has(ROLES.MUTED)) {
			const reason = `${member.user.username} was un-muted by ${interaction.user.tag} (${interaction.user.id})`;
			await member.roles.remove(ROLES.MUTED, reason);
			return interaction.reply({ content: `${member.user.username} has been un-muted.`, ephemeral: true });
		}
		const reason = `${member.user.username} was muted by ${interaction.user.tag} (${interaction.user.id})`;
		await member.roles.add(ROLES.MUTED, reason);
		return interaction.reply({ content: `${member.user.username} has been muted.`, ephemeral: true });
	}

	permissions(msg: Message): boolean {
		return staffPerms(msg);
	}

	async run(_msg: Message): Promise<Message> { return; }

}
