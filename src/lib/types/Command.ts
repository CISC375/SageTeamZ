import { ROLES } from '@root/config';
import { ApplicationCommandOptionData, ApplicationCommandPermissions, ApplicationCommandType, CommandInteraction, InteractionResponse, MessageContextMenuInteraction } from 'discord.js';


export abstract class Command {

	// members
	name: string;
	category: string;
	enabled: boolean;
	aliases?: Array<string>;
	description: string;
	usage?: string;
	extendedHelp?: string;
	runInDM?: boolean = true;
	runInGuild?: boolean = true;
	options?: ApplicationCommandOptionData[***REMOVED***
	type?: ApplicationCommandType;
	permissions?: ApplicationCommandPermissions[] = [{
		id: ROLES.VERIFIED,
		type: 'ROLE',
		permission: true
	}***REMOVED***

	// functions
	abstract run(interaction: CommandInteraction | MessageContextMenuInteraction): Promise<InteractionResponse<boolean> | void>;

}

export interface CompCommand {
	name: string,
	description: string,
	options: ApplicationCommandOptionData[]
}
