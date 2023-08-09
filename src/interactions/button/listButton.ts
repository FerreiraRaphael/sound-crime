import { ButtonInteraction } from "discord.js";
import { Player } from "discord-player";
import { UIID, paginationResponse } from "../../ui";

export const listButtonInteraction = (
  interaction: ButtonInteraction | void,
  player: Player,
): ButtonInteraction | void => {
  if (interaction && interaction.customId === (UIID.listButton)) {
    return paginationResponse(player, interaction, 1);
  }

  return interaction;
}
