/**
 * Starts monitoring swipes on the given element and
 * emits `swipe` event when a swipe gesture is performed.
 * @param {DOMElement} element Element on which to listen for swipe gestures.
 * @param {Object} options Optional: Options.
 * @return {Object}
 */
const SwipeListener = function (element, options) {
  if (!element) return;

  // CustomEvent polyfill
  if (typeof window !== 'undefined') {
    (function() {
      if (typeof window.CustomEvent === 'function') return false;
      function CustomEvent(event, params) {
        params = params || { bubbles: false, cancelable: false, detail: undefined };
        var evt = document.createEvent('CustomEvent');
        evt.initCustomEvent(event, params.bubbles, params.cancelable, params.detail);
        return evt;
      }
      CustomEvent.prototype = window.Event.prototype;
      window.CustomEvent = CustomEvent;
    })();
  }

  let defaultOpts = {
    minHorizontal: 10, // Minimum number of pixels traveled to count as a horizontal swipe.
    minVertical: 10, // Minimum number of pixels traveled to count as a vertical swipe.
    deltaHorizontal: 3, // Delta for horizontal swipe
    deltaVertical: 5 // Delta for vertical swipe
  };

  // Set options
  if (!options) {
    options = {};
  }
  options = {
    ...defaultOpts,
    ...options
  };

  // Store the touches
  let touches = [];

  // When the swipe is completed, calculate the direction.
  const _touchend = function(e) {
    if (!touches.length) return;

    let x = [];
    let y = [];

    let directions = {
      top: false,
      right: false,
      bottom: false,
      left: false
    };

    for (let i = 0; i < touches.length; i++) {
      x.push(touches[i].x);
      y.push(touches[i].y);
    }

    // Determine left or right
    let diff = x[0] - x[x.length - 1];
    let swipe = 'none';
    if (diff > 0) {
      swipe = 'left';
    } else {
      swipe = 'right';
    }

    let min = Math.min(...x),
      max = Math.max(...x),
      _diff;

    // If minimum horizontal distance was travelled
    if (Math.abs(diff) >= options.minHorizontal) {
      switch (swipe) {
        case 'left':
          _diff = Math.abs(min - x[x.length - 1]);
          if (_diff <= options.deltaHorizontal) {
            directions.left = true;
          }
          break;
        case 'right':
          _diff = Math.abs(max - x[x.length - 1]);
          if (_diff <= options.deltaHorizontal) {
            directions.right = true;
          }
          break;
      }
    }

    // Determine top or bottom
    diff = y[0] - y[y.length - 1];
    swipe = 'none';
    if (diff > 0) {
      swipe = 'top';
    } else {
      swipe = 'bottom';
    }

    min = Math.min(...y);
    max = Math.max(...y);

    // If minimum vertical distance was travelled
    if (Math.abs(diff) >= options.minVertical) {
      switch (swipe) {
        case 'top':
          _diff = Math.abs(min - y[y.length - 1]);
          if (_diff <= options.deltaVertical) {
            directions.top = true;
          }
          break;
        case 'bottom':
          _diff = Math.abs(max - y[y.length - 1]);
          if (_diff <= options.deltaVertical) {
            directions.bottom = true;
          }
          break;
      }
    }

    // Clear touches array.
    touches = [];

    // If there is a swipe direction, emit an event.
    if (directions.top ||
      directions.right ||
      directions.bottom ||
      directions.left) {
      let event = new CustomEvent('swipe', {
        detail: {
          directions,
          x: [x[0], x[x.length - 1]], // Start and end x-coords
          y: [y[0], y[y.length - 1]] // Start and end y-coords
        }
      });
      element.dispatchEvent(event);
    }
  };

  // When a swipe is performed, store the coords.
  const _touchmove = function (e) {
    let touch = e.changedTouches[0];
    touches.push({
      x: touch.clientX,
      y: touch.clientY
    });
  }

  element.addEventListener('touchmove', _touchmove);
  element.addEventListener('touchend', _touchend);

  return {
    off: function () {
      element.removeEventListener('touchmove', _touchmove);
      element.removeEventListener('touchend', _touchend);
    }
  }
};

if (typeof module !== 'undefined' && typeof module.exports !== 'undefined') {
  module.exports = SwipeListener;
} else {
  if (typeof define === 'function' && define.amd) {
    define([], function() {
      return SwipeListener;
    });
  } else {
    window.SwipeListener = SwipeListener;
  }
}
