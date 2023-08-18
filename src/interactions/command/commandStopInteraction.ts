import { Player } from "discord-player";
import { ChatInputCommandInteraction } from "discord.js";
import { Commands } from "../../commands";

export const commandStopInteraction = async (
  interaction: ChatInputCommandInteraction | void,
  player: Player,
): Promise<ChatInputCommandInteraction | void> => {
  if (interaction && interaction.commandName === Commands.stop) {
    await interaction.deferReply();
    const queue = player.queues.get(interaction.guildId);
    if (!queue || !queue.isPlaying()) return void interaction.followUp({ content: "❌ | Nenhuma música tocando!" });
    queue.node.stop();
    return void interaction.followUp({ content: "🛑 | Parei de tocar!" });
  }

  return interaction;
}
