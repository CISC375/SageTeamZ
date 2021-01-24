import { Message, Role } from 'discord.js';
import { AssignableRole } from '@lib/types/AssignableRole';
import { roleParser } from '@lib/arguments';
import { DB } from '@root/config';

export const description = `Use this command to assign a role to yourself! 
Use the argument 'list' to see a list of all self-assignable roles.`;
export const usage = '[Role|list]';
export const aliases = ['role'***REMOVED***
export const runInDM = false;

export async function run(msg: Message, [cmd]: [Role | 'list']): Promise<Message> {
	const assignables = msg.client.mongo.collection(DB.ASSIGNABLE);

	if (cmd === 'list') {
		return msg.channel.send(`Here is the list of self-assignable roles: 
\`${(await assignables.find().toArray()).map(a => msg.guild.roles.cache.get(a.id).name).join('`, `')}\``);
	} else {
		const role: AssignableRole = { id: cmd.id ***REMOVED***

		if (await assignables.countDocuments(role) === 1) {
			if (msg.member.roles.cache.has(role.id)) {
				msg.member.roles.remove(role.id);
				return msg.channel.send(`:no_entry: removed role: \`${cmd.name}\``);
			} else {
				msg.member.roles.add(role.id);
				return msg.channel.send(`:white_check_mark: added role: \`${cmd.name}\``);
			}
		}
	}
}

export async function argParser(msg: Message, input: string): Promise<Array<Role|string>> {
	if (input === 'list' || input === '') {
		return ['list'***REMOVED***
	}
	return [await roleParser(msg, input)***REMOVED***
}
