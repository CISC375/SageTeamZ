import { Collection, Client, CommandInteraction, ApplicationCommand, ApplicationCommandPermissionData, GuildMember, MessageSelectMenu, SelectMenuInteraction } from 'discord.js';
import { isCmdEqual, isPermissionEqual, readdirRecursive } from '@lib/utils';
import { Command } from '@lib/types/Command';
import { SageData } from '@lib/types/SageData';
import { DB, GUILDS } from '@root/config';
import { Course } from '../lib/types/Course';
import { SageUser } from '../lib/types/SageUser';

async function register(bot: Client): Promise<void> {
	try {
		await loadCommands(bot);
	} catch (error) {
		bot.emit('error', error);
	}

	bot.on('interactionCreate', async interaction => {
		if (interaction.isCommand()) runCommand(interaction, bot);
		if (interaction.isSelectMenu()) handleDropdown(interaction);
	});
}

async function handleDropdown(interaction: SelectMenuInteraction) {
	const courses: Array<Course> = await interaction.client.mongo.collection(DB.COURSES).find().toArray();
	const { customId, values, member } = interaction;
	let responseContent = `Your roles have been updated.`;
	if (customId === 'roleselect' && member instanceof GuildMember) {
		const component = interaction.component as MessageSelectMenu;
		const removed = component.options.filter((option) => !values.includes(option.value));
		for (const id of removed) {
			const role = interaction.guild.roles.cache.find(r => r.id === id.value);
			if (!role.name.includes('CISC')) {
				member.roles.remove(id.value);
				continue;
			}
			if (member.roles.cache.some(r => r.id === id.value)) { // does user have this role?
				const course = courses.find(c => c.name === role.name.substring(5));
				const user: SageUser = await interaction.client.mongo.collection(DB.USERS).findOne({ discordId: member.id });
				user.courses = user.courses.filter(c => c !== course.name);
				member.roles.remove(course.roles.student, `Unenrolled from ${course.name}.`);
				member.roles.remove(id.value);
				interaction.client.mongo.collection(DB.USERS).updateOne({ discordId: member.id }, { $set: { ...user } });
				responseContent = `Your enrollments have been updated.`;
			}
		}
		for (const id of values) {
			const role = interaction.guild.roles.cache.find(r => r.id === id);
			if (!role.name.includes('CISC')) {
				member.roles.add(id);
				continue;
			}
			const course = courses.find(c => c.name === role.name.substring(5));
			const user: SageUser = await interaction.client.mongo.collection(DB.USERS).findOne({ discordId: member.id });
			user.courses.push(course.name);
			member.roles.add(course.roles.student, `Enrolled in ${course.name}.`);
			member.roles.add(id);
			interaction.client.mongo.collection(DB.USERS).updateOne({ discordId: member.id }, { $set: { ...user } });
			responseContent = `Your enrollments have been updated.`;
		}
		interaction.reply({
			content: `${responseContent}`,
			ephemeral: true
		});
	}
}

async function loadCommands(bot: Client) {
	bot.commands = new Collection();
	const sageData = await bot.mongo.collection(DB.CLIENT_DATA).findOne({ _id: bot.user.id }) as SageData;
	const oldCommandSettings = sageData?.commandSettings || [***REMOVED***
	await bot.guilds.cache.get(GUILDS.MAIN).commands.fetch();
	const { commands } = bot.guilds.cache.get(GUILDS.MAIN);
	let numNew = 0, numEdited = 0;

	const commandFiles = readdirRecursive(`${__dirname}/../commands`).filter(file => file.endsWith('.js'));

	const awaitedCmds: Promise<ApplicationCommand>[] = [***REMOVED***

	for (const file of commandFiles) {
		const commandModule = await import(file);

		const dirs = file.split('/');
		const name = dirs[dirs.length - 1].split('.')[0***REMOVED***

		// semi type-guard, typeof returns function for classes
		if (!(typeof commandModule.default === 'function')) {
			console.log(`Invalid command ${name}`);
			continue;
		}

		// eslint-disable-next-line new-cap
		const command: Command = new commandModule.default;

		command.name = name;

		if (!command.description || command.description.length >= 100 || command.description.length <= 0) {
			throw `Command ${command.name}'s description must be between 1 and 100 characters.`;
		}

		command.category = dirs[dirs.length - 2***REMOVED***

		const guildCmd = commands.cache.find(cmd => cmd.name === command.name);

		const cmdData = {
			name: command.name,
			description: command.description,
			options: command?.options || [],
			defaultPermission: false
		***REMOVED***

		if (!guildCmd) {
			awaitedCmds.push(commands.create(cmdData));
			numNew++;
			console.log(`${command.name} does not exist, creating...`);
		} else if (!isCmdEqual(cmdData, guildCmd)) {
			awaitedCmds.push(commands.edit(guildCmd.id, cmdData));
			numEdited++;
			console.log(`a different version of ${command.name} already exists, editing...`);
		}

		const oldSettings = oldCommandSettings.find(cmd => cmd.name === command.name);
		let enable: boolean;
		if (oldSettings) {
			enable = oldSettings.enabled;
		} else {
			enable = command.enabled !== false;
			oldCommandSettings.push({ name: command.name, enabled: enable });
		}
		command.enabled = enable;

		bot.commands.set(name, command);

		bot.mongo.collection(DB.CLIENT_DATA).updateOne(
			{ _id: bot.user.id },
			{ $set: { commandSettings: oldCommandSettings } },
			{ upsert: true }
		);
	}

	await Promise.all(awaitedCmds);

	let permsUpdated = 0;
	console.log('Checking for updated permissions...');
	await Promise.all(commands.cache.map(async command => {
		let curPerms: ApplicationCommandPermissionData[***REMOVED***
		try {
			curPerms = await command.permissions.fetch({ command: command.id });
		} catch (err) {
			curPerms = [***REMOVED***
		}

		const botCmd = bot.commands.find(cmd => cmd.name === command.name);
		if (botCmd
			&& (botCmd.tempPermissions.length !== curPerms.length
			|| !botCmd.tempPermissions.every(perm =>
				curPerms.find(curPerm => isPermissionEqual(curPerm, perm))))) {
			console.log(`Updating permissions for ${botCmd.name}`);
			permsUpdated++;
			return commands.permissions.set({
				command: command.id,
				permissions: botCmd.tempPermissions
			});
		}
	}));

	console.log(`${bot.commands.size} commands loaded (${numNew} new, ${numEdited} edited) and ${permsUpdated} permission${permsUpdated === 1 ? '' : 's'} updated.`);
}

async function runCommand(interaction: CommandInteraction, bot: Client): Promise<unknown> {
	const command = bot.commands.get(interaction.commandName);
	if (interaction.channel.type === 'DM' && command.runInDM === false) {
		return interaction.reply('This command cannot be run in DMs');
	}

	if (interaction.channel.type === 'GUILD_TEXT' && command.runInGuild === false) {
		return interaction.reply({
			content: 'This command must be run in DMs, not public channels',
			ephemeral: true
		});
	}

	if (bot.commands.get(interaction.commandName).tempRun !== undefined) return bot.commands.get(interaction.commandName)?.tempRun(interaction);
	else return interaction.reply('We haven\'t switched that one over yet');
	// interaction.reply(interaction.commandName);
	// if ((!msg.content.toLowerCase().startsWith(PREFIX) && msg.channel.type !== 'DM') || msg.author.bot) return;

	// let commandName: string;
	// if (msg.channel.type !== 'DM' || msg.content.toLowerCase().startsWith(PREFIX)) {
	// 	[commandName] = msg.content.slice(PREFIX.length).trim().split(' ');
	// } else {
	// 	[commandName] = msg.content.split(' ');
	// }
	// const unparsedArgs = msg.content.slice(msg.content.indexOf(commandName) + commandName.length, msg.content.length).trim();

	// const command = getCommand(msg.client, commandName);
	// if (!command || command.enabled === false) return;

	// if (msg.channel.type === 'DM' && command.runInDM === false) return msg.reply(`${command.name} is not available in DMs.`);
	// if (msg.channel.type === 'GUILD_TEXT' && command.runInGuild === false) {
	// 	await msg.author.send(`<@!${msg.author.id}>, the command you just tried to run is not available in public channels. Try again in DMs.`)
	// 		.catch(async () => { await msg.reply('That command is not available here, try again in DMs'); });
	// 	return msg.delete();
	// }

	// if (command.permissions && !await command.permissions(msg)) return msg.reply('Missing permissions');

	// let args: Array<unknown>;
	// if (command.argParser) {
	// 	try {
	// 		args = await command.argParser(msg, unparsedArgs);
	// 	} catch (error) {
	// 		msg.channel.send(error);
	// 		return;
	// 	}
	// } else {
	// 	args = [unparsedArgs***REMOVED***
	// }

	// try {
	// 	command.run(msg, args)
	// 		?.catch(async (error: Error) => {
	// 			msg.reply(`An error occurred. ${MAINTAINERS} have been notified.`);
	// 			msg.client.emit('error', new CommandError(error, msg));
	// 		});
	// } catch (error) {
	// 	msg.reply(`An error occurred. ${MAINTAINERS} have been notified.`);
	// 	msg.client.emit('error', new CommandError(error, msg));
	// }
}

async function handleDropdown(interaction: SelectMenuInteraction) {
	const courses: Array<Course> = await interaction.client.mongo.collection(DB.COURSES).find().toArray();
	const { customId, values, member } = interaction;
	let responseContent = `Your roles have been updated.`;
	if (customId === 'roleselect' && member instanceof GuildMember) {
		const component = interaction.component as MessageSelectMenu;
		const removed = component.options.filter((option) => !values.includes(option.value));
		for (const id of removed) {
			const role = interaction.guild.roles.cache.find(r => r.id === id.value);
			if (!role.name.includes('CISC')) {
				member.roles.remove(id.value);
				continue;
			}
			if (member.roles.cache.some(r => r.id === id.value)) { // does user have this role?
				const course = courses.find(c => c.name === role.name.substring(5));
				const user: SageUser = await interaction.client.mongo.collection(DB.USERS).findOne({ discordId: member.id });
				user.courses = user.courses.filter(c => c !== course.name);
				member.roles.remove(course.roles.student, `Unenrolled from ${course.name}.`);
				member.roles.remove(id.value);
				interaction.client.mongo.collection(DB.USERS).updateOne({ discordId: member.id }, { $set: { ...user } });
				responseContent = `Your enrollments have been updated.`;
			}
		}
		for (const id of values) {
			const role = interaction.guild.roles.cache.find(r => r.id === id);
			if (!role.name.includes('CISC')) {
				member.roles.add(id);
				continue;
			}
			const course = courses.find(c => c.name === role.name.substring(5));
			const user: SageUser = await interaction.client.mongo.collection(DB.USERS).findOne({ discordId: member.id });
			if (user.courses.includes(course.name)) continue;
			user.courses.push(course.name);
			member.roles.add(course.roles.student, `Enrolled in ${course.name}.`);
			member.roles.add(id);
			interaction.client.mongo.collection(DB.USERS).updateOne({ discordId: member.id }, { $set: { ...user } });
			responseContent = `Your enrollments have been updated.`;
		}
		interaction.reply({
			content: `${responseContent}`,
			ephemeral: true
		});
	}
}

export default register;
