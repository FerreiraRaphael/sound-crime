import { Player } from "discord-player";
import { ChatInputCommandInteraction } from "discord.js";
import { Commands } from "../../commands";

export const commandSkipInteraction = async (
  interaction: ChatInputCommandInteraction | void,
  player: Player,
): Promise<ChatInputCommandInteraction | void> => {
  if (interaction && interaction.commandName === Commands.skip) {
    await interaction.deferReply();
    const queue = player.queues.get(interaction.guildId);
    if (!queue || !queue.isPlaying()) return void interaction.followUp({ content: "❌ | Nenhuma música tocando!" });
    const currentTrack = queue.currentTrack;
    const success = queue.node.skip();
    return void interaction.followUp({
      content: success ? `✅ | Pulando **${currentTrack}**!` : "❌ | Deu pau!"
    });
  }

  return interaction;
}
