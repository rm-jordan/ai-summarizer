import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import App from './App';

describe('App', () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('shows idle placeholder before submit', () => {
    render(<App />);

    expect(
      screen.getByText('Submit text to see a summary and action items.'),
    ).toBeInTheDocument();
  });

  it('keeps submit disabled for empty input', () => {
    render(<App />);

    expect(screen.getByRole('button', { name: 'Summarize' })).toBeDisabled();
  });

  it('submits text and renders formatted response', async () => {
    const fetchMock = vi.spyOn(window, 'fetch').mockResolvedValue({
      ok: true,
      json: async () => ({
        summary: 'A concise summary.',
        actionItems: ['First task', 'Second task', 'Third task'],
      }),
    } as Response);

    render(<App />);

    fireEvent.change(screen.getByLabelText('Input text'), {
      target: { value: 'This is enough text to submit.' },
    });
    fireEvent.click(screen.getByRole('button', { name: 'Summarize' }));

    await waitFor(() =>
      expect(screen.getByText('A concise summary.')).toBeInTheDocument(),
    );
    expect(screen.getByText('First task')).toBeInTheDocument();
    expect(fetchMock).toHaveBeenCalledTimes(1);
    expect(fetchMock).toHaveBeenCalledWith(
      'http://localhost:3000/ai/summarize',
      expect.objectContaining({
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
      }),
    );
  });

  it('toggles to JSON view after a successful response', async () => {
    vi.spyOn(window, 'fetch').mockResolvedValue({
      ok: true,
      json: async () => ({
        summary: 'JSON toggle test summary.',
        actionItems: ['Task one', 'Task two', 'Task three'],
      }),
    } as Response);

    render(<App />);

    fireEvent.change(screen.getByLabelText('Input text'), {
      target: { value: 'Trigger a successful summarize request.' },
    });
    fireEvent.click(screen.getByRole('button', { name: 'Summarize' }));

    await waitFor(() =>
      expect(screen.getByText('JSON toggle test summary.')).toBeInTheDocument(),
    );

    fireEvent.click(screen.getByRole('button', { name: 'JSON' }));

    expect(screen.getByText('"summary"')).toBeInTheDocument();
    expect(screen.getByText('"actionItems"')).toBeInTheDocument();
    expect(screen.getByText('"Task one"')).toBeInTheDocument();
  });

  it('shows backend error message when request fails', async () => {
    vi.spyOn(window, 'fetch').mockResolvedValue({
      ok: false,
      json: async () => ({
        message: 'Backend validation failed.',
      }),
    } as Response);

    render(<App />);

    fireEvent.change(screen.getByLabelText('Input text'), {
      target: { value: 'Trigger an error response.' },
    });
    fireEvent.click(screen.getByRole('button', { name: 'Summarize' }));

    await waitFor(() =>
      expect(screen.getByText('Backend validation failed.')).toBeInTheDocument(),
    );
  });

});
