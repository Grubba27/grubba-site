import { useRef } from 'react';
import { BACKGROUNDS, PLATFORMS } from './render';

// how big the large picture is drawn, in CSS pixels; dragging it is measured against this
export const PREVIEW_AVATAR = 192;

const SHAPE_CLASS = { square: '', rounded: 'bx-avatar--rounded', circle: 'bx-avatar--circle' };

// What the picture will look like where it is going: a profile and a message, in the shape
// the platform gives pictures, on the theme the picture fades into. Nothing else is imitated.
function Preview({ url, effect, onPan }) {
  const shape = SHAPE_CLASS[PLATFORMS[effect.platform].shape];
  const last = useRef(null);

  const start = (event) => {
    if (!url) return;
    last.current = { x: event.clientX, y: event.clientY };
    event.currentTarget.setPointerCapture(event.pointerId);
  };

  const move = (event) => {
    if (!last.current) return;
    onPan(event.clientX - last.current.x, event.clientY - last.current.y);
    last.current = { x: event.clientX, y: event.clientY };
  };

  const end = () => {
    last.current = null;
  };

  return (
    <section className="bx-preview" aria-label="Preview">
      <h2 className="bx-label">Preview</h2>
      <div
        className="bx-card"
        data-background={effect.background}
        style={{ '--bx-card-bg': BACKGROUNDS[effect.background].color }}
      >
        <div className="bx-card__profile">
          <div
            className={`bx-avatar bx-avatar--big ${shape}`}
            style={{ width: PREVIEW_AVATAR, height: PREVIEW_AVATAR, cursor: url ? 'grab' : 'default' }}
            onPointerDown={start}
            onPointerMove={move}
            onPointerUp={end}
            onPointerCancel={end}
          >
            {url ? (
              <img src={url} alt="Your picture, deactivated" draggable={false} />
            ) : (
              <span className="bx-avatar__empty" aria-hidden="true">?</span>
            )}
          </div>
          <p className="bx-card__name">Your name</p>
          <p className="bx-card__status">Deactivated account</p>
        </div>
        <div className="bx-message">
          <div className={`bx-avatar bx-avatar--small ${shape}`} aria-hidden="true">
            {url && <img src={url} alt="" draggable={false} />}
          </div>
          <div>
            <p className="bx-message__head">
              <b>Your name</b> <span>(deactivated)</span> <span>9:41 AM</span>
            </p>
            <p className="bx-message__text">It has been a pleasure, everyone.</p>
          </div>
        </div>
      </div>
      <p className="bx-hint">{url ? 'Drag the big picture to move it.' : 'Choose a picture to see it here.'}</p>
    </section>
  );
}

export default Preview;
