import { ApplicationCommandOptionData, ApplicationCommandPermissionData, CommandInteraction, EmbedField, Message, MessageEmbed } from 'discord.js';
import { Course } from '@lib/types/Course';
import { ADMIN_PERMS, staffPerms, STAFF_PERMS } from '@lib/permissions';
import { DB } from '@root/config';
import { Command } from '@lib/types/Command';

export default class extends Command {

	// Never assume staff are not dumb (the reason this is so long)

	tempPermissions: ApplicationCommandPermissionData[] = [STAFF_PERMS, ADMIN_PERMS***REMOVED***

	description = 'Adds an assignment to a given course ID\'s assignment list';
	usage = '<course ID>|<assignmentID(s)>';
	runInDM = false;
	aliases = ['adda'***REMOVED***

	options: ApplicationCommandOptionData[] =[
		{
			name: 'course',
			description: 'The course ID to add an assignment to',
			type: 'STRING',
			required: true
		},
		{
			name: 'newassignments',
			description: 'A comma separated list of new assignments',
			type: 'STRING',
			required: true
		}
***REMOVED***

	permissions(msg: Message): boolean {
		return staffPerms(msg);
	}

	async tempRun(interaction: CommandInteraction): Promise<void> {
		const course = interaction.options.getString('course');
		const newAssignments = interaction.options.getString('newassignments').split(',').map(assign => assign.trim());
		const entry: Course = await interaction.client.mongo.collection(DB.COURSES).findOne({ name: course });

		const added: Array<string> = [***REMOVED***
		const failed: Array<string> = [***REMOVED***
		newAssignments.forEach(assignment => {
			if (entry.assignments.includes(assignment)) {
				failed.push(assignment);
			} else {
				added.push(assignment);
				entry.assignments.push(assignment);
			}
		});

		interaction.client.mongo.collection(DB.COURSES).updateOne({ name: course }, { $set: { ...entry } });

		const fields: Array<EmbedField> = [***REMOVED***
		if (added.length > 0) {
			fields.push({
				name: `Added assignment${added.length === 1 ? '' : 's'}`,
				value: added.join('\n'),
				inline: true
			});
		}
		if (failed.length > 0) {
			fields.push({
				name: `Pre-existing assignment${failed.length === 1 ? '' : 's'}`,
				value: failed.join('\n'),
				inline: true
			});
		}
		const embed = new MessageEmbed()
			.setTitle(`Course ${course}`)
			.addFields(fields)
			.setColor('GOLD');

		return interaction.reply({ embeds: [embed] });
	}

	async run(msg: Message, [course, newAssignments]: [string, Array<string>]): Promise<Message> {
		const entry: Course = await msg.client.mongo.collection(DB.COURSES).findOne({ name: course });

		const added: Array<string> = [***REMOVED***
		const failed: Array<string> = [***REMOVED***
		newAssignments.forEach(assignment => {
			if (entry.assignments.includes(assignment)) {
				failed.push(assignment);
			} else {
				added.push(assignment);
				entry.assignments.push(assignment);
			}
		});

		msg.client.mongo.collection(DB.COURSES).updateOne({ name: course }, { $set: { ...entry } });

		const fields: Array<EmbedField> = [***REMOVED***
		if (added.length > 0) {
			fields.push({
				name: `Added assignment${added.length === 1 ? '' : 's'}`,
				value: added.join('\n'),
				inline: true
			});
		}
		if (failed.length > 0) {
			fields.push({
				name: `Pre-existing assignment${failed.length === 1 ? '' : 's'}`,
				value: failed.join('\n'),
				inline: true
			});
		}
		const embed = new MessageEmbed()
			.setTitle(`Course ${course}`)
			.addFields(fields)
			.setColor('GOLD');

		return msg.channel.send({ embeds: [embed] });
	}

	async argParser(msg: Message, input: string): Promise<[string, Array<string>]> {
		if (input === '' || input.split('|').length <= 1) {
			throw `Usage: ${this.usage}`;
		}

		const assignments = input.split('|').map(assignment => assignment.trim());
		const course = assignments.shift().toLowerCase();

		if (await msg.client.mongo.collection(DB.COURSES).countDocuments({ name: course }) !== 1) {
			throw `Could not find course: ${course}`;
		}

		return [course, assignments***REMOVED***
	}

}
