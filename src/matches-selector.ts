// Source taken from:
// https://github.com/ForbesLindesay/matches-selector/blob/master/index.js

export function matches(el: Element, selector: string) {
  if (!el || el.nodeType !== 1) return false;
  if (vendor) return vendor.call(el, selector);
  var nodes = el.parentNode!.querySelectorAll(selector);
  for (var i = 0; i < nodes.length; i++) {
    if (nodes[i] == el) return true;
  }
  return false;
}

type ElementWithVendorMatchesSelector = Element & {
  matchesSelector?: (selector: string) => boolean;
  webkitMatchesSelector?: (selector: string) => boolean;
  mozMatchesSelector?: (selector: string) => boolean;
  msMatchesSelector?: (selector: string) => boolean;
  oMatchesSelector?: (selector: string) => boolean;
};

const proto: ElementWithVendorMatchesSelector =
  typeof Element !== 'undefined'
    ? Element.prototype
    : ({} as ElementWithVendorMatchesSelector);

const vendor =
  proto.matches ||
  proto.matchesSelector ||
  proto.webkitMatchesSelector ||
  proto.mozMatchesSelector ||
  proto.msMatchesSelector ||
  proto.oMatchesSelector;
