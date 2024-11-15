/* eslint-disable max-depth */
/* eslint-disable no-lonely-if */
import { CHANNELS, DB } from '@root/config';
import { Client, TextChannel } from 'discord.js';
import { schedule } from 'node-cron';
import { getMostUsed, recommendationHelper } from '../lib/types/commands';

async function register(bot: Client): Promise<void> {
	handleWeekly(bot);
	schedule('1 2 * * 0', () => { // this should be run every week
		handleWeekly(bot)
			.catch(async error => bot.emit('error', error));
	});
	schedule('1 2 * * *', () => { // this should be run every day
		handleDaily(bot)
			.catch(async error => bot.emit('error', error));
	});
}

async function handleWeekly(bot: Client) {
	const usersID = bot.users.cache.map(user => user);
	for (let i = 0; i < usersID.length; i++) {
		const userID = usersID[i];
		const currentUser = await bot.mongo.collection(DB.USERS).findOne({ discordId: userID.id });
		// console.log(currentUser);
		if (currentUser !== null) {
			if (currentUser.personalizeRec !== undefined) {
				console.log(currentUser.personalizeRec);
				if (currentUser.personalizeRec.scheduled === 'weekly') {
					const returnGetMost = (await getMostUsed(bot, currentUser)).split('.');
					const recommendation = await recommendationHelper(bot, currentUser);
					switch (currentUser.personalizeRec.reccType) {
						case 'DM' : {
							bot.users.cache.get(currentUser.discordId).send(`Since you've used ${returnGetMost[0]} the most.\n${recommendation}`);
							break;
						}
						case 'Announcements' : {
							const channelId = CHANNELS.ANNOUNCEMENTS;
							const channel = bot.channels.cache.get(channelId);
							(channel as TextChannel).send(`<@${currentUser.discordId}>\nSince you've used ${returnGetMost[0]} the most.\n${recommendation}`);
							break;
						}
					}
				}
			} else {
				const channelId = CHANNELS.ANNOUNCEMENTS;
				const channel = bot.channels.cache.get(channelId);
				// (channel as TextChannel).send(`<@${currentUser.discordId}>\nUpdate your personal rec`);
			}
		}
	}
}

async function handleDaily(bot: Client) {
	const usersID = bot.users.cache.map(user => user);
	for (let i = 0; i < usersID.length; i++) {
		const userID = usersID[i];
		const currentUser = await bot.mongo.collection(DB.USERS).findOne({ discordId: userID.id });
		// console.log(currentUser);
		if (currentUser !== null) {
			if (currentUser.personalizeRec !== undefined) {
				console.log(currentUser.personalizeRec);
				if (currentUser.personalizeRec.scheduled === 'daily') {
					const returnGetMost = (await getMostUsed(bot, currentUser)).split('.');
					const recommendation = await recommendationHelper(bot, currentUser);
					switch (currentUser.personalizeRec.reccType) {
						case 'DM' : {
							bot.users.cache.get(currentUser.discordId).send(`Since you've used ${returnGetMost[0]} the most.\n${recommendation}`);
							break;
						}
						case 'Announcements' : {
							const channelId = CHANNELS.ANNOUNCEMENTS;
							const channel = bot.channels.cache.get(channelId);
							(channel as TextChannel).send(`<@${currentUser.discordId}>\nSince you've used ${returnGetMost[0]} the most.\n${recommendation}`);
							break;
						}
					}
				}
			} else {
				const channelId = CHANNELS.ANNOUNCEMENTS;
				const channel = bot.channels.cache.get(channelId);
				// (channel as TextChannel).send(`<@${currentUser.discordId}>\nUpdate your personal rec`);
			}
		}
	}
}

export default register;
