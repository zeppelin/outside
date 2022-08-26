// @vitest-environment jsdom
import hyper from 'hyperhtml';
import { afterEach, describe, expect, it, vi } from 'vitest';

import { ClickOutside } from '../src/index';
import { clickWithPointer, q, render } from './test-helpers';

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
