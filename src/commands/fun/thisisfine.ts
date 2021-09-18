import { Message } from 'discord.js';
import { Command } from '@lib/types/Command';

export default class extends Command {

	description = 'everything is fine... probably';
	aliases = ['tif'***REMOVED***

	run(msg: Message): Promise<Message> {
		return msg.channel.send({ files: [{
			attachment: `${__dirname}../../../../../assets/images/thisisfine.png`, //	aliases don't work for file uploads
			name: `this_is_fine.png`
		}] });
	}

}
