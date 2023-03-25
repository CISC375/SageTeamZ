import { ADMIN_PERMS, STAFF_PERMS } from '@lib/permissions';
import { Command } from '@lib/types/Command';
import { BOT } from '@root/config';
import { MessageEmbed, ApplicationCommandPermissions, ApplicationCommandOptionData, CommandInteraction } from 'discord.js';

export default class extends Command {

	permissions: ApplicationCommandPermissions[] = [STAFF_PERMS, ADMIN_PERMS***REMOVED***
	description = `Have ${BOT.NAME} google something for someone`;
	options: ApplicationCommandOptionData[] = [
		{
			name: 'query',
			type: ApplicationCommandOptionType.String,
			description: `What you'd like ${BOT.NAME} to Google for someone!`,
			required: true
		}
***REMOVED***;

	run(interaction: CommandInteraction): Promise<void> {
		const query = (interaction.options as CommandInteractionOptionResolver).getString('query');
		const formatted = query.replace(new RegExp(' ', 'g'), '+').replace('%', '%25');
		const link = `https://letmegooglethat.com/?q=${formatted}`;
		const embed = new MessageEmbed({
			description: `[Let me Google that for you!](${link})`,
			color: 'LUMINOUS_VIVID_PINK'
		});
		return interaction.reply({ embeds: [embed] });
	}

}
