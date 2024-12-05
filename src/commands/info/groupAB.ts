import { ChatInputCommandInteraction, EmbedBuilder, InteractionResponse } from 'discord.js';
import { Command } from '@lib/types/Command';
import { SageUser } from '@root/src/lib/types/SageUser';
import { DB } from '@root/config';

export default class extends Command {

	description = 'Display information about Groups A and B';

	async run(interaction: ChatInputCommandInteraction): Promise<InteractionResponse<boolean> | void> {
		const users = await interaction.client.mongo.collection(DB.USERS).find({}).toArray();
		const groupA = users.filter(user => user.group === 'A');
		const groupB = users.filter(user => user.group === 'B');

		const info = `
			## Group Information 
			### Group A (Aggressive Recommendations)
			- Members: ${groupA.length} 
			- Engagement Rate: ${this.calculateEngagementRate(groupA)}% 
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

	private calculateEngagementRate(group: SageUser[]): number {
		const engagedUsers = group.filter(user =>
			user.commandUsage && user.commandUsage.some(cmd => cmd.commandCount > 0)
		);
		return (engagedUsers.length / group.length) * 100;
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
