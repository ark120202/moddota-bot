import { Client, Collection, Guild, MessageOptions, TextChannel } from 'discord.js';

const client = new Client({ disableEveryone: true });
client.on('ready', () => console.log(`[Core] Logged in as ${client.user.tag}!`));
export const login = (token: string) => client.login(token);

const getTextChannels = (guild: Guild) =>
  guild.channels.filter(x => x.type === 'text') as Collection<string, TextChannel>;

const getGuilds = (id: string) => client.guilds.filter(g => g.id === id);
const getMainGuilds = () =>
  getGuilds(process.env.NODE_ENV !== 'production' ? '517693364154531953' : '250160069549883392');

export const sendMessageToChannel = (channel: string, message: string | MessageOptions) =>
  getMainGuilds().forEach(guild => {
    getTextChannels(guild)
      .filter(x => x.name === channel)
      .forEach(c => c.send(message));
  });
