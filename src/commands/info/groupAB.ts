import { ChatInputCommandInteraction, EmbedBuilder, InteractionResponse } from 'discord.js';
import { Command } from '@lib/types/Command';
import { SageUser } from '@root/src/lib/types/SageUser';
import { DB } from '@root/config';

export default class extends Command {

	description = 'Display information about Groups A and B';
	name = 'groupab';
	category = 'info';
	enabled = true;
	runInDM = false;
	runInGuild = true;

	async run(interaction: ChatInputCommandInteraction): Promise<InteractionResponse<boolean> | void> {
		const users = await interaction.client.mongo.collection(DB.USERS).find({}).toArray();
		const groupA = users.filter((user) => user.personalizeRec && user.personalizeRec.frequency === 'aggressive');
		const groupB = users.filter((user) => user.personalizeRec && user.personalizeRec.frequency !== 'aggressive');

		const info = `
			## Group Information 
			### Group A (Aggressive Recommendations)
			- Members: ${groupA.length} 
			- Reccomendations Used: ${this.calculateReccsUsed(groupA)}% 
			### Group B (Diverse Recommendations)
			- Members: ${groupB.length}
			- Command Diversity: ${this.calculateCommandDiversity(groupB)} 
			For detailed user information, use the /userinfo command.`;
		const responseEmbed = new EmbedBuilder()
			.setColor('#add8e6')
			.setTitle('Group Information Report')
			.setDescription(info);

		return interaction.reply({ embeds: [responseEmbed], ephemeral: true });
	}

	private calculateReccsUsed(group: SageUser[]): number {
		let totalReccsUsed = 0;
		for (const user of group) {
			totalReccsUsed += user.personalizeRec.reccomendationsUsed || 0;
		}
		return totalReccsUsed;
	}

	private calculateCommandDiversity(group: SageUser[]): string {
		const uniqueCommands = new Set(
			group.flatMap(user =>
				user.commandUsage ? user.commandUsage.map(cmd => cmd.commandName) : []
			)
		);
		return `${uniqueCommands.size} unique commands used`;
	}

}

