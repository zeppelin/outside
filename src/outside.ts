import { closest, composedPath, documentOrBodyContains } from './utils';

// Somehow this needs to be told to ESLint.
/* global EventListener */

export class ClickOutside {
  constructor(
    element: Element,
    action: Function,
    options: {
      exceptSelector?: string;
      active?: boolean;
    } = {}
  ) {
    Object.assign(this, options);

    this.upEventHandler = this.createHandler(
      element,
      action,
      options.exceptSelector
    );

    this.addListeners();
  }

  private active = true;
  private pointerDownEvent?: Event;
  private upEventHandler: EventListener;
  private downEventHandler = (e: Event) => {
    this.pointerDownEvent = e;
  };

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
    this.removeListeners();
  }

  private addListeners() {
    document.addEventListener('pointerdown', this.downEventHandler);
    document.addEventListener('pointerup', this.upEventHandler);
  }

  private removeListeners() {
    document.removeEventListener('pointerdown', this.downEventHandler);
    document.removeEventListener('pointerup', this.upEventHandler);
  }

  private createHandler(
    element: Element,
    action: Function,
    exceptSelector?: string
  ) {
    return (pointerUpEvent: Event) => {
      if (!this.active) {
        return;
      }

      let releasedElement = pointerUpEvent.target as HTMLElement;
      let downEventPath = composedPath(this.pointerDownEvent!);

      // If the pointer was pressed inside the element, just return, because it
      // doesn't matter if it was released outside.
      if (downEventPath?.includes(element)) {
        return;
      }

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
