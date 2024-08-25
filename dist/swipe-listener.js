(function (global, factory) {
    typeof exports === 'object' && typeof module !== 'undefined' ? module.exports = factory() :
    typeof define === 'function' && define.amd ? define(factory) :
    (global = typeof globalThis !== 'undefined' ? globalThis : global || self, global.SwipeListener = factory());
})(this, (function () { 'use strict';

    /******************************************************************************
    Copyright (c) Microsoft Corporation.

    Permission to use, copy, modify, and/or distribute this software for any
    purpose with or without fee is hereby granted.

    THE SOFTWARE IS PROVIDED "AS IS" AND THE AUTHOR DISCLAIMS ALL WARRANTIES WITH
    REGARD TO THIS SOFTWARE INCLUDING ALL IMPLIED WARRANTIES OF MERCHANTABILITY
    AND FITNESS. IN NO EVENT SHALL THE AUTHOR BE LIABLE FOR ANY SPECIAL, DIRECT,
    INDIRECT, OR CONSEQUENTIAL DAMAGES OR ANY DAMAGES WHATSOEVER RESULTING FROM
    LOSS OF USE, DATA OR PROFITS, WHETHER IN AN ACTION OF CONTRACT, NEGLIGENCE OR
    OTHER TORTIOUS ACTION, ARISING OUT OF OR IN CONNECTION WITH THE USE OR
    PERFORMANCE OF THIS SOFTWARE.
    ***************************************************************************** */

    var __assign = function() {
        __assign = Object.assign || function __assign(t) {
            for (var s, i = 1, n = arguments.length; i < n; i++) {
                s = arguments[i];
                for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p)) t[p] = s[p];
            }
            return t;
        };
        return __assign.apply(this, arguments);
    };

    typeof SuppressedError === "function" ? SuppressedError : function (error, suppressed, message) {
        var e = new Error(message);
        return e.name = "SuppressedError", e.error = error, e.suppressed = suppressed, e;
    };

    var DEFAULT_OPTIONS = {
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
     */
    function SwipeListener(element, options) {
        if (!element) {
            return;
        }
        // Set options
        if (!options) {
            options = {};
        }
        options = __assign(__assign({}, DEFAULT_OPTIONS), options);
        // Store the touches
        var touches = [];
        // Not dragging by default.
        var dragging = false;
        // When mouse-click is started, make dragging true.
        var _mousedown = function (e) {
            dragging = true;
        };
        // When mouse-click is released, make dragging false and signify end by imitating `touchend`.
        var _mouseup = function (e) {
            dragging = false;
            _touchend(e);
        };
        // When mouse is moved while being clicked, imitate a `touchmove`.
        var _mousemove = function (e) {
            if (dragging) {
                _touchmove(__assign(__assign({}, e), { changedTouches: [
                        // @ts-expect-error -- We only care about a few properties
                        {
                            clientX: e.clientX,
                            clientY: e.clientY,
                        },
                    ] }));
            }
        };
        if (options.mouse) {
            element.addEventListener('mousedown', _mousedown);
            element.addEventListener('mouseup', _mouseup);
            element.addEventListener('mousemove', _mousemove);
        }
        // When the swipe is completed, calculate the direction.
        var _touchend = function (e) {
            if (!touches.length) {
                return;
            }
            var touch = typeof TouchEvent === 'function' && e instanceof TouchEvent;
            var x = [], y = [];
            var directions = {
                top: false,
                right: false,
                bottom: false,
                left: false,
            };
            for (var i = 0; i < touches.length; i++) {
                x.push(touches[i].x);
                y.push(touches[i].y);
            }
            var xs = x[0], xe = x[x.length - 1], // Start and end x-coords
            ys = y[0], ye = y[y.length - 1]; // Start and end y-coords
            var eventCoords = {
                x: [xs, xe],
                y: [ys, ye],
            };
            if (touches.length > 1) {
                var swipeReleaseEventData = {
                    detail: __assign({ touch: touch, target: e.target }, eventCoords),
                };
                var swipeReleaseEvent = new CustomEvent('swiperelease', swipeReleaseEventData);
                element.dispatchEvent(swipeReleaseEvent);
            }
            // Determine left or right
            var diff = x[0] - x[x.length - 1];
            var swipe = 'none';
            if (diff > 0) {
                swipe = 'left';
            }
            else {
                swipe = 'right';
            }
            var min = Math.min.apply(Math, x), max = Math.max.apply(Math, x), _diff;
            // If minimum horizontal distance was travelled
            if (typeof options.minHorizontal === 'number' &&
                Math.abs(diff) >= options.minHorizontal) {
                switch (swipe) {
                    case 'left':
                        _diff = Math.abs(min - x[x.length - 1]);
                        if (typeof options.deltaHorizontal === 'number' &&
                            _diff <= options.deltaHorizontal) {
                            directions.left = true;
                        }
                        break;
                    case 'right':
                        _diff = Math.abs(max - x[x.length - 1]);
                        if (typeof options.deltaHorizontal === 'number' &&
                            _diff <= options.deltaHorizontal) {
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
            }
            else {
                swipe = 'bottom';
            }
            min = Math.min.apply(Math, y);
            max = Math.max.apply(Math, y);
            // If minimum vertical distance was travelled
            if (typeof options.minVertical === 'number' &&
                Math.abs(diff) >= options.minVertical) {
                switch (swipe) {
                    case 'top':
                        _diff = Math.abs(min - y[y.length - 1]);
                        if (typeof options.deltaVertical === 'number' &&
                            _diff <= options.deltaVertical) {
                            directions.top = true;
                        }
                        break;
                    case 'bottom':
                        _diff = Math.abs(max - y[y.length - 1]);
                        if (typeof options.deltaVertical === 'number' &&
                            _diff <= options.deltaVertical) {
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
                /**
                 * If lockAxis is true, determine which axis to select.
                 * The axis with the most travel is selected.
                 * TODO: Factor in for the orientation of the device
                 * and use it as a weight to determine the travel along an axis.
                 */
                if (options.lockAxis) {
                    if ((directions.left || directions.right) &&
                        Math.abs(xs - xe) > Math.abs(ys - ye)) {
                        directions.top = directions.bottom = false;
                    }
                    else if ((directions.top || directions.bottom) &&
                        Math.abs(xs - xe) < Math.abs(ys - ye)) {
                        directions.left = directions.right = false;
                    }
                }
                var eventData = {
                    detail: __assign({ directions: directions, touch: touch, target: e.target }, eventCoords),
                };
                var event_1 = new CustomEvent('swipe', eventData);
                element.dispatchEvent(event_1);
            }
            else {
                var cancelEvent = new CustomEvent('swipecancel', {
                    detail: __assign({ touch: touch, target: e.target }, eventCoords),
                });
                element.dispatchEvent(cancelEvent);
            }
        };
        // When a swipe is performed, store the coords.
        var _touchmove = function (e) {
            var touch = e.changedTouches[0];
            touches.push({
                x: touch.clientX,
                y: touch.clientY,
            });
            // Emit a `swiping` event if there are more than one touch-points.
            if (touches.length > 1) {
                var xs = touches[0].x, // Start and end x-coords
                xe = touches[touches.length - 1].x, ys = touches[0].y, // Start and end y-coords
                ye = touches[touches.length - 1].y, eventData = {
                    detail: {
                        x: [xs, xe],
                        y: [ys, ye],
                        touch: typeof TouchEvent === 'function' && e instanceof TouchEvent,
                        target: e.target,
                    },
                };
                var event_2 = new CustomEvent('swiping', eventData);
                var shouldPrevent = options.preventScroll === true ||
                    (typeof options.preventScroll === 'function' &&
                        options.preventScroll(event_2));
                if (shouldPrevent) {
                    e.preventDefault();
                }
                element.dispatchEvent(event_2);
            }
        };
        /**
         * START: Feature detection for passive events
         * https://github.com/WICG/EventListenerOptions/blob/gh-pages/explainer.md#feature-detection
         */
        var passiveOptions = false;
        try {
            var testOptions = Object.defineProperty({}, 'passive', {
                get: function () {
                    passiveOptions = {
                        passive: !options.preventScroll,
                    }; // Explicit cast because `EventListenerOptions` does not have `passive` property.
                },
            });
            // @ts-expect-error -- `testPassive` is not an actual event
            window.addEventListener('testPassive', null, testOptions);
            // @ts-expect-error -- `testPassive` is not an actual event
            window.removeEventListener('testPassive', null, testOptions);
        }
        catch (e) { }
        /**
         * END: Feature detection for passive events
         */
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

    return SwipeListener;

}));
//# sourceMappingURL=swipe-listener.js.map
