import {
  Client,
  TextChannel,
} from 'discord.js';
import {
  Player,
} from "discord-player";
import { playingTrack } from './ui';

export const createDiscordPlayer = (discordClient: Client) => new Player(discordClient);

export const setupPlayerEvents = (player: Player) => {
  player.events.on('playerStart', (queue, track) => {
    const metadata = queue.metadata as TextChannel;
    const { components, embeds } = playingTrack(queue, track);
    metadata.send({
      embeds: [embeds],
      components,
    });
  });

  player.events.on('audioTrackAdd', (queue, track) => {
    // Emitted when the player adds a single song to its queue
    // console.log('queue.metadata', queue.metadata);
    const metadata = queue.metadata as TextChannel;
    metadata.send(`🍆 Meti a música **${track.title}** na fila`);
  });

  player.events.on('audioTrackRemove', (queue, track) => {
    const metadata = queue.metadata as TextChannel;
    metadata.send(`💩 Tirei essa bosta **${track.title}** da fila`);
  });

  player.events.on('audioTracksAdd', (queue, tracks) => {
    // Emitted when the player adds multiple songs to its queue
    const metadata = queue.metadata as TextChannel;

    const embeds = [{
      title: `🫵 ${tracks[0].requestedBy.username} adicionou ${tracks.length} músicas na fila!`,
      description: `
        ${tracks.slice(0, 5).map((track, index) => `${index + 1} - ${track.title}`).join('\n')}
        ${tracks.length > 5 ? '...' : ''}
      `,
    }];
    metadata.send({
      embeds,
    });
  });

  player.events.on('playerSkip', (queue, track) => {
    // Emitted when the audio player fails to load the stream for a song
    const metadata = queue.metadata as TextChannel;
    metadata.send(`Pulando **${track.title}** pq deu pau!`);
  });

  player.events.on('disconnect', (queue) => {
    // Emitted when the bot leaves the voice channel
    const metadata = queue.metadata as TextChannel;
    metadata.send('Adeus senhoras e senhores');
  });
  player.events.on('emptyChannel', (queue) => {
    // Emitted when the voice channel has been empty for the set threshold
    const metadata = queue.metadata as TextChannel;
    metadata.send(`Adeus meu povo!`);
  });
  player.events.on('emptyQueue', (queue) => {
    // Emitted when the player queue has finished
    const metadata = queue.metadata as TextChannel;
    metadata.send('Acabou a fila!');
  });

  player.events.on('error', (queue, error) => {
    // Emitted when the player queue encounters error
    console.log(`Deu pau geral: ${error.message}`);
    console.log(error);
  });

  player.events.on('playerError', (queue, error) => {
    // Emitted when the audio player errors while streaming audio track
    console.log(`Deu pau no player: ${error.message}`);
    console.log(error);
  });
}
