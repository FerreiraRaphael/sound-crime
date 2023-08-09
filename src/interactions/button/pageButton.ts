import { ButtonInteraction } from "discord.js";
import { Player } from "discord-player";
import { UIID, paginationResponse } from "../../ui";

export const pageButtonInteraction = (
  interaction: ButtonInteraction | void,
  player: Player,
): ButtonInteraction | void => {
  if (interaction && interaction.customId.includes(UIID.pageButton)) {
    const [, page] = interaction.customId.split(UIID.pageButton);
    return paginationResponse(player, interaction, Number(page));
  }

  return interaction;
}
