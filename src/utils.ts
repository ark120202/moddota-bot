const URL_REGEX = /((([A-Za-z]{3,9}:(?:\/\/)?)(?:[\-;:&=\+\$,\w]+@)?[A-Za-z0-9\.\-]+|(?:www\.|[\-;:&=\+\$,\w]+@)[A-Za-z0-9\.\-]+)((?:\/[\+~%\/\.\w\-_]*)?\??(?:[\-\+=&;%@\.\w_]*)#?(?:[\.\!\/\\\w]*))?)/g;
export const removeLinks = (text: string) => text.replace(URL_REGEX, '<link removed>');

const delay = (ms: number) => new Promise<void>(resolve => setTimeout(resolve, ms));
export const botLoop = (
  name: string,
  interval: number,
  callback: () => Promise<void>,
) => async () => {
  while (true) {
    try {
      await callback();
    } catch (err) {
      console.error(`[${name}] Error`);
      console.error(err);
    }

    await delay(interval);
  }
};
