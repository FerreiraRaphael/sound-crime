import { Player } from "discord-player";
import { ChatInputCommandInteraction } from "discord.js";
import { Commands } from "../../commands";

export const commandMoveInteraction = async (
  interaction: ChatInputCommandInteraction | void,
  player: Player,
): Promise<ChatInputCommandInteraction | void> => {
  if (interaction && interaction.commandName === Commands.move) {
    await interaction.deferReply();
    const musicIndex = Number(interaction.options.get("musica").value) as number;
    const newIndex = Number(interaction.options.get("novaposicao").value) as number;
    const queue = player.queues.get(interaction.guildId);
    const queueSize = queue.tracks.size;
    if (!queue)
      return void interaction.followUp({ content: "❌ | Porra mermão n tem música tocando!" });
    if (queue.tracks.size === 0)
      return void interaction.followUp({ content: "❌ | Porra mermão n tem nenhuma lista rolando!" });
    if (queue.tracks.size === 1)
      return void interaction.followUp({ content: "❌ | Porra mermão só tem uma musica na fila" });
    try {
      const lastIndex = queueSize - 1;
      const firstIndex = 0;
      const value = (n: number) => Math.max(Math.min(n, lastIndex), firstIndex);
      const src = value(musicIndex - 1);
      const dest = value(newIndex - 1);
      const track = queue.tracks.at(src);
      queue.swapTracks(src, dest); return void interaction.followUp({ content: `Mudei a música ${track.title} pra nova posição ${dest + 1}` });
    } catch (e) {
      return void interaction.followUp({ content: "❌ | Porra mermão n dei conta de fazer esse trem, vc fez alguma merda!" });
    }
  }

  return interaction;
}
