import { DB, EMAIL } from '@root/config';
import { userParser } from '@lib/arguments';
import { staffPerms } from '@lib/permissions';
import { SageUser } from '@lib/types/SageUser';
import { Message, GuildMember, MessageEmbed } from 'discord.js';
import nodemailer from 'nodemailer';
import { Command } from '@lib/types/Command';

export default class extends Command {

	description = 'Looks up information about a given user';
	usage = '<user>';
	runInDM = false;

	permissions(msg: Message): boolean {
		return staffPerms(msg);
	}

	async run(msg: Message, [member]: [GuildMember]): Promise<void> {
		const entry: SageUser = await msg.client.mongo.collection(DB.USERS).findOne({ discordId: member.user.id });

		if (!entry) {
			msg.channel.send(`User ${member.user.tag} has not verified.`);
			return;
		}

		const embed = new MessageEmbed()
			.setColor('GREEN')
			.setAuthor(member.user.username, member.user.avatarURL())
			.setFooter(`ID: ${member.user.id}`)
			.addFields([
				{
					name: 'Email:',
					value: entry.email,
					inline: true
				},
				{
					name: 'Messages: ',
					value: entry.count,
					inline: true
				}
		***REMOVED***);

		if (!entry.pii) {
			const sender: SageUser = await msg.client.mongo.collection(DB.USERS).findOne({ discordId: msg.author.id });
			msg.channel.send(`That user has not opted in to have their information shared over Discord. 
	An email has been sent to you containing the requested data.`);
			this.sendEmail(sender.email, member.user.username, entry);
			return;
		}

		msg.author.send({ embeds: [embed] }).then(() => msg.channel.send('I\'ve sent the requested info to your DMs'))
			.catch(() => msg.channel.send('I couldn\'t send you a DM. Please enable DMs and try again'));
		return;
	}

	sendEmail(recipient: string, username: string, entry: SageUser): void {
		const mailer = nodemailer.createTransport({
			host: 'mail.udel.edu',
			port: 25
		});

		mailer.sendMail({
			from: EMAIL.SENDER,
			replyTo: EMAIL.REPLY_TO,
			to: recipient,
			subject: `Requested student information`,
			html: `<!DOCTYPE html>
	<html>

	<head>
		<title>User Information</title>
	</head>

	<body>

		<h1>Your requested user information: </h1>
		<p>User: ${username}</p>
		<p>Email: ${entry.email}</p>
		<p>Message Count: ${entry.count}</p>
		<p>ID: ${entry.discordId}</p>
		<p><br>Thanks for using Sage!</p>

	</body>

	</html>`
		});
	}

	async argParser(msg: Message, input: string): Promise<Array<GuildMember>> {
		return [await userParser(msg, input)***REMOVED***
	}

}
