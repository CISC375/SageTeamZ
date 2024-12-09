import { ADMIN_PERMS, BOTMASTER_PERMS } from '@lib/permissions';
import { RequestError } from '@octokit/types';
import { BOT, DB, GITHUB_PROJECT } from '@root/config';
import { Command } from '@lib/types/Command';
import { ApplicationCommandOptionData, ApplicationCommandOptionType, ApplicationCommandPermissions, ChatInputCommandInteraction, EmbedBuilder, InteractionResponse } from 'discord.js';
import { SageUser } from '@root/src/lib/types/SageUser';

export default class extends Command {

	description = `Creates an issue in ${BOT.NAME}'s repository.`;
	permissions: ApplicationCommandPermissions[] = [ADMIN_PERMS];

	options: ApplicationCommandOptionData[] = [{
		name: 'title',
		description: 'What\'s the issue?',
		type: ApplicationCommandOptionType.String,
		required: true
	},
	{
		name: 'labels',
		description: 'The issue labels, in a comma-separated list (if multiple).',
		type: ApplicationCommandOptionType.String,
		required: false
	},
	{
		name: 'body',
		description: 'The issue body',
		type: ApplicationCommandOptionType.String,
		required: false
	}]

	async run(interaction: ChatInputCommandInteraction): Promise<InteractionResponse<boolean> | void> {
		const title = interaction.options.getString('title');
		const label = interaction.options.getString('labels');
		const body = interaction.options.getString('body');

		const labels = label ? label.split(', ') : [];

		const newIssue = await interaction.client.octokit.issues.create({
			owner: 'ud-cis-discord',
			repo: GITHUB_PROJECT,
			title: title,
			labels: labels,
			body: body || `\n\n<sub>Created by ${interaction.user.username} via ${BOT.NAME}</sub>`
		}).catch(response => {
			console.log(response);
			let errormsg = '';
			const { errors } = response as RequestError;
			errors.forEach((error: { code; field; }) => {
				errormsg += `Value ${error.code} for field ${error.field}.\n`;
			});
			interaction.reply({ content: `Issue creation failed. (HTTP Error ${response.status})
			\`\`\`diff
			-${errormsg}\`\`\``, ephemeral: true });
		});
		if (newIssue) {
			return interaction.reply(`I've created your issue at <${newIssue.data.html_url}>`);
		} else {
			return interaction.reply('Something went horribly wrong with issue creation! Blame Josh.');
		}
	}

}

export default class extends Command {

	name = 'groupab';
	description = 'Display information about Groups A and B';
	category = 'info';
	enabled: true;
	runInGuild: true;
	runInDM: false;
	permissions?: ApplicationCommandPermissions[] = BOTMASTER_PERMS;


	async run(interaction: ChatInputCommandInteraction): Promise<InteractionResponse<boolean>> {
		const users = await interaction.client.mongo.collection(DB.USERS).find({}).toArray();
		const groupA = users.filter((user: SageUser) => user.personalizeRec.frequency === 'aggressive');
		const groupB = users.filter((user: SageUser) => user.personalizeRec.frequency !== 'aggressive');

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
			group.flatMap(user => user.commandUsage ? user.commandUsage.map(cmd => cmd.commandName) : []
			)
		);
		return `${uniqueCommands.size} unique commands used`;
	}

}
