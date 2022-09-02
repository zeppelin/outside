// Credits:
// https://github.com/Andarist/are-passive-events-supported/blob/master/src/index.ts

/* global EventListenerOptions, AddEventListenerOptions */

let supportsPassiveEvents: boolean;

export function arePassiveEventsSupported(win: Window = window): boolean {
  if (supportsPassiveEvents !== undefined) {
    return supportsPassiveEvents;
  }

  let passive = false;

  let options: AddEventListenerOptions = {
    // @ts-ignore: this is a temporary object, it doesn't have to return anything
    // eslint-disable-next-line getter-return
    get passive() {
      passive = true;
    },
  };

  const noop = () => {};

  win.addEventListener('t', noop, options);
  win.removeEventListener('t', noop, options as EventListenerOptions);

  supportsPassiveEvents = passive;

  return passive;
}
