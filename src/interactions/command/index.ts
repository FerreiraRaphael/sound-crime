import { Player } from "discord-player";
import { ChatInputCommandInteraction, Interaction } from "discord.js";
import { commandPlayInteraction } from "./commandPlayInteraction";
import { commandSkipInteraction } from "./commandSkipInteraction";
import { commandStopInteraction } from "./commandStopInteraction";
import { commandListInteraction } from "./commandListInteraction";
import { commandMoveInteraction } from "./commandMoveInteraction";
import { commandRemoveInteraction } from "./commandRemoveInteraction";
import { commandHelpInteraction } from "./commandHelpInteraction";

export const commandInteraction =  async (
  userInteraction: Interaction | void,
  player: Player,
) => {
  let interaction: Interaction | void = userInteraction;
  if (interaction && interaction.isCommand() && interaction.guildId) {
    interaction = await commandPlayInteraction((interaction as ChatInputCommandInteraction), player);
    interaction = await commandSkipInteraction(interaction, player);
    interaction = await commandStopInteraction(interaction, player);
    interaction = await commandListInteraction(interaction, player);
    interaction = await commandMoveInteraction(interaction, player);
    interaction = await commandRemoveInteraction(interaction, player);
    interaction = await commandHelpInteraction(interaction);
    return;
  }
}
