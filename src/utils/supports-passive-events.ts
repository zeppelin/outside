// Credits:
// https://github.com/Andarist/are-passive-events-supported/blob/master/src/index.ts

/* global EventListenerOptions, AddEventListenerOptions */

let supportsPassiveEvents: boolean;

export function arePassiveEventsSupported(): boolean {
  if (supportsPassiveEvents !== undefined) {
    return supportsPassiveEvents;
  }

  if (typeof window === 'undefined') {
    supportsPassiveEvents = false;
    return false;
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

  window.addEventListener('t', noop, options);
  window.removeEventListener('t', noop, options as EventListenerOptions);

  supportsPassiveEvents = passive;

  return passive;
}
