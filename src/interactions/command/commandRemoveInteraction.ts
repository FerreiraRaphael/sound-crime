import { Player } from "discord-player";
import { ChatInputCommandInteraction } from "discord.js";
import { Commands } from "../../commands";

export const commandRemoveInteraction = async (
  interaction: ChatInputCommandInteraction | void,
  player: Player,
): Promise<ChatInputCommandInteraction | void> => {
  if (interaction && interaction.commandName === Commands.remove) {
    await interaction.deferReply();
    const musicIndex = Number(interaction.options.get("numero").value) as number;
    const queue = player.queues.get(interaction.guildId);
    const queueSize = queue.tracks.size;
    const value = (n: number) => Math.max(Math.min(n, queueSize - 1), 0);
    if (!queue)
      return void interaction.followUp({ content: "❌ | Porra mermão n tem música tocando!" });
    if (queueSize === 0)
      return void interaction.followUp({ content: "❌ | Porra mermão n tem nenhuma lista rolando!" });
    await interaction.deleteReply();
    queue.removeTrack(value(musicIndex - 1));
  }

  return interaction;
}
