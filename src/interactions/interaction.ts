import { Client, GuildMember, Interaction } from "discord.js";
import { commands } from "../commands";
import { Player } from "discord-player";
import { UIID, paginationResponse } from "../ui";

export const validateInteraction = async (
  discordClient: Client,
  interaction: Interaction,
): Promise<Interaction | void> => {
  const cmds = await interaction.guild.commands.fetch();
  const enabledChatIds = cmds.filter(cmd => !commands.map(c => c.description).includes(cmd.description))
    .map(c => c.description);
  const canUseCommandInChannel = enabledChatIds.includes(interaction.channelId);
  const channels = await Promise.all(enabledChatIds.map(id => discordClient.channels.fetch(id)));
  const channelNames = channels.map((c) => {
    if ('name' in c) {
      return c.name;
    };
    return undefined;
  }).filter(c => !!c);

  if (!canUseCommandInChannel) {
    if (
      interaction.isStringSelectMenu() ||
      interaction.isButton() ||
      interaction.isCommand()
    ) {
      if (channelNames.length === 0) {
        return void interaction.reply(`
            Nenhum channel permitido ainda.
          `);
      }
      return void interaction.reply(`
          Commando n permitido nesse chat,\n apenas nos chats: ${channelNames.join(', ')}
        `);
    }
  }
  if (interaction.isCommand() && interaction.guildId)  {
    if (!(interaction.member instanceof GuildMember) || !interaction.member.voice.channel) {
      return void interaction.reply({ content: "Vc n está num canal/sala!", ephemeral: true });
    }

    if (interaction.guild.members.me.voice.channelId && interaction.member.voice.channelId !== interaction.guild.members.me.voice.channelId) {
      return void interaction.reply({ content: "Vc n está no meu canal/sala!", ephemeral: true });
    }
  }

  return interaction;
}

export const stringSelectMenuInteraction = async (
  interaction: Interaction | void,
  player: Player,
): Promise<Interaction | void> => {
  if (interaction && interaction.isStringSelectMenu()) {
    await interaction.deferReply();
    const queue = player.queues.get(interaction.guildId);
    if (!queue || !queue?.currentTrack) {
      return void interaction.editReply({
        content: 'Sem playlist no momento, por favor adicione uma musiquina pra noix',
      })
    }
    if (interaction.customId === UIID.selectPage) {
      const [page] = interaction.values;
      return paginationResponse(player, interaction, Number(page));
    }
  }

  return interaction;
}
