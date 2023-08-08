import { config } from './config';
import {
  Client,
  GuildMember,
  GatewayIntentBits,
  ApplicationCommandOptionType,
  TextChannel,
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
  ChatInputApplicationCommandData,
} from 'discord.js';
import {
  Player,
  GuildQueue,
  usePlayer,
  Track
} from "discord-player";

const client = new Client({
  intents: [
    GatewayIntentBits.GuildVoiceStates,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.Guilds,
    GatewayIntentBits.MessageContent,
  ],
});
client.login(config.token);
client.once('ready', async () => {
  await player.extractors.loadDefault();
  console.log('TO ON');
});
client.on("error", console.error);
client.on("warn", console.warn);
const player = new Player(client);

const parseSpotifyUrl = (url: string): string => {
  const regex = /^(?:https:\/\/open\.spotify\.com\/(intl-([a-z]|[A-Z]){0,3}\/)?(?:user\/[A-Za-z0-9]+\/)?|spotify:)(album|playlist|track)(?:[/:])([A-Za-z0-9]+).*$/;
  const match = url.match(regex);
  if (!match) return url;
  const [, , , type, id] = match;
  return `https://open.spotify.com/${type}/${id}`;
}

const listButton = new ButtonBuilder().setLabel('🗒️ Playlist').setCustomId('list-button').setStyle(ButtonStyle.Secondary);
const commands: ChatInputApplicationCommandData[] = [
  {
    name: "toca",
    description: "Toca quer musica, só meter um link ou nome",
    options: [
      {
        name: "query",
        type: ApplicationCommandOptionType.String,
        description: "Link ou nome da música ruim",
        required: true
      }
    ]
  },
  {
    name: "pula",
    description: "Pula essa música ruim"
  },
  {
    name: "fila",
    description: "Veja uma pagina da playlist",
    options: [{
      name: "pagina",
      type: ApplicationCommandOptionType.Number,
      description: "Qual pagina que a senhorita quer?",
      required: true,
    }]
  },
  {
    name: "para",
    description: "Para essa merda"
  },
  {
    name: "move",
    description: "Para música de posição da fila",
    options: [{
      name: "musica",
      type: ApplicationCommandOptionType.Number,
      description: "Número na lista da música que tu quer mudar",
      required: true
    }, {
      name: "novaposicao",
      type: ApplicationCommandOptionType.Number,
      description: "Nova posição da música",
      required: true
    }]
  },
  {
    name: "tira",
    description: 'Tira essa musica daqui por favor',
    options: [{
      name: "numero",
      type: ApplicationCommandOptionType.Number,
      description: "Número na lista da música que tu quer tirar",
      required: true
    }]
  },
  {
    name: "help",
    description: "🥺 ME AJUDA BOT CHAN!!"
  },
];


const playingTrack = (queue: GuildQueue, track: Track) => {
  const currentPosition = queue.node.getTrackPosition(queue.currentTrack);
  const total = queue.tracks.size;
  const isFirst = currentPosition === -1;
  const isLast = currentPosition + 1 === total;
  const isPlaying = usePlayer(queue).isPlaying();
  const isPlaylist = queue.tracks.size >= 1;
  const nextButton = new ButtonBuilder().setLabel('➡️').setCustomId('next-button').setStyle(ButtonStyle.Secondary);
  const previousButton = new ButtonBuilder().setLabel('⬅️').setCustomId('previous-button').setStyle(ButtonStyle.Secondary);
  const pauseButton = new ButtonBuilder().setLabel('⏸️').setCustomId('pause-button').setStyle(ButtonStyle.Secondary);
  const playButton = new ButtonBuilder().setLabel('▶️').setCustomId('play-button').setStyle(ButtonStyle.Secondary);
  const stopButton = new ButtonBuilder().setLabel('⏹️').setCustomId('stop-button').setStyle(ButtonStyle.Secondary);
  const row = new ActionRowBuilder<ButtonBuilder>();
  if (!isFirst && isPlaylist && isPlaying)
    row.addComponents([previousButton]);
  row.addComponents([isPlaying ? pauseButton : playButton]);
  if (!isLast && isPlaylist && isPlaying)
    row.addComponents([nextButton]);
  row.addComponents(stopButton);
  if (isPlaylist)
    row.addComponents(listButton);

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

const paginationResponse = async (interaction: ChatInputCommandInteraction | ButtonInteraction | StringSelectMenuInteraction, pageNumber: number) => {
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

client.on('messageCreate', async (message) => {
  if (message.author.bot || !message.guild) return;
  if (!client.application?.owner) await client.application?.fetch();
  if (message.content.includes("p!play")) {
    await message.reply({
      content: 'EI VC, QUE TAL N USAR O PANCAKE E USAR O BOTZIN FEITO PELO REI DO CRIME? Manda um /toca ai e dale',
    });
  }
  if (message.content === "!deploy" && message.author.id === client.application?.owner?.id) {
    await message.guild.commands.set([...commands, {
      name: 'canal',
      description: message.channelId,
    }]);
    await message.reply("Deployed!");
  }
});

client.on("interactionCreate", async (interaction) => {
  const cmds = await interaction.guild.commands.fetch();
  const enabledChatIds = cmds.filter(cmd => !commands.map(c => c.description).includes(cmd.description))
    .map(c => c.description);
  const canUseCommandInChannel = enabledChatIds.includes(interaction.channelId);
  const channels = await Promise.all(enabledChatIds.map(id => client.channels.fetch(id)));
  const channelNames = channels.map((c) => {
    if ('name' in c) {
      return c.name;
    };
    return undefined;
  }).filter(c => !!c);

  if (!canUseCommandInChannel) {
    if (
      interaction.isStringSelectMenu() ||
      interaction.isButton() ||
      interaction.isCommand()
    ) {
      if (channelNames.length === 0) {
        return void interaction.reply(`
          Nenhum channel permitido ainda.
        `);
      }
      return void interaction.reply(`
        Commando n permitido nesse chat,\n apenas nos chats: ${channelNames.join(', ')}
      `);
    }
  }

  if (interaction.isStringSelectMenu()) {
    await interaction.deferReply();
    const queue = player.queues.get(interaction.guildId);
    if (!queue || !queue?.currentTrack) {
      return void interaction.editReply({
        content: 'Sem playlist no momento, por favor adicione uma musiquina pra noix',
      })
    }
    if (interaction.customId === 'selectPage') {
      const [page] = interaction.values;
      return paginationResponse(interaction, Number(page));
    }
  }
  if (interaction.isButton()) {
    await interaction.deferReply();
    const queue = player.queues.get(interaction.guildId);
    if (!queue || !queue?.currentTrack) {
      return void interaction.editReply({
        content: 'Sem playlist no momento, por favor adicione uma musiquina pra noix',
      })
    }
    if (interaction.customId === 'pause-button') {
      const queue = player.queues.get(interaction.guildId);
      queue.node.pause();
      const { components, embeds } = playingTrack(queue, queue.currentTrack);
      return void interaction.editReply({
        embeds: [embeds],
        components,
      });
    }
    if (interaction.customId === 'play-button') {
      const queue = player.queues.get(interaction.guildId);
      queue.node.resume();
      const { components, embeds } = playingTrack(queue, queue.currentTrack);
      return void interaction.editReply({
        embeds: [embeds],
        components,
      });
    }
    if (interaction.customId === 'next-button') {
      const queue = player.queues.get(interaction.guildId);
      queue.node.skip();
      return void interaction.deleteReply();
    }
    if (interaction.customId.includes('btn-page-')) {
      const [, page] = interaction.customId.split('btn-page-');
      return paginationResponse(interaction, Number(page));
    }
    if (interaction.customId === ('list-button')) {
      return paginationResponse(interaction, 1);
    }
    if (interaction.customId === 'stop-button') {
      const queue = player.queues.get(interaction.guildId);
      if (!queue || !queue.isPlaying()) return void interaction.followUp({ content: "❌ | Nenhuma música tocando!" });
      queue.delete();
      return void interaction.followUp({ content: "🛑 | Parei de tocar!" });
    }
  }
  if (!interaction.isCommand() || !interaction.guildId) return;

  if (!(interaction.member instanceof GuildMember) || !interaction.member.voice.channel) {
    return void interaction.reply({ content: "Vc n está num canal/sala!", ephemeral: true });
  }

  if (interaction.guild.members.me.voice.channelId && interaction.member.voice.channelId !== interaction.guild.members.me.voice.channelId) {
    return void interaction.reply({ content: "Vc n está no meu canal/sala!", ephemeral: true });
  }

  if (interaction.commandName === "toca") {
    await interaction.deferReply();
    console.info('Comando toca');
    const query = interaction.options.get("query").value;
    const parsedQuery = parseSpotifyUrl(query as string);
    console.info('Procurando pela query', parsedQuery);
    const searchResult = await player
      .search(parsedQuery, {
        requestedBy: interaction.user,
      })
      .catch((e) => {
        console.error('Erro na busca');
        console.error(e);
      })
    if (!searchResult || !searchResult.tracks.length) return void interaction.followUp({ content: "No results were found!" });
    console.debug(searchResult.tracks);
    const queue = await player.queues.create(interaction.guild, {
      metadata: interaction.channel
    });

    try {
      if (!queue.connection) await queue.connect(interaction.member.voice.channel);
    } catch {
      void player.queues.delete(interaction.guildId);
      return void interaction.followUp({ content: "Não consegui entrar na sala 😓!" });
    }

    await interaction.followUp({ content: `⏱ | Carregando a ${searchResult.playlist ? "playlist" : "musiquinha"}...` });
    searchResult.playlist ? queue.addTrack(searchResult.tracks) : queue.addTrack(searchResult.tracks[0]);
    if (!queue.isPlaying()) {
      queue.node.play();
    };
    await interaction.deleteReply();
  }

  if (interaction.commandName === "pula") {
    await interaction.deferReply();
    const queue = player.queues.get(interaction.guildId);
    if (!queue || !queue.isPlaying()) return void interaction.followUp({ content: "❌ | Nenhuma música tocando!" });
    const currentTrack = queue.currentTrack;
    const success = queue.node.skip();
    return void interaction.followUp({
      content: success ? `✅ | Pulando **${currentTrack}**!` : "❌ | Deu pau!"
    });
  }

  if (interaction.commandName === "para") {
    await interaction.deferReply();
    const queue = player.queues.get(interaction.guildId);
    if (!queue || !queue.isPlaying()) return void interaction.followUp({ content: "❌ | Nenhuma música tocando!" });
    queue.delete();
    return void interaction.followUp({ content: "🛑 | Parei de tocar!" });
  }

  if (interaction.commandName === "fila") {
    await interaction.deferReply();
    const pageNumber = interaction.options.get("pagina").value as number;
    return paginationResponse(interaction as ChatInputCommandInteraction, pageNumber);
  }

  if (interaction.commandName === "move") {
    await interaction.deferReply();
    const musicIndex = Number(interaction.options.get("musica").value) as number;
    const newIndex = Number(interaction.options.get("novaposicao").value) as number;
    const queue = player.queues.get(interaction.guildId);
    const queueSize = queue.tracks.size;
    if (!queue)
      return void interaction.followUp({ content: "❌ | Porra mermão n tem música tocando!" });
    if (queue.tracks.size === 0)
      return void interaction.followUp({ content: "❌ | Porra mermão n tem nenhuma lista rolando!" });
    if (queue.tracks.size === 1)
      return void interaction.followUp({ content: "❌ | Porra mermão só tem uma musica na fila" });
    try {
      const lastIndex = queueSize - 1;
      const firstIndex = 0;
      const value = (n: number) => Math.max(Math.min(n, lastIndex), firstIndex);
      const src = value(musicIndex - 1);
      const dest = value(newIndex - 1);
      const track = queue.tracks.at(src);
      queue.swapTracks(src, dest); return void interaction.followUp({ content: `Mudei a música ${track.title} pra nova posição ${dest + 1}` });
    } catch (e) {
      return void interaction.followUp({ content: "❌ | Porra mermão n dei conta de fazer esse trem, vc fez alguma merda!" });
    }
  }
  if (interaction.commandName === "tira") {
    await interaction.deferReply();
    const musicIndex = Number(interaction.options.get("numero").value) as number;
    const queue = player.queues.get(interaction.guildId);
    const queueSize = queue.tracks.size;
    const value = (n: number) => Math.max(Math.min(n, queueSize - 1), 0);
    if (!queue)
      return void interaction.followUp({ content: "❌ | Porra mermão n tem música tocando!" });
    if (queueSize === 0)
      return void interaction.followUp({ content: "❌ | Porra mermão n tem nenhuma lista rolando!" });
    await interaction.deleteReply();
    queue.removeTrack(value(musicIndex - 1));
  }
  if (interaction.commandName === "help") {
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
});
