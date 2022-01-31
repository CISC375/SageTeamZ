import { PVQuestion } from '@lib/types/PVQuestion';
import { BOT, DB, MAINTAINERS } from '@root/config';
import { ADMIN_PERMS, staffPerms, STAFF_PERMS } from '@lib/permissions';
import { ApplicationCommandOptionData, ApplicationCommandPermissionData, CommandInteraction, GuildChannel, Message, MessageEmbed, TextChannel, ThreadChannel } from 'discord.js';
import { Command } from '@lib/types/Command';
import { Course } from '@lib/types/Course';

export default class extends Command {

	description = `Reply to a question asked through ${BOT.NAME}.`;
	usage = '<questionID> <response>';
	extendedHelp = 'Responses get sent to the askers DMs. This command will tell you it failed if it cannot send the DM.';
	runInDM = false;

	options: ApplicationCommandOptionData[] = [
		{
			name: 'questionid',
			description: 'ID of question you are replying to',
			type: 'INTEGER',
			required: true
		},
		{
			name: 'response',
			description: 'Response to the question',
			type: 'STRING',
			required: true
		}
***REMOVED***

	tempPermissions: ApplicationCommandPermissionData[] = [STAFF_PERMS, ADMIN_PERMS***REMOVED***

	async tempRun(interaction: CommandInteraction): Promise<Message | void> {
		const question: PVQuestion = await interaction.client.mongo.collection<PVQuestion>(DB.PVQ)
			.findOne({ questionId: `${interaction.options.getInteger('questionid')}` });
		const response = interaction.options.getString('response');
		const bot = interaction.client;

		if (interaction.channel.type !== 'GUILD_TEXT') {
			return interaction.reply({
				content: `Something went wrong. Please contact ${MAINTAINERS} for help.`, ephemeral: true
			});
		}

		const channel = interaction.channel as TextChannel;

		const course = await bot.mongo.collection<Course>(DB.COURSES).findOne({ 'channels.category': channel.parentId });

		if (question.type === 'private') {
			const splitLink = question.messageLink.split('/');
			const threadId = splitLink[splitLink.length - 2***REMOVED***
			return interaction.reply({
				content: `\`/sudoreply\` has been depreciated for private questions. Please reply in thread <#${threadId}>.`,
				ephemeral: true
			});
		}

		const courseGeneral = (await bot.channels.fetch(course.channels.general)) as GuildChannel;
		let privThread: ThreadChannel;
		if (courseGeneral.isText()) {
			privThread = await courseGeneral.threads.create({
				name: `${interaction.user.username}‘s private question (${question.questionId})'`,
				autoArchiveDuration: 4320,
				reason: `${interaction.user.username} asked a private question`,
				type: `GUILD_PRIVATE_THREAD`
			});
		} else {
			throw `Something went wrong creating ${interaction.user.username}'s private thread. Please contact ${MAINTAINERS} for assistance!'`;
		}

		privThread.guild.members.fetch();
		privThread.members.add(interaction.user.id);
		privThread.members.add(question.owner);

		const embed = new MessageEmbed()
			.setDescription(`I've sent your response to this thread: <#${privThread.id}>\n\n Please have any further conversation there.`);

		await interaction.reply({
			embeds: [embed]
		});

		const asker = await interaction.guild.members.fetch(question.owner);

		embed.setDescription(`${question.messageLink}`);
		embed.setTitle(`${asker.user.tag}'s Question`);
		embed.setFooter(`When you're done with this question, you can send \`/archive\` to close it`);
		await privThread.send({
			embeds: [embed]
		});

		const threadEmbed = new MessageEmbed()
			.setAuthor(`${interaction.user.tag}`, interaction.user.avatarURL())
			.setDescription(response)
			.setFooter(`Please have any further conversation in this thread!`);

		return privThread.send({ embeds: [threadEmbed] });
	}

	permissions(msg: Message): boolean {
		return staffPerms(msg);
	}

	async run(_msg: Message): Promise<Message> { return; }

	async argParser(msg: Message, input: string): Promise<[PVQuestion, string]> {
		const question: PVQuestion = await msg.client.mongo.collection(DB.PVQ).findOne({ questionId: input.split(' ')[0] });

		if (!question) throw `Could not find question with an ID of **${input.split(' ')[0]}**.`;

		return [question, input.slice(question.questionId.length).trim()***REMOVED***
	}

}
