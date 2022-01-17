import { Command } from '@lib/types/Command';
import { ROLES } from '@root/config';
import { BOTMASTER_PERMS } from '@lib/permissions';
import { ApplicationCommandPermissionData, CommandInteraction, GuildMember, Message, MessageActionRow, MessageButton, MessageEmbed } from 'discord.js';

const PRUNE_TIMEOUT = 30;

export default class extends Command {

	description = `Prunes all members who don't have the <@&${ROLES.VERIFIED}> role`;
	runInDM = false;
	tempPermissions: ApplicationCommandPermissionData[] = [BOTMASTER_PERMS***REMOVED***

	async tempRun(interaction: CommandInteraction): Promise<void> {
		let timeout = PRUNE_TIMEOUT;

		await interaction.guild.members.fetch();
		const toKick = interaction.guild.members.cache.filter(member => !member.user.bot && !member.roles.cache.has(ROLES.VERIFIED));
		if (toKick.size === 0) return interaction.reply('No prunable members.');

		const confirmEmbed = new MessageEmbed()
			.setTitle(`Server prune will kick ${toKick.size} members from the guild. Proceed?`)
			.setColor('RED')
			.setFooter(`This command will expire in ${PRUNE_TIMEOUT}s`);

		const confirmBtns = [
			new MessageButton({ label: 'Cancel', customId: 'cancel', style: 'SECONDARY' }),
			new MessageButton({ label: 'Proceed', customId: 'proceed', style: 'DANGER' })
	***REMOVED***;

		const confirmMsg = await interaction.channel.send({
			embeds: [confirmEmbed],
			components: [new MessageActionRow({ components: confirmBtns })]
		});

		const collector = interaction.channel.createMessageComponentCollector({
			filter: i => i.message.id === confirmMsg.id, time: PRUNE_TIMEOUT * 1000
		});

		const countdown = setInterval(() => this.countdown(confirmMsg, --timeout, confirmBtns, confirmEmbed), 1000);

		collector.on('collect', async btnClick => {
			if (!btnClick.isButton()) return;
			if (btnClick.user.id !== interaction.user.id) {
				return await btnClick.reply({
					content: 'You cannot respond to a command you did not execute.',
					ephemeral: true
				});
			}
			btnClick.deferReply({ ephemeral: true });
			clearInterval(countdown);

			confirmBtns.forEach(btn => btn.setDisabled(true));


			if (btnClick.customId === 'cancel') {
				confirmEmbed.setColor('BLUE')
					.setTitle(`Prune cancelled. ${interaction.user.username} got cold feet!`);
				confirmMsg.edit({ embeds: [confirmEmbed], components: [new MessageActionRow({ components: confirmBtns })] });
			} else {
				confirmEmbed.setTitle(`<a:loading:928003042954059888> Pruning ${toKick.size} members...`);
				confirmMsg.edit({ embeds: [confirmEmbed], components: [new MessageActionRow({ components: confirmBtns })] });

				const awaitedKicks: Promise<GuildMember>[] = [***REMOVED***
				toKick.forEach(member => {
					awaitedKicks.push(member.kick(`Pruned by ${interaction.user.username} (${interaction.user.id})`));
					return;
				});
				await Promise.all(awaitedKicks);

				confirmEmbed.setTitle(`:white_check_mark: Pruned ${toKick.size} members!`);
				confirmMsg.edit({
					embeds: [confirmEmbed],
					components: [new MessageActionRow({ components: confirmBtns })]
				});
			}
			collector.stop();
		}).on('end', async collected => {
			const validCollected = collected.filter(i => i.isButton()
			&& i.message.id === confirmMsg.id
			&& i.user.id === interaction.user.id);

			if (validCollected.size === 0) {
				clearInterval(countdown);
				confirmBtns.forEach(btn => btn.setDisabled(true));
				confirmEmbed.setColor('BLUE').setDescription('Prune timed out.');
			}
			confirmEmbed.setFooter('');
			confirmMsg.edit({ embeds: [confirmEmbed], components: [new MessageActionRow({ components: confirmBtns })] });

			collected.forEach(interactionX => {
				if (validCollected.has(interactionX.id)) interactionX.followUp({ content: 'Done!' });
			});
		});

		return;
	}

	async run(msg: Message): Promise<void> {
		let timeout = PRUNE_TIMEOUT;
		await msg.guild.members.fetch();
		const toKick = msg.guild.members.cache.filter(member => !member.user.bot && !member.roles.cache.has(ROLES.VERIFIED));
		if (toKick.size === 0) {
			msg.channel.send('No prunable members.');
			return;
		}

		const confirmEmbed = new MessageEmbed()
			.setTitle(`Server prune will kick ${toKick.size} members from the guild. Proceed?`)
			.setColor('RED')
			.setFooter(`This command will expire in ${PRUNE_TIMEOUT}s`);

		const confirmBtns = [
			new MessageButton({ label: 'Cancel', customId: 'cancel', style: 'SECONDARY' }),
			new MessageButton({ label: 'Proceed', customId: 'proceed', style: 'DANGER' })
	***REMOVED***;

		const confirmMsg = await msg.channel.send({
			embeds: [confirmEmbed],
			components: [new MessageActionRow({ components: confirmBtns })]
		});

		const collector = msg.channel.createMessageComponentCollector({
			filter: i => i.message.id === confirmMsg.id, time: PRUNE_TIMEOUT * 1000
		});

		const countdown = setInterval(() => this.countdown(confirmMsg, --timeout, confirmBtns, confirmEmbed), 1000);

		collector.on('collect', async interaction => {
			if (!interaction.isButton()) return;
			if (interaction.user.id !== msg.author.id) {
				await interaction.reply({
					content: 'You cannot respond to a command you did not execute',
					ephemeral: true
				});
				return;
			}
			interaction.deferReply({ ephemeral: true });
			clearInterval(countdown);

			confirmBtns.forEach(btn => btn.setDisabled(true));


			if (interaction.customId === 'cancel') {
				confirmEmbed.setColor('BLUE')
					.setTitle(`Prune cancelled. ${msg.member.displayName} got cold feet!`);
				confirmMsg.edit({ embeds: [confirmEmbed], components: [new MessageActionRow({ components: confirmBtns })] });
			} else {
				confirmEmbed.setTitle(`<a:loading:928003042954059888> Pruning ${toKick.size} members...`);
				confirmMsg.edit({ embeds: [confirmEmbed], components: [new MessageActionRow({ components: confirmBtns })] });

				const awaitedKicks: Promise<GuildMember>[] = [***REMOVED***
				toKick.forEach(member => {
					awaitedKicks.push(member.kick(`Pruned by ${msg.member.displayName} (${msg.author.id})`));
					return;
				});
				await Promise.all(awaitedKicks);

				confirmEmbed.setTitle(`:white_check_mark: Pruned ${toKick.size} members!`);
				confirmMsg.edit({
					embeds: [confirmEmbed],
					components: [new MessageActionRow({ components: confirmBtns })]
				});
			}
			collector.stop();
		}).on('end', async collected => {
			const validCollected = collected.filter(i => i.isButton()
			&& i.message.id === confirmMsg.id
			&& i.user.id === msg.author.id);

			if (validCollected.size === 0) {
				clearInterval(countdown);
				confirmBtns.forEach(btn => btn.setDisabled(true));
				confirmEmbed.setColor('BLUE').setDescription('Prune timed out.');
			}
			confirmEmbed.setFooter('');
			confirmMsg.edit({ embeds: [confirmEmbed], components: [new MessageActionRow({ components: confirmBtns })] });

			collected.forEach(interaction => {
				if (validCollected.has(interaction.id)) interaction.followUp({ content: 'Done!' });
			});
		});

		return;
	}

	countdown(msg: Message, timeout: number, confirmBtns: MessageButton[], confirmEmbed: MessageEmbed): void {
		confirmEmbed.setFooter(`This command will expire in ${timeout}s`);
		msg.edit({ embeds: [confirmEmbed], components: [new MessageActionRow({ components: confirmBtns })] });
	}

}

