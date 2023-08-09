import { Player } from "discord-player";
import { ChatInputCommandInteraction } from "discord.js";
import { paginationResponse } from "../../ui";
import { Commands } from "../../commands";

export const commandListInteraction = async (
  interaction: ChatInputCommandInteraction | void,
  player: Player,
): Promise<ChatInputCommandInteraction | void> => {
  if (interaction && interaction.commandName === Commands.list) {
    await interaction.deferReply();
    const pageNumber = interaction.options.get("pagina").value as number;
    return paginationResponse(player, interaction as ChatInputCommandInteraction, pageNumber);
  }

  return interaction;
}
