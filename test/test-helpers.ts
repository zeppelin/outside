import hyper from 'hyperhtml';

export const render = (
  html: ReturnType<typeof hyper>,
  target: Element = document.body
) => hyper(target)`${html}`;

type QuerySelector = typeof document.querySelector;
export const q = (selectors: Parameters<QuerySelector>[0]) =>
  document.querySelector(selectors)!;

type Target = string | Element | Document;

export const triggerEvent = (target: Target, eventType: string | Event) => {
  let t = typeof target === 'string' ? document.querySelector(target)! : target;
  let event =
    typeof eventType === 'string'
      ? new Event(eventType, { bubbles: true })
      : eventType;

  return t.dispatchEvent(event);
};

export const clickWithPointer = (selector: string) => {
  triggerEvent(selector, 'pointerdown');
  triggerEvent(selector, 'pointerup');
};
