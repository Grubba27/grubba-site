import { useCallback, useEffect, useRef, useState } from 'react';
import { BACKGROUNDS, DEFAULT_EFFECT, PLATFORMS, clampOffset, cropRect, loadImage } from './render';
import { useAvatar } from './useAvatar';
import Preview, { PREVIEW_AVATAR } from './Preview';

const percent = (fraction) => `${Math.round(fraction * 100)}%`;

function Choice({ type = 'radio', children, ...input }) {
  return (
    <label className="bx-choice">
      <input type={type} {...input} />
      {children}
    </label>
  );
}

function Slider({ label, value, display, ...input }) {
  return (
    <label className="bx-slider">
      <span>{label}</span>
      <input type="range" value={value} {...input} />
      <output>{display}</output>
    </label>
  );
}

// The controls and the preview. The picture is decoded, drawn and saved in this browser only.
function Maker() {
  const [picture, setPicture] = useState(null);
  const [zoom, setZoom] = useState(1);
  const [offset, setOffset] = useState({ x: 0, y: 0 });
  const [effect, setEffect] = useState(DEFAULT_EFFECT);
  const [error, setError] = useState(null);
  const fileInput = useRef(null);
  const { previewUrl, download } = useAvatar({ picture, zoom, offset, effect });

  const choose = useCallback(async (file) => {
    if (!file) return;
    if (!file.type.startsWith('image/')) {
      setError('That file is not a picture.');
      return;
    }

    try {
      const image = await loadImage(file);
      setPicture({ image, name: file.name });
      setZoom(1);
      setOffset({ x: 0, y: 0 });
      setError(null);
    } catch (problem) {
      setError(problem.message);
    }
  }, []);

  // a picture can also be pasted anywhere on the page
  useEffect(() => {
    const onPaste = (event) => choose(event.clipboardData?.files[0]);
    window.addEventListener('paste', onPaste);

    return () => window.removeEventListener('paste', onPaste);
  }, [choose]);

  const drop = (event) => {
    event.preventDefault();
    choose(event.dataTransfer.files[0]);
  };

  const set = (change) => setEffect((current) => ({ ...current, ...change }));

  const changeZoom = (value) => {
    setZoom(value);
    setOffset((current) => clampOffset(picture.image, value, current));
  };

  // the preview is drawn smaller than the square it shows, so a drag covers more source pixels
  const pan = (dx, dy) => {
    const scale = cropRect(picture.image, zoom, offset).side / PREVIEW_AVATAR;
    setOffset((current) => clampOffset(picture.image, zoom, { x: current.x - dx * scale, y: current.y - dy * scale }));
  };

  return (
    <div className="bx-maker" onDragOver={(event) => event.preventDefault()} onDrop={drop}>
      <div className="bx-maker__controls">
        <section className="bx-field" aria-labelledby="bx-picture">
          <h2 id="bx-picture" className="bx-label">Picture</h2>
          <div className="bx-field__row">
            <button type="button" className="bx-btn bx-press" onClick={() => fileInput.current.click()}>
              Choose a picture
            </button>
            <span className="bx-hint">{picture ? picture.name : 'or drop it on this page, or paste it'}</span>
          </div>
          <input
            ref={fileInput}
            className="bx-sr-only"
            type="file"
            accept="image/*"
            aria-label="Picture file"
            onChange={(event) => choose(event.target.files[0])}
          />
          <Slider
            label="Zoom"
            min="1"
            max="3"
            step="0.01"
            value={zoom}
            display={`${zoom.toFixed(1)}×`}
            disabled={!picture}
            onChange={(event) => changeZoom(Number(event.target.value))}
          />
        </section>

        <fieldset className="bx-field bx-choices">
          <legend className="bx-label">Made for</legend>
          {Object.entries(PLATFORMS).map(([id, platform]) => (
            <Choice
              key={id}
              name="platform"
              value={id}
              checked={effect.platform === id}
              onChange={() => set({ platform: id })}
            >
              {platform.label}
            </Choice>
          ))}
        </fieldset>

        <section className="bx-field" aria-labelledby="bx-look">
          <h2 id="bx-look" className="bx-label">Look</h2>
          <Slider
            label="Grey"
            min="0"
            max="100"
            value={Math.round(effect.grey * 100)}
            display={percent(effect.grey)}
            onChange={(event) => set({ grey: Number(event.target.value) / 100 })}
          />
          <Slider
            label="Fade"
            min="0"
            max="90"
            value={Math.round(effect.fade * 100)}
            display={percent(effect.fade)}
            onChange={(event) => set({ fade: Number(event.target.value) / 100 })}
          />
          <fieldset className="bx-choices">
            <legend className="bx-label">Fades into</legend>
            {Object.entries(BACKGROUNDS).map(([id, background]) => (
              <Choice
                key={id}
                name="background"
                value={id}
                checked={effect.background === id}
                onChange={() => set({ background: id })}
              >
                {background.label}
              </Choice>
            ))}
          </fieldset>
          <div className="bx-choices">
            <Choice type="checkbox" checked={effect.lettering} onChange={(event) => set({ lettering: event.target.checked })}>
              Write on the picture
            </Choice>
          </div>
          <label className="bx-text">
            <span className="bx-sr-only">Text written on the picture</span>
            <input
              type="text"
              value={effect.text}
              maxLength={40}
              disabled={!effect.lettering}
              onChange={(event) => set({ text: event.target.value })}
            />
          </label>
        </section>

        <div className="bx-maker__actions">
          <button type="button" className="bx-btn bx-press" disabled={!picture} onClick={download}>
            Download PNG
          </button>
          <span className="bx-hint">1024 × 1024 PNG</span>
        </div>
        {error && <p className="bx-error" role="alert">{error}</p>}
      </div>

      <Preview url={previewUrl} effect={effect} onPan={pan} />
    </div>
  );
}

export default Maker;
