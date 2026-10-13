import { useEffect, useRef, useState } from 'react';
import { EXPORT_SIZE, PREVIEW_SIZE, cropRect, drawAvatar, toBlob } from './render';
import { FILE_NAME } from './site';

const draw = async ({ picture, zoom, offset, effect }, size) => {
  const canvas = document.createElement('canvas');
  drawAvatar(canvas, { image: picture.image, crop: cropRect(picture.image, zoom, offset), size, effect });

  return toBlob(canvas);
};

// Draws the picture again whenever anything about it changes and hands back a URL to show it
// from, plus a way to save it at full size.
export function useAvatar(state) {
  const { picture, zoom, offset, effect } = state;
  // the latest drawing: its URL, and the picture it is of
  const [drawn, setDrawn] = useState(null);
  const shown = useRef(null);

  useEffect(() => {
    if (!picture) return undefined;

    let stale = false;
    // one drawing per frame, however fast the sliders move
    const frame = requestAnimationFrame(async () => {
      const blob = await draw({ picture, zoom, offset, effect }, PREVIEW_SIZE);
      if (stale) return;

      const url = URL.createObjectURL(blob);
      const previous = shown.current;
      shown.current = url;
      setDrawn({ url, picture });
      // the <img>s move on to the new URL with this render; the old one can go a moment later
      if (previous) setTimeout(() => URL.revokeObjectURL(previous), 1000);
    });

    return () => {
      stale = true;
      cancelAnimationFrame(frame);
    };
  }, [picture, zoom, offset, effect]);

  // the last URL goes with the page
  useEffect(
    () => () => {
      if (shown.current) URL.revokeObjectURL(shown.current);
    },
    [],
  );

  const download = async () => {
    if (!picture) return;

    const blob = await draw({ picture, zoom, offset, effect }, EXPORT_SIZE);
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = FILE_NAME;
    link.click();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
  };

  // a drawing of another picture is never shown for the new one
  return { previewUrl: drawn && drawn.picture === picture ? drawn.url : null, download };
}
