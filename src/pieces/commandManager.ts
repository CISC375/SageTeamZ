/* eslint-disable complexity */
/* eslint-disable max-depth */
import { Collection, Client, CommandInteraction, ApplicationCommand,
	GuildMember, SelectMenuInteraction,
	ModalSubmitInteraction, TextChannel, GuildMemberRoleManager,
	ButtonInteraction, ModalBuilder, TextInputBuilder, ActionRowBuilder,
	ModalActionRowComponentBuilder, ApplicationCommandType, ApplicationCommandDataResolvable, ChannelType, ApplicationCommandPermissionType, TextInputStyle,
	ChatInputCommandInteraction } from 'discord.js';
import { isCmdEqual, readdirRecursive } from '@root/src/lib/utils/generalUtils';
import { Command } from '@lib/types/Command';
import { SageData } from '@lib/types/SageData';
import { DB, GUILDS, MAINTAINERS, CHANNELS } from '@root/config';
import { Course } from '../lib/types/Course';
import { SageUser } from '../lib/types/SageUser';
import { CommandError } from '../lib/types/errors';
import { verify } from '../pieces/verification';
import { FUN_RECS, ADMIN_RECS, CONFIG_RECS, REMIND_RECS, INFO_RECS, PARTIALVIS_RECS, QUESTIONTAG_RECS, recommendationHelper, getMostUsed, logicRec } from '../lib/types/commands';

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
		if (interaction.isChatInputCommand() || interaction.isContextMenuCommand()) runCommand(interaction as ChatInputCommandInteraction, bot);
		if (interaction.isSelectMenu()) handleDropdown(interaction);
		if (interaction.isModalSubmit()) handleModalBuilder(interaction, bot);
		if (interaction.isButton()) handleButton(interaction);
	});

	bot.on('messageCreate', async msg => {
		const lcMessage = msg.content.toLowerCase();
		const thankCheck = (lcMessage.includes('thank') || lcMessage.includes('thx')) && lcMessage.includes(' sage');

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
		const { component } = interaction;
		const removed = component.options.filter((option) => !values.includes(option.value));
		const addedRoleNames = [];
		const removedRoleNames = [];
		for (const id of removed) {
			const role = interaction.guild.roles.cache.find(r => r.id === id.value);
			if (!role.name.includes('CISC') && member.roles.cache.some(r => r.id === id.value)) {
				member.roles.remove(id.value);
				removedRoleNames.push(role.name);
				responseContent = `Your enrollments have been updated.`;
			}
			if (role.name.includes('CISC') && member.roles.cache.some(r => r.id === id.value)) { // does user have this role?
				const course = courses.find(c => c.name === role.name.substring(5));
				const user: SageUser = await interaction.client.mongo.collection(DB.USERS).findOne({ discordId: member.id });
				user.courses = user.courses.filter(c => c !== course.name);
				member.roles.remove(course.roles.student, `Unenrolled from ${course.name}.`);
				member.roles.remove(id.value);
				removedRoleNames.push(role.name);
				interaction.client.mongo.collection(DB.USERS).updateOne({ discordId: member.id }, { $set: { ...user } });
				responseContent = `Your enrollments have been updated.`;
			}
		}
		for (const id of values) {
			const role = interaction.guild.roles.cache.find(r => r.id === id);
			if (!role.name.includes('CISC') && !member.roles.cache.some(r => r.id === id)) {
				member.roles.add(id);
				addedRoleNames.push(role.name);
			}
			if (role.name.includes('CISC') && !member.roles.cache.some(r => r.id === id)) { // does user not have this role?
				const course = courses.find(c => c.name === role.name.substring(5));
				const user: SageUser = await interaction.client.mongo.collection(DB.USERS).findOne({ discordId: member.id });
				user.courses.push(course.name);
				member.roles.add(course.roles.student, `Enrolled in ${course.name}.`);
				member.roles.add(id);
				addedRoleNames.push(role.name);
				interaction.client.mongo.collection(DB.USERS).updateOne({ discordId: member.id }, { $set: { ...user } });
				responseContent = `Your enrollments have been updated.`;
			}
		}
		interaction.reply({
			content: `${responseContent} The following changes have been applied to your roles:
			${addedRoleNames.length !== 0 ? `**Added: **${addedRoleNames.join(', ')}\n\t\t\t` : ''}${removedRoleNames.length !== 0 ? `**Removed: **${removedRoleNames.join(', ')}` : ''}`,
			ephemeral: true
		});
	}
}

async function handleModalBuilder(interaction: ModalSubmitInteraction, bot: Client) {
	const { customId, fields } = interaction;
	const userID = interaction.user.id;
	console.log(userID);
	const guild = await bot.guilds.fetch(GUILDS.MAIN);
	guild.members.fetch();

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
			console.log('entered edit');
			const content = fields.getTextInputValue('content');
			const channel = bot.channels.cache.get(fields.getTextInputValue('channel')) as TextChannel;
			const message = await channel.messages.fetch(fields.getTextInputValue('message'));
			await message.edit(content);
			console.log('entered edit');
			interaction.reply({ content: `Your message was edited.` });
			break;
		}
		case 'verify': {
			const givenHash = fields.getTextInputValue('verifyPrompt');
			const entry: SageUser = await interaction.client.mongo.collection(DB.USERS).findOne({ hash: givenHash });

			if (!entry) {
				interaction.user.send(`I could not find that hash in the database. Please try again or contact ${MAINTAINERS}.`);
				break;
			}
			await verify(interaction, bot, guild, entry, givenHash);
			const enrollStr = entry.courses.length > 0
				? `You have been automatically enrolled in CISC ${entry.courses[0]}. To enroll in more courses or to unenroll from your current course,` +
			` go to <#${CHANNELS.ROLE_SELECT}> and use the proper dropdown menu.`
				: '';
			interaction.reply({ content: `Thank you for verifying! You can now access the rest of the server. ${enrollStr}`, ephemeral: true });
			break;
		}
		// here is where the submit button on the modal updates to Mongo
		case 'recommendationchanges': {
			let errString = ``;
			const entry: SageUser = await interaction.client.mongo.collection(DB.USERS).findOne({ discordId: userID });
			const userObj = entry.personalizeRec;
			const reccType = fields.getTextInputValue('reccType');
			const frequency = fields.getTextInputValue('frequency');
			const tone = fields.getTextInputValue('tone');
			const scheduled = fields.getTextInputValue('scheduled');
			if (reccType !== '') {
				if (reccType.toLocaleLowerCase() === 'dm' || reccType.toLocaleLowerCase() === 'announcements' || reccType.toLocaleLowerCase() === 'none') {
					userObj.reccType = reccType as ('announcements' | 'dm' | 'none');
				} else {
					errString += `Invalid Recommendation Type\n`;
				}
			}
			if (frequency !== '') {
				if (frequency.toLocaleLowerCase() === 'aggressive' || frequency.toLocaleLowerCase() === 'moderate' || frequency.toLocaleLowerCase() === 'low') {
					userObj.frequency = frequency as ('aggressive' | 'moderate' | 'low');
				} else {
					errString += `Invalid Tone\n`;
				}
			}
			if (tone !== '') {
				if (tone.toLocaleLowerCase() === 'casual' || tone.toLocaleLowerCase() === 'formal') {
					userObj.tone = tone as ('casual' | 'formal');
				} else {
					errString += `Invalid Frequency\n`;
				}
			}
			if (scheduled !== '') {
				if (scheduled.toLocaleLowerCase() === 'random' || scheduled.toLocaleLowerCase() === 'daily' || scheduled.toLocaleLowerCase() === 'weekly') {
					userObj.scheduled = scheduled as 'random' | 'daily' | 'weekly';
				} else {
					errString += `Invalid Schedule\n`;
				}
			}
			interaction.reply({ content: `${errString} ${userObj.reccType} -- ${userObj.frequency} -- ${userObj.tone} -- ${userObj.scheduled}` });
			interaction.client.mongo.collection(DB.USERS).findOneAndUpdate({ discordId: userID }, { $set: { personalizeRec: userObj } });
			break;
		}
	}
}

export async function handleButton(interaction: ButtonInteraction): Promise<void> {
	const { customId } = interaction;

	switch (customId) {
		case 'verify': {
			const verifyModal = new ModalBuilder()
				.setTitle('User Verification')
				.setCustomId('verify');
			const verifyPrompt = new TextInputBuilder()
				.setCustomId('verifyPrompt')
				.setLabel('Please enter your unigue hash code here: ')
				.setStyle(TextInputStyle.Short)
				.setMinLength(44)
				.setMaxLength(44)
				.setRequired(true);
			const verifyActionRow = new ActionRowBuilder<ModalActionRowComponentBuilder>().addComponents(verifyPrompt);

			verifyModal.addComponents(verifyActionRow);

			// eslint-disable-next-line @typescript-eslint/ban-ts-comment
			// @ts-ignore - apparently doesn't exist, but if i ignore it it works!
			await interaction.showModal(verifyModal);
		}
	}
}

export async function loadCommands(bot: Client): Promise<void> {
	bot.commands = new Collection();
	const sageData = await bot.mongo.collection(DB.CLIENT_DATA).findOne({ _id: bot.user.id }) as SageData;
	const oldCommandSettings = sageData?.commandSettings || [];
	await bot.guilds.cache.get(GUILDS.MAIN).commands.fetch();
	const { commands } = bot.guilds.cache.get(GUILDS.MAIN);
	let numNew = 0, numEdited = 0;

	const commandFiles = readdirRecursive(`${__dirname}/../commands`).filter(file => file.endsWith('.js'));

	const awaitedCmds: Promise<ApplicationCommand>[] = [];

	for (const file of commandFiles) {
		const commandModule = await import(file);

		const dirs = file.split('/');

		const name = dirs[dirs.length - 1].split('.')[0];

		// semi type-guard, typeof returns function for classes
		if (!(typeof commandModule.default === 'function')) {
			console.log(`Invalid command ${name}`);
			continue;
		}

		// eslint-disable-next-line new-cap
		const command: Command = new commandModule.default;

		command.name = name;

		if ((!command.description || command.description.length >= 100 || command.description.length <= 0) && (command.type === ApplicationCommandType.ChatInput)) {
			throw `Command ${command.name}'s description must be between 1 and 100 characters.`;
		}

		command.category = dirs[dirs.length - 2];

		const guildCmd = commands.cache.find(cmd => cmd.name === command.name);

		const cmdData = {
			name: command.name,
			description: command.description,
			options: command?.options || [],
			type: command.type || ApplicationCommandType.ChatInput,
			defaultPermission: false
		} as ApplicationCommandDataResolvable;

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

// eslint-disable-next-line complexity
async function runCommand(interaction: ChatInputCommandInteraction, bot: Client): Promise<unknown> {
	console.log('-----------------');
	const command = bot.commands.get(interaction.commandName);
	console.log(command.category);
	const currentUser = await bot.mongo.collection(DB.USERS).findOne({ discordId: interaction.user.id });
	if (interaction.channel.type === ChannelType.GuildText && command.runInGuild === false) {
		return interaction.reply({
			content: 'This command must be run in DMs, not public channels',
			ephemeral: true
		});
	}

	if (bot.commands.get(interaction.commandName).run !== undefined) {
		let success = false;
		for (const user of command.permissions) {
			if (user.id === interaction.user.id && user.type === ApplicationCommandPermissionType.User) { // the user is able to use this command (most likely admin-only)
				success = true;
				break;
			}
			if (user.type === ApplicationCommandPermissionType.Role) {
				// says these parens are unneeded, but removing them breaks this line, so
				// eslint-disable-next-line no-extra-parens
				if ((interaction.member.roles as GuildMemberRoleManager).cache.find(role => role.id === user.id)) {
					success = true;
					break;
				}
			}
		}

		const failMessages = ['HTTP 401: Unauthorized', `I'm sorry ${interaction.user.username}, I'm afraid I can't do that.`,
			'Username is not in the sudoers file. This incident will be reported.', `I'm sorry ${interaction.user.username}, but you need sigma nine clearance for that.`];
		if (!success) return interaction.reply(failMessages[Math.floor(Math.random() * failMessages.length)]);

		try {
			console.log(`${currentUser.personalizeRec.reccType}`);
			// COMMAND USAGE MAKE SURE ITS A VALID POSITION AND WILL RETURN -1 IF NOT FOUND IN THE ARRAY OF OBJECTS
			const returnCU = await bot.mongo.collection(DB.USERS).findOne({ discordId: interaction.user.id });
			const arrayCU = returnCU.commandUsage;
			const item = arrayCU.findIndex(i => i.commandName === command.name);
			console.log(item);
			if (item > -1) {
				console.log('ENTER');
				const itemObject = arrayCU[item];
				console.log(itemObject);
				itemObject.commandCount += 1;
				arrayCU[item] = itemObject;
				bot.mongo.collection(DB.USERS).update({ discordId: interaction.user.id }, { $set: { commandUsage: arrayCU } });
			} else {
				const commandUsageObject = {
					commandName: command.name,
					commandDescription: command.description,
					commandCount: 1,
					commandCategory: command.category
				};
				bot.mongo.collection(DB.USERS).findOneAndUpdate(
					{ discordId: interaction.user.id },
					{ $push: { commandUsage: commandUsageObject } });
			}
			// console.log(interaction.user.id, '   ', bot.user.id);
			//
			//
			//
			// On command interaction run to see if they pass a random check (have the ability to get notifs even if they have it scheduled)
			const user_ = await bot.mongo.collection(DB.USERS).findOne({ discordId: interaction.user.id });
			if (user_.personalizeRec.reccType !== 'None') {
				logicRec(user_, interaction, bot);
			}
			//
			//
			//
			bot.commands.get(interaction.commandName).run(interaction)
				?.catch(async (error: Error) => { // Idk if this is needed now, but keeping in case removing it breaks stuff...
					bot.emit('error', new CommandError(error, interaction));
					interaction.reply({ content: `An error occurred. ${MAINTAINERS} have been notified.`, ephemeral: true });
				});
			/* if (currentUser.personalizeRec.reccType === 'DM') {
				bot.users.cache.get(currentUser.discordId).send(`<@${currentUser.discordId}>`);
			}*/
		} catch (error) {
			bot.emit('error', new CommandError(error, interaction));
			interaction.reply({ content: `An error occurred. ${MAINTAINERS} have been notified.`, ephemeral: true });
			console.log(error.errors);
		}
	}
}

export default register;
