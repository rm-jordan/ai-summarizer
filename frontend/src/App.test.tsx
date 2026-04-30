import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import App from './App';

describe('App', () => {
  it('shows idle placeholder before submit', () => {
    render(<App />);

    expect(
      screen.getByText('Submit text to see a summary and action items.'),
    ).toBeInTheDocument();
  });

  it('keeps submit disabled for empty input', async () => {
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

    fetchMock.mockRestore();
  });
});
