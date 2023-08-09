import {
  ButtonBuilder,
  ActionRowBuilder,
  ButtonStyle,
  APIEmbed,
  ChatInputCommandInteraction,
  ButtonInteraction,
  InteractionEditReplyOptions,
  StringSelectMenuOptionBuilder,
  StringSelectMenuBuilder,
  StringSelectMenuInteraction,
} from 'discord.js';

import {
  Player,
  GuildQueue,
  usePlayer,
  Track,
} from "discord-player";

export const UIID = {
  selectPage: 'select-page',
  pauseButton: 'pause-button',
  playButton: 'play-button',
  nextButton: 'next-button',
  pageButton: 'btn-page-',
  listButton: 'list-button',
  stopButton: 'stop-button',
} as const;

export const listButton = new ButtonBuilder().setLabel('🗒️ Playlist').setCustomId(UIID.listButton).setStyle(ButtonStyle.Secondary);

export const playingTrack = (queue: GuildQueue, track: Track) => {
  const currentPosition = queue.node.getTrackPosition(queue.currentTrack);
  const total = queue.tracks.size;
  const isLast = currentPosition + 1 === total;
  const isPlaying = usePlayer(queue).isPlaying();
  const isPlaylist = queue.tracks.size >= 1;
  const nextButton = new ButtonBuilder().setLabel('➡️').setCustomId(UIID.nextButton).setStyle(ButtonStyle.Secondary);
  const pauseButton = new ButtonBuilder().setLabel('⏸️').setCustomId(UIID.pauseButton).setStyle(ButtonStyle.Secondary);
  const playButton = new ButtonBuilder().setLabel('▶️').setCustomId(UIID.playButton).setStyle(ButtonStyle.Secondary);
  const stopButton = new ButtonBuilder().setLabel('⏹️').setCustomId(UIID.stopButton).setStyle(ButtonStyle.Secondary);
  const row = new ActionRowBuilder<ButtonBuilder>();
  row.addComponents([isPlaying ? pauseButton : playButton]);
  if (!isLast && isPlaylist && isPlaying) {
    row.addComponents([nextButton]);
  }
  row.addComponents(stopButton);
  if (isPlaylist) {
    row.addComponents(listButton);
  }

  const embed: APIEmbed = {
    image: {
      url: track.thumbnail,
    },
    title: isPlaylist ? `Tocando ${currentPosition + 2} / ${total + 1}` : 'Tocando',
    description: `
    ${track.title} - ${track.author}
    `,
    footer: {
      text: `Por ${track.requestedBy.username}`,
    },
  };
  return {
    embeds: embed,
    components: [row],
  }
}

export const paginationResponse = (
  player: Player,
  interaction: ChatInputCommandInteraction | ButtonInteraction | StringSelectMenuInteraction,
  pageNumber: number
): void => {
  const queue = player.queues.get(interaction.guildId);
  if (!queue || queue.size === 0) {
    return void interaction.editReply({
      content: 'Sem fila no momento',
    });
  }

  const currentPage = Math.max(pageNumber - 1, 0);
  const queueSize = queue.size;
  const pageSize = 5;
  const startSlice = currentPage * pageSize;
  const endSlice = startSlice + pageSize;
  const page = queue.tracks.toArray().slice(startSlice, endSlice);
  const totalPages = Math.ceil(queueSize / pageSize);
  const row = new ActionRowBuilder<ButtonBuilder | StringSelectMenuBuilder>();
  const select = new StringSelectMenuBuilder().setPlaceholder('Escolhe o número da pagina ae').setCustomId('selectPage').setMaxValues(1).setMinValues(1);
  for (let i = 1; i <= totalPages; i++) {
    select.addOptions(new StringSelectMenuOptionBuilder().setLabel(`Pagina ${i}`).setValue(i.toString()));
  }
  if (totalPages > 1) {
    row.addComponents(select);
  }
  const editOptions: InteractionEditReplyOptions = {
    embeds: [{
      title: `Pagina ${pageNumber} / ${totalPages}`,
      description: page.map((track, index) => `${startSlice + index + 1} - ${track.title}`).join('\n'),
    }],
  };
  if (row.components.length >= 1) {
    editOptions.components = [row];
  }
  return void interaction.editReply(editOptions);
}
