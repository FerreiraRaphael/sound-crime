import { Player } from "discord-player";
import { ButtonInteraction } from "discord.js";
import { UIID } from "../../ui";

export const stopButtonInteraction = (interaction: ButtonInteraction | void, player: Player): ButtonInteraction | void => {
  if (interaction && interaction.customId === UIID.stopButton) {
    const queue = player.queues.get(interaction.guildId);
    if (!queue || !queue.isPlaying()) return void interaction.followUp({ content: "❌ | Nenhuma música tocando!" });
    queue.delete();
    return void interaction.followUp({ content: "🛑 | Parei de tocar!" });
  }
  return interaction;
}
