// Everything here draws on canvases in the visitor's browser: the picture never leaves it.

export const PREVIEW_SIZE = 512;
// the largest profile picture the platforms take; it is always a full square
export const EXPORT_SIZE = 1024;

// Where the picture will be used decides the shape it is shown in, and so where lettering
// can go. The platform masks the picture itself: the file is uploaded as a full square.
export const PLATFORMS = {
  slack: { label: 'Slack', shape: 'rounded' },
  teams: { label: 'Microsoft Teams', shape: 'circle' },
  discord: { label: 'Discord', shape: 'circle' },
  other: { label: 'Somewhere else', shape: 'square' },
};

// the picture fades into the colour behind it, so the theme it will sit on has to be known
export const BACKGROUNDS = {
  light: { label: 'Light theme', color: '#ffffff' },
  dark: { label: 'Dark theme', color: '#1e1f22' },
};

export const DEFAULT_EFFECT = {
  platform: 'slack',
  grey: 1,
  fade: 0,
  background: 'light',
  lettering: false,
  text: 'Deactivated account',
};

// The band the lettering sits on, as fractions of the side, measured on the real thing: an
// opaque strip along the bottom with a small box icon and the text to its right. In a circle
// the band sits higher and its content is centred, or the platform's mask would cut it off.
const BANDS = {
  square: { top: 0.863, height: 0.137, align: 'left', textWidth: 0.8 },
  rounded: { top: 0.863, height: 0.137, align: 'left', textWidth: 0.8 },
  circle: { top: 0.7, height: 0.137, align: 'centre', textWidth: 0.6 },
};

export const bandFor = (shape) => BANDS[shape];

const BAND_COLOUR = 'rgb(53, 55, 59)';
const LETTERING_COLOUR = 'rgb(143, 144, 146)';
const LEFT_MARGIN = 0.068; // of the side
const ICON_GAP = 0.039; // between the icon and the text, of the side

// the `+ 0` turns the -0 that clamping a negative number to 0 gives into a plain 0
const clamp = (value, min, max) => Math.min(max, Math.max(min, value)) + 0;

const MAX_ZOOM = 3;

// How far the square can move from the centre of a picture, in source pixels.
const roomFor = ({ width, height }, zoom) => {
  const side = Math.min(width, height) / clamp(zoom, 1, MAX_ZOOM);

  return { side, x: (width - side) / 2, y: (height - side) / 2 };
};

// Keeps an offset within the picture, so that dragging never runs off its edges.
export function clampOffset(image, zoom, offset) {
  const room = roomFor(image, zoom);

  return { x: clamp(offset.x, -room.x, room.x), y: clamp(offset.y, -room.y, room.y) };
}

// The square to take from a picture: the largest one that fits, zoomed in by `zoom`, and
// moved from the centre by `offset` (source pixels) as far as the edges allow.
export function cropRect(image, zoom = 1, offset = { x: 0, y: 0 }) {
  const room = roomFor(image, zoom);
  const { x, y } = clampOffset(image, zoom, offset);

  return { x: room.x + x, y: room.y + y, side: room.side };
}

// Pulls each pixel towards its own luminance; 0 leaves the colours alone, 1 makes it grey.
export function greyOut(pixels, amount) {
  if (amount <= 0) return pixels;

  for (let i = 0; i < pixels.length; i += 4) {
    const r = pixels[i];
    const g = pixels[i + 1];
    const b = pixels[i + 2];
    const luma = 0.2126 * r + 0.7152 * g + 0.0722 * b;

    pixels[i] = r + (luma - r) * amount;
    pixels[i + 1] = g + (luma - g) * amount;
    pixels[i + 2] = b + (luma - b) * amount;
  }

  return pixels;
}

// The biggest font size, in px, at which `text` fits in `maxWidth`.
export function fitFontSize(ctx, text, font, maxWidth, maxSize) {
  let size = maxSize;

  while (size > 4) {
    ctx.font = font(size);
    if (ctx.measureText(text).width <= maxWidth) break;
    size -= 1;
  }

  return size;
}

const letteringFont = (px) =>
  `700 ${px}px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif`;

// A box with a lid: the icon next to the lettering. `x`, `y` is its top left, `side` its size.
function drawBoxIcon(ctx, x, y, side) {
  const lidHeight = side * 0.3;
  const bodyInset = side * 0.1;
  const corner = side * 0.08;

  ctx.fillStyle = LETTERING_COLOUR;
  ctx.beginPath();
  ctx.roundRect(x, y, side, lidHeight, corner);
  ctx.fill();
  ctx.beginPath();
  ctx.roundRect(x + bodyInset, y + lidHeight + side * 0.07, side - 2 * bodyInset, side - lidHeight - side * 0.07, [
    0,
    0,
    corner * 1.5,
    corner * 1.5,
  ]);
  ctx.fill();

  // the slot in the front of the box
  ctx.fillStyle = BAND_COLOUR;
  ctx.fillRect(x + side * 0.35, y + lidHeight + side * 0.2, side * 0.3, side * 0.08);
}

function drawLettering(ctx, size, text, shape) {
  const band = bandFor(shape);
  const top = Math.round(size * band.top);
  const height = Math.round(size * band.height);
  const middle = top + height / 2;
  const iconSide = height * 0.29;

  ctx.fillStyle = BAND_COLOUR;
  ctx.fillRect(0, top, size, height);

  // the text is as big as the band allows, smaller only when it would not fit the band
  const fontSize = fitFontSize(ctx, text, letteringFont, size * band.textWidth, height * 0.38);
  ctx.font = letteringFont(fontSize);
  const textWidth = ctx.measureText(text).width;
  const contentWidth = iconSide + size * ICON_GAP + textWidth;
  const left = band.align === 'left' ? size * LEFT_MARGIN : (size - contentWidth) / 2;

  drawBoxIcon(ctx, left, middle - iconSide / 2, iconSide);

  ctx.fillStyle = LETTERING_COLOUR;
  ctx.textAlign = 'left';
  ctx.textBaseline = 'middle';
  ctx.fillText(text, left + iconSide + size * ICON_GAP, middle);
}

// Draws the finished picture on `canvas`: the chosen square of `image`, greyed out and faded
// into the theme's background, with the lettering band on top when asked for.
export function drawAvatar(canvas, { image, crop, size, effect }) {
  const { platform, grey, fade, background, lettering, text } = effect;

  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext('2d');

  ctx.fillStyle = BACKGROUNDS[background].color;
  ctx.fillRect(0, 0, size, size);

  // the picture goes grey on a scratch canvas, so that only its own pixels lose their colour
  const scratch = document.createElement('canvas');
  scratch.width = size;
  scratch.height = size;
  const scratchCtx = scratch.getContext('2d');
  scratchCtx.drawImage(image, crop.x, crop.y, crop.side, crop.side, 0, 0, size, size);

  if (grey > 0) {
    const imageData = scratchCtx.getImageData(0, 0, size, size);
    greyOut(imageData.data, grey);
    scratchCtx.putImageData(imageData, 0, 0);
  }

  ctx.globalAlpha = 1 - clamp(fade, 0, 0.95);
  ctx.drawImage(scratch, 0, 0);
  ctx.globalAlpha = 1;

  if (lettering && text.trim()) drawLettering(ctx, size, text.trim(), PLATFORMS[platform].shape);

  return canvas;
}

export const toBlob = (canvas, type = 'image/png') =>
  new Promise((resolve, reject) => {
    canvas.toBlob((blob) => (blob ? resolve(blob) : reject(new Error('The picture could not be saved.'))), type);
  });

// Decodes a chosen file into something the canvas can draw. Browsers apply the rotation stored
// in phone photos themselves while decoding into an <img>.
export const loadImage = (file) =>
  new Promise((resolve, reject) => {
    const url = URL.createObjectURL(file);
    const image = new Image();

    image.onload = () => {
      URL.revokeObjectURL(url);
      resolve(image);
    };
    image.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new Error('This browser cannot open that file as a picture.'));
    };
    image.src = url;
  });
