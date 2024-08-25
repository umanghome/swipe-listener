export interface SwipeListenerOptions {
  /**
   * Minimum number of pixels traveled to count as a horizontal swipe.
   * @default 10
   */
  minHorizontal?: number;

  /**
   * Minimum number of pixels traveled to count as a vertical swipe.
   * @default 10
   */
  minVertical?: number;

  /**
   * Delta for horizontal swipe
   * @default 3
   */
  deltaHorizontal?: number;

  /**
   * Delta for vertical swipe
   * @default 5
   */
  deltaVertical?: number;

  /**
   * Prevents scrolling when swiping.
   * @default false
   */
  preventScroll?: boolean;

  /**
   * Select only one axis to be true instead of multiple.
   * @default true
   */
  lockAxis?: boolean;

  /**
   * Listen for touch events
   * @default true
   */
  touch?: boolean;

  /**
   * Listen for mouse events
   * @default true
   */
  mouse?: boolean;
}

const DEFAULT_OPTIONS: Required<SwipeListenerOptions> = {
  minHorizontal: 10,
  minVertical: 10,
  deltaHorizontal: 3,
  deltaVertical: 5,
  preventScroll: false,
  lockAxis: true,
  touch: true,
  mouse: true,
};

/**
 * Starts monitoring swipes on the given element and
 * emits `swipe` event when a swipe gesture is performed.
 * @param {DOMElement} element Element on which to listen for swipe gestures.
 * @param {Object} options Optional: Options.
 * @return {Object}
 */
export default function SwipeListener(
  element: HTMLElement,
  options?: SwipeListenerOptions
) {
  if (!element) {
    return;
  }

  // Set options
  if (!options) {
    options = {};
  }

  options = {
    ...DEFAULT_OPTIONS,
    ...options,
  };

  // Store the touches
  let touches = [];

  // Not dragging by default.
  let dragging = false;

  // When mouse-click is started, make dragging true.
  const _mousedown = function (e) {
    dragging = true;
  };

  // When mouse-click is released, make dragging false and signify end by imitating `touchend`.
  const _mouseup = function (e) {
    dragging = false;
    _touchend(e);
  };

  // When mouse is moved while being clicked, imitate a `touchmove`.
  const _mousemove = function (e) {
    if (dragging) {
      e.changedTouches = [
        {
          clientX: e.clientX,
          clientY: e.clientY,
        },
      ];
      _touchmove(e);
    }
  };

  if (options.mouse) {
    element.addEventListener('mousedown', _mousedown);
    element.addEventListener('mouseup', _mouseup);
    element.addEventListener('mousemove', _mousemove);
  }

  // When the swipe is completed, calculate the direction.
  const _touchend = function (e) {
    if (!touches.length) return;

    const touch = typeof TouchEvent === 'function' && e instanceof TouchEvent;

    let x = [],
      y = [];

    let directions = {
      top: false,
      right: false,
      bottom: false,
      left: false,
    };

    for (let i = 0; i < touches.length; i++) {
      x.push(touches[i].x);
      y.push(touches[i].y);
    }

    const xs = x[0],
      xe = x[x.length - 1], // Start and end x-coords
      ys = y[0],
      ye = y[y.length - 1]; // Start and end y-coords

    const eventCoords = {
      x: [xs, xe],
      y: [ys, ye],
    };

    if (touches.length > 1) {
      const swipeReleaseEventData = {
        detail: {
          touch,
          target: e.target,
          ...eventCoords,
        },
      };

      let swipeReleaseEvent = new CustomEvent(
        'swiperelease',
        swipeReleaseEventData
      );
      element.dispatchEvent(swipeReleaseEvent);
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
    if (
      directions.top ||
      directions.right ||
      directions.bottom ||
      directions.left
    ) {
      /**
       * If lockAxis is true, determine which axis to select.
       * The axis with the most travel is selected.
       * TODO: Factor in for the orientation of the device
       * and use it as a weight to determine the travel along an axis.
       */
      if (options.lockAxis) {
        if (
          (directions.left || directions.right) &&
          Math.abs(xs - xe) > Math.abs(ys - ye)
        ) {
          directions.top = directions.bottom = false;
        } else if (
          (directions.top || directions.bottom) &&
          Math.abs(xs - xe) < Math.abs(ys - ye)
        ) {
          directions.left = directions.right = false;
        }
      }

      const eventData = {
        detail: {
          directions,
          touch,
          target: e.target,
          ...eventCoords,
        },
      };

      let event = new CustomEvent('swipe', eventData);
      element.dispatchEvent(event);
    } else {
      let cancelEvent = new CustomEvent('swipecancel', {
        detail: {
          touch,
          target: e.target,
          ...eventCoords,
        },
      });
      element.dispatchEvent(cancelEvent);
    }
  };

  // When a swipe is performed, store the coords.
  const _touchmove = function (e) {
    let touch = e.changedTouches[0];
    touches.push({
      x: touch.clientX,
      y: touch.clientY,
    });

    // Emit a `swiping` event if there are more than one touch-points.
    if (touches.length > 1) {
      const xs = touches[0].x, // Start and end x-coords
        xe = touches[touches.length - 1].x,
        ys = touches[0].y, // Start and end y-coords
        ye = touches[touches.length - 1].y,
        eventData = {
          detail: {
            x: [xs, xe],
            y: [ys, ye],
            touch: typeof TouchEvent === 'function' && e instanceof TouchEvent,
            target: e.target,
          },
        };
      let event = new CustomEvent('swiping', eventData);

      const shouldPrevent =
        options.preventScroll === true ||
        (typeof options.preventScroll === 'function' &&
          options.preventScroll(event));

      if (shouldPrevent) {
        e.preventDefault();
      }

      element.dispatchEvent(event);
    }
  };

  // Test via a getter in the options object to see if the passive property is accessed
  let passiveOptions = false;
  try {
    const testOptions = Object.defineProperty({}, 'passive', {
      get: function () {
        passiveOptions = { passive: !options.preventScroll };
      },
    });
    window.addEventListener('testPassive', null, testOptions);
    window.removeEventListener('testPassive', null, testOptions);
  } catch (e) {}

  if (options.touch) {
    element.addEventListener('touchmove', _touchmove, passiveOptions);
    element.addEventListener('touchend', _touchend);
  }

  return {
    off: function () {
      element.removeEventListener('touchmove', _touchmove, passiveOptions);
      element.removeEventListener('touchend', _touchend);
      element.removeEventListener('mousedown', _mousedown);
      element.removeEventListener('mouseup', _mouseup);
      element.removeEventListener('mousemove', _mousemove);
    },
  };
}
