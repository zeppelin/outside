// @vitest-environment jsdom
import hyper from 'hyperhtml';
import { afterEach, describe, expect, it, vi } from 'vitest';

import { ClickOutsideCompat } from '../src/index';
import { q, render, triggerEvent } from './test-helpers';

const defaultTemplate = hyper`
  <div class="outside">🏞</div>
  <div class="inside">🏠</div>
`;

describe('ClickOutsideCompat', () => {
  let compat: ClickOutsideCompat;
  let callback: any = vi.fn();

  afterEach(() => {
    compat.destroy(); // Destroy can be called multiple times, don't worry..
    callback.reset();
  });

  it('smoke test', async () => {
    render(defaultTemplate);

    compat = new ClickOutsideCompat(q('.inside'), callback);

    triggerEvent('.inside', 'click');
    triggerEvent('.outside', 'click');

    expect(callback).toHaveBeenCalledTimes(1);
  });

  it('destroy', async () => {
    render(defaultTemplate);

    compat = new ClickOutsideCompat(q('.inside'), callback);

    triggerEvent('.outside', 'click');

    compat.destroy();

    triggerEvent('.outside', 'click');

    expect(callback).toHaveBeenCalledTimes(1);
  });

  it('exceptSelector', async () => {
    render(hyper`
      <div class="outside">🏞</div>
      <div class="inside">🏠</div>
      <div class="except-outside">❌</div>
    `);

    compat = new ClickOutsideCompat(q('.inside'), callback, {
      exceptSelector: '.except-outside',
    });

    triggerEvent('.inside', 'click');
    triggerEvent('.except-outside', 'click');
    triggerEvent('.outside', 'click');

    expect(callback).toHaveBeenCalledTimes(1);
  });

  it('custom event', async () => {
    render(defaultTemplate);

    compat = new ClickOutsideCompat(q('.inside'), callback, {
      eventType: 'mousedown',
    });

    triggerEvent('.outside', 'mousedown');

    expect(callback).toHaveBeenCalledTimes(1);
  });

  it('options.active', async () => {
    render(hyper`<div class="outside">🏞</div>`);

    compat = new ClickOutsideCompat(q('.inside'), callback, {
      active: false,
    });

    expect(compat.isActive).toBe(false);

    triggerEvent('.outside', 'click');

    compat.activate();
    expect(compat.isActive).toBe(true);

    // Only this should fire, hence the callback should be called only once.
    triggerEvent('.outside', 'click');

    compat.deactivate();
    expect(compat.isActive).toBe(false);

    triggerEvent('.outside', 'click');

    expect(callback).toHaveBeenCalledTimes(1);
  });

  // TODO: not sure if I can make this fail...
  it.skip('removed DOM element', async () => {
    render(hyper`
      <div class="outside">🏞</div>
      <div class="inside">🏠</div>
      <div class="except-outside">❌</div>
    `);

    q('.outside').addEventListener('click', () => {
      let o = q('.outside');
      o.parentNode!.removeChild(o);
    });

    compat = new ClickOutsideCompat(q('.inside'), callback);

    triggerEvent('.outside', 'click');

    expect(callback).toHaveBeenCalledTimes(1);
  });
});
