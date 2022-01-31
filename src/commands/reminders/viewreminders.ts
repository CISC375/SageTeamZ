import { DB } from '@root/config';
import { Reminder } from '@lib/types/Reminder';
import { CommandInteraction, Message, MessageEmbed } from 'discord.js';
import { reminderTime } from '@lib/utils';
import { Command } from '@lib/types/Command';

export default class extends Command {

	description = 'See your upcoming reminders.';
	extendedHelp = 'Don\'t worry, private reminders will be hidden if you use this command publicly.';
	aliases = ['showremind', 'showreminders', 'sr', 'viewremind', 'vr'***REMOVED***

	async tempRun(interaction: CommandInteraction): Promise<void> {
		const reminders: Array<Reminder> = await interaction.client.mongo.collection(DB.REMINDERS)
			.find({ owner: interaction.user.id }).toArray();
		reminders.sort((a, b) => a.expires.valueOf() - b.expires.valueOf());

		if (reminders.length < 1) {
			interaction.reply({ content: 'You don\'t have any pending reminders!', ephemeral: true });
		}

		const embeds: Array<MessageEmbed> = [***REMOVED***

		reminders.forEach((reminder, i) => {
			if (i % 25 === 0) {
				embeds.push(new MessageEmbed()
					.setTitle('Pending reminders')
					.setColor('DARK_AQUA'));
			}
			const hidden = reminder.mode === 'private' && interaction.channel.type !== 'DM';
			embeds[Math.floor(i / 25)].addField(
				`${i + 1}. ${hidden ? 'Private reminder' : reminder.content}`,
				hidden ? 'Some time in the future.' : reminderTime(reminder));
		});

		interaction.reply({ embeds });
	}

	async run(msg: Message) : Promise<void> {
		const reminders: Array<Reminder> = await msg.client.mongo.collection(DB.REMINDERS).find({ owner: msg.author.id }).toArray();
		reminders.sort((a, b) => a.expires.valueOf() - b.expires.valueOf());

		if (reminders.length < 1) {
			msg.channel.send('You don\'t have any pending reminders!');
		}

		const embeds: Array<MessageEmbed> = [***REMOVED***

		reminders.forEach((reminder, i) => {
			if (i % 25 === 0) {
				embeds.push(new MessageEmbed()
					.setTitle('Pending reminders')
					.setColor('DARK_AQUA'));
			}
			const hidden = reminder.mode === 'private' && msg.channel.type !== 'DM';
			embeds[Math.floor(i / 25)].addField(
				`${i + 1}. ${hidden ? 'Private reminder' : reminder.content}`,
				hidden ? 'Some time in the future.' : reminderTime(reminder));
		});
		// TODO: possibly send as a list of 10 embeds at a time
		embeds.forEach(embed => msg.channel.send({ embeds: [embed] }));
	}

}
