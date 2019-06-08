import cheerio from 'cheerio';
import fetch from 'node-fetch';
import { sendMessageToChannel } from '../discord';
import { botLoop } from '../utils';

const REGEX_CHINESE = /[\u4e00-\u9fff]|[\u3400-\u4dbf]|[\u{20000}-\u{2a6df}]|[\u{2a700}-\u{2b73f}]|[\u{2b740}-\u{2b81f}]|[\u{2b820}-\u{2ceaf}]|[\uf900-\ufaff]|[\u3300-\u33ff]|[\ufe30-\ufe4f]|[\uf900-\ufaff]|[\u{2f800}-\u{2fa1f}]/u;
const BLOCKED_PHRASES = ['giveaway', 'free', 'you won', 'skins'];
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
    .filter(
      ({ title }) =>
        !(
          BLOCKED_PHRASES.some(phrase => title.toLowerCase().includes(phrase)) ||
          REGEX_CHINESE.test(title)
        ),
    );

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
  if (items.length > 0 && (!isFinite(lastFile) || lastFile !== Math.max(lastFile, items[0].id))) {
    console.log(`[New Custom Games] Update latest id to: ${items[0].id}`);
    lastFile = items[0].id;
  }
});
