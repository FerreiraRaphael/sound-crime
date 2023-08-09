import { createDiscordClient, setupDiscordClient } from './src/discordClient';
import { createDiscordPlayer, setupPlayerEvents } from './src/player';

const client = createDiscordClient();
const player = createDiscordPlayer(client);
setupDiscordClient(player, client);
setupPlayerEvents(player);
