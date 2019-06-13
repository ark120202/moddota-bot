import { customGameUpdatesLoop } from './bots/custom-game-updates';
import { forumNotificationsLoop } from './bots/forum-notifications';
import { newCustomGamesLoop } from './bots/new-custom-games';
import { redditLoop } from './bots/reddit';
import { login } from './discord';

(async () => {
  if (process.env.BOT_TOKEN == null) throw new Error('BOT_TOKEN is not defined');
  await login(process.env.BOT_TOKEN);
  await Promise.all([
    customGameUpdatesLoop(),
    forumNotificationsLoop(),
    newCustomGamesLoop(),
    redditLoop(),
  ]);
})().catch(err => {
  console.error(err);
  process.exit(1);
});
