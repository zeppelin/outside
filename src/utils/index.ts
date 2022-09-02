import { matches } from './matches-selector';
export { arePassiveEventsSupported } from './supports-passive-events';

type EventWithPath = Event & {
  // IE doesn't have `composedPath()`
  path?: ReturnType<Event['composedPath']>;
};

export const composedPath = (event: EventWithPath) =>
  event.path || event.composedPath?.();

export function closest(
  element: Element,
  selector: string
): Element | undefined {
  if (matches(element, selector)) {
    return element;
  }

  while (element.parentNode) {
    element = element.parentNode as Element;

    if (matches(element, selector)) {
      return element;
    }
  }

  return;
}

export const documentOrBodyContains = (element: Element) => {
  // https://github.com/zeppelin/ember-click-outside/issues/30
  return typeof document.contains === 'function'
    ? document.contains(element)
    : document.body.contains(element);
};
