import { ApplicationCommandOptionData, CommandInteraction, EmbedField, Message, MessageEmbed } from 'discord.js';
import { Course } from '@lib/types/Course';
import { QuestionTag } from '@lib/types/QuestionTag';
import { SageUser } from '@lib/types/SageUser';
import { BOT, DB, MAINTAINERS, PREFIX } from '@root/config';
import { Command } from '@lib/types/Command';

export default class extends Command {

	description = 'Filters the questionTags collection for a given class and assignment';
	extendedHelp = `${BOT.NAME} will automatically determine your course if you are only enrolled in one!`;
	usage = '[courseID] <assignmentID>';
	options: ApplicationCommandOptionData[] = [
		{
			name: 'assignment',
			description: 'The ID of the assignment to filter questions from',
			type: 'STRING',
			required: true
		},
		{
			name: 'course',
			description: 'What course would you like to filter questions from?',
			type: 'STRING',
			required: false
		}
***REMOVED***

	// never assume that students are not dumb

	run(_msg: Message): Promise<void> { return; }

	async tempRun(interaction: CommandInteraction): Promise<void> {
		const user: SageUser = await interaction.client.mongo.collection(DB.USERS).findOne({ discordId: interaction.user.id });

		if (!user) {
			const responseEmbed = new MessageEmbed()
				.setTitle(`Error`)
				.setDescription(`Something went wrong. Please contact ${MAINTAINERS}`)
				.setColor('#ff0000');
			return interaction.reply({ embeds: [responseEmbed], ephemeral: true });
		}

		let course: Course;
		const assignment = interaction.options.getString('assignment');
		const courses: Array<Course> = await interaction.client.mongo.collection(DB.COURSES).find().toArray();

		if (user.courses.length === 1) {
			course = courses.find(c => c.name === user.courses[0]);
		} else {
			const inputtedCourse = courses.find(c => c.name === interaction.options.getString('course'));
			if (!inputtedCourse) {
				const responseEmbed = new MessageEmbed()
					.setTitle(`Argument error`)
					.setDescription('I wasn\'t able to determine your course based off of your enrollment or your input. Please specify the course at the beginning of your question.' +
					`\nAvailable courses: \`${courses.map(c => c.name).sort().join('`, `')}\``)
					.setColor('#ff0000');
				return interaction.reply({ embeds: [responseEmbed], ephemeral: true });
			}
			course = inputtedCourse;
		}

		if (!course.assignments.includes(assignment)) {
			const responseEmbed = new MessageEmbed()
				.setTitle(`Argument error`)
				.setDescription(`I couldn't find an assignment called **${assignment}** for CISC ${course.name}\n` +
				`Assignments for CISC ${course.name}: ${course.assignments.length > 0 ? `\`${course.assignments.join('`, `')}\``
					: 'It looks like there aren\'t any yet, ask a staff member to add some.'}`)
				.setColor('#ff0000');
			return interaction.reply({ embeds: [responseEmbed], ephemeral: true });
		}

		const entries: Array<QuestionTag> = await interaction.client.mongo.collection(DB.QTAGS).find({ course: course, assignment: assignment }).toArray();
		const fields: Array<EmbedField> = [***REMOVED***
		if (entries.length === 0) {
			return interaction.reply({ content: `There are no questions for ${course}, ${assignment}.
		To add questions, use the tag command (\`/help tag\`)`.replace('\t', ''), ephemeral: true });
		}
		entries.forEach(doc => {
			fields.push({ name: doc.header.replace(/\n/g, ' '), value: `[Click to view](${doc.link})`, inline: false });
		});
		const embeds: Array<MessageEmbed> = [new MessageEmbed()
			.setTitle(`Questions for ${course} ${assignment}`)
			.addFields(fields.splice(0, 25))
			.setColor('DARK_AQUA')***REMOVED***

		while (fields.length > 0) {
			embeds.push(new MessageEmbed()
				.addFields(fields.splice(0, 25))
				.setColor('DARK_AQUA'));
		}

		return interaction.reply({ embeds: embeds, ephemeral: true });
	}

}
