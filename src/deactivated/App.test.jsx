import { render, screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import App from './App';
import { drawAvatar, loadImage } from './render';

// jsdom has no canvas and cannot decode pictures: the drawing is faked, the rest is real
vi.mock('./render', async (importOriginal) => ({
  ...(await importOriginal()),
  loadImage: vi.fn(async () => ({ width: 400, height: 200 })),
  drawAvatar: vi.fn(),
  toBlob: vi.fn(async () => new Blob(['png'], { type: 'image/png' })),
}));

const picture = () => new File(['jpeg'], 'me.jpeg', { type: 'image/jpeg' });

const choosePicture = async () => {
  await userEvent.upload(screen.getByLabelText('Picture file'), picture());
  await screen.findByAltText('Your picture, deactivated');
};

const lastDrawing = () => drawAvatar.mock.calls.at(-1)[1];

// the name the last download was saved under
let downloaded = null;

beforeEach(() => {
  drawAvatar.mockClear();
  loadImage.mockClear();
  URL.createObjectURL = vi.fn(() => `blob:preview-${URL.createObjectURL.mock.calls.length}`);
  URL.revokeObjectURL = vi.fn();
  HTMLAnchorElement.prototype.click = vi.fn(function click() {
    downloaded = this.download;
  });
  downloaded = null;
});

test('starts empty, with nothing to download yet', () => {
  render(<App />);

  expect(screen.getByRole('heading', { level: 1, name: 'Deactivated' })).toBeInTheDocument();
  expect(screen.getByRole('button', { name: 'Download PNG' })).toBeDisabled();
  expect(screen.getByLabelText('Zoom')).toBeDisabled();
  expect(screen.queryByAltText('Your picture, deactivated')).not.toBeInTheDocument();
  expect(screen.getByText(/never uploaded/)).toBeInTheDocument();
});

test('names the platforms only as options, never in the copy', () => {
  render(<App />);

  const options = screen.getByRole('group', { name: 'Made for' });
  expect(within(options).getByRole('radio', { name: 'Slack' })).toBeChecked();
  expect(within(options).getByRole('radio', { name: 'Microsoft Teams' })).toBeInTheDocument();

  // the one mention of each is its radio button
  for (const name of ['Slack', 'Teams', 'Discord']) {
    expect(screen.getAllByText(new RegExp(name))).toHaveLength(1);
  }
});

test('shows the chosen picture in the preview and lets it be downloaded', async () => {
  render(<App />);

  await choosePicture();

  expect(loadImage).toHaveBeenCalledWith(expect.objectContaining({ name: 'me.jpeg' }));
  expect(screen.getByText('me.jpeg')).toBeInTheDocument();
  expect(screen.getByLabelText('Zoom')).toBeEnabled();
  expect(lastDrawing()).toMatchObject({ size: 512, crop: { x: 100, y: 0, side: 200 } });

  await userEvent.click(screen.getByRole('button', { name: 'Download PNG' }));

  await waitFor(() => expect(HTMLAnchorElement.prototype.click).toHaveBeenCalled());
  expect(lastDrawing()).toMatchObject({ size: 1024, effect: { platform: 'slack', grey: 1 } });
  // saved under the name the sheet shows
  expect(downloaded).toBe('Goodbye.png');
  expect(screen.getByRole('heading', { level: 2, name: 'Goodbye.png' })).toBeInTheDocument();
});

test('the platform decides the shape of the preview', async () => {
  render(<App />);
  await choosePicture();

  const avatar = screen.getByAltText('Your picture, deactivated').parentElement;
  expect(avatar).toHaveClass('bx-avatar--rounded');

  await userEvent.click(screen.getByRole('radio', { name: 'Microsoft Teams' }));
  expect(avatar).toHaveClass('bx-avatar--circle');
  await waitFor(() => expect(lastDrawing().effect.platform).toBe('teams'));

  await userEvent.click(screen.getByRole('radio', { name: 'Somewhere else' }));
  expect(avatar).not.toHaveClass('bx-avatar--circle');
  expect(avatar).not.toHaveClass('bx-avatar--rounded');
});

test('the lettering is off until asked for, and its text can be changed', async () => {
  render(<App />);
  await choosePicture();

  const text = screen.getByLabelText('Text written on the picture');
  expect(text).toBeDisabled();
  expect(text).toHaveValue('Deactivated account');
  expect(lastDrawing().effect.lettering).toBe(false);

  await userEvent.click(screen.getByRole('checkbox', { name: 'Write on the picture' }));
  expect(text).toBeEnabled();
  await userEvent.clear(text);
  await userEvent.type(text, 'Gone fishing');

  await waitFor(() => expect(lastDrawing().effect).toMatchObject({ lettering: true, text: 'Gone fishing' }));
});

test('the theme the picture fades into changes the preview and the drawing', async () => {
  render(<App />);
  await choosePicture();

  await userEvent.click(screen.getByRole('radio', { name: 'Dark theme' }));

  expect(screen.getByText('Your name', { selector: '.bx-card__name' }).closest('.bx-card')).toHaveAttribute(
    'data-background',
    'dark',
  );
  await waitFor(() => expect(lastDrawing().effect.background).toBe('dark'));
});

test('refuses a file that is not a picture', async () => {
  render(<App />);

  await userEvent.upload(screen.getByLabelText('Picture file'), new File(['hi'], 'notes.txt', { type: 'text/plain' }), {
    applyAccept: false,
  });

  expect(await screen.findByRole('alert')).toHaveTextContent('That file is not a picture.');
  expect(loadImage).not.toHaveBeenCalled();
});
