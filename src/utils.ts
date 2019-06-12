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

const REGEX_CHINESE = /[\u4e00-\u9fff]|[\u3400-\u4dbf]|[\u{20000}-\u{2a6df}]|[\u{2a700}-\u{2b73f}]|[\u{2b740}-\u{2b81f}]|[\u{2b820}-\u{2ceaf}]|[\uf900-\ufaff]|[\u3300-\u33ff]|[\ufe30-\ufe4f]|[\uf900-\ufaff]|[\u{2f800}-\u{2fa1f}]/u;
export const isChineseText = (text: string) => REGEX_CHINESE.test(text);
