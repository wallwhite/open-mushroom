import { type ComponentProps, type CSSProperties, useEffect, useRef } from 'react';

import { ensureMushroomGsap, type MushroomGsap, type MushroomTimeline } from '../core/animations/mushroom-gsap';
import { joinClassNames } from './join-class-names';
import { buildBubbleTimeline, buildInstantBubbleTimeline } from './speech-bubble-motion';

/*
 * The speech bubble: a plain white card with a tail growing out of its
 * bottom-right corner, toward the mushroom sitting below it. Styled by the
 * package stylesheet (`open-mushroom/styles.css`, `.om-bubble*` classes) and
 * themed through `--om-bubble-*` custom properties.
 */

/*
 * The tail, drawn in its own box hung under the corner.
 *
 * Its base is the segment of the bubble's own bottom edge to the left of the
 * corner (`TAIL_ANCHOR_PX` of it), so the shape grows out of the card rather
 * than being stuck beside it. From there the outer edge sweeps down and right
 * to a rounded tip and the inner edge curves back, giving the soft comic-strip
 * fin instead of a paper aeroplane.
 */
const TAIL_PATH = 'M0 0H18C18.5 7.5 21 14.5 27.4 21.4 28.4 22.4 27.8 23.9 26.4 23.4 14.6 19.4 5.6 11 0 0Z';
const TAIL_WIDTH = 30;
const TAIL_HEIGHT = 25;
/* Where the bubble's right edge falls inside that box. */
const TAIL_ANCHOR_PX = 16;
/* A hairline of overlap, so the two whites never show a seam between them. */
const TAIL_OVERLAP = 1;
const REDUCED_MOTION_QUERY = '(prefers-reduced-motion: reduce)';

const noop = (): void => {};

export interface MushroomSpeechBubbleProps {
  text: string;
  visible: boolean;
  /* Name line above the text; the line is not rendered without it. */
  speaker?: string;
  /* Given when the line is in the way and the person may wave it off. */
  onDismiss?: () => void;
  className?: string;
  style?: CSSProperties;
}

/*
 * The white card itself. A div rather than a <button> even when it is
 * clickable: its content is paragraphs, which a button may not contain.
 */
const Card = ({ className, children, ...props }: ComponentProps<'div'>) => (
  <div {...props} className={joinClassNames('om-bubble__card', className)}>
    {children}
  </div>
);

export const MushroomSpeechBubble = ({
  text,
  visible,
  speaker,
  onDismiss,
  className,
  style,
}: MushroomSpeechBubbleProps) => {
  /*
   * The text empties in the same commit that starts the exit transition, so
   * without this the reader watches a blank card shrink away every time.
   * Holding the last line lets it fade out with words still in it.
   */
  const lastText = useRef(text);
  const rootRef = useRef<HTMLDivElement>(null);
  /* Kept so a toggle after the first one is instant rather than another await. */
  const gsapRef = useRef<MushroomGsap | null>(null);
  const timelineRef = useRef<MushroomTimeline | null>(null);

  if (text.length > 0) lastText.current = text;

  useEffect(() => {
    const element = rootRef.current;

    if (element === null) return noop;

    let cancelled = false;

    const play = (gsap: MushroomGsap): void => {
      if (cancelled) return;
      gsapRef.current = gsap;
      /*
       * Killed rather than reverted: reverting restores the state from before
       * the previous run, which for a card mid-arrival is invisible; the exit
       * would then have nothing left to fade.
       */
      timelineRef.current?.kill();
      timelineRef.current = window.matchMedia(REDUCED_MOTION_QUERY).matches
        ? buildInstantBubbleTimeline(gsap, element, visible)
        : buildBubbleTimeline(gsap, element, visible);
    };

    if (gsapRef.current === null) {
      ensureMushroomGsap()
        .then(play)
        .catch(() => {
          /* No GSAP: the bubble still comes and goes, just without the swing. */
          if (!cancelled) element.style.opacity = visible ? '1' : '0';
        });
    } else {
      play(gsapRef.current);
    }

    return () => {
      cancelled = true;
    };
  }, [visible]);

  useEffect(
    () => () => {
      timelineRef.current?.kill();
    },
    [],
  );

  return (
    <div
      ref={rootRef}
      /*
       * Ambient decoration: a live region firing lines into a screen reader
       * helps nobody, and the real affordance sits elsewhere in the page.
       */
      aria-hidden="true"
      className={joinClassNames('om-bubble', className)}
      /* Hidden until the timeline says otherwise, so nothing flashes on mount. */
      style={{ ...style, opacity: 0 }}
    >
      {/*
       * A button when it can be dismissed, so the click has a real target and
       * a cursor; still `aria-hidden` with the wrapper, and out of the tab
       * order. Only the card takes pointer events: the tail and the padding
       * around it stay transparent to clicks on the page beneath.
       *
       * And only while it is on screen. The exit animates opacity, not display,
       * so a card left clickable would go on swallowing taps over a band of
       * every page long after it faded, with nothing visible to blame for it.
       */}
      <Card
        {...(onDismiss === undefined || !visible
          ? {}
          : {
              role: 'button' as const,
              tabIndex: -1,
              className: 'om-bubble__card--dismissable',
              onClick: onDismiss,
            })}
      >
        {speaker === undefined ? null : <p className="om-bubble__speaker">{speaker}</p>}
        <p className="om-bubble__text">{text.length > 0 ? text : lastText.current}</p>
      </Card>

      <svg
        className="om-bubble__tail"
        viewBox={`0 0 ${TAIL_WIDTH} ${TAIL_HEIGHT}`}
        fill="currentColor"
        aria-hidden="true"
        focusable="false"
        style={{
          left: `calc(100% - ${TAIL_ANCHOR_PX}px)`,
          top: '80%',
          marginTop: -TAIL_OVERLAP,
          width: TAIL_WIDTH,
          height: TAIL_HEIGHT,
        }}
      >
        <path d={TAIL_PATH} />
      </svg>
    </div>
  );
};
