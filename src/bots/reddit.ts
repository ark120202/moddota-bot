import fetch from 'node-fetch';
import { sendMessageToChannel } from '../discord';
import { botLoop, removeLinks } from '../utils';

const API_URL = 'https://www.reddit.com/r/Dota2Modding/new.json?before=';

let lastPost = '';
export const redditLoop = botLoop('Reddit', 30000, async () => {
  const response = await (await fetch(API_URL + lastPost)).json();
  const children: any[] = response.data.children;

  if (lastPost) {
    for (const child of [...children].reverse()) {
      const text = removeLinks((child.data.selftext as string).replace(/&amp;#x200B;/g, ''));
      sendMessageToChannel('moddota-helpdesk', {
        embed: {
          title: 'New post on r/Dota2Modding',
          url: child.data.url,
          description: `_u/${child.data.author}_ - **${child.data.title}**\n\n${text}`,
          color: 0xff4500,
        },
      });
    }
  }

  if (children.length > 0) lastPost = children[0].data.name;
});
