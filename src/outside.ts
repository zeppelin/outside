import { closest, composedPath, documentOrBodyContains } from './utils';
import arePassiveEventsSupported from './utils/supports-passive-events';

// Somehow this needs to be told to ESLint.
/* global EventListener */

const PASSIVE_EVENTS_SUPPORTED = arePassiveEventsSupported();
const PASSIVE_EVENT_OPTIONS = PASSIVE_EVENTS_SUPPORTED ? { passive: true } : {};

const DOWN_LISTENER_NAME = 'pointerdown';
const UP_LISTENER_NAME = 'pointerup';

export class ClickOutside {
  constructor(
    element: Element,
    action: Function,
    options: {
      exceptSelector?: string;
      activate?: boolean;
      passiveEventListeners?: boolean;
    } = {}
  ) {
    let { activate, ...opts } = options;

    this._isActive = activate ?? this._isActive;
    Object.assign(this, opts);

    this.upEventHandler = this.createHandler(
      element,
      action,
      options.exceptSelector
    );

    this.addListeners();
  }

  private _isActive = true;
  private passiveEventListeners = true;
  private pointerDownEventPath?: EventTarget[];
  private upEventHandler: EventListener;
  private downEventHandler = (e: Event) => {
    this.pointerDownEventPath = composedPath(e);
  };

  get isActive() {
    return this._isActive;
  }

  activate() {
    this._isActive = true;
  }

  deactivate() {
    this._isActive = false;
  }

  destroy() {
    this.removeListeners();
  }

  private addListeners() {
    document.addEventListener(DOWN_LISTENER_NAME, this.downEventHandler, {
      ...PASSIVE_EVENT_OPTIONS,
    });

    document.addEventListener(UP_LISTENER_NAME, this.upEventHandler, {
      ...(this.passiveEventListeners && PASSIVE_EVENT_OPTIONS),
    });
  }

  private removeListeners() {
    document.removeEventListener(DOWN_LISTENER_NAME, this.downEventHandler);
    document.removeEventListener(UP_LISTENER_NAME, this.upEventHandler);
  }

  private createHandler(
    element: Element,
    action: Function,
    exceptSelector?: string
  ) {
    return (pointerUpEvent: Event) => {
      if (!this._isActive) {
        return;
      }

      // If the pointer was pressed inside the element, just return, because it
      // doesn't matter if it was released outside.
      if (this.pointerDownEventPath?.includes(element)) {
        return;
      }

      let releasedElement = pointerUpEvent.target as HTMLElement;

      // Return if `exceptSelector` is matching the element that was released.
      if (exceptSelector && closest(releasedElement, exceptSelector)) {
        return;
      }

      let upEventPath = composedPath(pointerUpEvent);
      if (upEventPath) {
        if (!upEventPath.includes(element)) {
          action(pointerUpEvent);
        }
      } else {
        // Check if the click target still is in the DOM.
        // If not, there is no way to know if it was inside the element or not.
        let isRemoved =
          !releasedElement || !documentOrBodyContains(releasedElement);

        // Check the element is found as a parent of the click target.
        let isInside =
          element === releasedElement || element.contains(releasedElement);

        if (!isRemoved && !isInside) {
          action(pointerUpEvent);
        }
      }
    };
  }
}
