import { bandFor, clampOffset, cropRect, fitFontSize, greyOut } from './render';

describe('cropRect', () => {
  test('takes the largest centred square of a landscape picture', () => {
    expect(cropRect({ width: 400, height: 200 })).toEqual({ x: 100, y: 0, side: 200 });
  });

  test('takes the largest centred square of a portrait picture', () => {
    expect(cropRect({ width: 200, height: 400 })).toEqual({ x: 0, y: 100, side: 200 });
  });

  test('zooming in shrinks the square around the centre', () => {
    expect(cropRect({ width: 400, height: 400 }, 2)).toEqual({ x: 100, y: 100, side: 200 });
  });

  test('moves the square by the offset, but never past the edges', () => {
    expect(cropRect({ width: 400, height: 200 }, 1, { x: -50, y: 0 })).toEqual({ x: 50, y: 0, side: 200 });
    expect(cropRect({ width: 400, height: 200 }, 1, { x: 999, y: 999 })).toEqual({ x: 200, y: 0, side: 200 });
    expect(cropRect({ width: 400, height: 200 }, 1, { x: -999, y: -999 })).toEqual({ x: 0, y: 0, side: 200 });
  });

  test('zoom stays between 1 and 3', () => {
    expect(cropRect({ width: 300, height: 300 }, 0.2)).toEqual({ x: 0, y: 0, side: 300 });
    expect(cropRect({ width: 300, height: 300 }, 30)).toEqual({ x: 100, y: 100, side: 100 });
  });
});

describe('clampOffset', () => {
  test('keeps the offset within the room the zoom leaves', () => {
    const image = { width: 400, height: 400 };

    expect(clampOffset(image, 1, { x: 50, y: -50 })).toEqual({ x: 0, y: 0 });
    expect(clampOffset(image, 2, { x: 50, y: -50 })).toEqual({ x: 50, y: -50 });
    expect(clampOffset(image, 2, { x: 500, y: -500 })).toEqual({ x: 100, y: -100 });
  });
});

describe('greyOut', () => {
  const red = () => new Uint8ClampedArray([255, 0, 0, 255]);

  test('turns a pixel into its luminance at full strength', () => {
    expect(Array.from(greyOut(red(), 1))).toEqual([54, 54, 54, 255]);
  });

  test('leaves the pixel alone at zero', () => {
    expect(Array.from(greyOut(red(), 0))).toEqual([255, 0, 0, 255]);
  });

  test('keeps grey pixels where they are', () => {
    expect(Array.from(greyOut(new Uint8ClampedArray([128, 128, 128, 255]), 1))).toEqual([128, 128, 128, 255]);
  });

  test('goes halfway at 0.5', () => {
    const [r, g] = greyOut(red(), 0.5);
    expect(r).toBe(155);
    expect(g).toBe(27);
  });
});

describe('fitFontSize', () => {
  // a fake context where every character is as wide as half the font size
  const ctx = {
    font: '',
    measureText(text) {
      const size = Number(this.font.match(/(\d+)px/)[1]);
      return { width: (text.length * size) / 2 };
    },
  };
  const font = (px) => `${px}px sans-serif`;

  test('keeps the biggest size when the text already fits', () => {
    expect(fitFontSize(ctx, 'Hi', font, 100, 40)).toBe(40);
  });

  test('shrinks the text until it fits', () => {
    // 20 characters at 40px are 400 wide; they fit in 200 at 20px
    expect(fitFontSize(ctx, 'x'.repeat(20), font, 200, 40)).toBe(20);
  });
});

test('the lettering band runs along the bottom of a square, and sits higher, centred, in a circle', () => {
  expect(bandFor('square').top + bandFor('square').height).toBeCloseTo(1);
  expect(bandFor('square').align).toBe('left');
  expect(bandFor('rounded')).toEqual(bandFor('square'));

  expect(bandFor('circle').top).toBeLessThan(bandFor('square').top);
  expect(bandFor('circle').textWidth).toBeLessThan(bandFor('square').textWidth);
  expect(bandFor('circle').align).toBe('centre');
});
