import { CommandInteraction } from 'discord.js';
import { Command } from '@lib/types/Command';
import prettyMilliseconds from 'pretty-ms';

export default class extends Command {

	description = 'Runs a connection test to Discord';

	// left in for the export default
	async run(): Promise<void> {
		return;
	}

	async tempRun(interaction: CommandInteraction): Promise<void> {
		const msgTime = new Date().getTime();
		await interaction.reply('Ping?');
		interaction.editReply(`Pong! Round trip took ${prettyMilliseconds(msgTime - interaction.createdTimestamp)}, REST ping ${interaction.client.ws.ping}ms.`);
		return;
	}

}
