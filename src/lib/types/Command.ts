import { ROLES } from '@root/config';
import { ApplicationCommandOptionData, ApplicationCommandPermissionData, CommandInteraction, Message } from 'discord.js';


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
	tempPermissions: ApplicationCommandPermissionData[] = [{
		id: ROLES.VERIFIED,
		type: 'ROLE',
		permission: true
	}***REMOVED***

	// functions
	abstract run?(msg: Message, args?: Array<unknown>): Promise<unknown>;
	tempRun?(interaction: CommandInteraction): Promise<unknown>;
	permissions?(msg: Message): Promise<boolean> | boolean;
	argParser?(msg: Message, input: string): Promise<Array<unknown>> | Array<unknown>;

}

export interface CompCommand {
	name: string,
	description: string,
	options: ApplicationCommandOptionData[]
}
