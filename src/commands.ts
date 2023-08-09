import {
  ApplicationCommandOptionType,
  ChatInputApplicationCommandData,
} from 'discord.js';

export const Commands = {
  "play": "toca",
  "skip": "pula",
  "list": "fila",
  "stop": "para",
  "move": "move",
  "remove": "tira",
  "help": "help",
} as const;

export type Command = typeof Commands;

export type CommandName = Command[keyof Command];

export const commands: ChatInputApplicationCommandData[] = [
  {
    name: Commands.play,
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
    name: Commands.skip,
    description: "Pula essa música ruim"
  },
  {
    name: Commands.list,
    description: "Veja uma pagina da playlist",
    options: [{
      name: "pagina",
      type: ApplicationCommandOptionType.Number,
      description: "Qual pagina que a senhorita quer?",
      required: true,
    }]
  },
  {
    name: Commands.stop,
    description: "Para essa merda"
  },
  {
    name: Commands.move,
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
    name: Commands.remove,
    description: 'Tira essa musica daqui por favor',
    options: [{
      name: "numero",
      type: ApplicationCommandOptionType.Number,
      description: "Número na lista da música que tu quer tirar",
      required: true
    }]
  },
  {
    name: Commands.help,
    description: "🥺 ME AJUDA BOT CHAN!!"
  },
];
