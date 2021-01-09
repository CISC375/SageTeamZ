import 'module-alias/register';
import fs from 'fs';
import crypto from 'crypto';
import nodemailer from 'nodemailer';
import { MongoClient } from 'mongodb';
import { TextChannel, Client } from 'discord.js';
import { SageUser } from '@lib/types/SageUser';
import { BOT, EMAIL, GUILDS, MONGO } from '@root/config';

const MESSAGE = `Hello,

You are part of a class which is using the UD CIS Discord Server in S21. 
Hash: $hash
Invite: https://discord.gg/$invCode
`;

const mailer = nodemailer.createTransport({
	host: 'mail.udel.edu',
	port: 25
});

const bot = new Client();
bot.login(BOT.TOKEN);

bot.once('ready', async () => {
	const guild = await bot.guilds.fetch(GUILDS.GATEWAY);
	const channel = guild.systemChannel;

	fs.readFile('./resources/emails.csv', async (err, data) => {
		if (err) {
			console.error(err);
			return;
		}

		await MongoClient.connect(MONGO, { useUnifiedTopology: true }).then((client) => {
			bot.mongo = client.db(BOT.NAME);
		});

		const emails = data.toString().split('\n').map(email => email.trim());
		let isStaff: boolean;

		if (emails[0] === 'STAFF') {
			isStaff = true;
		} else if (emails[0] === 'STUDENT') {
			isStaff = false;
		} else {
			console.error('First value must be STAFF or STUDENT');
			process.exit(1);
		}

		emails.shift();
		for (const email of emails) {
			const hash = crypto.createHash('sha256').update(email).digest('base64').toString();
			console.log(email, ':', isStaff, ':', hash);

			const entry: SageUser = await bot.mongo.collection('users').findOne({ email: email, hash: hash });

			const newUser: SageUser = {
				email: email,
				hash: hash,
				isStaff: isStaff,
				discordId: '',
				count: 0,
				isVerified: false,
				pii: false,
				roles: []
			***REMOVED***

			if (entry) {			// User already on-boarded
				if (isStaff) {		// Make staff is not already
					bot.mongo.collection('users').updateOne(entry, { $set: { ...newUser } });
				}
				continue;
			}

			bot.mongo.collection('users').insertOne(newUser);

			sendEmail(email, hash, channel);
		}
	});
});


async function sendEmail(email: string, hash: string, channel: TextChannel): Promise<void> {
	const invite = await channel.createInvite({
		maxAge: 0,
		maxUses: 1,
		unique: true,
		reason: 'Onboarding someone.'
	});

	mailer.sendMail({
		from: EMAIL.SENDER,
		replyTo: EMAIL.REPLY_TO,
		to: email,
		subject: 'Welcome to the UD CIS Discord!',
		html: MESSAGE.replace('$hash', hash).replace('$invCode', invite.code)
	});
}
