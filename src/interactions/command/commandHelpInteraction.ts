import { ChatInputCommandInteraction } from "discord.js";
import { Commands, commands } from "../../commands";

export const commandHelpInteraction = async (
  interaction: ChatInputCommandInteraction | void,
): Promise<ChatInputCommandInteraction | void> => {
  if (interaction && interaction.commandName === Commands.help) {
    await interaction.deferReply();
    const cmds = commands.filter((cmd) => cmd.name !== 'help').filter(cmd => cmd.name !== 'canal');
    return void interaction.followUp({
      embeds: [{
        title: 'Se liga nas dica',
        fields: cmds.map((cmd) => ({
          name: `/${cmd.name}`,
          value: cmd.description,
        }))
      }]
    });
  }

  return interaction;
}
