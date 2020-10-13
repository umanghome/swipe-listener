'use strict';

var _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; };

/**
 * Starts monitoring swipes on the given element and
 * emits `swipe` event when a swipe gesture is performed.
 * @param {DOMElement} element Element on which to listen for swipe gestures.
 * @param {Object} options Optional: Options.
 * @return {Object}
 */
var SwipeListener = function SwipeListener(element, options) {
  if (!element) return;

  // CustomEvent polyfill
  if (typeof window !== 'undefined') {
    (function () {
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

  var defaultOpts = {
    minHorizontal: 10, // Minimum number of pixels traveled to count as a horizontal swipe.
    minVertical: 10, // Minimum number of pixels traveled to count as a vertical swipe.
    deltaHorizontal: 3, // Delta for horizontal swipe
    deltaVertical: 5, // Delta for vertical swipe
    preventScroll: false, // Prevents scrolling when swiping.
    lockAxis: true, // Select only one axis to be true instead of multiple.
    touch: true, // Listen for touch events
    mouse: true // Listen for mouse events
  };

  // Set options
  if (!options) {
    options = {};
  }
  options = _extends({}, defaultOpts, options);

  // Store the touches
  var touches = [];

  // Not dragging by default.
  var dragging = false;

  // When mouse-click is started, make dragging true.
  var _mousedown = function _mousedown(e) {
    dragging = true;
  };

  // When mouse-click is released, make dragging false and signify end by imitating `touchend`.
  var _mouseup = function _mouseup(e) {
    dragging = false;
    _touchend(e);
  };

  // When mouse is moved while being clicked, imitate a `touchmove`.
  var _mousemove = function _mousemove(e) {
    if (dragging) {
      e.changedTouches = [{
        clientX: e.clientX,
        clientY: e.clientY
      }];
      _touchmove(e);
    }
  };

  if (options.mouse) {
    element.addEventListener('mousedown', _mousedown);
    element.addEventListener('mouseup', _mouseup);
    element.addEventListener('mousemove', _mousemove);
  }

  // When the swipe is completed, calculate the direction.
  var _touchend = function _touchend(e) {
    if (!touches.length) return;

    var touch = typeof TouchEvent === 'function' && e instanceof TouchEvent;

    var x = [],
        y = [];

    var directions = {
      top: false,
      right: false,
      bottom: false,
      left: false
    };

    for (var i = 0; i < touches.length; i++) {
      x.push(touches[i].x);
      y.push(touches[i].y);
    }

    var xs = x[0],
        xe = x[x.length - 1],
        // Start and end x-coords
    ys = y[0],
        ye = y[y.length - 1]; // Start and end y-coords

    var eventCoords = {
      x: [xs, xe],
      y: [ys, ye]
    };

    if (touches.length > 1) {
      var swipeReleaseEventData = {
        detail: _extends({
          touch: touch,
          target: e.target
        }, eventCoords)
      };

      var swipeReleaseEvent = new CustomEvent('swiperelease', swipeReleaseEventData);
      element.dispatchEvent(swipeReleaseEvent);
    }

    // Determine left or right
    var diff = x[0] - x[x.length - 1];
    var swipe = 'none';
    if (diff > 0) {
      swipe = 'left';
    } else {
      swipe = 'right';
    }

    var min = Math.min.apply(Math, x),
        max = Math.max.apply(Math, x),
        _diff = void 0;

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

    min = Math.min.apply(Math, y);
    max = Math.max.apply(Math, y);

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
    if (directions.top || directions.right || directions.bottom || directions.left) {
      /**
      * If lockAxis is true, determine which axis to select.
      * The axis with the most travel is selected.
      * TODO: Factor in for the orientation of the device
      * and use it as a weight to determine the travel along an axis.
      */
      if (options.lockAxis) {
        if ((directions.left || directions.right) && Math.abs(xs - xe) > Math.abs(ys - ye)) {
          directions.top = directions.bottom = false;
        } else if ((directions.top || directions.bottom) && Math.abs(xs - xe) < Math.abs(ys - ye)) {
          directions.left = directions.right = false;
        }
      }

      var eventData = {
        detail: _extends({
          directions: directions,
          touch: touch,
          target: e.target
        }, eventCoords)
      };

      var event = new CustomEvent('swipe', eventData);
      element.dispatchEvent(event);
    } else {
      var cancelEvent = new CustomEvent('swipecancel', {
        detail: _extends({
          touch: touch,
          target: e.target
        }, eventCoords)
      });
      element.dispatchEvent(cancelEvent);
    }
  };

  // When a swipe is performed, store the coords.
  var _touchmove = function _touchmove(e) {
    var touch = e.changedTouches[0];
    touches.push({
      x: touch.clientX,
      y: touch.clientY
    });

    // Emit a `swiping` event if there are more than one touch-points.
    if (touches.length > 1) {
      var xs = touches[0].x,
          // Start and end x-coords
      xe = touches[touches.length - 1].x,
          ys = touches[0].y,
          // Start and end y-coords
      ye = touches[touches.length - 1].y,
          eventData = {
        detail: {
          x: [xs, xe],
          y: [ys, ye],
          touch: typeof TouchEvent === 'function' && e instanceof TouchEvent,
          target: e.target
        }
      };
      var event = new CustomEvent('swiping', eventData);

      var shouldPrevent = options.preventScroll === true || typeof options.preventScroll === 'function' && options.preventScroll(event);

      if (shouldPrevent) {
        e.preventDefault();
      }

      element.dispatchEvent(event);
    }
  };

  // Test via a getter in the options object to see if the passive property is accessed
  var passiveOptions = false;
  try {
    var testOptions = Object.defineProperty({}, 'passive', {
      get: function get() {
        passiveOptions = { passive: !options.preventScroll };
      }
    });
    window.addEventListener('testPassive', null, testOptions);
    window.removeEventListener('testPassive', null, testOptions);
  } catch (e) {}

  if (options.touch) {
    element.addEventListener('touchmove', _touchmove, passiveOptions);
    element.addEventListener('touchend', _touchend);
  }

  return {
    off: function off() {
      element.removeEventListener('touchmove', _touchmove, passiveOptions);
      element.removeEventListener('touchend', _touchend);
      element.removeEventListener('mousedown', _mousedown);
      element.removeEventListener('mouseup', _mouseup);
      element.removeEventListener('mousemove', _mousemove);
    }
  };
};

if (typeof module !== 'undefined' && typeof module.exports !== 'undefined') {
  module.exports = SwipeListener;
  module.exports.default = SwipeListener;
} else {
  if (typeof define === 'function' && define.amd) {
    define([], function () {
      return SwipeListener;
    });
  } else {
    window.SwipeListener = SwipeListener;
  }
}
