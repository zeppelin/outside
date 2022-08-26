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
    // TODO: can't seem to test this in jsdom, because:
    //
    // document.addEventListener('click', (e) => {
    //   e.preventDefault();
    //   console.log(e.defaultPrevented); // `false` in jsdom, `true` in real browsers
    // };
    it('event listeners are passive', async () => {
      render(defaultTemplate);

      let o = {
        callback(e: Event) {
          e.preventDefault();
          expect(e.defaultPrevented).toBe(false);
        },
      };

      let callback = vi.spyOn(o, 'callback');

      outside = new ClickOutside(q('.inside'), callback as unknown as Function);

      clickWithPointer('.outside');

      expect(callback).toHaveBeenCalledTimes(1);
    });

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
  });
});
