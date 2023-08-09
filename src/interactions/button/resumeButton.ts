import { Player } from "discord-player";
import { ButtonInteraction } from "discord.js";
import { UIID, playingTrack } from "../../ui";

export const resumeButtonInteraction = (interaction: ButtonInteraction | void, player: Player): ButtonInteraction | void => {
  if (interaction && interaction.customId === UIID.playButton) {
    const queue = player.queues.get(interaction.guildId);
    queue.node.resume();
    const { components, embeds } = playingTrack(queue, queue.currentTrack);
    return void interaction.editReply({
      embeds: [embeds],
      components,
    });
  }
  return interaction;
}
