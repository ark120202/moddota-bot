import cheerio from 'cheerio';
import fetch from 'node-fetch';
import { sendMessageToChannel } from '../discord';
import { botLoop } from '../utils';

interface Post {
  url: string;
  postDate: number;
}

const RECENT_DISCUSSIONS_URL = 'https://moddota.com/forums/discussions';
const getLatestPosts = async () => {
  const $ = cheerio.load(await (await fetch(RECENT_DISCUSSIONS_URL)).text());

  const posts: Post[] = [];
  for (const post of $('.ItemDiscussion:not(.Announcement)').toArray()) {
    const $post = $(post);
    posts.push({
      url: $post.find('.Title > a').attr('href'),
      postDate: Date.parse($post.find('.LastCommentDate > time').attr('datetime')),
    });
  }

  return posts;
};

const announceNewPost = async (newestPostDate: number, post: Post) => {
  const $ = cheerio.load(await (await fetch(post.url)).text());
  const title = $('.PageTitle').text();

  $('.Item')
    .toArray()
    .map($)
    .filter($c => Date.parse($c.find('.DateCreated time').attr('datetime')) > newestPostDate)
    .forEach($c => {
      const id = $c.attr('id');
      const author = $c.find('.Username').text();
      const $message = $c.find('.Message');
      $message
        .find('pre')
        .toArray()
        .map($)
        .forEach($e => $e.replaceWith(`\`\`\`${$e.text()}\`\`\``));
      $message.find('a').replaceWith('&lt;link removed&gt;');
      const content = $message.text().trim();

      sendMessageToChannel('moddota-helpdesk', {
        embed: {
          title: 'New message on ModDota Forums',
          url: `${post.url}#${id}`,
          description: `**${author}**:\n${content}`,
          footer: { text: `> ${title}` },
          color: 0xb3d34b,
        },
      });
    });
};

let lastPostDate = Infinity;
export const forumNotificationsLoop = botLoop('Forum Notifications', 30000, async () => {
  const posts = await getLatestPosts();
  try {
    const newPosts = posts.filter(x => x.postDate > lastPostDate);
    await Promise.all(newPosts.map(post => announceNewPost(lastPostDate, post)));
  } finally {
    lastPostDate = posts[0].postDate;
  }
});
