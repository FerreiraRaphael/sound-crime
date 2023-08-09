import { ButtonInteraction } from "discord.js";
import { Player } from "discord-player";
import { UIID } from "../../ui";

export const nextButtonInteraction = (
  interaction: ButtonInteraction | void,
  player: Player,
): ButtonInteraction | void => {
  if (interaction && interaction.customId === UIID.nextButton) {
    const queue = player.queues.get(interaction.guildId);
    queue.node.skip();
    return void interaction.deleteReply();
  }

  return interaction;
}
