import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import App from './App';

beforeEach(() => {
  window.history.replaceState({}, '', '/');
});

test('opens the Explorer and the Notepad with About.txt', () => {
  render(<App />);

  expect(screen.getAllByText('Explorer').length).toBeGreaterThan(0);
  expect(screen.getAllByText('Notepad - About.txt').length).toBeGreaterThan(0);
  expect(screen.getByRole('heading', { name: 'About' })).toBeInTheDocument();
  expect(screen.getByText(/a software engineer at Discourse/)).toBeInTheDocument();
});

test('lists About, Resume, Contact and Blog in the Explorer', () => {
  render(<App />);

  for (const file of ['About.txt', 'Resume.txt', 'Contact.txt', 'Blog.txt']) {
    expect(screen.getByText(file)).toBeInTheDocument();
  }
  expect(screen.queryByText('Projects.txt')).not.toBeInTheDocument();
});

test('opens the file that matches the URL', () => {
  window.history.replaceState({}, '', '/contact');
  render(<App />);

  expect(screen.getByRole('heading', { name: "Let's have a chat!" })).toBeInTheDocument();
});

test('falls back to About.txt for a URL without a file', () => {
  window.history.replaceState({}, '', '/projects');
  render(<App />);

  expect(screen.getByRole('heading', { name: 'About' })).toBeInTheDocument();
});

test('picking a file in the Explorer shows it in the Notepad', async () => {
  render(<App />);

  await userEvent.click(screen.getByText('Resume.txt'));

  expect(screen.getByRole('heading', { name: 'Work Experience' })).toBeInTheDocument();
  expect(screen.getByText('APR 2024 – Present')).toBeInTheDocument();
  expect(window.location.pathname).toBe('/resume');
});

test('the Notepad can be closed and opened again', async () => {
  render(<App />);

  await userEvent.click(screen.getByRole('button', { name: 'Close' }));
  expect(screen.queryByRole('heading', { name: 'About' })).not.toBeInTheDocument();

  await userEvent.click(screen.getByText('About.txt'));
  expect(screen.getByRole('heading', { name: 'About' })).toBeInTheDocument();
});
