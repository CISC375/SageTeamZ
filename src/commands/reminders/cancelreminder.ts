import { Reminder } from '@lib/types/Reminder';
import { DB } from '@root/config';
import { Message } from 'discord.js';
import { Command } from '@lib/types/Command';

export default class extends Command {

	description = 'Cancel any pending reminders you may have.';
	usage = '<reminder number>';
	extendedHelp = 'You can only cancel one reminder at a time';
	aliases = ['cr', 'removereminder'***REMOVED***

	run(msg: Message, [reminder]: [Reminder]): Promise<Message> {
		msg.client.mongo.collection(DB.REMINDERS).findOneAndDelete(reminder);

		const hidden = reminder.mode === 'private' && msg.channel.type !== 'DM';
		return msg.channel.send(`Canceled reminder: **${hidden ? 'Private reminder.' : reminder.content}**`);
	}

	async argParser(msg: Message, input: string): Promise<Array<Reminder>> {
		const remindNum = parseInt(input) - 1;

		if (isNaN(remindNum)) throw 'Please provide a valid number.';

		const reminders: Array<Reminder> = await msg.client.mongo.collection(DB.REMINDERS).find({ owner: msg.author.id }).toArray();
		reminders.sort((a, b) => a.expires.valueOf() - b.expires.valueOf());
		const reminder = reminders[remindNum***REMOVED***

		if (!reminder) throw `I couldn't find reminder **${input}**. Use the \`viewremind\` command to see your current reminders.`;

		return [reminder***REMOVED***
	}

}
