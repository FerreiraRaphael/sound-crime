import { config } from '../config';
import {
  Client,
  GatewayIntentBits,
  Interaction,
} from 'discord.js';
import {
  Player,
} from "discord-player";
import { commands } from './commands';
import { stringSelectMenuInteraction, validateInteraction } from './interactions/interaction';
import { buttonInteraction } from './interactions/button';
import { commandInteraction } from './interactions/command';

export const createDiscordClient = () => new Client({
  intents: [
    GatewayIntentBits.GuildVoiceStates,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.Guilds,
    GatewayIntentBits.MessageContent,
  ],
});

export const setupDiscordClient = (
  discordPlayer: Player,
  discordClient: Client
): void => {
  discordClient.login(config.token);
  discordClient.once('ready', async () => {
    await discordPlayer.extractors.loadDefault();
    console.log('TO ON');
  });
  discordClient.on("error", (e) => {
    console.log('Client error');
    console.error(e);
  });
  discordClient.on("warn", (m) => {
    console.log('Client warning');
    console.error(m);
  });

  discordClient.on('messageCreate', async (message) => {
    if (message.author.bot || !message.guild) return;
    if (!discordClient.application?.owner) await discordClient.application?.fetch();
    if (message.content.includes("p!play")) {
      await message.reply({
        content: 'EI VC, QUE TAL N USAR O PANCAKE E USAR O BOTZIN FEITO PELO REI DO CRIME? Manda um /toca ai e dale',
      });
    }
    if (message.content === "!deploy" && message.author.id === discordClient.application?.owner?.id) {
      await message.guild.commands.set([...commands, {
        name: 'canal',
        description: message.channelId,
      }]);
      await message.reply("Deployed!");
    }
  });

  discordClient.on("interactionCreate", async (userInteraction) => {
    let interaction: Interaction | void = userInteraction;
    interaction = await validateInteraction(discordClient, interaction);
    interaction = await stringSelectMenuInteraction(interaction, discordPlayer);
    interaction = await buttonInteraction(interaction, discordPlayer);
    interaction = await commandInteraction(interaction, discordPlayer);
    return;
  });
}
