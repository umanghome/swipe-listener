# Swipe-Listener
[![npm version](https://badge.fury.io/js/swipe-listener.svg)](https://www.npmjs.com/package/swipe-listener)

Zero-dependency, minimal swipe-gesture listener for the web.

---

## [Demo](https://umanghome.github.io/swipe-listener)

# What

Swipe-listener is a very minimal library that allows listening for swipe gesture on literally any DOM element. Once invoked with a DOM element, simply listen for `swipe` event and determine the direction with the `directions` object.

# Example Code

```js
var container = document.querySelector('#container');
var listener = SwipeListener(container);
container.addEventListener('swipe', function (e) {
  var directions = e.detail.directions;
  var x = e.detail.x;
  var y = e.detail.y;

  if (directions.left) {
    console.log('Swiped left.');
  }

  if (directions.right) {
    console.log('Swiped right.');
  }

  if (directions.top) {
    console.log('Swiped top.');
  }

  if (directions.bottom) {
    console.log('Swiped bottom.');
  }

  if (directions.top && directions.right) {
    console.log('Swiped top-right.');
  }

  if (directions.top && directions.left) {
    console.log('Swiped top-left.');
  }

  if (directions.bottom && directions.right) {
    console.log('Swiped bottom-right.');
  }

  if (directions.bottom && directions.left) {
    console.log('Swiped bottom-left.');
  }

  console.log('Started horizontally at', x[0], 'and ended at', x[1]);
  console.log('Started vertically at', y[0], 'and ended at', y[1]);
});
```

# Installation

## Browser

```html
<script src="path/to/swipe-listener.min.js" type="text/javascript"></script>
<script>
  var container = document.querySelector('#container');
  var listener = SwipeListener(container);
  container.addEventListener('swipe', function (e) {
    console.log(e.detail);
  });
</script>
```

Swipe-listener is also available from unpkg: [`https://unpkg.com/swipe-listener@1.2.0/dist/swipe-listener.min.js`](https://unpkg.com/swipe-listener@1.2.0/dist/swipe-listener.min.js)

## Installing using NPM

Install from NPM using `npm i --save swipe-listener`, then

```js
import SwipeListener from 'swipe-listener';
```

OR

```js
const SwipeListener = require('swipe-listener');
```

# API

### `SwipeListener(element, options)`

- `element` DOM Element on which you want to enable swipe gesture tracking. This is the element on which you will be attacking the `swipe` event listener.
- `options` [Optional] Configuration options (see below)

Listen for `swipe` event on the `element` passed. Access details using `event.detail`. For example, `directions` can be accessed using `event.detail.directions`. See [events](#events) for more events.

Data passed to `event.detail`:

- `directions` (Object)
  - `top` (Boolean) Signifies a top-swipe.
  - `right` (Boolean) Signifies a right-swipe.
  - `bottom` (Boolean) Signifies a bottom-swipe.
  - `left` (Boolean) Signifies a left-swipe.
- `x` (Array) Array containing two elements: starting and ending x-coords.
- `y` (Array) Array containing two elements: starting and ending y-coords.
- `touch` (Boolean) Whether or not `TouchEvent` was used for this particular event.

**Note that multiple directions can be `true` at one. In case of a top-left swipe, `directions.top` and `directions.left` will both be `true`.**

### Options

| Key | Description | Default value |
| --- | --- | --- |
| `minHorizontal` | Minimum number of horizontal pixels travelled for the gesture to be considered as a left or right swipe. | `10` |
| `minVertical` | Minimum number of vertical pixels travelled for the gesture to be considered as a top or bottom swipe. | `10` |
| `deltaHorizontal` | Maximum difference between the rightmost pixel (right-swipe) or the leftmost pixel (left-swipe) travelled to and the pixel at which the gesture is released. | `3` |
| `deltaVertical` | Maximum difference between the bottommost pixel (bottom-swipe) or the topmost pixel (top-swipe) travelled to and the pixel at which the gesture is released. | `5` |
| `preventScroll` | Prevents page scrolling when swiping on the DOM element.  Can also be specified as a function with the signature `(event) => boolean` | `false` |
| `lockAxis` | Enforces only one direction to be true instead of multiple. Selects the direction with the most travel. Is not enforced when the travel is equal. Example: for a top-left swipe, only one of `top` and `left` will be `true` instead of both. | `true` |
| `touch` | Whether to listen for swipes with touch events | `true` |
| `mouse` | Whether to listen for swipes with mouse events | `true` |

### `.off()`

Turns off the swipe-listener on a given element.

Usage:

```js
var listener = SwipeListener(myElem);
listener.off();
```

# Events

### `swipe` - Emitted once a swipe is performed.

Emitted once a swipe is completed.

`event.detail` contains

| key | type | description |
| --- | --- | --- |
| `directions` | Object | Object containing `top`, `left`, `bottom`, `right` keys. The directions in which the swipe is performed are set to `true`. |
| `x` | Array | Array of two items: the starting x-coordinate and the ending x-coordinate. |
| `y` | Array | Array of two items: the starting y-coordinate and the ending y-coordinate. |
| `touch` | Boolean | Whether or not `TouchEvent` was used for this particular event. |

### `swiping` - Emitted while a swipe is being performed.

Emitted multiple times during a single swipe.

`event.detail` contains

| key | type | description |
| --- | --- | --- |
| `x` | Array | Array of two items: the starting x-coordinate and the ending x-coordinate. |
| `y` | Array | Array of two items: the starting y-coordinate and the ending y-coordinate. |
| `touch` | Boolean | Whether or not `TouchEvent` was used for this particular event. |

### `swiperelease` - Emitted once the swipe is released/completed.

Emitted at the end of the swipe.

`event.detail` contains

| key | type | description |
| --- | --- | --- |
| `x` | Array | Array of two items: the starting x-coordinate and the ending x-coordinate. |
| `y` | Array | Array of two items: the starting y-coordinate and the ending y-coordinate. |
| `touch` | Boolean | Whether or not `TouchEvent` was used for this particular event. |

### `swipecancel` - Emitted if the swipe-distance did not meet minimum travel-distance.

Emitted at the end of the swipe.

`event.detail` contains

| key | type | description |
| --- | --- | --- |
| `x` | Array | Array of two items: the starting x-coordinate and the ending x-coordinate. |
| `y` | Array | Array of two items: the starting y-coordinate and the ending y-coordinate. |
| `touch` | Boolean | Whether or not `TouchEvent` was used for this particular event. |

# Misc

- When `lockAxis` is `false`, swipes using the mouse might make multiple directions `true` even when the travel in a certain direction may not be much. You can work around this by setting `lockAxis` to `true` when the page is not being accessed from a touch-enabled device. Or, you can use `event.detail.x` and `event.detail.y` to calculate which direction has more travel and consider only that direction. Or, you can increase the values of `minVertical` and `minHorizontal`.
- [`TouchEvent`](https://developer.mozilla.org/en-US/docs/Web/API/TouchEvent/TouchEvent) is not supported in IE and Edge. Unless you have polyfilled it into the page and it's available as `TouchEvent`, swipes made using touch will not be detected as touch swipes.

---

# License

[MIT License](https://opensource.org/licenses/MIT) © [Umang Galaiya](https://umanggalaiya.in/)
