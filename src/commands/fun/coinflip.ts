/* eslint-disable eqeqeq */
import { CommandInteraction } from 'discord.js';
import { Command } from '@lib/types/Command';
import { setTimeout } from 'timers';

const COIN_FLIP = ['You got: Heads!', 'You got: Tails!'***REMOVED***

export default class extends Command {

	description = 'Have Sage flip a coin for you!';

	async run(interaction: CommandInteraction): Promise<InteractionResponse<boolean> | void> {
		await interaction.reply('Flipping...');
		const result = COIN_FLIP[Math.floor(Math.random() * COIN_FLIP.length)***REMOVED***

		setTimeout(() => {
			if (result == COIN_FLIP[0]) {
				interaction.editReply({ files: [{
					attachment: `${__dirname}../../../../../assets/images/steve_heads.png`, //	aliases don't work for file uploads
					name: `steve_heads.png`
				}] });
			} else {
				interaction.editReply({ files: [{
					attachment: `${__dirname}../../../../../assets/images/steve_tails.png`, //	aliases don't work for file uploads
					name: `steve_tails.png`
				}] });
			}
			return interaction.editReply(result);
		}, 3000);
	}

}

