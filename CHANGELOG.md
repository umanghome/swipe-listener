# Changelog

### 1.1.0

- `main` in `package.json` refers to `dist/swipe-listener.min.js` instead of `index.js`. Transpiled version would be served directly.
- Added options `mouse` and `touch` to allow setting which input source swipes should be listened for.
- Updated `package-lock.json`.
- Added sanity checks for `TouchEvent`. Library should start working on IE and Edge.
- Exports `default` for ES6 imports.

### 1.0.7

Add `touch` property to events.

### 1.0.6

Uses `passive` event listener for touchmove and mousemove events.

### 1.0.5

Adds `swiping`, `swiperelease`, `swipecancel` events.

### 1.0.4

Adds support for swipes using mouse, defaults `lockAxis` to `true`.

### 1.0.3

Adds `lockAxis` option.

### 1.0.2

Adds `preventScroll` option.

### 1.0.1

- Renames `onswipe` to `swipe`.

### 1.0.0

- Basic swipe-listener.
