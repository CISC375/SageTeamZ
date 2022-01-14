import { ApplicationCommandOptionData, ApplicationCommandPermissionData, CommandInteraction, GuildMember, Message } from 'discord.js';
import { ADMIN_PERMS, staffPerms, STAFF_PERMS } from '@lib/permissions';
import { userParser } from '@lib/arguments';
import { SageUser } from '@lib/types/SageUser';
import { DatabaseError } from '@lib/types/errors';
import { DB } from '@root/config';
import { Command } from '@lib/types/Command';

export default class extends Command {

	description = 'Resets a given user\'s message count.';
	usage = '<user>|[to_subtract|to_set_to]';
	extendedHelp = `Using with no value will reset to 0. A positive integer will
	set their message count and a negative will subtract that from their total`;
	runInDM = false;
	aliases = ['reset'***REMOVED***

	options: ApplicationCommandOptionData[] = [
		{
			name: 'user',
			description: 'The user whose message count will be edited',
			type: 'USER',
			required: true
		},
		{
			name: 'value',
			description: 'value to use (positive to set, negative to subtract, none to set to 0)',
			type: 'INTEGER',
			required: false
		}
***REMOVED***;

	async tempRun(interaction: CommandInteraction): Promise<void> {
		const user = interaction.options.getUser('user');
		const amount = interaction.options.getInteger('value') || 0;
		const entry: SageUser = await interaction.client.mongo.collection(DB.USERS).findOne({ discordId: user.id });

		if (!entry) {
			throw new DatabaseError(`User ${user.username} (${user.id}) not in database`);
		}

		let retStr: string;

		if (amount < 0) {
			entry.count += amount;
			if (entry.count < 0) {
				entry.count = 0;
				retStr = `Subtracted ${amount * -1} from ${user.username}'s message count (bottomed out at 0).`;
			} else {
				retStr = `Subtracted ${amount * -1} from ${user.username}'s message count.`;
			}
		} else {
			entry.count = amount;
			retStr = `Set ${user.username}'s message count to ${amount}.`;
		}

		await interaction.client.mongo.collection(DB.USERS).updateOne(
			{ discordId: user.id },
			{ $set: { count: entry.count } });

		return interaction.reply({ content: retStr, ephemeral: true });
	}

	tempPermissions: ApplicationCommandPermissionData[] = [STAFF_PERMS, ADMIN_PERMS***REMOVED***

	permissions(msg: Message): boolean {
		return staffPerms(msg);
	}

	async run(msg: Message, [member, amount]: [GuildMember, number]): Promise<Message> {
		const entry: SageUser = await msg.client.mongo.collection(DB.USERS).findOne({ discordId: member.user.id });

		if (!entry) {
			throw new DatabaseError(`User ${member.user.username} (${member.user.id}) not in database`);
		}

		let retStr: string;

		if (amount < 0) {
			entry.count += amount;
			if (entry.count < 0) {
				entry.count = 0;
				retStr = `Subtracted ${amount * -1} from ${member.user.username}'s message count (bottomed out at 0).`;
			} else {
				retStr = `Subtracted ${amount * -1} from ${member.user.username}'s message count.`;
			}
		} else {
			entry.count = amount;
			retStr = `Set ${member.user.username}'s message count to ${amount}.`;
		}

		await msg.client.mongo.collection(DB.USERS).updateOne(
			{ discordId: member.user.id },
			{ $set: { count: entry.count } });

		return msg.channel.send(retStr);
	}

	async argParser(msg: Message, input: string): Promise<[GuildMember, number]> {
		const [member, option] = input.trim().split('|');

		let amount: number;

		if (option && typeof (amount = parseInt(option.trim())) !== 'number') {
			throw `Usage: ${this.usage}`;
		}
		if (!option) {
			amount = 0;
		}

		return [await userParser(msg, member.trim()), amount***REMOVED***
	}

}
