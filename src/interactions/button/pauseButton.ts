import { ButtonInteraction } from "discord.js";
import { Player } from "discord-player";
import { UIID, playingTrack } from "../../ui";

export const pauseButtonInteraction = (
  interaction: ButtonInteraction | void,
  player: Player,
): ButtonInteraction | void => {
  if (interaction && interaction.customId === UIID.pauseButton) {
    const queue = player.queues.get(interaction.guildId);
    queue.node.pause();
    const { components, embeds } = playingTrack(queue, queue.currentTrack);
    return void interaction.editReply({
      embeds: [embeds],
      components,
    });
  }

  return interaction;
}
