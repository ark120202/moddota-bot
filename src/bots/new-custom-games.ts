import cheerio from 'cheerio';
import fetch from 'node-fetch';
import { sendMessageToChannel } from '../discord';
import { botLoop } from '../utils';

const BLOCKED_PHRASES = ['giveaway', 'free', 'you won'];
const PAGE_URL =
  'https://steamcommunity.com/workshop/browse/?appid=570&browsesort=mostrecent&section=readytouseitems&actualsort=mostrecent&p=1';
const getNewCustomGames = async () => {
  const $ = cheerio.load(await (await fetch(PAGE_URL)).text());
  const items = $('.workshopItem')
    .toArray()
    .map($)
    .map($item => {
      const $anchor = $item.find('a').first();
      return {
        id: Number($anchor.data('publishedfileid')),
        title: $item.find('.workshopItemTitle').text(),
        url: $anchor.attr('href').replace(/&searchtext=$/, ''),
        authorName: $item.find('.workshopItemAuthorName > a').text(),
        preview: $item.find('.workshopItemPreviewImage').attr('src'),
      };
    })
    .filter(({ title }) => {
      const block = BLOCKED_PHRASES.some(phrase => title.toLowerCase().includes(phrase));
      if (block) console.log(`[New Custom Games] Name "${title}" contains blocked phrases`);
      return !block;
    });

  if (items.length === 0) {
    throw new Error('No items found');
  }

  return items;
};

let lastFile = Infinity;
export const newCustomGamesLoop = botLoop('New Custom Games', 30000, async () => {
  const items = await getNewCustomGames();

  for (const item of items.filter(x => x.id > lastFile).reverse()) {
    sendMessageToChannel('moddota', {
      embed: {
        title: 'New custom game published',
        description: `**${item.title}** by _${item.authorName}_`,
        url: item.url,
        thumbnail: { url: item.preview },
        color: 0x66c0f4,
      },
    });
  }

  // Use `Math.max` in case some custom game was hidden
  if (!isFinite(lastFile) || lastFile !== Math.max(lastFile, items[0].id)) {
    console.log(`[New Custom Games] Update latest id to: ${items[0].id}`);
    lastFile = items[0].id;
  }
});
