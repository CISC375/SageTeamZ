/* eslint-disable padded-blocks */
/* eslint-disable no-lonely-if */
import { Client } from 'discord.js';
import { SageUser } from '../lib/types/SageUser';
import { schedule } from 'node-cron';
import { DB, GUILDS, ROLES } from '@root/config';
// inactivity.ts should reset commandUsage, timestampArray, messageCount
async function register(bot: Client): Promise<void> {
	handleInactivity(bot);
	schedule('0 3 * * 0', () => { // this should be run every week
		handleInactivity(bot)
			.catch(async error => bot.emit('error', error));
	});
}

async function handleInactivity(bot: Client) {
	console.log('inactivity run');
	const guild = await bot.guilds.fetch(GUILDS.MAIN);
	await guild.members.fetch();
	guild.members.cache.forEach(async (member) => {
		if (member.user.bot || !member.roles.cache.has(ROLES.VERIFIED)) return; // ignore bots/unverified members
		const currentUser = await bot.mongo.collection<SageUser>(DB.USERS).findOne({ discordId: member.user.id });
		if (!currentUser) return; // not in database (for some reason; maybe ID is not linked to a user document)
		if (currentUser.isNewUser) {
			if (currentUser.messageCount < 1 && currentUser.activityLevel === 'active') {
				const roleToGive = member.guild.roles.cache.get('1302773007554449518');
				const roleToTake = member.guild.roles.cache.get('1302772918249590794');
				member.roles.add(roleToGive);
				member.roles.remove(roleToTake);
				currentUser.activityLevel = 'mildly inactive';
				currentUser.roles.push('1302773007554449518');
			} else if (currentUser.messageCount < 1 && currentUser.activityLevel === 'mildly inactive') {
				currentUser.activityLevel = 'moderately inactive';
			} else if (currentUser.messageCount < 1 && currentUser.activityLevel === 'moderately inactive') {
				currentUser.activityLevel = 'highly inactive';
			} else { // message count is greater than threshold, going from inactive to active
				if (currentUser.activityLevel !== 'active') {
					currentUser.activityLevel = 'active';
					const roleToGive = member.guild.roles.cache.get('1302772918249590794');
					const roleToTake = member.guild.roles.cache.get('1302773007554449518');
					member.roles.add(roleToGive);
					member.roles.remove(roleToTake);
					currentUser.roles.push('1302772918249590794');
				}

			}
		} else if (currentUser.messageCount < 5 && currentUser.activityLevel === 'active') { // user is old
			const roleToGive = member.guild.roles.cache.get('1302773007554449518');
			const roleToTake = member.guild.roles.cache.get('1302772918249590794');
			member.roles.add(roleToGive);
			member.roles.remove(roleToTake);
			currentUser.activityLevel = 'mildly inactive';
			currentUser.roles.push('1302773007554449518');
		} else if (currentUser.messageCount < 5 && currentUser.activityLevel === 'mildly inactive') {
			currentUser.activityLevel = 'moderately inactive';
		} else if (currentUser.messageCount < 5 && currentUser.activityLevel === 'moderately inactive') {
			currentUser.activityLevel = 'highly inactive';
		} else { // not a new user and message count is greater than threshold: move user from inactive to active
			if (currentUser.activityLevel !== 'active') {
				currentUser.activityLevel = 'active';
				const roleToGive = member.guild.roles.cache.get('1302772918249590794');
				const roleToTake = member.guild.roles.cache.get('1302773007554449518');
				member.roles.add(roleToGive);
				member.roles.remove(roleToTake);
				currentUser.roles.push('1302772918249590794');
			}
		}
		// After updating activity level for this week, wipe the message count
		currentUser.messageCount = 0;
	});
}
export default register;
