import { Interaction } from "discord.js";
import { Player } from "discord-player";
import { pauseButtonInteraction } from "./pauseButton";
import { resumeButtonInteraction } from "./resumeButton";
import { nextButtonInteraction } from "./nextButton";
import { pageButtonInteraction } from "./pageButton";
import { listButtonInteraction } from "./listButton";
import { stopButtonInteraction } from "./stopButton";

export const buttonInteraction = async (
  userInteraction: Interaction | void,
  player: Player
): Promise<Interaction | void> => {
  let interaction: Interaction | void = userInteraction;
  if (interaction && interaction.isButton()) {
    await interaction.deferReply();
    const queue = player.queues.get(interaction.guildId);
    if (!queue || !queue?.currentTrack) {
      return void interaction.editReply({
        content: 'Sem playlist no momento, por favor adicione uma musiquina pra noix',
      })
    }
    interaction = await pauseButtonInteraction(interaction, player);
    interaction = await resumeButtonInteraction(interaction, player);
    interaction = await nextButtonInteraction(interaction, player);
    interaction = await pageButtonInteraction(interaction, player);
    interaction = await listButtonInteraction(interaction, player);
    interaction = await stopButtonInteraction(interaction, player);
    return;
  }

  return interaction;
}
