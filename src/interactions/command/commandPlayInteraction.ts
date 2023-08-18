import { Player } from "discord-player";
import { ChatInputCommandInteraction, GuildMember } from "discord.js";
import { parseUrl, treatList } from "../../utils";
import { Commands } from "../../commands";

export const commandPlayInteraction = async (
  interaction: ChatInputCommandInteraction | void,
  player: Player,
): Promise<ChatInputCommandInteraction | void> => {
  if (interaction && interaction.commandName === Commands.play) {

    await interaction.deferReply();
    console.info('Comando toca');
    const query = interaction.options.get("query").value;
    const parsedQuery = parseUrl(query as string);
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
    const selectedTracks = treatList(searchResult.tracks, query as string);
    const SEGUNDO_1 = 1000;
    const MINUTO_1 = 60 * SEGUNDO_1;
    const queue = await player.queues.create(interaction.guild, {
      metadata: interaction.channel,
      leaveOnEmpty: true,
      leaveOnEmptyCooldown: MINUTO_1 * 5,
      leaveOnStop: true,
      leaveOnEndCooldown: MINUTO_1 * 5,
      leaveOnEnd: true,
      leaveOnStopCooldown: MINUTO_1 * 5,
    });

    try {
      if (!queue.connection) await queue.connect((interaction.member as GuildMember).voice.channel);
    } catch {
      void player.queues.delete(interaction.guildId);
      return void interaction.followUp({ content: "Não consegui entrar na sala 😓!" });
    }

    await interaction.followUp({ content: `⏱ | Carregando a ${searchResult.playlist ? "playlist" : "musiquinha"}...` });
    try {
      searchResult.playlist ? queue.addTrack(selectedTracks) : queue.addTrack(selectedTracks[0]);
      if (!queue.isPlaying()) {
        queue.node.play();
      };
    } catch (e) {
      console.error('Erro ao tocar', e);
      return void interaction.followUp({ content: "❌ | Deu pau! essa musica :(" });
    }
    await interaction.deleteReply();
  }

  return interaction;
}
