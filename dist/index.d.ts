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
    preventScroll?: boolean | ((event: MouseEvent | TouchEvent) => boolean);
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
/**
 * Starts monitoring swipes on the given element and
 * emits `swipe` event when a swipe gesture is performed.
 */
export default function SwipeListener(element: HTMLElement, options?: SwipeListenerOptions): {
    off: () => void;
} | undefined;
