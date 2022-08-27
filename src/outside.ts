import {
  arePassiveEventsSupported,
  closest,
  composedPath,
  documentOrBodyContains,
} from './utils';

// Somehow this needs to be told to ESLint.
/* global EventListener, DocumentEventMap */

type EventType = keyof DocumentEventMap;

const PASSIVE_EVENTS_SUPPORTED = arePassiveEventsSupported();
const PASSIVE_EVENT_OPTIONS = PASSIVE_EVENTS_SUPPORTED ? { passive: true } : {};

const DOWN_LISTENER_NAME = 'pointerdown';
const UP_LISTENER_NAME = 'pointerup';

export class Outside {
  constructor(
    element: Element,
    action: Function,
    options: {
      exceptSelector?: string;
      activate?: boolean;
      passiveEventListeners?: boolean;
      eventTypes?: EventType[];
      capture?: boolean;
      refEvent?: boolean;
    } = {}
  ) {
    let { activate, eventTypes, refEvent, ...opts } = options;

    if (refEvent) {
      this.refEvent = new Event('__reference');
    }

    this._isActive = activate ?? this._isActive;
    this.eventTypes = eventTypes ?? [UP_LISTENER_NAME];

    Object.assign(this, opts);

    this.upEventHandler = this.createHandler(
      element,
      action,
      options.exceptSelector
    );

    this.addListeners();
  }

  private _isActive = true;
  private capture = false;
  private eventTypes: EventType[];
  private passiveEventListeners = true;
  private refEvent?: Event;
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

    for (let eventType of this.eventTypes) {
      document.addEventListener(eventType, this.upEventHandler, {
        capture: this.capture,
        ...(this.passiveEventListeners && PASSIVE_EVENT_OPTIONS),
      });
    }
  }

  private removeListeners() {
    document.removeEventListener(DOWN_LISTENER_NAME, this.downEventHandler);

    for (let eventType of this.eventTypes) {
      document.removeEventListener(eventType, this.upEventHandler, {
        //  If a listener is registered twice, one with the capture flag set and
        //  one without, you must remove each one separately. Removal of a
        //  capturing listener does not affect a non-capturing version of the same
        //  listener, and vice versa.
        capture: this.capture,
      });
    }
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

      // Return if the reference event is created before or at the time the the
      // pointer up event was fired.
      if (this.refEvent && this.refEvent.timeStamp > pointerUpEvent.timeStamp) {
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
