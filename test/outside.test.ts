// @vitest-environment jsdom
import hyper from 'hyperhtml';
import { afterEach, describe, expect, it, vi } from 'vitest';

import { ClickOutside } from '../src/index';
import { clickWithPointer, q, render, triggerEvent } from './test-helpers';

const defaultTemplate = hyper`
  <div class="outside">🏞</div>
  <div class="inside">🏠</div>
`;

describe('Outside', () => {
  let outside: ClickOutside;
  let callback: any = vi.fn();

  afterEach(() => {
    outside.destroy(); // Destroy can be called multiple times, don't worry..
    callback.reset();
  });

  it('smoke test', async () => {
    render(defaultTemplate);

    outside = new ClickOutside(q('.inside'), callback);

    clickWithPointer('.inside');
    clickWithPointer('.outside');

    expect(callback).toHaveBeenCalledTimes(1);
  });

  describe('Lifecycle', () => {
    it('destroy', async () => {
      render(defaultTemplate);

      outside = new ClickOutside(q('.inside'), callback);

      clickWithPointer('.outside');

      outside.destroy();

      clickWithPointer('.outside');

      expect(callback).toHaveBeenCalledTimes(1);
    });

    it('destroy called multiple times', async () => {
      render(defaultTemplate);

      outside = new ClickOutside(q('.inside'), callback);

      expect(() => {
        outside.destroy();
        outside.destroy();
      }).not.toThrow();
    });
  });

  describe('Event listeners', async () => {
    // TODO: can't seem to test this in jsdom (false positive), because:
    //
    // document.addEventListener('click', (e) => {
    //   e.preventDefault();
    //   console.log(e.defaultPrevented); // `false` in jsdom, `true` in real browsers
    // };
    it('event listeners are passive by default', () =>
      new Promise((done) => {
        render(defaultTemplate);

        let o = {
          callback(e: Event) {
            e.preventDefault();
            expect(e.defaultPrevented).toBe(false);

            done(true);
          },
        };

        let callback = vi.spyOn(o, 'callback');

        outside = new ClickOutside(
          q('.inside'),
          callback as unknown as Function
        );

        clickWithPointer('.outside');

        expect(callback).toHaveBeenCalledTimes(1);
      }));

    // TODO: can't seem to test this in jsdom (test fails), because:
    //
    // document.addEventListener('click', (e) => {
    //   e.preventDefault();
    //   console.log(e.defaultPrevented); // `false` in jsdom, `true` in real browsers
    // };
    it.skip('passive can be configured', () =>
      new Promise((done) => {
        render(defaultTemplate);

        let o = {
          callback(e: Event) {
            e.preventDefault();
            expect(e.defaultPrevented).toBe(true);

            done(true);
          },
        };

        let callback = vi.spyOn(o, 'callback');

        outside = new ClickOutside(
          q('.inside'),
          callback as unknown as Function,
          {
            passiveEventListeners: false,
          }
        );

        clickWithPointer('.outside');

        expect(callback).toHaveBeenCalledTimes(1);
      }));

    it('without pointerdown event', async () => {
      render(defaultTemplate);

      outside = new ClickOutside(q('.inside'), callback);

      triggerEvent('.outside', 'pointerup');

      expect(callback).toHaveBeenCalledTimes(1);
    });

    it('release outside', async () => {
      render(defaultTemplate);

      outside = new ClickOutside(q('.inside'), callback);

      triggerEvent('.inside', 'pointerdown');
      triggerEvent('.outside', 'pointerup');

      expect(callback).toBeCalledTimes(0);
    });
  });

  describe('Multiple event types', () => {
    it('replaces the default event type', () => {
      render(defaultTemplate);

      outside = new ClickOutside(q('.inside'), callback, {
        eventTypes: ['mousedown', 'click'],
      });

      triggerEvent('.outside', 'pointerup'); // This shouldn't be called
      triggerEvent('.outside', 'mousedown');
      triggerEvent('.outside', 'click');

      expect(callback).toBeCalledTimes(2);
    });

    it('torn down on destoy', () => {
      render(defaultTemplate);

      outside = new ClickOutside(q('.inside'), callback, {
        eventTypes: ['touchend', 'click'],
      });

      outside.destroy();

      triggerEvent('.outside', 'touchend');
      triggerEvent('.outside', 'click');

      expect(callback).toBeCalledTimes(0);
    });
  });

  describe('options', () => {
    it('exceptSelector', async () => {
      render(hyper`
        <div class="outside">🏞</div>
        <div class="inside">🏠</div>
        <div class="except-outside">❌</div>
      `);

      outside = new ClickOutside(q('.inside'), callback, {
        exceptSelector: '.except-outside',
      });

      clickWithPointer('.inside');
      clickWithPointer('.except-outside');
      clickWithPointer('.outside');

      expect(callback).toHaveBeenCalledTimes(1);
    });

    it('activate', async () => {
      render(defaultTemplate);

      outside = new ClickOutside(q('.inside'), callback, {
        activate: false,
      });

      expect(outside.isActive).toBe(false);

      clickWithPointer('.outside');

      outside.activate();
      expect(outside.isActive).toBe(true);

      // Only this should fire, hence the callback should be called only once.
      clickWithPointer('.outside');

      outside.deactivate();
      expect(outside.isActive).toBe(false);

      clickWithPointer('.outside');

      expect(callback).toHaveBeenCalledTimes(1);
    });

    it('capture: default', () =>
      new Promise((done) => {
        render(defaultTemplate);

        let callback = (e: Event) => {
          expect(e.eventPhase).toBe(e.BUBBLING_PHASE);
          done(true);
        };

        outside = new ClickOutside(q('.inside'), callback);

        triggerEvent('.outside', 'pointerup');
      }));

    it('capture: true', () =>
      new Promise((done) => {
        render(defaultTemplate);

        let callback = (e: Event) => {
          expect(e.eventPhase).toBe(e.CAPTURING_PHASE);
          done(true);
        };

        outside = new ClickOutside(q('.inside'), callback, {
          capture: true,
        });

        triggerEvent('.outside', 'pointerup');
      }));
  });
});
