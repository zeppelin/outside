/* global DocumentEventMap, EventListener */
import { closest, documentOrBodyContains } from './utils';

type EventType = keyof DocumentEventMap;

export class ClickOutsideCompat {
  private active = true;
  private capture = false;
  private eventType: EventType = 'click';
  private eventHandler: EventListener;

  constructor(
    element: Element,
    action: Function,
    options: {
      active?: boolean;
      exceptSelector?: string;
      eventType?: EventType;
      capture?: boolean;
    } = {}
  ) {
    Object.assign(this, options);

    this.eventHandler = this.createHandler(
      element,
      action,
      options.exceptSelector
    );

    this.addListener();
  }

  get isActive() {
    return this.active;
  }

  activate() {
    this.active = true;
  }

  deactivate() {
    this.active = false;
  }

  destroy() {
    this.removeListener();
  }

  addListener() {
    document.addEventListener(this.eventType, this.eventHandler, {
      capture: this.capture,
    });
  }

  removeListener() {
    document.removeEventListener(this.eventType, this.eventHandler, {
      //  If a listener is registered twice, one with the capture flag set and
      //  one without, you must remove each one separately. Removal of a
      //  capturing listener does not affect a non-capturing version of the same
      //  listener, and vice versa.
      capture: this.capture,
    });
  }

  private createHandler(
    element: Element,
    action: Function,
    exceptSelector?: string
  ) {
    return (e: Event) => {
      if (!this.active) {
        return;
      }

      let pointerUpEvent = e as any;
      let releasedElement = e.target as any;

      // Return if `exceptSelector` is matching the element that was released.
      // @ts-ignore
      if (exceptSelector && closest(releasedElement, exceptSelector)) {
        return;
      }

      let upEventPath = pointerUpEvent.path || pointerUpEvent.composedPath?.();

      if (upEventPath) {
        if (!upEventPath.includes(element)) {
          action(e);
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
          action(e);
        }
      }
    };
  }
}
