/**
 * Starts monitoring swipes on the given element and
 * emits `swipe` event when a swipe gesture is performed.
 * @param {DOMElement} element Element on which to listen for swipe gestures.
 * @param {Object} options Optional: Options.
 * @return {Object}
 */
export default function SwipeListener(element: any, options: any): {
    off: () => void;
} | undefined;
