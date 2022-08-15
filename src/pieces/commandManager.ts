import { Collection, Client, CommandInteraction, ApplicationCommand, GuildMember, MessageSelectMenu, SelectMenuInteraction, ModalSubmitInteraction, TextChannel,
	GuildMemberRoleManager } from 'discord.js';
import { isCmdEqual, isPermissionEqual, readdirRecursive } from '@root/src/lib/utils/generalUtils';
import { Command } from '@lib/types/Command';
import { SageData } from '@lib/types/SageData';
import { DB, GUILDS, MAINTAINERS, CHANNELS } from '@root/config';
import { Course } from '../lib/types/Course';
import { SageUser } from '../lib/types/SageUser';
import { CommandError } from '../lib/types/errors';

const DELETE_DELAY = 10000;

async function register(bot: Client): Promise<void> {
	try {
		await loadCommands(bot);
	} catch (error) {
		bot.emit('error', error);
	}

	bot.on('messageCreate', async msg => {
		if (msg.content.substring(0, 2).toLowerCase().includes('s;')) {
			// eslint-disable-next-line max-len
			msg.reply(`If you're trying to run a Sage command, we've moved over to using slash commands. If you're trying to enroll in a course, please use the dropdowns in <#${CHANNELS.ROLE_SELECT}> instead!`)
				.then(reply => {
					// delete reply after 10 seconds
					setTimeout(() => { reply.delete(); }, DELETE_DELAY);
				});
			msg.delete();
		}
	});

	bot.on('interactionCreate', async interaction => {
		if (interaction.isCommand() || interaction.isContextMenu()) runCommand(interaction as CommandInteraction, bot);
		if (interaction.isSelectMenu()) handleDropdown(interaction);
		if (interaction.isModalSubmit()) handleModal(interaction, bot);
	});

	bot.on('messageCreate', async msg => {
		const lcMessage = msg.content.toLowerCase();
		const thankCheck = (lcMessage.includes('thank') || lcMessage.includes('thx')) && lcMessage.includes('sage');

		if (thankCheck) {
			msg.react('<:steve_peace:883541149032267816>');
		}
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
			if (!member.roles.cache.some(r => r.id === id)) { // does user have this role?
				const course = courses.find(c => c.name === role.name.substring(5));
				const user: SageUser = await interaction.client.mongo.collection(DB.USERS).findOne({ discordId: member.id });
				user.courses.push(course.name);
				member.roles.add(course.roles.student, `Enrolled in ${course.name}.`);
				member.roles.add(id);
				interaction.client.mongo.collection(DB.USERS).updateOne({ discordId: member.id }, { $set: { ...user } });
				responseContent = `Your enrollments have been updated.`;
			} else {
				responseContent = `It looks like you are already in the course you've selected! If you'd like to unenroll, please unselect the course from the dropdown.`;
			}
		}
		interaction.reply({
			content: `${responseContent}`,
			ephemeral: true
		});
	}
}

async function handleModal(interaction: ModalSubmitInteraction, bot: Client) {
	const { customId, fields } = interaction;
	switch (customId) {
		case 'announce': {
			const channel = bot.channels.cache.get(fields.getTextInputValue('channel')) as TextChannel;
			const content = fields.getTextInputValue('content');
			const file = fields.getTextInputValue('file');
			await channel.send({
				content: content,
				files: file !== '' ? [file] : null,
				allowedMentions: { parse: ['everyone', 'roles'] }
			});
			interaction.reply({ content: `Your announcement was posted in ${channel}.` });
			break;
		}
		case 'edit': {
			const content = fields.getTextInputValue('content');
			const channel = bot.channels.cache.get(fields.getTextInputValue('channel')) as TextChannel;
			const message = await channel.messages.fetch(fields.getTextInputValue('message'));
			await message.edit(content);
			interaction.reply({ content: `Your message was edited.` });
			break;
		}
	}
}

export async function loadCommands(bot: Client): Promise<void> {
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

		if ((!command.description || command.description.length >= 100 || command.description.length) <= 0 && (command.type === 'CHAT_INPUT')) {
			throw `Command ${command.name}'s description must be between 1 and 100 characters.`;
		}

		command.category = dirs[dirs.length - 2***REMOVED***

		const guildCmd = commands.cache.find(cmd => cmd.name === command.name);

		const cmdData = {
			name: command.name,
			description: command.description,
			options: command?.options || [],
			type: command.type || 'CHAT_INPUT',
			defaultPermission: false
		***REMOVED***

		if (!guildCmd) {
			awaitedCmds.push(commands.create(cmdData));
			numNew++;
			console.log(`${command.name} does not exist, creating...`);
			// eslint-disable-next-line @typescript-eslint/ban-ts-comment
			// @ts-ignore: guildCmd's typing wasn't properly infered, throws a gigantic error I'm not even going to *try* to understand.
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

	console.log(`${bot.commands.size} commands loaded (${numNew} new, ${numEdited} edited).`);
}

async function runCommand(interaction: CommandInteraction, bot: Client): Promise<unknown> {
	const command = bot.commands.get(interaction.commandName);

	if (interaction.channel.type === 'GUILD_TEXT' && command.runInGuild === false) {
		return interaction.reply({
			content: 'This command must be run in DMs, not public channels',
			ephemeral: true
		});
	}

	if (bot.commands.get(interaction.commandName).run !== undefined) {
		let success = false;
		for (const user of command.permissions) {
			if (user.id === interaction.user.id && user.type === 'USER') { // the user is able to use this command (most likely admin-only)
				success = true;
				break;
			}
			if (user.type === 'ROLE') {
				// says these parens are unneeded, but removing them breaks this line, so
				// eslint-disable-next-line no-extra-parens
				if ((interaction.member.roles as GuildMemberRoleManager).cache.find(role => role.id === user.id)) {
					success = true;
					break;
				}
			}
		}

		const failMessages = ['HTTP 401: Unauthorized', `I'm sorry ${interaction.user.username}, I'm afraid I can't do that.`,
			'Username is not in the sudoers file. This incident will be reported.', `I'm sorry ${interaction.user.username}, but you need sigma nine clearance for that.`***REMOVED***
		if (!success) return interaction.reply(failMessages[Math.floor(Math.random() * failMessages.length)]);

		try {
			bot.commands.get(interaction.commandName).run(interaction)
				?.catch(async (error: Error) => {
					interaction.reply({ content: `An error occurred. ${MAINTAINERS} have been notified.`, ephemeral: true });
					bot.emit('error', new CommandError(error, interaction));
				});
		} catch (error) {
			bot.emit('error', new CommandError(error, interaction));
		}
	}
}

export default register;
